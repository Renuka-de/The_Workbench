// lightweight id generator to avoid external dependencies
function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

type Role = 'VENDOR' | 'CONTRACTOR' | 'PROJECT_MANAGER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  vendorId: string;
  projectManagerId: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface Assignment {
  id: string;
  projectId: string;
  contractorId: string;
  status: string;
  assignedAt: string;
  respondedAt?: string | null;
}

export interface Timesheet {
  id: string;
  projectId: string;
  contractorId: string;
  assignmentId: string;
  workDate: string;
  hours: number;
  description: string;
  status: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
}

// Seed users
export const users: User[] = [
  { id: 'u-vendor', name: 'Vendor Test', email: 'vendor@test.com', role: 'VENDOR' },
  { id: 'u-contractor', name: 'Contractor Test', email: 'contractor@test.com', role: 'CONTRACTOR' },
  { id: 'u-pm', name: 'PM Test', email: 'pm@test.com', role: 'PROJECT_MANAGER' },
];

// Seed project
export const projects: Project[] = [
  {
    id: 'p-ecom',
    name: 'E-Commerce Backend',
    description: 'Sample project for Phase 2 flow',
    vendorId: 'u-vendor',
    projectManagerId: 'u-pm',
    status: 'ACTIVE',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
  },
];

// Seed assignment (pending)
export const assignments: Assignment[] = [
  {
    id: 'a-1',
    projectId: 'p-ecom',
    contractorId: 'u-contractor',
    status: 'PENDING',
    assignedAt: new Date('2026-08-10').toISOString(),
    respondedAt: null,
  },
];

// Seed timesheets (empty start)
export const timesheets: Timesheet[] = [];

// Helpers
export function findUserByEmail(email?: string) {
  if (!email) return users[1];
  return users.find((u) => u.email === email) ?? users[1];
}

export function getAssignmentsForContractor(contractorId: string) {
  return assignments.filter((a) => a.contractorId === contractorId);
}

export function acceptAssignment(id: string, contractorId: string) {
  const a = assignments.find((x) => x.id === id && x.contractorId === contractorId);
  if (!a) throw new Error('Assignment not found');
  if (a.status !== 'PENDING') throw new Error('Assignment is not pending');
  a.status = 'ACCEPTED';
  a.respondedAt = new Date().toISOString();
  return a;
}

export function rejectAssignment(id: string, contractorId: string) {
  const a = assignments.find((x) => x.id === id && x.contractorId === contractorId);
  if (!a) throw new Error('Assignment not found');
  if (a.status !== 'PENDING') throw new Error('Assignment is not pending');
  a.status = 'REJECTED';
  a.respondedAt = new Date().toISOString();
  return a;
}

export function listProjectsForUser(user: User) {
  if (user.role === 'VENDOR') return projects.filter((p) => p.vendorId === user.id);
  if (user.role === 'PROJECT_MANAGER') return projects.filter((p) => p.projectManagerId === user.id);
  // contractor: return accepted projects
  const accepted = assignments.filter((a) => a.contractorId === user.id && a.status === 'ACCEPTED').map((a) => a.projectId);
  return projects.filter((p) => accepted.includes(p.id));
}

export function getProjectDetailForUser(user: User, projectId: string) {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;
  if (user.role === 'VENDOR' && project.vendorId !== user.id) return null;
  if (user.role === 'PROJECT_MANAGER' && project.projectManagerId !== user.id) return null;
  if (user.role === 'CONTRACTOR') {
    const asg = assignments.find((a) => a.contractorId === user.id && a.projectId === projectId && a.status === 'ACCEPTED');
    if (!asg) return null;
  }

  const projAssignments = assignments.filter((a) => a.projectId === projectId).map((a) => ({
    contractorId: a.contractorId,
    status: a.status,
    assignmentId: a.id,
  }));

  return { ...project, assignments: projAssignments, timesheets: timesheets.filter((t) => t.projectId === projectId) };
}

export function createTimesheet(input: { contractorId: string; projectId: string; workDate: string; hours: number; description: string }) {
  // validation
  const assignment = assignments.find((a) => a.contractorId === input.contractorId && a.projectId === input.projectId && a.status === 'ACCEPTED');
  if (!assignment) throw new Error('You are not assigned to this project');
  const wd = new Date(input.workDate);
  if (Number.isNaN(wd.getTime())) throw new Error('Invalid work date');
  const today = new Date(); today.setHours(0,0,0,0);
  const workDay = new Date(wd); workDay.setHours(0,0,0,0);
  if (workDay > today) throw new Error('Timesheets cannot be submitted for future dates');
  if (input.hours <= 0 || input.hours > 24) throw new Error('Invalid hours');

  const exists = timesheets.find((t) => t.contractorId === input.contractorId && t.projectId === input.projectId && t.workDate === input.workDate && t.status !== 'DRAFT' && t.status !== 'REJECTED');
  if (exists) throw new Error('A timesheet already exists for this date');

  const entry = {
    id: generateId('t-'),
    projectId: input.projectId,
    contractorId: input.contractorId,
    assignmentId: assignment.id,
    workDate: input.workDate,
    hours: input.hours,
    description: input.description,
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
  } as Timesheet;

  timesheets.push(entry);
  return entry;
}

export function getTimesheetsForContractor(contractorId: string) {
  return timesheets.filter((t) => t.contractorId === contractorId);
}

export function listPendingTimesheetsForProjectManager(projectManagerId: string) {
  const pmProjects = projects.filter((p) => p.projectManagerId === projectManagerId).map((p) => p.id);
  return timesheets.filter((t) => pmProjects.includes(t.projectId) && t.status === 'SUBMITTED');
}

export function approveTimesheet(timesheetId: string, pmId: string) {
  const t = timesheets.find((x) => x.id === timesheetId);
  if (!t) throw new Error('Timesheet not found');
  const proj = projects.find((p) => p.id === t.projectId);
  if (!proj || proj.projectManagerId !== pmId) throw new Error('You do not manage this project');
  if (t.status !== 'SUBMITTED') throw new Error('Only submitted timesheets can be approved');
  t.status = 'APPROVED';
  t.reviewedAt = new Date().toISOString();
  t.reviewedBy = pmId;
  t.rejectionReason = null;
  return t;
}

export function rejectTimesheet(timesheetId: string, pmId: string, reason: string) {
  const t = timesheets.find((x) => x.id === timesheetId);
  if (!t) throw new Error('Timesheet not found');
  const proj = projects.find((p) => p.id === t.projectId);
  if (!proj || proj.projectManagerId !== pmId) throw new Error('You do not manage this project');
  if (t.status !== 'SUBMITTED') throw new Error('Only submitted timesheets can be rejected');
  t.status = 'REJECTED';
  t.reviewedAt = new Date().toISOString();
  t.reviewedBy = pmId;
  t.rejectionReason = reason;
  return t;
}
