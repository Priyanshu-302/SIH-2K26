import { Router } from 'express';
import multer from 'multer';
import { sessionController } from '../controllers/session.controller.js';
import { documentController } from '../controllers/document.controller.js';
import { validate } from '../middleware/validator.middleware.js';
import { createSessionSchema } from '../schemas/session.schema.js';
import { documentUploadSchema } from '../schemas/document.schema.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

// Configure Multer for local drafts storing (Max: 15MB)
const upload = multer({
  dest: 'storage/uploads/',
  limits: { fileSize: 15 * 1024 * 1024 },
});

const router = Router();

// POST /api/sessions - Create session
router.post(
  '/',
  authMiddleware,
  validate(createSessionSchema),
  sessionController.createSession
);

// POST /api/sessions/:sessionId/documents - Upload document to session
router.post(
  '/:sessionId/documents',
  authMiddleware,
  upload.single('file'),
  validate(documentUploadSchema),
  documentController.uploadDocument
);

export default router;
