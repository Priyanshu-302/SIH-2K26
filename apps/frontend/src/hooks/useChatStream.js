import { useRef, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { streamAssessmentAPI } from '../services/stream';
import { createSessionAPI } from '../services/apiService';
import { translateText } from '../services/bhashiniService';
import { useLanguageStore } from '../store/languageStore';

export function useChatStream() {
  const abortControllerRef = useRef(null);
  const {
    sessionId,
    setSessionId,
    jurisdiction,
    addUserMessage,
    initAssistantMessage,
    appendStreamToken,
    setCitations,
    finishStreaming,
    isStreaming,
  } = useChatStore();

  const { addToast } = useUIStore();
  const { selectedLanguage, setIsTranslating } = useLanguageStore();

  const submitQuery = useCallback(
    async (queryText) => {
      if (!queryText || !queryText.trim() || isStreaming) return;

      let currentSessionId = sessionId;
      let englishQuery = queryText.trim();

      // ── Translate user query → English (if not already English) ──
      if (selectedLanguage !== 'en') {
        try {
          setIsTranslating(true);
          englishQuery = await translateText(queryText.trim(), selectedLanguage, 'en');
        } catch (_) {
          englishQuery = queryText.trim(); // fallback
        } finally {
          setIsTranslating(false);
        }
      }

      // Create session on-demand with user's prompt as title if not present
      if (!currentSessionId) {
        try {
          const title = englishQuery.length > 55 ? englishQuery.slice(0, 52) + '...' : englishQuery;
          const sessionRes = await createSessionAPI(title);
          currentSessionId = sessionRes.sessionId;
          setSessionId(currentSessionId);
        } catch (err) {
          addToast({ type: 'error', message: `Could not start session: ${err.message}` });
          return;
        }
      }

      // Add the ORIGINAL user text (in their language) to the UI
      addUserMessage(queryText.trim());
      initAssistantMessage();

      // Create new AbortController
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        await streamAssessmentAPI({
          query: englishQuery,  // always send English to the AI backend
          sessionId: currentSessionId,
          jurisdiction,
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
                window.dispatchEvent(new Event('refresh_sessions'));

                // ── Translate AI response → user language (if not English) ──
                if (selectedLanguage !== 'en') {
                  (async () => {
                    const state = useChatStore.getState();
                    const msgs = state.messages;
                    const lastMsg = msgs[msgs.length - 1];
                    if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.content) return;

                    try {
                      setIsTranslating(true);
                      const translated = await translateText(
                        lastMsg.content,
                        'en',
                        selectedLanguage
                      );
                      if (translated && translated !== lastMsg.content) {
                        useChatStore.setState((s) => {
                          const updated = [...s.messages];
                          const idx = updated.length - 1;
                          if (updated[idx]?.role === 'assistant') {
                            updated[idx] = { ...updated[idx], content: translated };
                          }
                          return { messages: updated };
                        });
                      }
                    } catch (_) {
                      // silently skip — English response still shown
                    } finally {
                      setIsTranslating(false);
                    }
                  })();
                }
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
          useChatStore.setState((state) => {
            const msgs = [...state.messages];
            if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant' && !msgs[msgs.length - 1].content) {
              msgs.pop();
              return { messages: msgs };
            }
            return state;
          });
        }
      }
    },
    [sessionId, jurisdiction, isStreaming, selectedLanguage, setIsTranslating, addUserMessage, initAssistantMessage, appendStreamToken, setCitations, finishStreaming, addToast, setSessionId]
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
