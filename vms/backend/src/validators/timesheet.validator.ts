import { z } from 'zod';

export const createTimesheetSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  workDate: z.string().min(1, 'Date is required'),
  hours: z.coerce.number().gt(0, 'Hours must be greater than 0').lte(24, 'Hours cannot exceed 24'),
  description: z.string().trim().min(1, 'Description is required'),
});

export const rejectTimesheetSchema = z.object({
  reason: z.string().trim().min(1, 'Rejection reason is required'),
});
