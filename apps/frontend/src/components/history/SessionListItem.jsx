import React from 'react';
import { MessageSquare, ChevronRight } from 'lucide-react';

export function SessionListItem({ session, isActive, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
        isActive
          ? 'bg-ayur-50 border border-ayur-200 text-ayur-900 shadow-sm'
          : 'hover:bg-sage-50 text-slate-700'
      }`}
    >
      <div className="flex items-start gap-2.5 overflow-hidden">
        <MessageSquare
          className={`w-4 h-4 shrink-0 mt-0.5 ${
            isActive ? 'text-ayur-700' : 'text-slate-400'
          }`}
        />
        <div className="overflow-hidden">
          <p className="text-xs font-semibold truncate leading-tight">
            {session.title}
          </p>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {session.date}
          </span>
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-60" />
    </div>
  );
}
