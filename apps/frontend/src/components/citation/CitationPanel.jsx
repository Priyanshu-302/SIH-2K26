import React from 'react';
import { X, BookMarked, Scale } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import { CitationCard } from './CitationCard';

export function CitationPanel() {
  const { selectedCitation, messages } = useChatStore();
  const { closeCitationPanel } = useUIStore();

  // Find all citations from the latest assistant message as back up if none selected
  const assistantMessages = messages.filter((m) => m.role === 'assistant');
  const latestCitations =
    assistantMessages.length > 0
      ? assistantMessages[assistantMessages.length - 1].citations || []
      : [];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sage-100 bg-alabaster-50">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-ayur-700" />
          <h3 className="font-heading font-bold text-slate-900 text-sm">
            Legal Grounding & Citations
          </h3>
        </div>
        <button
          onClick={closeCitationPanel}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-sage-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {selectedCitation ? (
          <div>
            <span className="text-[10px] uppercase font-bold text-ayur-800 tracking-wider mb-2 block">
              Highlighted Reference
            </span>
            <CitationCard citation={selectedCitation} />
          </div>
        ) : null}

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3 block">
            All Groundings in Current Assessment ({latestCitations.length})
          </span>
          {latestCitations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <BookMarked className="w-8 h-8 mx-auto mb-2 text-sage-300" />
              <p>No citations extracted for this assessment yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestCitations.map((cit, idx) => (
                <CitationCard key={cit.id || idx} citation={cit} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
