import { Router } from 'express';
import { listNotificationsController, markNotificationReadController } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listNotificationsController);
router.post('/:id/read', requireAuth, markNotificationReadController);

export default router;
