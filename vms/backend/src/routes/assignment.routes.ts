import { Router } from 'express';
import { acceptAssignmentController, listAssignments, rejectAssignmentController } from '../controllers/assignment.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('CONTRACTOR'), listAssignments);
router.post('/:id/accept', requireAuth, requireRole('CONTRACTOR'), acceptAssignmentController);
router.post('/:id/reject', requireAuth, requireRole('CONTRACTOR'), rejectAssignmentController);

export default router;
