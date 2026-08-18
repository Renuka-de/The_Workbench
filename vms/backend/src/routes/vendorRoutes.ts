import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  department: z.string().min(1, 'Department is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  billingType: z.enum(['HOURLY', 'FIXED', 'MILESTONE']),
  hourlyRate: z.number().nullable().optional(),
  currency: z.string().min(1, 'Currency is required'),
  contractType: z.enum(['CONTRACTOR', 'TEMPORARY', 'CONSULTANT']),
  requiredSkills: z.array(z.string()).default([]),
  minimumExperience: z.number().min(0),
  numberOfContractors: z.number().int().min(1),
  status: z.enum(['DRAFT', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED']).optional(),
});

type VendorProject = Omit<z.infer<typeof projectSchema>, 'status'> & {
  id: number;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
  status: NonNullable<z.infer<typeof projectSchema>['status']>;
};

type VendorContractor = {
  id: number;
  name: string;
  email: string;
  skills: string[];
  availability: 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
};

type VendorAssignment = {
  id: number;
  projectId: number;
  contractorId: number;
  contractorName: string;
  assignedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
};

const vendorProjects: VendorProject[] = [
  {
    id: 1,
    vendorId: 'seed-vendor',
    name: 'Warehouse Staff Expansion',
    description: 'Scale contractor coverage for Q3 logistics demand.',
    department: 'Operations',
    startDate: '2026-08-20',
    endDate: '2026-10-15',
    billingType: 'HOURLY',
    hourlyRate: 28,
    currency: 'USD',
    contractType: 'CONTRACTOR',
    requiredSkills: ['Forklift', 'Inventory', 'Night shift'],
    minimumExperience: 2,
    numberOfContractors: 6,
    status: 'OPEN',
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
  },
  {
    id: 2,
    vendorId: 'seed-vendor',
    name: 'Regional Helpdesk Support',
    description: 'Temporary support bench for peak onboarding and device setup.',
    department: 'IT Services',
    startDate: '2026-08-25',
    endDate: '2026-11-30',
    billingType: 'FIXED',
    hourlyRate: null,
    currency: 'USD',
    contractType: 'TEMPORARY',
    requiredSkills: ['Service desk', 'Active Directory', 'Laptop imaging'],
    minimumExperience: 3,
    numberOfContractors: 4,
    status: 'IN_PROGRESS',
    createdAt: '2026-08-11T09:30:00.000Z',
    updatedAt: '2026-08-12T08:15:00.000Z',
  },
];

const vendorContractors: VendorContractor[] = [
  { id: 1, name: 'Anika Rao', email: 'anika.rao@example.com', skills: ['React', 'Vendor onboarding'], availability: 'AVAILABLE' },
  { id: 2, name: 'Rahul Sen', email: 'rahul.sen@example.com', skills: ['Helpdesk', 'Active Directory'], availability: 'PARTIAL' },
  { id: 3, name: 'Maya Thomas', email: 'maya.thomas@example.com', skills: ['Inventory', 'Night shift'], availability: 'AVAILABLE' },
];

const vendorAssignments: VendorAssignment[] = [
  {
    id: 1,
    projectId: 2,
    contractorId: 2,
    contractorName: 'Rahul Sen',
    assignedAt: '2026-08-13T08:00:00.000Z',
    status: 'PENDING',
  },
];

router.use(requireAuth, requireRole('VENDOR'));

router.get('/dashboard', (req: AuthenticatedRequest, res) => {
  const vendorId = req.user?.id ?? 'seed-vendor';
  const projects = vendorProjects.filter((project) => project.vendorId === vendorId || project.vendorId === 'seed-vendor');
  const activeProjects = projects.filter((project) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(project.status)).length;

  res.status(200).json({
    success: true,
    data: {
      activeProjects,
      activeProjectsDelta: 12,
      contractors: projects.reduce((total, project) => total + project.numberOfContractors, 0),
      contractorsDelta: 8,
      pendingActions: projects.filter((project) => project.status === 'DRAFT' || project.status === 'OPEN').length,
      pendingActionsDelta: -3,
      invoices: 3,
      invoicesDelta: 5,
      recentProjects: [...projects]
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 4),
    },
  });
});

