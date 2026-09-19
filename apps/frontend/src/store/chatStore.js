import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  sessionId: typeof window !== 'undefined' ? localStorage.getItem('ayur_session_id') || null : null,
  jurisdiction: typeof window !== 'undefined' ? localStorage.getItem('ayur_jurisdiction') || 'national' : 'national',
  messages: [],
  isStreaming: false,
  streamStatusText: '',
  selectedCitation: null,

  setJurisdiction: (jurisdiction) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayur_jurisdiction', jurisdiction);
    }
    set({ jurisdiction });
  },

  setSessionId: (sessionId) => {
    if (typeof window !== 'undefined') {
      if (sessionId) localStorage.setItem('ayur_session_id', sessionId);
      else localStorage.removeItem('ayur_session_id');
    }
    set({ sessionId });
  },

  setMessages: (messages) => set({ messages: Array.isArray(messages) ? messages : [] }),

  setStreamingState: (isStreaming, statusText = '') =>
    set({ isStreaming, streamStatusText: statusText }),

  setSelectedCitation: (citation) => set({ selectedCitation: citation }),

  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ayur_session_id');
    }
    set({ sessionId: null, messages: [], selectedCitation: null });
  },

  addUserMessage: (content) => {
    const currentJurisdiction = get().jurisdiction;
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      jurisdiction: currentJurisdiction,
      citations: [],
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
    }));

    return userMsg;
  },

  initAssistantMessage: () => {
    const currentJurisdiction = get().jurisdiction;
    const assistantMsg = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      jurisdiction: currentJurisdiction,
      citations: [],
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, assistantMsg],
      isStreaming: true,
      streamStatusText: currentJurisdiction === 'international' ? 'Consulting WIPO GRATK & PCT treaties...' : 'Analyzing legal framework...',
    }));

    return assistantMsg;
  },

  appendStreamToken: (token) => {
    set((state) => {
      const messages = [...state.messages];
      if (messages.length === 0) return state;

      const lastIdx = messages.length - 1;
      if (messages[lastIdx].role !== 'assistant') return state;

      const updatedLastMsg = {
        ...messages[lastIdx],
        content: messages[lastIdx].content + token,
      };

      messages[lastIdx] = updatedLastMsg;
      return { messages };
    });
  },

  setCitations: (citations) => {
    set((state) => {
      const messages = [...state.messages];
      if (messages.length === 0) return state;

      const lastIdx = messages.length - 1;
      if (messages[lastIdx].role !== 'assistant') return state;

      messages[lastIdx] = {
        ...messages[lastIdx],
        citations: Array.isArray(citations) ? citations : [],
      };

      return { messages };
    });
  },

  finishStreaming: () => {
    set({ isStreaming: false, streamStatusText: '' });
  },
}));
