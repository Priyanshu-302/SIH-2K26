import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useSession } from '../../hooks/useSession';
import { useUIStore } from '../../store/uiStore';
import { SessionListItem } from './SessionListItem';

export function HistorySidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const { sessionId, resetSession, isInitializing } = useSession();
  const { closeSidebar } = useUIStore();

  // Mock past historical sessions for UI richness
  const [mockSessions] = useState([
    {
      id: 'sess-1',
      title: 'Neem & Curcumin Synergy Study',
      date: 'Today 10:24 AM',
      active: true,
    },
    {
      id: 'sess-2',
      title: 'Tinospora Cordifolia Patentability',
      date: 'Yesterday',
      active: false,
    },
    {
      id: 'sess-3',
      title: 'Triphala Extraction Solvent Prior Art',
      date: '24 Aug 2026',
      active: false,
    },
    {
      id: 'sess-4',
      title: 'Ashwagandha Withanolide Patent Claims',
      date: '20 Aug 2026',
      active: false,
    },
  ]);

  const filteredSessions = mockSessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
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
            closeSidebar();
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
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
          Recent Prior Art Queries
        </span>

        {filteredSessions.map((session) => (
          <SessionListItem
            key={session.id}
            session={session}
            isActive={session.active}
            onSelect={() => closeSidebar()}
          />
        ))}
      </div>
    </div>
  );
}
