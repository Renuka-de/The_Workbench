import { Router } from 'express';
import {
  findUserByEmail,
  getAssignmentsForContractor,
  acceptAssignment,
  rejectAssignment,
  listProjectsForUser,
  getProjectDetailForUser,
  createTimesheet,
  getTimesheetsForContractor,
  listPendingTimesheetsForProjectManager,
  approveTimesheet,
  rejectTimesheet,
  users,
} from '../mock/data.js';

const router = Router();

function getMockUser(req: any) {
  const email = req.headers['x-mock-user-email'] as string | undefined;
  return findUserByEmail(email);
}

router.get('/assignments', (_req, res) => {
  const user = getMockUser(_req);
  if (user.role !== 'CONTRACTOR') return res.status(403).json({ success: false, message: 'Only contractors' });
  const data = getAssignmentsForContractor(user.id);
  return res.json({ success: true, data });
});

router.post('/assignments/:id/accept', (req, res) => {
  const user = getMockUser(req);
  try {
    const a = acceptAssignment(req.params.id, user.id);
    return res.json({ success: true, data: a });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/assignments/:id/reject', (req, res) => {
  const user = getMockUser(req);
  try {
    const a = rejectAssignment(req.params.id, user.id);
    return res.json({ success: true, data: a });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/projects', (req, res) => {
  const user = getMockUser(req);
  const data = listProjectsForUser(user);
  return res.json({ success: true, data });
});

router.get('/projects/:id', (req, res) => {
  const user = getMockUser(req);
  const data = getProjectDetailForUser(user, req.params.id);
  if (!data) return res.status(404).json({ success: false, message: 'Not found' });
  return res.json({ success: true, data });
});

router.post('/timesheets', (req, res) => {
  const user = getMockUser(req);
  if (user.role !== 'CONTRACTOR') return res.status(403).json({ success: false, message: 'Only contractors can submit timesheets' });
  try {
    const payload = req.body;
    const entry = createTimesheet({ contractorId: user.id, projectId: payload.projectId, workDate: payload.workDate, hours: payload.hours, description: payload.description });
    return res.status(201).json({ success: true, data: entry });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/timesheets/my', (req, res) => {
  const user = getMockUser(req);
  if (user.role !== 'CONTRACTOR') return res.status(403).json({ success: false, message: 'Only contractors' });
  const data = getTimesheetsForContractor(user.id);
  return res.json({ success: true, data });
});

router.get('/timesheets/pending', (req, res) => {
  const user = getMockUser(req);
  if (user.role !== 'PROJECT_MANAGER') return res.status(403).json({ success: false, message: 'Only PMs' });
  const data = listPendingTimesheetsForProjectManager(user.id);
  return res.json({ success: true, data });
});

router.post('/timesheets/:id/approve', (req, res) => {
  const user = getMockUser(req);
  try {
    const t = approveTimesheet(req.params.id, user.id);
    return res.json({ success: true, data: t });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/timesheets/:id/reject', (req, res) => {
  const user = getMockUser(req);
  const reason = req.body.reason;
  try {
    const t = rejectTimesheet(req.params.id, user.id, reason);
    return res.json({ success: true, data: t });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/users', (_req, res) => {
  return res.json({ success: true, data: users });
});

export default router;
