import React, { useEffect } from 'react';
import { FileDragDrop } from '../components/upload/FileDragDrop';
import { IngestionLogs } from '../components/upload/IngestionLogs';
import { useDocumentStore } from '../store/documentStore';
import { fetchDocumentsAPI } from '../services/apiService';
import { FileText, Layers, BookMarked, Scale } from 'lucide-react';

export default function AdminUploadPage() {
  const { documents, setDocuments, setIsLoadingDocuments } = useDocumentStore();

  useEffect(() => {
    async function loadDocs() {
      setIsLoadingDocuments(true);
      try {
        const data = await fetchDocumentsAPI();
        setDocuments(data || []);
      } catch (err) {
        console.warn('Failed to fetch documents, using local state:', err);
      } finally {
        setIsLoadingDocuments(false);
      }
    }
    loadDocs();
  }, [setDocuments, setIsLoadingDocuments]);

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="light-card rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingested Documents</p>
            <h4 className="text-2xl font-bold font-heading text-slate-900 mt-1">{documents.length || '4,103'}</h4>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              ↑ 12% this week
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="light-card rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chunks Indexed</p>
            <h4 className="text-2xl font-bold font-heading text-slate-900 mt-1">89,521</h4>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              ↑ 8% new
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="light-card rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classical Texts</p>
            <h4 className="text-2xl font-bold font-heading text-slate-900 mt-1">1,280</h4>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              Samhitas & TKDL
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-goldParchment-200 text-goldParchment-500 flex items-center justify-center">
            <BookMarked className="w-5 h-5" />
          </div>
        </div>

        <div className="light-card rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patents & Precedents</p>
            <h4 className="text-2xl font-bold font-heading text-slate-900 mt-1">2,823</h4>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              IPO & PCT Index
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Upload Staging & Repository Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 light-panel rounded-2xl p-6">
          <FileDragDrop />
        </div>
        <div className="lg:col-span-7 light-panel rounded-2xl p-6">
          <IngestionLogs />
        </div>
      </div>
    </div>
  );
}
