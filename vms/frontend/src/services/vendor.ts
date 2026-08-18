import { apiRequest } from './api';
import type {
  Assignment,
  Contractor,
  CreateProjectInput,
  DashboardStats,
  Project,
  ProjectDetails,
  ProjectStatus,
  UpdateProjectInput,
} from '../types/vendor';

export async function getVendorDashboard() {
  return apiRequest<DashboardStats>('/vendor/dashboard');
}

export async function getVendorProjects(params?: { search?: string; status?: ProjectStatus | '' }) {
  const query = new URLSearchParams();

  if (params?.search) {
    query.set('search', params.search);
  }

  if (params?.status) {
    query.set('status', params.status);
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<Project[]>(`/vendor/projects${suffix}`);
}

export async function createVendorProject(input: CreateProjectInput) {
  return apiRequest<Project>('/vendor/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getVendorProject(id: number) {
  return apiRequest<ProjectDetails>(`/vendor/projects/${id}`);
}

export async function updateVendorProject(id: number, input: UpdateProjectInput) {
  return apiRequest<Project>(`/vendor/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function getVendorAssignments() {
  return apiRequest<Assignment[]>('/vendor/assignments');
}

export async function getVendorContractors() {
  return apiRequest<Contractor[]>('/vendor/contractors');
}

export async function createVendorAssignment(projectId: number, contractorId: number) {
  return apiRequest<Assignment>(`/vendor/projects/${projectId}/assignments`, {
    method: 'POST',
    body: JSON.stringify({ contractorId }),
  });
}
