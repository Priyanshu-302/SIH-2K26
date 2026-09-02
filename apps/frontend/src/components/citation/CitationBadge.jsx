import React from 'react';
import { BookOpen } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';

export function CitationBadge({ citation, index }) {
  const { setSelectedCitation } = useChatStore();
  const { openCitationPanel } = useUIStore();

  const handleClick = () => {
    setSelectedCitation(citation);
    openCitationPanel();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`${citation.source || 'Traditional Knowledge'} - ${citation.section || '§ 3(p)'}`}
      className="inline-flex items-center gap-1 px-2.5 py-0.5 mx-1 rounded-full text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 hover:scale-105 transition-all cursor-pointer shadow-sm"
    >
      <BookOpen className="w-3 h-3 text-emerald-700" />
      <span>[{index + 1}] {citation.section || '§ 3(p)'}</span>
    </button>
  );
}
