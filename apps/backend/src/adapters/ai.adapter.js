import config from '../config/index.js';
import logger from '../config/logger.js';
import { mockAgentStream } from './mockAi.adapter.js';

// Lazily import runAgentStream from `@ayur/ai-core` if not mocking
let runAgentStream = null;

/**
 * Adapter interface mapping input arguments to the AI core engine
 * 
 * @param {string} query - The user's Ayurvedic formulation query.
 * @param {Object} context - Context options.
 * @param {string} context.sessionId - Valid MongoDB ObjectId string representing session.
 * @param {Array<Object>} [context.history] - Array of previous chat messages.
 * @param {Object} [context.options] - Extensible configuration parameters.
 * @returns {AsyncGenerator<Object, void, unknown>} Async generator yielding events.
 */
export async function* streamAssessment(query, { sessionId, history, options } = {}) {
  const correlationId = 'ai-stream';
  
  if (config.AI_ADAPTER_MOCK) {
    logger.debug({ correlationId, sessionId }, 'Routing RAG query to Mock AI Adapter');
    yield* mockAgentStream({ query, sessionId, history, options });
    return;
  }

  if (!runAgentStream) {
    logger.debug({ correlationId }, 'Importing @ayur/ai-core runAgentStream dynamically');
    const aiCore = await import('@ayur/ai-core');
    runAgentStream = aiCore.runAgentStream;
  }

  logger.debug({ correlationId, sessionId }, 'Routing RAG query to production AI Core Engine');
  yield* runAgentStream({ query, sessionId, history, options });
}
