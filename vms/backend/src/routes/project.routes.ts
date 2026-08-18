import { Router } from 'express';
import { getProject, listProjects } from '../controllers/project.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listProjects);
router.get('/:id', requireAuth, getProject);

export default router;
