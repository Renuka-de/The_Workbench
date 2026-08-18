import type { Response } from 'express';
import { getProjectDetailForUser, listProjectsForUser } from '../services/project.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const listProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));

    const projects = await listProjectsForUser(req.user);
    return res.status(200).json(successResponse(projects));
  } catch (error) {
    return res.status(500).json(errorResponse(error instanceof Error ? error.message : 'Unable to load projects'));
  }
};

export const getProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));

    const projectId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const project = await getProjectDetailForUser(req.user, projectId);
    if (!project) return res.status(404).json(errorResponse('Project not found'));

    return res.status(200).json(successResponse(project));
  } catch (error) {
    return res.status(500).json(errorResponse(error instanceof Error ? error.message : 'Unable to load project'));
  }
};
