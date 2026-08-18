import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTimesheet = async (input: {
  contractorId: string;
  projectId: string;
  workDate: string;
  hours: number;
  description: string;
}) => {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const assignment = await prisma.contractorAssignment.findFirst({
    where: {
      projectId: input.projectId,
      contractorId: input.contractorId,
      status: 'ACCEPTED',
    },
  });

  if (!assignment) {
    throw new Error('You are not assigned to this project');
  }

  const workDate = new Date(input.workDate);

  if (Number.isNaN(workDate.getTime())) {
    throw new Error('Invalid work date');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const workDay = new Date(workDate);
  workDay.setHours(0, 0, 0, 0);

  if (workDay > today) {
    throw new Error('Timesheets cannot be submitted for future dates');
  }

  const entry = await prisma.timesheet.findFirst({
    where: {
      contractorId: input.contractorId,
      projectId: input.projectId,
      workDate,
    },
  });

  if (entry && entry.status !== 'DRAFT' && entry.status !== 'REJECTED') {
    throw new Error('A timesheet already exists for this date');
  }

  if (entry && entry.status === 'APPROVED') {
    throw new Error('Approved timesheets cannot be modified');
  }

  if (entry) {
    return prisma.timesheet.update({
      where: { id: entry.id },
      data: {
        hours: Number(input.hours),
        description: input.description.trim(),
        status: 'SUBMITTED',
        submittedAt: new Date(),
        rejectionReason: null,
        reviewedAt: null,
        reviewedBy: null,
      },
      include: {
        project: true,
        contractor: true,
      },
    });
  }

  return prisma.timesheet.create({
    data: {
      projectId: input.projectId,
      contractorId: input.contractorId,
      assignmentId: assignment.id,
      workDate,
      hours: Number(input.hours),
      description: input.description.trim(),
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
    include: {
      project: true,
      contractor: true,
    },
  });
};

export const getTimesheetsForContractor = async (contractorId: string, filters?: { projectId?: string; status?: string; startDate?: string; endDate?: string }) => {
  const where: Record<string, unknown> = { contractorId };

  if (filters?.projectId) {
    where.projectId = filters.projectId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.startDate || filters?.endDate) {
    where.workDate = {} as Record<string, Date>;

    if (filters.startDate) {
      (where.workDate as Record<string, Date>).gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      (where.workDate as Record<string, Date>).lte = new Date(filters.endDate);
    }
  }

  return prisma.timesheet.findMany({
    where,
    include: {
      project: true,
      contractor: true,
      reviewer: true,
    },
    orderBy: { workDate: 'desc' },
  });
};

export const listPendingTimesheetsForProjectManager = async (projectManagerId: string) => {
  return prisma.timesheet.findMany({
    where: {
      status: 'SUBMITTED',
      project: {
        projectManagerId,
      },
    },
    include: {
      project: true,
      contractor: true,
    },
    orderBy: { submittedAt: 'desc' },
  });
};

export const approveTimesheet = async (timesheetId: string, projectManagerId: string) => {
  const timesheet = await prisma.timesheet.findUnique({
    where: { id: timesheetId },
    include: { project: true },
  });

  if (!timesheet) {
    throw new Error('Timesheet not found');
  }

  if (timesheet.project.projectManagerId !== projectManagerId) {
    throw new Error('You do not manage this project');
  }

  if (timesheet.status !== 'SUBMITTED') {
    throw new Error('Only submitted timesheets can be approved');
  }

  return prisma.timesheet.update({
    where: { id: timesheetId },
    data: {
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedBy: projectManagerId,
      rejectionReason: null,
    },
    include: {
      project: true,
      contractor: true,
      reviewer: true,
    },
  });
};

export const rejectTimesheet = async (timesheetId: string, projectManagerId: string, reason: string) => {
  const timesheet = await prisma.timesheet.findUnique({
    where: { id: timesheetId },
    include: { project: true },
  });

  if (!timesheet) {
    throw new Error('Timesheet not found');
  }

  if (timesheet.project.projectManagerId !== projectManagerId) {
    throw new Error('You do not manage this project');
  }

  if (timesheet.status !== 'SUBMITTED') {
    throw new Error('Only submitted timesheets can be rejected');
  }

  if (!reason || !reason.trim()) {
    throw new Error('Rejection reason is required');
  }

  return prisma.timesheet.update({
    where: { id: timesheetId },
    data: {
      status: 'REJECTED',
      reviewedAt: new Date(),
      reviewedBy: projectManagerId,
      rejectionReason: reason.trim(),
    },
    include: {
      project: true,
      contractor: true,
      reviewer: true,
    },
  });
};
