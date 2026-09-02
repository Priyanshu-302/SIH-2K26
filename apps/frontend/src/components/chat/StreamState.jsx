import React from 'react';
import { Sparkles } from 'lucide-react';

export function StreamState({ statusText = 'Analyzing traditional knowledge...' }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ayur-800 bg-ayur-50 px-3.5 py-2 rounded-xl border border-ayur-200 w-fit animate-pulse shadow-sm">
      <Sparkles className="w-3.5 h-3.5 text-ayur-600 animate-spin" />
      <span className="font-medium">{statusText || 'Consulting Classical Texts & TKDL Repositories...'}</span>
    </div>
  );
}
