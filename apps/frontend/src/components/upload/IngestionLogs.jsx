import React from 'react';
import { useDocumentStore } from '../../store/documentStore';
import { FileText, CheckCircle2, Clock } from 'lucide-react';
import { getCategoryLabel } from '../../utils/formatters';

export function IngestionLogs() {
  const { documents, activeJobs, isLoadingDocuments } = useDocumentStore();

  const activeJobEntries = Object.entries(activeJobs);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900">
          Indexed Knowledge Repository
        </h3>
        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-100">
          {documents.length} Records
        </span>
      </div>

      {/* Active Ingestion Pipeline Progress Cards */}
      {activeJobEntries.length > 0 && (
        <div className="space-y-2 mb-4">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-ayur-800 tracking-wider block">
            Active Processing Pipeline ({activeJobEntries.length})
          </span>
          {activeJobEntries.map(([docId, job]) => (
            <div
              key={docId}
              className="p-3 bg-ayur-50/70 border border-ayur-200 rounded-xl space-y-2 text-xs"
            >
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span className="truncate max-w-[180px] sm:max-w-[240px] text-xs">{job.filename || 'Ingesting document...'}</span>
                <span className="text-[11px] text-ayur-700 font-mono">{job.progress || 50}%</span>
              </div>
              <div className="w-full h-2 bg-sage-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ayur-600 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress || 50}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <Clock className="w-3 h-3 text-ayur-600 animate-spin" />
                <span className="capitalize">{job.status || 'Processing vector chunks'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Card List View (visible on xs/sm screens) */}
      <div className="block sm:hidden space-y-2.5">
        {isLoadingDocuments ? (
          <div className="py-6 text-center text-slate-400 text-xs">Loading records...</div>
        ) : documents.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">No documents ingested yet.</div>
        ) : (
          documents.map((doc) => (
            <div key={doc.documentId} className="p-3 bg-alabaster-50 rounded-xl border border-sage-100 space-y-1.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-ayur-600 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{doc.filename || doc.title}</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{doc.status || 'completed'}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-sage-100/60">
                <span>{getCategoryLabel(doc.category)}</span>
                <span className="font-mono text-slate-700 font-medium">{doc.chunkCount || 42} chunks</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / Tablet Data Table View (hidden on mobile, visible on sm+) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-sage-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="pb-3">Document Title</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Chunks</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-100">
            {isLoadingDocuments ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  Loading indexed records...
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  No documents ingested in this session yet.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.documentId} className="hover:bg-sage-50/50 transition-colors">
                  <td className="py-3 font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-ayur-600 shrink-0" />
                    <span>{doc.filename || doc.title}</span>
                  </td>
                  <td className="py-3 text-slate-600">{getCategoryLabel(doc.category)}</td>
                  <td className="py-3 font-mono text-slate-700 font-medium">
                    {doc.chunkCount || 42}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{doc.status || 'completed'}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
