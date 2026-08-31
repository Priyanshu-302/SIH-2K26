import { graph } from './agent/graph.js';
export { runIngestion } from './ingestion/pipeline.js';

class Queue {
  constructor() {
    this.items = [];
    this.resolvers = [];
  }

  push(item) {
    if (this.resolvers.length > 0) {
      const resolve = this.resolvers.shift();
      resolve(item);
    } else {
      this.items.push(item);
    }
  }

  async pop() {
    if (this.items.length > 0) {
      return this.items.shift();
    }
    return new Promise((resolve) => {
      this.resolvers.push(resolve);
    });
  }
}

export async function runAgent(query, options = {}) {
  const { chatHistory = [], abortSignal, metadata = {} } = options;

  try {
    const finalState = await graph.invoke(
      {
        query,
        chatHistory,
        classification: '',
        classificationReasoning: '',
        generation: '',
        validatorFeedback: '',
        validationPassed: false,
        retryCount: 0,
        finalResponse: '',
        verifiedCitations: []
      },
      {
        signal: abortSignal,
        metadata
      }
    );

    return {
      result: finalState.finalResponse,
      classification: finalState.classification,
      citations: finalState.verifiedCitations || [],
      isValidated: finalState.validationPassed,
      retries: finalState.retryCount || 0,
      retrievedDocuments: finalState.retrievedDocuments || []
    };
  } catch (err) {
    console.error("runAgent failed:", err);
    throw err;
  }
}

export async function* runAgentStream(payload) {
  const { query, sessionId, history = [], options = {} } = payload || {};

  if (!query) {
    yield { type: "error", message: "Missing required parameter 'query'." };
    return;
  }

  const queue = new Queue();
  let finished = false;

  const executionPromise = graph.invoke(
    {
      query,
      chatHistory: history,
      classification: '',
      classificationReasoning: '',
      generation: '',
      validatorFeedback: '',
      validationPassed: false,
      retryCount: 0,
      finalResponse: '',
      verifiedCitations: []
    },
    {
      configurable: {
        onToken: (token) => queue.push({ type: "token", data: token }),
      },
      signal: options.abortSignal,
      metadata: { sessionId }
    }
  );

  executionPromise.then(
    (finalState) => {
      queue.push({ type: "citations", data: finalState.verifiedCitations || [] });
      queue.push({ type: "done" });
    },
    (err) => {
      queue.push({ type: "error", message: err.message || "Unknown error during reasoning execution." });
    }
  );

  while (!finished) {
    const event = await queue.pop();
    yield event;
    if (event.type === 'done' || event.type === 'error') {
      finished = true;
    }
  }
}
