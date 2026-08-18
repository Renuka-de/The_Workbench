import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAssignmentsForContractor = async (contractorId: string) => {
  return prisma.contractorAssignment.findMany({
    where: { contractorId },
    include: {
      project: {
        include: {
          vendor: true,
          projectManager: true,
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });
};

export const getAcceptedProjectsForContractor = async (contractorId: string) => {
  const rows = await prisma.contractorAssignment.findMany({
    where: { contractorId, status: 'ACCEPTED' },
    include: {
      project: {
        include: {
          vendor: true,
          projectManager: true,
        },
      },
    },
    orderBy: { respondedAt: 'desc' },
  });

  return rows.map((row) => ({
    ...row.project,
    assignmentStatus: row.status,
    assignmentId: row.id,
  }));
};

export const acceptAssignment = async (assignmentId: string, contractorId: string) => {
  const assignment = await prisma.contractorAssignment.findFirst({
    where: { id: assignmentId, contractorId },
    include: {
      project: true,
    },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (assignment.status !== 'PENDING') {
    throw new Error('Assignment is not pending');
  }

  return prisma.contractorAssignment.update({
    where: { id: assignmentId },
    data: {
      status: 'ACCEPTED',
      respondedAt: new Date(),
    },
    include: {
      project: {
        include: {
          vendor: true,
          projectManager: true,
        },
      },
    },
  });
};

export const rejectAssignment = async (assignmentId: string, contractorId: string) => {
  const assignment = await prisma.contractorAssignment.findFirst({
    where: { id: assignmentId, contractorId },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (assignment.status !== 'PENDING') {
    throw new Error('Assignment is not pending');
  }

  return prisma.contractorAssignment.update({
    where: { id: assignmentId },
    data: {
      status: 'REJECTED',
      respondedAt: new Date(),
    },
    include: {
      project: {
        include: {
          vendor: true,
          projectManager: true,
        },
      },
    },
  });
};
