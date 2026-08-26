import { Session } from '../models/session.model.js';
import logger from '../config/logger.js';

export const sessionController = {
  /**
   * Creates a new chat/assessment session
   * 
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async createSession(req, res, next) {
    const correlationId = req.id || 'session-create';
    try {
      const title = req.body?.title || 'New Assessment';
      
      logger.info({ correlationId, title }, 'Creating new assessment session');
      const session = new Session({ title });
      await session.save();
      
      logger.info({ correlationId, sessionId: session._id }, 'Assessment session created successfully');
      res.status(201).json({ sessionId: session._id.toString() });
    } catch (error) {
      next(error);
    }
  },
};
