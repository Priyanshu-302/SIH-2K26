import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore();

  // If not logged in, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/app/admin" replace />;
  }

  // If user is not an administrator, show restricted access gate
  if (user?.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full min-h-[60vh]">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-5 shadow-soft-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">
          Administrator Access Required
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          The classical dataset ingestion console and knowledge base indexing pipelines are restricted to authorized platform administrators.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app/chat"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ayur-700 hover:bg-ayur-800 text-white text-xs font-semibold shadow-soft-card transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workspace</span>
          </Link>
          <Link
            to="/app/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all"
          >
            <span>View Profile Roles</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
