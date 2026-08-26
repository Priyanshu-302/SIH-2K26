import { z } from 'zod';

/**
 * Zod validation schema for POST /api/sessions
 */
export const createSessionSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(100).optional(),
  }).optional(),
});
