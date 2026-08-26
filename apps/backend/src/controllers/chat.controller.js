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
      // 1. Verify session existence
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(400).json({
          error: 'Session Not Found',
          code: 'SESSION_INVALID',
          details: 'Please initialize a valid session via POST /api/sessions first.',
        });
      }

      // 2. Setup Server-Sent Events (SSE) response headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders(); // Flush the headers to establish the SSE channel

      const writeEvent = (eventObj) => {
        return res.write(`data: ${JSON.stringify(eventObj)}\n\n`);
      };

      // 3. Keep track of stream state
      let generatedText = '';
      let collectedCitations = [];
      let terminalSent = false;

      // 4. Retrieve session history if historyOverride is not provided
      let chatHistory = historyOverride;
      if (!chatHistory) {
        chatHistory = await historyService.getMessagesBySessionId(sessionId);
      }

      // Save user message in database history
      await historyService.addMessage({
        sessionId,
        role: 'user',
        content: query,
      });

      // Invoke dynamic AI stream assessment
      const generator = await streamAssessment(query, {
        sessionId,
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
          sessionId,
          role: 'assistant',
          content: generatedText,
          citations: collectedCitations,
        });
      }

      logger.info({ correlationId, sessionId }, 'Completed streaming AI assessment and saved logs');
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
