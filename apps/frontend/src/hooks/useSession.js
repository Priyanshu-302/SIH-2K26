import { useEffect, useState, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { createSessionAPI, fetchSessionHistoryAPI } from '../services/apiService';

let isGlobalInitializing = false;

export function useSession() {
  const { sessionId, setSessionId, setMessages, clearSession } = useChatStore();
  const { addToast } = useUIStore();
  const [isInitializing, setIsInitializing] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  const initSession = useCallback(async () => {
    if (isGlobalInitializing) return;
    isGlobalInitializing = true;
    setIsInitializing(true);
    setSessionError(null);

    // 1. If we already have a sessionId (restored from localStorage)
    const activeSessionId = sessionId || (typeof window !== 'undefined' ? localStorage.getItem('ayur_session_id') : null);

    if (activeSessionId) {
      try {
        const history = await fetchSessionHistoryAPI(activeSessionId);
        if (Array.isArray(history)) {
          setSessionId(activeSessionId);
          if (history.length > 0) {
            const formattedMessages = history.map((m) => ({
              id: m._id || `msg-${Date.now()}`,
              role: m.role,
              content: m.content,
              citations: m.citations || [],
              timestamp: m.createdAt || new Date().toISOString(),
            }));
            setMessages(formattedMessages);
          }
          setIsInitializing(false);
          isGlobalInitializing = false;
          return;
        }
      } catch (err) {
        console.warn('[History Restoration Warning]:', err.message);
      }
    }

    // 2. Otherwise initialize a fresh session on backend
    try {
      const data = await createSessionAPI();
      if (data && data.sessionId) {
        setSessionId(data.sessionId);
      } else {
        throw new Error('Server returned empty session identifier');
      }
    } catch (err) {
      console.error('[Session Setup Failed]:', err);
      setSessionError(err.message);
      addToast({ type: 'error', message: `Session creation failed: ${err.message}` });
    } finally {
      setIsInitializing(false);
      isGlobalInitializing = false;
    }
  }, [sessionId, setSessionId, setMessages, addToast]);

  useEffect(() => {
    initSession();
  }, []);

  const resetSession = async () => {
    if (isGlobalInitializing) return;
    isGlobalInitializing = true;
    clearSession();
    try {
      setIsInitializing(true);
      const data = await createSessionAPI();
      if (data && data.sessionId) {
        setSessionId(data.sessionId);
        setMessages([]);
      }
    } catch (err) {
      addToast({ type: 'error', message: `Failed to create new session: ${err.message}` });
    } finally {
      setIsInitializing(false);
      isGlobalInitializing = false;
    }
  };

  return {
    sessionId,
    isInitializing,
    sessionError,
    initSession,
    resetSession,
  };
}
