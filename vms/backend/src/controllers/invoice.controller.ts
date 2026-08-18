import type { Response } from 'express';
import { generateInvoiceForProject, validateInvoice, approveInvoice, listInvoicesForProject } from '../services/invoice.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const generateInvoiceController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const invoice = await generateInvoiceForProject(projectId, req.user.id);
    return res.status(201).json(successResponse(invoice));
  } catch (err) {
    return res.status(400).json(errorResponse(err instanceof Error ? err.message : 'Unable to generate invoice'));
  }
};

export const validateInvoiceController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await validateInvoice(id);
    return res.status(200).json(successResponse(updated));
  } catch (err) {
    return res.status(400).json(errorResponse(err instanceof Error ? err.message : 'Unable to validate invoice'));
  }
};

export const approveInvoiceController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { approve } = req.body;
    const updated = await approveInvoice(id, req.user.id, Boolean(approve));
    return res.status(200).json(successResponse(updated));
  } catch (err) {
    return res.status(400).json(errorResponse(err instanceof Error ? err.message : 'Unable to approve invoice'));
  }
};

export const listInvoicesController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const list = await listInvoicesForProject(projectId);
    return res.status(200).json(successResponse(list));
  } catch (err) {
    return res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Unable to load invoices'));
  }
};
