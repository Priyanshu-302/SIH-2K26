import { z } from 'zod';

/**
 * Zod validation schema for POST /api/chat/ask
 */
export const askRequestSchema = z.object({
  body: z.object({
    query: z.string()
      .min(3, { message: 'Query must be at least 3 characters long' })
      .max(1000, { message: 'Query must not exceed 1000 characters' })
      .trim(),
    sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, { 
      message: 'Session ID must be a valid 24-character hexadecimal MongoDB ObjectId' 
    }),
    historyOverride: z.array(
      z.object({
        role: z.enum(['user', 'assistant'], { message: 'Role must be user or assistant' }),
        content: z.string().min(1, { message: 'Message content cannot be empty' }),
      })
    ).optional(),
  }),
});
