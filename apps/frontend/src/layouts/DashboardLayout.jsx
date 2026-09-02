import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, UploadCloud, Leaf, Home, UserCheck } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { Footer } from '../components/common/Footer';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, removeToast } = useUIStore();

  const isChatPage = location.pathname.includes('/app/chat');

  return (
    <div className="min-h-screen bg-alabaster-100 flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-sage-100 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm w-full max-w-full">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-ayur-100 flex items-center justify-center border border-ayur-200 group-hover:scale-105 transition-transform shrink-0">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-ayur-700" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base sm:text-lg font-bold font-heading text-slate-900 leading-none block">Ayur-IP</span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-ayur-700 uppercase tracking-wider block">Patent Intelligence</span>
            </div>
          </div>
        </div>

        {/* Center: Responsive Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-sage-50/90 p-1 rounded-xl border border-sage-100 shrink-0">
          <NavLink
            to="/app/chat"
            title="Legal Research Workspace"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-ayur-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Workspace</span>
          </NavLink>

          <NavLink
            to="/app/admin"
            title="Ingestion Console"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-ayur-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ingestion</span>
          </NavLink>

          <NavLink
            to="/app/profile"
            title="Examiner Profile"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-ayur-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Profile</span>
          </NavLink>
        </nav>

        {/* Right: Home and User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={() => navigate('/')}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-sage-50 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* User Profile Avatar Link */}
          <div 
            onClick={() => navigate('/app/profile')}
            className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-sage-200 cursor-pointer group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-ayur-700 group-hover:bg-ayur-800 text-white flex items-center justify-center text-xs font-bold shadow-sm transition-colors shrink-0">
              AS
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none group-hover:text-ayur-700 transition-colors">Dr. A. Sharma</p>
              <p className="text-[9px] text-slate-500">Patent Examiner</p>
            </div>
          </div>
        </div>
      </header>

      {/* Global Toast Notifications */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`p-3 rounded-xl shadow-elevated text-xs font-medium border flex items-center justify-between gap-2 cursor-pointer transition-all animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-slate-800 border-sage-200'
            }`}
          >
            <span>{toast.message}</span>
            <span className="text-[10px] opacity-60">✕</span>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full max-w-full">
        <Outlet />
      </main>

      {/* Footer for non-chat scrollable pages */}
      {!isChatPage && <Footer />}
    </div>
  );
}
