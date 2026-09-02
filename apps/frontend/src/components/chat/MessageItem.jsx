import React from 'react';
import { User, Bot } from 'lucide-react';
import { CitationBadge } from '../citation/CitationBadge';

export const MessageItem = React.memo(function MessageItem({ message }) {
  const isUser = message.role === 'user';

  // Helper to parse Sanskrit verses and citations in assistant messages
  const renderFormattedContent = (text, citations = []) => {
    if (!text) return null;

    // Check for Sanskrit verses or classical blocks denoted by Sanskrit quotes or headers
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      // Check if paragraph contains Sanskrit text or classical verse formatting
      const isSanskritQuote = /[\u0900-\u097F]/.test(para);

      if (isSanskritQuote && !isUser) {
        return (
          <div key={pIdx} className="parchment-box rounded-xl p-3.5 my-2 text-xs font-serif leading-relaxed border-l-4 border-l-goldParchment-500 shadow-sm">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-900 block mb-1">
              Classical Manuscript Context:
            </span>
            <p className="italic text-slate-800">{para}</p>
          </div>
        );
      }

      // Parse inline citation tags like [TKDL Act 3(p)] or [1]
      const parts = para.split(/(\[[^\]]+\])/g);

      return (
        <p key={pIdx} className="mb-2 last:mb-0 leading-relaxed">
          {parts.map((part, index) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              const tagContent = part.slice(1, -1);
              const matchingCit = citations.find(
                (c) =>
                  c.section?.includes(tagContent) ||
                  c.source?.includes(tagContent) ||
                  c.id === tagContent
              ) || {
                source: tagContent.length > 2 ? tagContent : 'Traditional Knowledge Library',
                section: tagContent,
                snippet: para,
                confidence: 'high',
              };

              return <CitationBadge key={index} citation={matchingCit} index={index} />;
            }
            return <span key={index}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-ayur-100 text-ayur-800 flex items-center justify-center shrink-0 border border-ayur-200 mt-1 shadow-sm">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
          isUser
            ? 'bg-ayur-700 text-white rounded-br-none shadow-soft-card'
            : 'bg-white border border-sage-100 rounded-bl-none shadow-soft-card text-slate-800'
        }`}
      >
        <div className="prose prose-sm prose-slate max-w-none">
          {renderFormattedContent(message.content, message.citations)}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
});
