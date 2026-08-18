import { Router } from 'express';
import { approveTimesheetController, listMyTimesheets, listPendingTimesheets, rejectTimesheetController, submitTimesheet } from '../controllers/timesheet.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('CONTRACTOR'), submitTimesheet);
router.get('/my', requireAuth, requireRole('CONTRACTOR'), listMyTimesheets);
router.get('/pending', requireAuth, requireRole('PROJECT_MANAGER'), listPendingTimesheets);
router.post('/:id/approve', requireAuth, requireRole('PROJECT_MANAGER'), approveTimesheetController);
router.post('/:id/reject', requireAuth, requireRole('PROJECT_MANAGER'), rejectTimesheetController);

export default router;
