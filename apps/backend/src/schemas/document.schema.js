import { z } from 'zod';
import { DOCUMENT_CATEGORIES } from '../constants/documentCategory.js';

/**
 * Zod validation schema for POST /api/sessions/:sessionId/documents
 */
export const documentUploadSchema = z.object({
  params: z.object({
    sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, { 
      message: 'Invalid session MongoDB ObjectId format' 
    }),
  }),
  body: z.object({
    title: z.string().min(2, { message: 'Document title must be at least 2 characters' }).max(255).optional(),
    category: z.enum(DOCUMENT_CATEGORIES, {
      required_error: 'Category is required',
    }),
  }),
});
