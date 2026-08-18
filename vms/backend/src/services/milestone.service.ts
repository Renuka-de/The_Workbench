import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMilestone = async (projectId: string, input: { name: string; description?: string; amount: number; dueDate?: string }, userId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');
  if (project.projectManagerId !== userId) throw new Error('Only project manager can create milestones');

  return prisma.milestone.create({
    data: {
      projectId,
      name: input.name,
      description: input.description ?? null,
      amount: Number(input.amount),
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  });
};

export const listMilestonesForProject = async (projectId: string) => {
  return prisma.milestone.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
};

export const approveMilestone = async (milestoneId: string, projectManagerId: string) => {
  const m = await prisma.milestone.findUnique({ where: { id: milestoneId }, include: { project: true } });
  if (!m) throw new Error('Milestone not found');
  if (m.project.projectManagerId !== projectManagerId) throw new Error('You do not manage this project');
  if (m.status !== 'COMPLETED') throw new Error('Only completed milestones can be approved');

  return prisma.milestone.update({
    where: { id: milestoneId },
    data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: projectManagerId },
  });
};
