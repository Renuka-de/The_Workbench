import type { Response } from 'express';
import { approveTimesheet, createTimesheet, getTimesheetsForContractor, listPendingTimesheetsForProjectManager, rejectTimesheet } from '../services/timesheet.service.js';
import { createTimesheetSchema, rejectTimesheetSchema } from '../validators/timesheet.validator.js';
import { successResponse, errorResponse } from '../utils/response.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const submitTimesheet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    if (req.user.role !== 'CONTRACTOR') return res.status(403).json(errorResponse('Only contractors can submit timesheets'));

    const parsed = createTimesheetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(errorResponse(parsed.error.issues[0]?.message ?? 'Invalid timesheet data'));
    }

    const timesheet = await createTimesheet({
      contractorId: req.user.id,
      projectId: parsed.data.projectId,
      workDate: parsed.data.workDate,
      hours: parsed.data.hours,
      description: parsed.data.description,
    });

    return res.status(201).json(successResponse(timesheet));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit timesheet';
    const status = message.includes('not found') ? 404 : message.includes('not assigned') ? 403 : 500;
    return res.status(status).json(errorResponse(message));
  }
};

export const listMyTimesheets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    if (req.user.role !== 'CONTRACTOR') return res.status(403).json(errorResponse('Only contractors can view timesheets'));

    const { project, status, startDate, endDate } = req.query as Record<string, string | undefined>;
    const entries = await getTimesheetsForContractor(req.user.id, { projectId: project, status, startDate, endDate });
    return res.status(200).json(successResponse(entries));
  } catch (error) {
    return res.status(500).json(errorResponse(error instanceof Error ? error.message : 'Unable to load timesheets'));
  }
};

export const listPendingTimesheets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    if (req.user.role !== 'PROJECT_MANAGER') return res.status(403).json(errorResponse('Only project managers can review timesheets'));

    const entries = await listPendingTimesheetsForProjectManager(req.user.id);
    return res.status(200).json(successResponse(entries));
  } catch (error) {
    return res.status(500).json(errorResponse(error instanceof Error ? error.message : 'Unable to load pending timesheets'));
  }
};

export const approveTimesheetController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    if (req.user.role !== 'PROJECT_MANAGER') return res.status(403).json(errorResponse('Only project managers can approve timesheets'));

    const timesheetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const timesheet = await approveTimesheet(timesheetId, req.user.id);
    return res.status(200).json(successResponse(timesheet));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to approve timesheet';
    const status = message.includes('not found') ? 404 : message.includes('manage') || message.includes('Only submitted') ? 403 : 500;
    return res.status(status).json(errorResponse(message));
  }
};

export const rejectTimesheetController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json(errorResponse('Authentication required'));
    if (req.user.role !== 'PROJECT_MANAGER') return res.status(403).json(errorResponse('Only project managers can reject timesheets'));

    const parsed = rejectTimesheetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(errorResponse(parsed.error.issues[0]?.message ?? 'Invalid rejection data'));
    }

    const timesheetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const timesheet = await rejectTimesheet(timesheetId, req.user.id, parsed.data.reason);
    return res.status(200).json(successResponse(timesheet));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reject timesheet';
    const status = message.includes('not found') ? 404 : message.includes('manage') || message.includes('Only submitted') ? 403 : 500;
    return res.status(status).json(errorResponse(message));
  }
};
