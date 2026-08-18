import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.get('/vendor-only', requireAuth, requireRole('VENDOR'), (_req, res) => {
  res.status(200).json({ success: true, data: { message: 'Vendor access granted' } });
});

export default router;
