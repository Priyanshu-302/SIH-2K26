import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import { useDocumentStore } from '../../store/documentStore';
import { useSession } from '../../hooks/useSession';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { StreamState } from './StreamState';
import { Modal } from '../ui/Modal';
import { FileDragDrop } from '../upload/FileDragDrop';
import { PanelLeftClose, PanelLeft, Sparkles, BookOpen, PlusCircle, Scale, ArrowDown } from 'lucide-react';

export function ChatWindow() {
  const { messages, isStreaming, streamStatusText } = useChatStore();
  const { isSidebarOpen, isCitationPanelOpen, toggleSidebar, toggleCitationPanel } = useUIStore();
  const { isUploadModalOpen, setIsUploadModalOpen } = useDocumentStore();
  const { sessionId, isInitializing, resetSession } = useSession();
  
  const scrollContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Monitor user scrolling to detect if they manually scrolled up to read
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // If within 100px of bottom, stick to bottom
    const isAtBottom = distanceFromBottom < 100;
    shouldAutoScrollRef.current = isAtBottom;
    setShowScrollBottom(!isAtBottom && scrollHeight > clientHeight);
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    shouldAutoScrollRef.current = true;
    setShowScrollBottom(false);
    if (smooth) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Frame-synced auto-scroll during streaming (avoids choppy smooth-scroll physics)
  useEffect(() => {
    if (!shouldAutoScrollRef.current || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const rafId = requestAnimationFrame(() => {
      if (container && shouldAutoScrollRef.current) {
        container.scrollTop = container.scrollHeight;
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden min-h-0">
      {/* Top Session Sub-Header */}
      <div className="h-14 sm:h-16 bg-white/90 backdrop-blur-md border-b border-sage-100 px-3 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-sage-50 border border-sage-200 shrink-0 transition-colors"
            title={isSidebarOpen ? 'Hide Query History' : 'Show Query History'}
            aria-label="Toggle Query History"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
          <div className="overflow-hidden">
            <h3 className="text-xs sm:text-sm font-bold font-heading text-slate-900 truncate">
              Ayurveda Prior Art Analysis
            </h3>
            <span className="text-[9px] sm:text-[10px] text-slate-500 truncate block">
              Patents Act 1970 • Section 3(p) Compliance
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={resetSession}
            disabled={isInitializing || isStreaming}
            className="text-[11px] sm:text-xs font-semibold text-ayur-800 hover:text-ayur-900 flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-ayur-50 hover:bg-ayur-100 transition-all border border-ayur-200 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">New Query</span>
          </button>

          {/* Legal Citations Panel Toggle (Visible on Desktop & Mobile) */}
          <button
            onClick={toggleCitationPanel}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer ${
              isCitationPanelOpen
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
            title="Toggle Legal Citations Drawer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Citations</span>
          </button>

          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>TKDL Active</span>
          </span>
        </div>
      </div>

      {/* Messages Scroll View with 60fps performance scroll */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-0 relative scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3 sm:space-y-4 py-8 px-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-ayur-100 flex items-center justify-center text-ayur-700 shadow-sm border border-ayur-200">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h4 className="text-sm sm:text-base font-bold font-heading text-slate-900">
              Begin Herbal Formulation IP Assessment
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
              Enter patent claims, botanical compositions, or active compounds (e.g. <em>Azadirachta indica</em>, <em>Tinospora cordifolia</em>) to assess novelty, non-obviousness, and traditional knowledge anticipation.
            </p>
          </div>
        ) : (
          messages.map((message, idx) => (
            <MessageItem key={message.id || idx} message={message} />
          ))
        )}

        {isStreaming && <StreamState statusText={streamStatusText} />}
      </div>

      {/* Floating Scroll to Bottom Button if user scrolled up */}
      {showScrollBottom && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => scrollToBottom(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-ayur-800/90 hover:bg-ayur-900 text-white text-xs font-semibold shadow-elevated backdrop-blur-xs transition-all cursor-pointer hover:scale-105"
          >
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            <span>Latest response</span>
          </button>
        </div>
      )}

      {/* Input Area with safe padding */}
      <div className="p-2.5 sm:p-4 bg-white/95 backdrop-blur-md border-t border-sage-100 shrink-0 relative z-10">
        <ChatInput />
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Patent Claim or Manuscript"
      >
        <FileDragDrop />
      </Modal>
    </div>
  );
}
