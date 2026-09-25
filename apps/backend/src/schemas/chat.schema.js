import { z } from 'zod';

/**
 * Zod validation schema for POST /api/chat/ask
 */
export const askRequestSchema = z.object({
  body: z.object({
    query: z.string()
      .min(1, { message: 'Query cannot be empty' })
      .max(10000, { message: 'Query must not exceed 10,000 characters' })
      .trim(),

    sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, { 
      message: 'Session ID must be a valid 24-character hexadecimal MongoDB ObjectId' 
    }),
    jurisdiction: z.enum(['national', 'international']).default('national'),
    historyOverride: z.array(
      z.object({
        role: z.enum(['user', 'assistant'], { message: 'Role must be user or assistant' }),
        content: z.string().min(1, { message: 'Message content cannot be empty' }),
      })
    ).optional(),
  }),
});
