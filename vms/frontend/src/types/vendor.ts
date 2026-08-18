export type ProjectStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED';

export type BillingType = 'HOURLY' | 'FIXED' | 'MILESTONE';

export type ContractType = 'CONTRACTOR' | 'TEMPORARY' | 'CONSULTANT';

export interface Project {
  id: number;
  vendorId: string;
  name: string;
  description: string;
  department: string;
  startDate: string;
  endDate: string;
  billingType: BillingType;
  hourlyRate: number | null;
  currency: string;
  contractType: ContractType;
  requiredSkills: string[];
  minimumExperience: number;
  numberOfContractors: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Contractor {
  id: number;
  name: string;
  email: string;
  skills: string[];
  availability: 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
}

export interface Assignment {
  id: number;
  projectId: number;
  contractorId: number;
  contractorName: string;
  assignedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
}

export interface ProjectDetails extends Project {
  assignments: Assignment[];
}

export interface DashboardStats {
  activeProjects: number;
  activeProjectsDelta: number;
  contractors: number;
  contractorsDelta: number;
  pendingActions: number;
  pendingActionsDelta: number;
  invoices: number;
  invoicesDelta: number;
  recentProjects: Project[];
}

export interface CreateProjectInput {
  name: string;
  description: string;
  department: string;
  startDate: string;
  endDate: string;
  billingType: BillingType;
  hourlyRate?: number | null;
  currency: string;
  contractType: ContractType;
  requiredSkills: string[];
  minimumExperience: number;
  numberOfContractors: number;
  status?: ProjectStatus;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  status?: ProjectStatus;
}
