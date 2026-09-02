import { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { createSessionAPI } from '../services/apiService';

export function useSession() {
  const { sessionId, setSessionId, clearSession } = useChatStore();
  const { addToast } = useUIStore();
  const [isInitializing, setIsInitializing] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  const initSession = async () => {
    if (isInitializing) return;
    setIsInitializing(true);
    setSessionError(null);

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
    }
  };

  useEffect(() => {
    if (!sessionId && !isInitializing && !sessionError) {
      initSession();
    }
  }, [sessionId]);

  const resetSession = async () => {
    clearSession();
    await initSession();
  };

  return {
    sessionId,
    isInitializing,
    sessionError,
    initSession,
    resetSession,
  };
}
