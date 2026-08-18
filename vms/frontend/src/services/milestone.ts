import { apiRequest } from './api';

export type CreateMilestoneInput = {
  name: string;
  description?: string;
  amount: number;
  dueDate?: string;
};

export type Milestone = {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  amount: number;
  dueDate?: string | null;
  status: string;
  createdAt?: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
};

export async function listMilestones(projectId: string) {
  return apiRequest<Milestone[]>(`/milestones/projects/${projectId}`);
}

export async function createMilestone(projectId: string, input: CreateMilestoneInput) {
  return apiRequest<Milestone>(`/milestones/projects/${projectId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function approveMilestone(milestoneId: string) {
  return apiRequest<Milestone>(`/milestones/${milestoneId}/approve`, { method: 'POST' });
}

export default { listMilestones, createMilestone, approveMilestone };
