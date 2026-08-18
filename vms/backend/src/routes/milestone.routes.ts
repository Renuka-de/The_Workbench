import { Router } from 'express';
import { createMilestoneController, listMilestonesController, approveMilestoneController } from '../controllers/milestone.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/projects/:projectId', requireAuth, requireRole('PROJECT_MANAGER'), createMilestoneController);
router.get('/projects/:projectId', requireAuth, listMilestonesController);
router.post('/:id/approve', requireAuth, requireRole('PROJECT_MANAGER'), approveMilestoneController);

export default router;
