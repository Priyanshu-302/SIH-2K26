import { z } from 'zod';

/**
 * Zod validation schema for GET /api/sessions/:sessionId/history
 */
export const getHistorySchema = z.object({
  params: z.object({
    sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, { 
      message: 'Invalid session MongoDB ObjectId format' 
    }),
  }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  }).optional(),
});
