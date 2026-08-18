import type { Response } from 'express';
import { createMilestone, listMilestonesForProject, approveMilestone } from '../services/milestone.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const createMilestoneController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const payload = req.body;
    const milestone = await createMilestone(projectId, payload, req.user.id);
    return res.status(201).json(successResponse(milestone));
  } catch (err) {
    return res.status(400).json(errorResponse(err instanceof Error ? err.message : 'Unable to create milestone'));
  }
};

export const listMilestonesController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const items = await listMilestonesForProject(projectId);
    return res.status(200).json(successResponse(items));
  } catch (err) {
    return res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Unable to load milestones'));
  }
};

export const approveMilestoneController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    const milestoneId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await approveMilestone(milestoneId, req.user.id);
    return res.status(200).json(successResponse(updated));
  } catch (err) {
    return res.status(400).json(errorResponse(err instanceof Error ? err.message : 'Unable to approve milestone'));
  }
};
