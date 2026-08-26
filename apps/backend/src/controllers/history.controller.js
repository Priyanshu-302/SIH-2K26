import { historyService } from '../services/history.service.js';
import { Session } from '../models/session.model.js';

export const historyController = {
  /**
   * Retrieves paginated chat messages for a specific session
   * Route: GET /api/sessions/:sessionId/history
   * 
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async getHistory(req, res, next) {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
      // 1. Verify session exists
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          error: 'Session Not Found',
          code: 'SESSION_NOT_FOUND',
          details: 'Unable to retrieve chat history for a non-existent session.',
        });
      }

      // 2. Fetch paginated logs
      const messages = await historyService.getMessagesBySessionId(sessionId, limit, offset);
      
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  },
};
