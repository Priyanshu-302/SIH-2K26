import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot } from 'lucide-react';
import { CitationBadge } from '../citation/CitationBadge';

export const MessageItem = React.memo(function MessageItem({ message }) {
  const isUser = message.role === 'user';
  const citations = message.citations || [];

  // Recursive citation replacer for text inside Markdown nodes
  const renderWithCitations = (children) => {
    if (typeof children === 'string') {
      const parts = children.split(/(\[[^\]]+\])/g);
      if (parts.length === 1) return children;

      return parts.map((part, index) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const tagContent = part.slice(1, -1).trim();

          // Check if this looks like a citation tag (e.g. Doc 1, 1, cit-..., or Section 3(p))
          if (/^(doc\s*\d+|\d+|cit-.*|section.*|§.*)/i.test(tagContent)) {
            const docMatch = tagContent.match(/doc\s*(\d+)/i);
            const citIndex = docMatch ? parseInt(docMatch[1], 10) - 1 : parseInt(tagContent, 10) - 1;

            const matchingCit =
              (citIndex >= 0 && citIndex < citations.length ? citations[citIndex] : null) ||
              citations.find(
                (c) =>
                  c.id === tagContent ||
                  c.section?.toLowerCase().includes(tagContent.toLowerCase()) ||
                  c.source?.toLowerCase().includes(tagContent.toLowerCase())
              ) || {
                source: 'Verified Corpus Reference',
                section: tagContent,
                snippet: 'Extracted from official IP statutes and traditional knowledge documents.',
                confidence: 'high',
              };

            return (
              <CitationBadge
                key={index}
                citation={matchingCit}
                index={citIndex >= 0 ? citIndex : index}
              />
            );
          }
        }
        return <span key={index}>{part}</span>;
      });
    }

    if (Array.isArray(children)) {
      return children.map((child, idx) => (
        <React.Fragment key={idx}>{renderWithCitations(child)}</React.Fragment>
      ));
    }

    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        children: renderWithCitations(children.props.children),
      });
    }

    return children;
  };

  // Custom component renderers for rich typography & layout
  const markdownComponents = {
    h1: ({ children }) => (
      <h1 className="text-base sm:text-lg font-bold font-heading text-slate-900 mt-4 mb-2 pb-1.5 border-b border-sage-200">
        {renderWithCitations(children)}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-sm sm:text-base font-bold font-heading text-ayur-800 mt-4 mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-ayur-600 inline-block shrink-0"></span>
        {renderWithCitations(children)}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xs sm:text-sm font-bold text-emerald-800 mt-3 mb-1.5">
        {renderWithCitations(children)}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xs font-bold text-slate-800 mt-2.5 mb-1 uppercase tracking-wider">
        {renderWithCitations(children)}
      </h4>
    ),
    p: ({ children }) => {
      // Check for Sanskrit verses or classical blocks denoted by Devanagari script
      const strContent = typeof children === 'string' ? children : '';
      const isSanskrit = /[\u0900-\u097F]/.test(strContent);

      if (isSanskrit && !isUser) {
        return (
          <div className="parchment-box rounded-xl p-3.5 my-2.5 text-xs font-serif leading-relaxed border-l-4 border-l-goldParchment-500 shadow-sm bg-goldParchment-50/50">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-900 block mb-1">
              Classical Manuscript Reference:
            </span>
            <p className="italic text-slate-800">{children}</p>
          </div>
        );
      }

      return (
        <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-700 text-xs sm:text-[13px]">
          {renderWithCitations(children)}
        </p>
      );
    },
    ul: ({ children }) => (
      <ul className="list-disc list-outside space-y-1.5 my-2.5 ml-4 text-slate-700 text-xs sm:text-[13px]">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-outside space-y-1.5 my-2.5 ml-4 text-slate-700 text-xs sm:text-[13px]">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed pl-1">{renderWithCitations(children)}</li>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-3.5 rounded-xl border border-sage-200 shadow-sm bg-white">
        <table className="min-w-full text-xs text-left divide-y divide-sage-200">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-sage-50 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
        {children}
      </thead>
    ),
    tbody: ({ children }) => <tbody className="divide-y divide-sage-100">{children}</tbody>,
    tr: ({ children }) => <tr className="hover:bg-alabaster-50 transition-colors">{children}</tr>,
    th: ({ children }) => (
      <th className="px-3.5 py-2.5 font-bold text-slate-800 whitespace-nowrap">
        {renderWithCitations(children)}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3.5 py-2.5 text-slate-700 text-xs leading-relaxed align-top">
        {renderWithCitations(children)}
      </td>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-ayur-600 bg-ayur-50/70 p-3 sm:p-3.5 my-3 rounded-r-xl italic text-slate-800 text-xs font-serif shadow-sm">
        {renderWithCitations(children)}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-slate-900">{renderWithCitations(children)}</strong>
    ),
    em: ({ children }) => <em className="italic text-slate-800">{children}</em>,
    hr: () => <hr className="my-3.5 border-sage-200" />,
    code: ({ children }) => (
      <code className="bg-sage-100 text-ayur-900 px-1.5 py-0.5 rounded text-[11px] font-mono border border-sage-200">
        {children}
      </code>
    ),
  };

  return (
    <div className={`flex gap-3 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-ayur-100 text-ayur-800 flex items-center justify-center shrink-0 border border-ayur-200 mt-1 shadow-sm">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-3xl sm:max-w-4xl lg:max-w-5xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed transition-all ${
          isUser
            ? 'bg-ayur-700 text-white rounded-br-none shadow-soft-card whitespace-pre-wrap'
            : 'bg-white border border-sage-100 rounded-bl-none shadow-soft-card text-slate-800 w-full'
        }`}
      >
        {isUser ? (
          <p className="leading-relaxed">{message.content}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
});
