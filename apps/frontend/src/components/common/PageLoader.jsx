import React from 'react';
import { Leaf } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="min-h-[400px] flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-ayur-100 flex items-center justify-center text-ayur-700 animate-bounce mb-3 border border-ayur-200">
        <Leaf className="w-6 h-6" />
      </div>
      <p className="text-xs font-semibold text-slate-700 font-heading">Loading Ayur-IP Intelligence...</p>
      <p className="text-[10px] text-slate-400 mt-1">Connecting to Traditional Knowledge Digital Library</p>
    </div>
  );
}
