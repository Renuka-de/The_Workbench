import type { Response } from 'express';
import { listNotificationsForUser, markNotificationRead } from '../services/notification.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const listNotificationsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    const items = await listNotificationsForUser(req.user.id);
    return res.status(200).json(successResponse(items));
  } catch (err) {
    return res.status(500).json(errorResponse(err instanceof Error ? err.message : 'Unable to load notifications'));
  }
};

export const markNotificationReadController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await markNotificationRead(id);
    return res.status(200).json(successResponse(updated));
  } catch (err) {
    return res.status(400).json(errorResponse(err instanceof Error ? err.message : 'Unable to mark notification'));
  }
};
