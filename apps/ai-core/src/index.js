/**
 * @ayur/ai-core package entry point
 */

export async function* runAgentStream({ query, sessionId, history, options } = {}) {
  yield { type: 'token', data: 'AI core: starting assessment...' };
  yield { type: 'done' };
}

export async function runIngestion(filePath, options = {}) {
  return { ingestedCount: 0, timeTakenMs: 0 };
}