router.get('/projects', (req: AuthenticatedRequest, res) => {
  const vendorId = req.user?.id ?? 'seed-vendor';
  const search = String(req.query.search ?? '').trim().toLowerCase();
  const status = String(req.query.status ?? '').trim();

  const projects = vendorProjects
    .filter((project) => project.vendorId === vendorId || project.vendorId === 'seed-vendor')
    .filter((project) => {
      if (!search) {
        return true;
      }

      return (
        project.name.toLowerCase().includes(search) ||
        project.department.toLowerCase().includes(search) ||
        project.description.toLowerCase().includes(search)
      );
    })
    .filter((project) => (!status ? true : project.status === status))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  res.status(200).json({ success: true, data: projects });
});

router.get('/projects/:id', (req: AuthenticatedRequest, res) => {
  const vendorId = req.user?.id ?? 'seed-vendor';
  const projectId = Number(req.params.id);
  const project = vendorProjects.find((item) => item.id === projectId && (item.vendorId === vendorId || item.vendorId === 'seed-vendor'));

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const assignments = vendorAssignments.filter((item) => item.projectId === projectId);
  return res.status(200).json({ success: true, data: { ...project, assignments } });
});

router.post('/projects', (req: AuthenticatedRequest, res) => {
  const parsed = projectSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid project data',
    });
  }

  if (new Date(parsed.data.endDate) < new Date(parsed.data.startDate)) {
    return res.status(400).json({
      success: false,
      message: 'End date must be on or after start date',
    });
  }

  const now = new Date().toISOString();
  const project: VendorProject = {
    id: vendorProjects.length ? Math.max(...vendorProjects.map((item) => item.id)) + 1 : 1,
    vendorId: req.user?.id ?? 'seed-vendor',
    createdAt: now,
    updatedAt: now,
    ...parsed.data,
    hourlyRate: parsed.data.billingType === 'HOURLY' ? parsed.data.hourlyRate ?? 0 : null,
    status: parsed.data.status ?? 'DRAFT',
  };

  vendorProjects.unshift(project);
  return res.status(201).json({ success: true, data: project });
});

router.put('/projects/:id', (req: AuthenticatedRequest, res) => {
  const vendorId = req.user?.id ?? 'seed-vendor';
  const projectId = Number(req.params.id);
  const index = vendorProjects.findIndex((item) => item.id === projectId && (item.vendorId === vendorId || item.vendorId === 'seed-vendor'));

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const parsed = projectSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? 'Invalid project data' });
  }

  const existing = vendorProjects[index];
  const updated = {
    ...existing,
    ...parsed.data,
    hourlyRate: (parsed.data.billingType ?? existing.billingType) === 'HOURLY'
      ? parsed.data.hourlyRate ?? existing.hourlyRate ?? 0
      : null,
    status: parsed.data.status ?? existing.status,
    updatedAt: new Date().toISOString(),
  };

  if (new Date(updated.endDate) < new Date(updated.startDate)) {
    return res.status(400).json({ success: false, message: 'End date must be on or after start date' });
  }

  vendorProjects[index] = updated;
  return res.status(200).json({ success: true, data: updated });
});

router.get('/contractors', (_req, res) => {
  return res.status(200).json({ success: true, data: vendorContractors });
});

router.get('/assignments', (_req, res) => {
  return res.status(200).json({ success: true, data: vendorAssignments });
});

router.post('/projects/:projectId/assignments', (req: AuthenticatedRequest, res) => {
  const projectId = Number(req.params.projectId);
  const contractorId = Number(req.body?.contractorId);
  const project = vendorProjects.find((item) => item.id === projectId);
  const contractor = vendorContractors.find((item) => item.id === contractorId);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (!contractor) {
    return res.status(404).json({ success: false, message: 'Contractor not found' });
  }

  const existingAssignment = vendorAssignments.find(
    (item) => item.projectId === projectId && item.contractorId === contractorId,
  );

  if (existingAssignment) {
    return res.status(409).json({ success: false, message: 'Contractor is already assigned to this project' });
  }

  const assignment: VendorAssignment = {
    id: vendorAssignments.length ? Math.max(...vendorAssignments.map((item) => item.id)) + 1 : 1,
    projectId,
    contractorId,
    contractorName: contractor.name,
    assignedAt: new Date().toISOString(),
    status: 'PENDING',
  };

  vendorAssignments.unshift(assignment);

  const projectIndex = vendorProjects.findIndex((item) => item.id === projectId);
  if (projectIndex !== -1) {
    vendorProjects[projectIndex] = {
      ...vendorProjects[projectIndex],
      status: vendorProjects[projectIndex].status === 'DRAFT' ? 'ASSIGNED' : vendorProjects[projectIndex].status,
      updatedAt: new Date().toISOString(),
    };
  }

  return res.status(201).json({ success: true, data: assignment });
});

export default router;
