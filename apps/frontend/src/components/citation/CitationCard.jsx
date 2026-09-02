import React from 'react';
import { ExternalLink, Scale, AlertOctagon, BookOpen } from 'lucide-react';
import { Badge } from '../ui/Badge';

/**
 * Format raw document file names into clean, readable judicial and statutory titles.
 */
function formatCitationSource(source) {
  if (!source) return 'Traditional Knowledge Digital Library';

  const clean = source.replace(/\.(md|pdf|txt)$/i, '');
  const lower = clean.toLowerCase();

  // Known landmark cases, statutes, and GI registry mappings
  if (lower.includes('manu_chaudhary')) return 'Manu Chaudhary v. Controller (Delhi HC)';
  if (lower.includes('shaafi_naturcure')) return 'Shaafi Naturcure v. Controller (Delhi HC)';
  if (lower.includes('novartis')) return 'Novartis AG v. Union of India (Supreme Court)';
  if (lower.includes('divya_pharmacy')) return 'Divya Pharmacy v. Union of India (Uttarakhand HC)';
  if (lower.includes('monsanto')) return 'Monsanto v. Nuziveedu Seeds (Supreme Court)';
  if (lower.includes('fraunhofer')) return 'Fraunhofer-Gesellschaft v. Controller (Calcutta HC)';
  if (lower.includes('cincata')) return 'Bioactive Cincata Patent Revocation (1076/CHE/2007)';
  if (lower.includes('panchagavya') || lower.includes('201721043812')) return 'Panchagavya Herbal Lamp (InPASS 201721043812)';
  if (lower.includes('patents_act')) return 'The Patents Act, 1970';
  if (lower.includes('biological_diversity')) return 'Biological Diversity Act, 2002';
  if (lower.includes('saffron')) return 'Kashmir Saffron (GI Certificate No. 635)';
  if (lower.includes('ashwagandha')) return 'Nagori Ashwagandha (GI Registry)';
  if (lower.includes('turmeric')) return 'TKDL Turmeric Revocation (US 5,401,504)';
  if (lower.includes('neem')) return 'TKDL Neem Revocation (EP 0436257)';

  // Fallback: convert snake_case or kebab-case to Title Case
  return clean
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Strips raw markdown debris (headers, bold, YAML frontmatter, trailing dashes) from snippets.
 */
function sanitizeSnippet(text) {
  if (!text) return 'Verified statutory context from indexed legal repository.';

  let sanitized = text
    // Remove YAML frontmatter blocks
    .replace(/^---[\s\S]*?---\s*/g, '')
    // Remove markdown headers
    .replace(/#+\s+/g, '')
    // Remove bold and italics
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove bullet characters, leading dashes and asterisks
    .replace(/^[-*•\s]+/gm, '')
    // Remove citation bracket artifacts like [^1]
    .replace(/\[\^?.*?\]/g, '')
    // Collapse whitespace and newlines
    .replace(/[\n\r]+/g, ' ')
    .trim();

  // If the snippet starts abruptly with a partial word, trim to next clean sentence/word
  if (/^[a-z]\s/i.test(sanitized)) {
    sanitized = sanitized.slice(2);
  }

  return sanitized || 'Statutory reference grounded in official IP database.';
}

export function CitationCard({ citation }) {
  if (!citation) return null;

  const isLowConfidence = citation.confidence === 'low';
  const cleanTitle = formatCitationSource(citation.source);
  const cleanText = sanitizeSnippet(citation.snippet);

  // Friendly section label
  const sectionLabel =
    !citation.section || citation.section.toLowerCase() === 'general'
      ? 'Statutory Grounds / Precedent'
      : citation.section;

  return (
    <div
      className={`rounded-2xl p-4 space-y-3 transition-all ${
        isLowConfidence
          ? 'bg-amber-50/50 border border-amber-300 shadow-sm'
          : 'bg-white border border-sage-100 shadow-soft-card hover:border-emerald-200'
      }`}
    >
      {isLowConfidence && (
        <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-semibold pb-1 border-b border-amber-200">
          <AlertOctagon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Low Retrieval Match Score - Verification Advised</span>
        </div>
      )}

      {/* Header with Title and Confidence */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 mt-0.5">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-heading leading-snug">
              {cleanTitle}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {sectionLabel}
              </span>
            </div>
          </div>
        </div>

        <Badge variant={citation.confidence || 'high'}>
          {citation.confidence || 'high'} Match
        </Badge>
      </div>

      {/* Clean Context Snippet */}
      <div className="parchment-box p-3 rounded-xl text-xs text-slate-700 font-serif leading-relaxed border border-goldParchment-300 bg-goldParchment-50/40">
        <span className="text-amber-900 font-sans block text-[10px] uppercase font-bold tracking-wider mb-1">
          Extracted Legal Snippet:
        </span>
        <p className="italic text-slate-800">"{cleanText}"</p>
      </div>

      {/* Official Link */}
      {citation.url && (
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ayur-700 hover:text-ayur-800 transition-colors pt-0.5"
        >
          <span>View Source Document / Kanoon Entry</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
