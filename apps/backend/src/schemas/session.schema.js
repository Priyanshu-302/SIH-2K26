import { z } from 'zod';

/**
 * Zod validation schema for POST /api/sessions
 */
export const createSessionSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(100).optional(),
  }).optional(),
});

/**
 * Zod validation schema for PATCH /api/sessions/:sessionId
 */
export const updateSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
      message: 'Invalid session MongoDB ObjectId format',
    }),
  }),
  body: z.object({
    title: z.string().trim().min(1, { message: 'Title cannot be empty' }).max(100, { message: 'Title cannot exceed 100 characters' }),
  }),
});

/**
 * Zod validation schema for DELETE /api/sessions/:sessionId
 */
export const deleteSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
      message: 'Invalid session MongoDB ObjectId format',
    }),
  }),
});

