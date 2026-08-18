import { PrismaClient } from '@prisma/client';
import type { Role } from '../types/auth.js';

const prisma = new PrismaClient();

export const listProjectsForUser = async (user: { id: string; role: Role }) => {
  if (user.role === 'VENDOR') {
    return prisma.project.findMany({
      where: { vendorId: user.id },
      include: {
        vendor: true,
        projectManager: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (user.role === 'PROJECT_MANAGER') {
    return prisma.project.findMany({
      where: { projectManagerId: user.id },
      include: {
        vendor: true,
        projectManager: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  const rows = await prisma.contractorAssignment.findMany({
    where: { contractorId: user.id, status: 'ACCEPTED' },
    include: {
      project: {
        include: {
          vendor: true,
          projectManager: true,
        },
      },
    },
  });

  return rows.map((row) => row.project);
};

export const getProjectDetailForUser = async (user: { id: string; role: Role }, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      vendor: true,
      projectManager: true,
      assignments: {
        include: {
          contractor: true,
        },
      },
      timesheets: {
        include: {
          contractor: true,
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  if (user.role === 'VENDOR' && project.vendorId !== user.id) {
    return null;
  }

  if (user.role === 'PROJECT_MANAGER' && project.projectManagerId !== user.id) {
    return null;
  }

  if (user.role === 'CONTRACTOR') {
    const assignment = await prisma.contractorAssignment.findFirst({
      where: {
        projectId,
        contractorId: user.id,
        status: 'ACCEPTED',
      },
    });

    if (!assignment) {
      return null;
    }
  }

  const assignments = project.assignments.map((assignment) => ({
    contractor: assignment.contractor,
    status: assignment.status,
    totalSubmittedHours: project.timesheets
      .filter((sheet) => sheet.contractorId === assignment.contractorId)
      .reduce((sum, sheet) => sum + Number(sheet.hours), 0),
    approvedHours: project.timesheets
      .filter((sheet) => sheet.contractorId === assignment.contractorId && sheet.status === 'APPROVED')
      .reduce((sum, sheet) => sum + Number(sheet.hours), 0),
    pendingTimesheets: project.timesheets.filter(
      (sheet) => sheet.contractorId === assignment.contractorId && sheet.status === 'SUBMITTED',
    ).length,
  }));

  return {
    ...project,
    assignments,
  };
};
