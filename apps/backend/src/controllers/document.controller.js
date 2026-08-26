import path from 'path';
import { IngestionJob } from '../models/ingestionJob.model.js';
import { Session } from '../models/session.model.js';
import { addIngestionJob } from '../workers/queue.js';
import logger from '../config/logger.js';

export const documentController = {
  /**
   * Handles document uploading, metadata registration, and BullMQ task dispatching
   * Route: POST /api/sessions/:sessionId/documents
   * 
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async uploadDocument(req, res, next) {
    const correlationId = req.id || 'doc-upload';
    const { sessionId } = req.params;
    const { category, title } = req.body;

    try {
      // 1. Verify session exists
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          error: 'Session Not Found',
          code: 'SESSION_NOT_FOUND',
          details: 'Document upload requires an existing, active session.',
        });
      }

      // 2. Validate uploaded file presence
      if (!req.file) {
        return res.status(400).json({
          error: 'Bad Request',
          code: 'FILE_REQUIRED',
          details: 'Please provide a file attachment under field key "file".',
        });
      }

      // Resolves final title: uses original filename if not provided
      const resolvedTitle = title || req.file.originalname;

      // 3. Register ingestion job model in database
      logger.info({ correlationId, sessionId, filename: req.file.originalname }, 'Registering document ingestion job');
      const job = new IngestionJob({
        title: resolvedTitle,
        filename: req.file.originalname, // Raw uploaded filename, distinct from user title
        category,
        filePath: req.file.path,
        status: 'PENDING',
        progress: 0,
      });
      await job.save();

      // 4. Dispatch async processing to queue worker
      await addIngestionJob(job._id.toString(), {
        filePath: job.filePath,
        title: job.title,
        category: job.category,
      });

      logger.info({ correlationId, documentId: job._id }, 'Ingestion job successfully dispatched');
      res.status(202).json({
        documentId: job._id.toString(),
        status: job.status,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Queries and returns lists of ingestion job logs sorted by creation date descending
   * Route: GET /api/documents
   * 
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async listDocuments(req, res, next) {
    try {
      const jobs = await IngestionJob.find().sort({ createdAt: -1 });

      const mappedJobs = jobs.map((job) => ({
        documentId: job._id.toString(),
        filename: job.filename,
        category: job.category,
        uploadedAt: job.createdAt,
        chunkCount: job.ingestedCount,
        status: job.status.toLowerCase(), // Frontend expects lowercased status string
      }));

      res.status(200).json(mappedJobs);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Polls progress and execution details for a specific ingestion document
   * Route: GET /api/documents/status/:documentId
   * 
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async getDocumentStatus(req, res, next) {
    const { documentId } = req.params;
    try {
      const job = await IngestionJob.findById(documentId);
      if (!job) {
        return res.status(404).json({
          error: 'Resource Not Found',
          code: 'DOCUMENT_JOB_NOT_FOUND',
          details: 'The specified document ingestion job could not be located.',
        });
      }

      res.status(200).json({
        documentId: job._id.toString(),
        filename: job.filename,
        status: job.status.toLowerCase(), // Lowercase status to align with client schemas
        progress: job.progress,
        error: job.errorMessage || null, // Exposes errorMessage as "error"
      });
    } catch (error) {
      next(error);
    }
  },
};
