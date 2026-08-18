import { z } from 'zod';

export const assignmentDecisionSchema = z.object({
  reason: z.string().trim().optional(),
});
