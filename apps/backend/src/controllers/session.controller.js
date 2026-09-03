import { Session } from '../models/session.model.js';
import { Message } from '../models/message.model.js';
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
      
      logger.info({ correlationId, title, userId: req.user?.id }, 'Creating new assessment session');
      const session = new Session({
        title,
        userId: req.user?.id || undefined,
      });
      await session.save();
      
      logger.info({ correlationId, sessionId: session._id }, 'Assessment session created successfully');
      res.status(201).json({ sessionId: session._id.toString() });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves list of active past sessions belonging to authenticated user
   */
  async listSessions(req, res, next) {
    try {
      const filter = {};

      if (req.user?.id) {
        filter.$or = [
          { userId: req.user.id },
          { userId: { $exists: false } },
        ];
      }

      const sessions = await Session.find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(50)
        .lean();

      const formatted = sessions.map((s) => ({
        id: s._id.toString(),
        title: s.title || 'Ayurvedic IP Assessment',
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));

      res.status(200).json(formatted);
    } catch (error) {
      next(error);
    }
  },
};
