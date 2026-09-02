import React from 'react';
import { ExternalLink, FileText, AlertOctagon } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function CitationCard({ citation }) {
  if (!citation) return null;

  const isLowConfidence = citation.confidence === 'low';

  return (
    <div className={`rounded-2xl p-4 space-y-3 transition-all ${
      isLowConfidence
        ? 'bg-amber-50/50 border border-amber-300 shadow-sm'
        : 'light-card border border-sage-100 shadow-soft-card'
    }`}>
      {isLowConfidence && (
        <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-semibold pb-1 border-b border-amber-200">
          <AlertOctagon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Low Retrieval Match Score - Verification Advised</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-ayur-100 text-ayur-800 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-heading">
              {citation.source || 'Traditional Knowledge Digital Library (TKDL)'}
            </h4>
            <p className="text-[11px] font-mono text-ayur-700 font-semibold">{citation.section || 'Section 3(p)'}</p>
          </div>
        </div>
        <Badge variant={citation.confidence || 'high'}>
          {citation.confidence || 'high'} Confidence
        </Badge>
      </div>

      <div className="parchment-box p-3 rounded-xl text-xs text-slate-700 font-serif leading-relaxed border border-goldParchment-300">
        <span className="text-amber-900 font-sans block text-[10px] uppercase font-bold tracking-wider mb-1">
          Extracted Context Snippet:
        </span>
        "{citation.snippet || 'Traditional Ayurvedic formulation and decoction method.'}"
      </div>

      {citation.url && (
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ayur-700 hover:text-ayur-800 transition-colors pt-1"
        >
          <span>View Official Gazette / Source Text</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
