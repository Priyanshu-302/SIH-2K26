import { useEffect, useState, useCallback, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { fetchSessionHistoryAPI } from '../services/apiService';

export function useSession() {
  const { sessionId, setSessionId, setMessages, clearSession } = useChatStore();
  const [isInitializing, setIsInitializing] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const isLoadedRef = useRef(false);

  const loadSessionHistory = useCallback(async (targetSessionId) => {
    if (!targetSessionId) return;
    setIsInitializing(true);
    try {
      const history = await fetchSessionHistoryAPI(targetSessionId);
      if (Array.isArray(history) && history.length > 0) {
        const formattedMessages = history.map((m) => ({
          id: m._id || `msg-${Date.now()}`,
          role: m.role,
          content: m.content,
          citations: m.citations || [],
          timestamp: m.createdAt || new Date().toISOString(),
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn('[Session History Load Warning]:', err.message);
      setSessionError(err.message);
      setMessages([]);
      if (err.message?.includes('Access Denied') || err.message?.includes('403') || err.message?.includes('Invalid Session')) {
        clearSession();
      }
    } finally {
      setIsInitializing(false);
    }
  }, [setMessages, clearSession]);

  // Load saved session on initial app mount only
  useEffect(() => {
    if (isLoadedRef.current) return;
    isLoadedRef.current = true;

    const activeSessionId = typeof window !== 'undefined' ? localStorage.getItem('ayur_session_id') : null;
    if (activeSessionId) {
      setSessionId(activeSessionId);
      loadSessionHistory(activeSessionId);
    }
  }, [loadSessionHistory, setSessionId]);

  // Reset to a clean new assessment workspace (without creating blank DB entries)
  const resetSession = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return {
    sessionId,
    isInitializing,
    sessionError,
    resetSession,
    loadSessionHistory,
  };
}

