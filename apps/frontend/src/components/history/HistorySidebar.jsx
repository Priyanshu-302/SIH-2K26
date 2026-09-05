import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Clock, AlertCircle } from 'lucide-react';
import { useSession } from '../../hooks/useSession';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import {
  fetchSessionsAPI,
  fetchSessionHistoryAPI,
  renameSessionAPI,
  deleteSessionAPI,
} from '../../services/apiService';
import { SessionListItem } from './SessionListItem';

function formatSessionDate(dateString) {
  if (!dateString) return 'Recent';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recent';
  }
}

export function HistorySidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sessionId, resetSession, isInitializing } = useSession();
  const { setSessionId, setMessages } = useChatStore();
  const { closeSidebar, addToast } = useUIStore();

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchSessionsAPI();
      if (Array.isArray(list)) {
        setSessions(list);
      }
    } catch (err) {
      console.warn('[Load Sessions Error]:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    const handleRefresh = () => loadSessions();
    window.addEventListener('refresh_sessions', handleRefresh);
    return () => window.removeEventListener('refresh_sessions', handleRefresh);
  }, [loadSessions]);

  const handleSelectSession = async (targetSessionId) => {
    try {
      setSessionId(targetSessionId);
      const history = await fetchSessionHistoryAPI(targetSessionId);

      if (Array.isArray(history)) {
        const formatted = history.map((m) => ({
          id: m._id || `msg-${Date.now()}`,
          role: m.role,
          content: m.content,
          citations: m.citations || [],
          timestamp: m.createdAt || new Date().toISOString(),
        }));
        setMessages(formatted);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('[Select Session Error]:', err);
    } finally {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        closeSidebar();
      }
    }
  };

  const handleRenameSession = async (targetSessionId, newTitle) => {
    try {
      setSessions((prev) =>
        prev.map((s) => (s.id === targetSessionId ? { ...s, title: newTitle } : s))
      );

      const res = await renameSessionAPI(targetSessionId, newTitle);
      addToast({ type: 'success', message: 'Assessment renamed' });

      if (res && res.title) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId
              ? { ...s, title: res.title, updatedAt: res.updatedAt }
              : s
          )
        );
      }
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Failed to rename assessment' });
      loadSessions();
    }
  };

  const handleDeleteSession = async (targetSessionId) => {
    try {
      const isActiveSession = sessionId === targetSessionId;
      const remainingSessions = sessions.filter((s) => s.id !== targetSessionId);

      setSessions(remainingSessions);
      await deleteSessionAPI(targetSessionId);
      addToast({ type: 'success', message: 'Assessment deleted' });

      if (isActiveSession) {
        if (remainingSessions.length > 0) {
          handleSelectSession(remainingSessions[0].id);
        } else {
          resetSession();
        }
      }
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Failed to delete assessment' });
      loadSessions();
    }
  };

  const filteredSessions = sessions.filter((s) =>
    (s.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Mobile Header with Close Button */}
      <div className="p-3.5 sm:p-4 space-y-3 border-b border-sage-100">
        <div className="flex items-center justify-between md:hidden">
          <span className="text-xs font-bold font-heading text-slate-800">Query History</span>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-sage-50"
            aria-label="Close query history"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            resetSession();
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              closeSidebar();
            }
          }}
          disabled={isInitializing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ayur-700 hover:bg-ayur-800 text-white text-xs font-semibold shadow-soft-card transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Assessment</span>
        </button>


        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past queries..."
            className="w-full pl-8 pr-3 py-1.5 bg-alabaster-100 border border-sage-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-ayur-600 transition-colors"
          />
        </div>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Recent Assessments ({filteredSessions.length})
          </span>
          <button
            onClick={loadSessions}
            className="text-[10px] text-ayur-700 hover:underline flex items-center gap-1 cursor-pointer"
            title="Refresh history list"
          >
            <Clock className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs px-4">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-sage-300" />
            <p>No matching assessment sessions found.</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={{
                id: session.id,
                title: session.title || 'Untitled Assessment',
                date: formatSessionDate(session.updatedAt || session.createdAt),
              }}
              isActive={session.id === sessionId}
              onSelect={() => handleSelectSession(session.id)}
              onRename={handleRenameSession}
              onDelete={handleDeleteSession}
            />
          ))
        )}
      </div>
    </div>
  );
}
