import { useEffect, useState, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { createSessionAPI, fetchSessionHistoryAPI } from '../services/apiService';

export function useSession() {
  const { sessionId, setSessionId, setMessages, clearSession } = useChatStore();
  const { addToast } = useUIStore();
  const [isInitializing, setIsInitializing] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  const loadSessionHistory = useCallback(async (targetSessionId) => {
    if (!targetSessionId) return;
    try {
      const history = await fetchSessionHistoryAPI(targetSessionId);
      if (Array.isArray(history)) {
        const formattedMessages = history.map((m) => ({
          id: m._id || `msg-${Date.now()}`,
          role: m.role,
          content: m.content,
          citations: m.citations || [],
          timestamp: m.createdAt || new Date().toISOString(),
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.warn('[Session History Load Warning]:', err.message);
    }
  }, [setMessages]);

  const initSession = useCallback(async () => {
    setIsInitializing(true);
    setSessionError(null);

    const activeSessionId = sessionId || (typeof window !== 'undefined' ? localStorage.getItem('ayur_session_id') : null);

    if (activeSessionId) {
      setSessionId(activeSessionId);
      await loadSessionHistory(activeSessionId);
      setIsInitializing(false);
      return;
    }

    try {
      const data = await createSessionAPI();
      if (data && data.sessionId) {
        setSessionId(data.sessionId);
        setMessages([]);
      }
    } catch (err) {
      setSessionError(err.message);
      addToast({ type: 'error', message: `Session creation failed: ${err.message}` });
    } finally {
      setIsInitializing(false);
    }
  }, [sessionId, setSessionId, setMessages, loadSessionHistory, addToast]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const resetSession = async () => {
    clearSession();
    setIsInitializing(true);
    try {
      const data = await createSessionAPI();
      if (data && data.sessionId) {
        setSessionId(data.sessionId);
        setMessages([]);
        window.dispatchEvent(new Event('refresh_sessions'));
      }
    } catch (err) {
      addToast({ type: 'error', message: `Failed to create new session: ${err.message}` });
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    sessionId,
    isInitializing,
    sessionError,
    initSession,
    resetSession,
    loadSessionHistory,
  };
}
