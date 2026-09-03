import { streamAssessment } from '../adapters/ai.adapter.js';
import { Session } from '../models/session.model.js';
import { historyService } from '../services/history.service.js';
import logger from '../config/logger.js';

export const chatController = {
  /**
   * Streams Ayurvedic IP classification assessment using Server-Sent Events (SSE)
   * 
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async ask(req, res, next) {
    const correlationId = req.id || 'chat-ask';
    const { query, sessionId, historyOverride } = req.body;

    try {
      // 1. Verify or auto-create session for self-healing persistence
      let session = null;
      if (sessionId && sessionId.match(/^[0-9a-fA-F]{24}$/)) {
        session = await Session.findById(sessionId);
      }

      if (!session) {
        logger.info({ correlationId, requestedSessionId: sessionId }, 'Session missing or invalid, creating fresh session');
        session = new Session({
          title: query.length > 55 ? query.slice(0, 52) + '...' : query,
          userId: req.user?.id || undefined,
        });
        await session.save();
      } else {
        // Associate user and title if needed
        let updated = false;
        if (!session.userId && req.user?.id) {
          session.userId = req.user.id;
          updated = true;
        }
        if (!session.title || session.title.startsWith('New Assessment') || session.title.startsWith('New Ayurvedic')) {
          session.title = query.length > 55 ? query.slice(0, 52) + '...' : query;
          updated = true;
        }
        if (updated) await session.save();
      }

      const activeSessionId = session._id.toString();

      // 2. Setup Server-Sent Events (SSE) response headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const writeEvent = (eventObj) => {
        return res.write(`data: ${JSON.stringify(eventObj)}\n\n`);
      };

      // Emit session acknowledgment event so client stores the valid session ID
      writeEvent({ type: 'session', sessionId: activeSessionId });

      // 3. Keep track of stream state
      let generatedText = '';
      let collectedCitations = [];
      let terminalSent = false;

      // 4. Retrieve session history if historyOverride is not provided
      let chatHistory = historyOverride;
      if (!chatHistory) {
        chatHistory = await historyService.getMessagesBySessionId(activeSessionId);
      }

      // Save user message in database history
      await historyService.addMessage({
        sessionId: activeSessionId,
        role: 'user',
        content: query,
      });

      // Invoke dynamic AI stream assessment
      const generator = await streamAssessment(query, {
        sessionId: activeSessionId,
        history: chatHistory,
      });

      for await (const event of generator) {
        // Handle stream errors
        if (event.type === 'error') {
          writeEvent({ type: 'error', message: event.message });
          terminalSent = true;
          break;
        }

        // Handle natural generator done token
        if (event.type === 'done') {
          writeEvent({ type: 'done' });
          terminalSent = true;
          break;
        }

        // Accumulate output response data for database logging
        if (event.type === 'token') {
          generatedText += event.data;
        } else if (event.type === 'citations') {
          collectedCitations = collectedCitations.concat(event.data);
        }

        // Write stream events and check backpressure
        const ok = writeEvent(event);
        if (!ok) {
          await new Promise((resolve) => res.once('drain', resolve));
        }
      }

      // Write default terminal token if none was explicitly written
      if (!terminalSent) {
        writeEvent({ type: 'done' });
      }

      // 5. Persist assistant output to history database
      if (generatedText) {
        await historyService.addMessage({
          sessionId: activeSessionId,
          role: 'assistant',
          content: generatedText,
          citations: collectedCitations,
        });
      }

      logger.info({ correlationId, sessionId: activeSessionId }, 'Completed streaming AI assessment and saved logs');
    } catch (error) {
      logger.error(error, 'Unhandled exception in chat streaming controller');
      // If headers aren't sent, delegate to Express error middleware. Otherwise, write error to SSE stream.
      if (!res.headersSent) {
        next(error);
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'An internal error occurred during generation' })}\n\n`);
      }
    } finally {
      res.end();
    }
  },
};
