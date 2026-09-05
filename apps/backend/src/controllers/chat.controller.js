import { streamAssessment } from '../adapters/ai.adapter.js';
import { Session } from '../models/session.model.js';
import { historyService } from '../services/history.service.js';
import { getRedisClient, isRedisConnected } from '../config/redis.js';
import config from '../config/index.js';
import logger from '../config/logger.js';

function normalizeQuery(q) {
  return (q || '').toLowerCase().replace(/[^\w\s]/g, '').trim().replace(/\s+/g, ' ');
}

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
      // 1. Verify session or reject if non-existent
      let session = null;
      if (sessionId && sessionId.match(/^[0-9a-fA-F]{24}$/)) {
        session = await Session.findById(sessionId);
      }

      if (sessionId && !session) {
        return res.status(400).json({
          error: 'Invalid Session',
          code: 'SESSION_INVALID',
          details: 'The specified session ID does not exist.'
        });
      }

      if (!session) {
        logger.info({ correlationId, requestedSessionId: sessionId }, 'Session missing or omitted, creating fresh session');
        session = new Session({
          title: query.length > 55 ? query.slice(0, 52) + '...' : query,
          userId: req.user?.id || undefined,
        });
        await session.save();
      } else {
        // Enforce session ownership isolation
        if (session.userId && req.user?.id && session.userId.toString() !== req.user.id.toString()) {
          return res.status(403).json({
            error: 'Access Denied',
            code: 'FORBIDDEN',
            details: 'You do not have permission to post to this session.'
          });
        }

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

      // Check Redis query cache (0 token cost for repeated questions)
      const normalized = normalizeQuery(query);
      const cacheKey = `rag:cache:${normalized}`;
      let cachedPayload = null;

      try {
        const redis = getRedisClient();
        if (isRedisConnected()) {
          const cachedStr = await redis.get(cacheKey);
          if (cachedStr) {
            cachedPayload = JSON.parse(cachedStr);
          }
        }
      } catch (cacheErr) {
        logger.debug({ correlationId, err: cacheErr.message }, 'Redis cache read skipped');
      }

      if (cachedPayload && cachedPayload.text) {
        logger.info({ correlationId, cacheKey }, 'Redis RAG cache HIT - serving with natural streaming cadence');

        const isTestEnv = config.NODE_ENV === 'test';

        // 1. Natural thinking pause (~450ms) so user sees active reasoning state
        if (!isTestEnv) {
          await new Promise((resolve) => setTimeout(resolve, 450));
        }

        // 2. Chunk words into small natural token clusters (2-3 words per packet)
        const rawWords = cachedPayload.text.match(/\S+\s*/g) || [cachedPayload.text];
        const tokenChunks = [];
        for (let i = 0; i < rawWords.length; i += 2) {
          tokenChunks.push(rawWords.slice(i, i + 2).join(''));
        }

        logger.debug({ correlationId, tokenChunksCount: tokenChunks.length }, 'Streaming cached tokens with natural cadence');

        // 3. Stream token chunks smoothly at realistic typing cadence (~15ms per chunk)
        for (let i = 0; i < tokenChunks.length; i++) {
          if (res.writableEnded) break;
          writeEvent({ type: 'token', data: tokenChunks[i] });
          if (!isTestEnv) {
            await new Promise((resolve) => setTimeout(resolve, 15));
          }
        }

        if (cachedPayload.citations?.length) {
          writeEvent({ type: 'citations', data: cachedPayload.citations });
        }
        writeEvent({ type: 'done' });
        terminalSent = true;
        generatedText = cachedPayload.text;
        collectedCitations = cachedPayload.citations || [];
      } else {
        // Cache miss: Invoke dynamic AI stream assessment
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

        if (!terminalSent) {
          writeEvent({ type: 'done' });
        }

        // Cache completed output in Redis with 24-hour TTL (86400s)
        if (generatedText && generatedText.length > 50) {
          try {
            const redis = getRedisClient();
            if (isRedisConnected()) {
              await redis.setex(cacheKey, 86400, JSON.stringify({
                text: generatedText,
                citations: collectedCitations,
              }));
              logger.debug({ correlationId, cacheKey }, 'Cached LLM assessment in Redis (24h TTL)');
            }
          } catch (e) {
            logger.debug({ correlationId, err: e.message }, 'Redis cache write skipped');
          }
        }
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
