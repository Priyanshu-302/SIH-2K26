import React from 'react';
import { HistorySidebar } from '../components/history/HistorySidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { CitationPanel } from '../components/citation/CitationPanel';
import { useUIStore } from '../store/uiStore';

export default function ChatPage() {
  const { isSidebarOpen, isCitationPanelOpen, closeSidebar, closeCitationPanel } = useUIStore();

  return (
    <div className="flex-1 flex overflow-hidden relative w-full max-w-full">
      {/* Mobile Backdrop for History Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* History Sidebar: Drawer on Mobile, Static Side-Panel on Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-sage-100 flex flex-col transition-transform duration-300 ease-in-out md:static md:w-72 md:translate-x-0 shrink-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-elevated md:shadow-none' : '-translate-x-full md:hidden'
        }`}
      >
        <HistorySidebar />
      </aside>

      {/* Center Chat Window - Takes 100% full width */}
      <section className="flex-1 flex flex-col bg-alabaster-100 overflow-hidden w-full max-w-full min-w-0">
        <ChatWindow />
      </section>

      {/* Mobile Backdrop for Citation Panel */}
      {isCitationPanelOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={closeCitationPanel}
          aria-hidden="true"
        />
      )}

      {/* Right Citation Slide-out Panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-sage-100 flex flex-col shadow-elevated transition-transform duration-300 ease-in-out lg:static lg:w-80 lg:translate-x-0 lg:shadow-none shrink-0 ${
          isCitationPanelOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'
        }`}
      >
        <CitationPanel />
      </aside>
    </div>
  );
}
