import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useChatStream } from '../../hooks/useChatStream';
import { useDocumentStore } from '../../store/documentStore';

export function ChatInput() {
  const [query, setQuery] = useState('');
  const { submitQuery, isStreaming } = useChatStream();
  const { setIsUploadModalOpen } = useDocumentStore();

  const handleSend = (e) => {
    e?.preventDefault();
    if (!query.trim() || isStreaming) return;

    submitQuery(query.trim());
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative w-full">
      <div className="flex items-end gap-1.5 sm:gap-2 bg-alabaster-100 border border-sage-200 rounded-2xl p-1.5 sm:p-2 focus-within:border-ayur-600 focus-within:ring-2 focus-within:ring-ayur-100 transition-all shadow-inner">
        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="p-1.5 sm:p-2 text-slate-400 hover:text-ayur-700 transition-colors shrink-0 cursor-pointer"
          title="Attach claim document or patent draft"
          aria-label="Attach claim document"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          rows={1}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a legal query (e.g. 'Is Neem & Tulsi combination patentable under Sec 3p?')..."
          className="flex-1 bg-transparent border-0 resize-none text-[11px] sm:text-xs text-slate-800 placeholder:text-slate-400 focus:ring-0 p-1.5 sm:p-2 max-h-28 sm:max-h-32 focus:outline-none leading-relaxed"
        />

        <button
          type="submit"
          disabled={!query.trim() || isStreaming}
          className={`p-2 sm:p-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            query.trim() && !isStreaming
              ? 'bg-ayur-700 hover:bg-ayur-800 text-white shadow-glow-mint'
              : 'bg-sage-100 text-slate-400 cursor-not-allowed'
          }`}
          aria-label="Send query"
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </form>
  );
}
