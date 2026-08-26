import { Router } from 'express';
import { documentController } from '../controllers/document.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// GET listings of uploaded files metadata
router.get(
  '/',
  authMiddleware,
  documentController.listDocuments
);

// GET status details of an ingestion job
router.get(
  '/status/:documentId',
  authMiddleware,
  documentController.getDocumentStatus
);

export default router;
