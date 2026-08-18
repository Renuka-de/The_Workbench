import { Router } from 'express';
import { generateInvoiceController, validateInvoiceController, approveInvoiceController, listInvoicesController } from '../controllers/invoice.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/projects/:projectId/generate', requireAuth, requireRole('PROJECT_MANAGER'), generateInvoiceController);
router.get('/projects/:projectId', requireAuth, listInvoicesController);
router.post('/:id/validate', requireAuth, validateInvoiceController);
router.post('/:id/approve', requireAuth, requireRole('PROJECT_MANAGER'), approveInvoiceController);

export default router;
