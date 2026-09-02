import { useRef, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { streamAssessmentAPI } from '../services/stream';
import { createSessionAPI } from '../services/apiService';

export function useChatStream() {
  const abortControllerRef = useRef(null);
  const {
    sessionId,
    setSessionId,
    addUserMessage,
    initAssistantMessage,
    appendStreamToken,
    setCitations,
    finishStreaming,
    isStreaming,
  } = useChatStore();

  const { addToast } = useUIStore();

  const submitQuery = useCallback(
    async (queryText) => {
      if (!queryText || !queryText.trim() || isStreaming) return;

      let currentSessionId = sessionId;

      // Create session on-demand if not present
      if (!currentSessionId) {
        try {
          const sessionRes = await createSessionAPI();
          currentSessionId = sessionRes.sessionId;
          setSessionId(currentSessionId);
        } catch (err) {
          addToast({ type: 'error', message: `Could not start session: ${err.message}` });
          return;
        }
      }

      // Add user message to state
      addUserMessage(queryText.trim());

      // Add empty assistant message to store
      initAssistantMessage();

      // Create new AbortController
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        await streamAssessmentAPI({
          query: queryText.trim(),
          sessionId: currentSessionId,
          signal: abortController.signal,
          onEvent: (event) => {
            if (!event || !event.type) return;

            switch (event.type) {
              case 'token':
                if (typeof event.data === 'string') {
                  appendStreamToken(event.data);
                }
                break;

              case 'citations':
                if (Array.isArray(event.data)) {
                  setCitations(event.data);
                }
                break;

              case 'error':
                addToast({ type: 'error', message: event.message || 'Stream error occurred' });
                finishStreaming();
                break;

              case 'done':
                finishStreaming();
                break;

              default:
                break;
            }
          },
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          addToast({ type: 'error', message: `Failed to execute assessment: ${error.message}` });
          finishStreaming();
        }
      }
    },
    [sessionId, isStreaming, addUserMessage, initAssistantMessage, appendStreamToken, setCitations, finishStreaming, addToast, setSessionId]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    finishStreaming();
    addToast({ type: 'info', message: 'Assessment generation stopped' });
  }, [finishStreaming, addToast]);

  return {
    submitQuery,
    cancelStream,
    isStreaming,
  };
}
