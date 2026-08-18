import type { Response } from 'express';
import { acceptAssignment, getAssignmentsForContractor, rejectAssignment } from '../services/assignment.service.js';
import { assignmentDecisionSchema } from '../validators/assignment.validator.js';
import { successResponse, errorResponse } from '../utils/response.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const listAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    if (req.user.role !== 'CONTRACTOR') return res.status(403).json(errorResponse('Only contractors can view assignments'));

    const assignments = await getAssignmentsForContractor(req.user.id);
    return res.status(200).json(successResponse(assignments));
  } catch (error) {
    return res.status(500).json(errorResponse(error instanceof Error ? error.message : 'Failed to load assignments'));
  }
};

export const acceptAssignmentController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    if (req.user.role !== 'CONTRACTOR') return res.status(403).json(errorResponse('Only contractors can accept assignments'));

    const assignmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const assignment = await acceptAssignment(assignmentId, req.user.id);
    return res.status(200).json(successResponse(assignment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to accept assignment';
    const status = message.includes('not found') ? 404 : message.includes('not pending') ? 400 : 500;
    return res.status(status).json(errorResponse(message));
  }
};

export const rejectAssignmentController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    if (req.user.role !== 'CONTRACTOR') return res.status(403).json(errorResponse('Only contractors can reject assignments'));

    const parsed = assignmentDecisionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(errorResponse(parsed.error.issues[0]?.message ?? 'Invalid rejection data'));
    }

    const assignmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const assignment = await rejectAssignment(assignmentId, req.user.id);
    return res.status(200).json(successResponse(assignment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reject assignment';
    const status = message.includes('not found') ? 404 : message.includes('not pending') ? 400 : 500;
    return res.status(status).json(errorResponse(message));
  }
};
