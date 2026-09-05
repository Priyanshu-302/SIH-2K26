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

      // Only display sessions that have associated queries/messages
      const sessionIdsWithMessages = await Message.distinct('sessionId');
      filter._id = { $in: sessionIdsWithMessages };

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

  /**
   * Updates/renames session title
   */
  async renameSession(req, res, next) {
    const correlationId = req.id || 'session-rename';
    try {
      const { sessionId } = req.params;
      const { title } = req.body;

      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Check ownership if session is bound to a user and user is authenticated
      if (session.userId && req.user?.id && session.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'You do not have permission to modify this session' });
      }

      session.title = title.trim();
      if (!session.userId && req.user?.id) {
        session.userId = req.user.id;
      }
      await session.save();

      logger.info({ correlationId, sessionId, title: session.title }, 'Session renamed successfully');
      res.status(200).json({
        id: session._id.toString(),
        title: session.title,
        updatedAt: session.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Deletes session and cascades to delete all associated messages
   */
  async deleteSession(req, res, next) {
    const correlationId = req.id || 'session-delete';
    try {
      const { sessionId } = req.params;

      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Check ownership if session is bound to a user and user is authenticated
      if (session.userId && req.user?.id && session.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'You do not have permission to delete this session' });
      }

      // Cascade delete messages associated with this session
      await Message.deleteMany({ sessionId });
      // Delete session document
      await Session.findByIdAndDelete(sessionId);

      logger.info({ correlationId, sessionId }, 'Session and associated messages deleted successfully');
      res.status(200).json({ success: true, message: 'Session deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

