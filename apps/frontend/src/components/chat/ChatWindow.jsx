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
import { PanelLeftClose, PanelLeft, Sparkles, BookOpen, PlusCircle, Scale, ArrowDown, FileText, Network, Building2 } from 'lucide-react';
import { useFormStore } from '../../store/formStore';
import { StatutoryFormModal } from '../forms/StatutoryFormModal';
import { OntologyGraphModal } from '../graph/OntologyGraphModal';
import { IntakeWizardModal } from '../wizard/IntakeWizardModal';
import { FacilitatorEscalationModal } from '../facilitator/FacilitatorEscalationModal';
import { useT } from '../../config/i18n';

export function ChatWindow() {
  const t = useT();
  const { messages, isStreaming, streamStatusText, jurisdiction, setJurisdiction } = useChatStore();
  const { isSidebarOpen, isCitationPanelOpen, toggleSidebar, toggleCitationPanel } = useUIStore();
  const { isUploadModalOpen, setIsUploadModalOpen } = useDocumentStore();
  const { sessionId, isInitializing, resetSession } = useSession();
  
  const [isOntologyOpen, setIsOntologyOpen] = useState(false);
  const [isIntakeWizardOpen, setIsIntakeWizardOpen] = useState(false);
  const [isFacilitatorModalOpen, setIsFacilitatorModalOpen] = useState(false);
  
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
      <div className="h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-sage-100 px-3 sm:px-6 flex items-center justify-between shrink-0 gap-2">
        {/* Left Title & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-sage-50 border border-sage-200 shrink-0 transition-colors"
            title={isSidebarOpen ? t('hideQueryHistory') : t('showQueryHistory')}
            aria-label="Toggle Query History"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold font-heading text-slate-900 truncate">
              {jurisdiction === 'international' ? t('internationalAssessment') : t('domesticAssessment')}
            </h3>
            <span className="text-[9px] sm:text-[10px] text-slate-500 truncate block">
              {jurisdiction === 'international' 
                ? t('internationalSubtext')
                : t('domesticSubtext')}
            </span>
          </div>
        </div>

        {/* Right Header Controls: Jurisdiction Switch + New Query + Citations */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Central Jurisdiction Toggle Switch */}
          <div className="flex items-center p-0.5 sm:p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setJurisdiction('national')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                jurisdiction === 'national'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-300/80 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Switch to Indian National Regime (Patents Act 1970, Sec 3(p), BDA 2002)"
            >
              <span className="text-xs">🇮🇳</span>
              <span className="hidden md:inline">{t('indiaTab')}</span>
              <span className="md:hidden">{t('indiaShort')}</span>
            </button>
            <button
              type="button"
              onClick={() => setJurisdiction('international')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                jurisdiction === 'international'
                  ? 'bg-white text-indigo-800 shadow-sm border border-indigo-300/80 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Switch to International Regime (WIPO GRATK Treaty 2024, PCT, US FDA, EU THMPD)"
            >
              <span className="text-xs">🌐</span>
              <span className="hidden md:inline">{t('globalTab')}</span>
              <span className="md:hidden">{t('globalShort')}</span>
            </button>
          </div>

          {/* New Query Button */}
          <button
            onClick={resetSession}
            disabled={isInitializing || isStreaming}
            className="text-[11px] sm:text-xs font-semibold text-ayur-800 hover:text-ayur-900 flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-ayur-50 hover:bg-ayur-100 transition-all border border-ayur-200 cursor-pointer shrink-0"
            title="Start a new assessment query"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('newQuery')}</span>
          </button>

          {/* Legal Citations Panel Toggle */}
          <button
            onClick={toggleCitationPanel}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
              isCitationPanelOpen
                ? (jurisdiction === 'international' ? 'bg-indigo-700 text-white border-indigo-800 shadow-sm' : 'bg-emerald-700 text-white border-emerald-800 shadow-sm')
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
            title="Toggle Legal Citations Drawer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t('citations')}</span>
          </button>
        </div>
      </div>

      {/* Responsive Legal & Phase 2 Capabilities Ribbon */}
      <div className="bg-white/90 backdrop-blur-md border-b border-sage-100 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 1. Guided Intake Wizard */}
          <button
            onClick={() => setIsIntakeWizardOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-800 border border-emerald-300 shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
            title={t('intakeWizardDesc')}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t('intakeWizard')}</span>
          </button>

          {/* 2. Knowledge Graph Visualizer */}
          <button
            onClick={() => setIsOntologyOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            title={t('ontologyGraphDesc')}
          >
            <Network className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{t('ontologyGraph')}</span>
          </button>

          {/* 3. AYUSH PFC Government Facilitator Escalation */}
          <button
            onClick={() => setIsFacilitatorModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            title={t('escalateFacilitatorDesc')}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{t('escalateFacilitator')}</span>
          </button>

          {/* 4. Statutory Filing Forms (Form 25 / NBA) */}
          <button
            onClick={() => {
              const latestAssistantMsg = messages.filter(m => m.role === 'assistant' && m.content).pop();
              useFormStore.getState().openFormModal({
                sessionId,
                conversationText: latestAssistantMsg?.content || '',
                initialTab: jurisdiction === 'international' ? 'IPO_FORM_25' : 'NBA_FORM_1',
              });
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold bg-sage-50 hover:bg-sage-100 text-slate-800 border border-sage-200 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            title="Generate official statutory filing forms (IPO Form 25, NBA Form I/III, WIPO GRATK)"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{t('statutoryForms')}</span>
          </button>
        </div>

        {/* Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border ${
            jurisdiction === 'international'
              ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }`}>
            <Sparkles className={`w-3 h-3 ${jurisdiction === 'international' ? 'text-indigo-600' : 'text-emerald-600'}`} />
            <span>{jurisdiction === 'international' ? t('wipoActive') : t('tkdlActive')}</span>
          </span>
        </div>
      </div>

      {/* Dynamic Contextual Jurisdiction Scope Bar */}
      {jurisdiction === 'international' ? (
        <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-indigo-50/90 border-b border-indigo-200/70 px-3 sm:px-6 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] text-indigo-900 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="inline-flex items-center gap-1 font-bold text-indigo-800 uppercase tracking-wider text-[9px] bg-indigo-100/90 px-2 py-0.5 rounded-md border border-indigo-300/60 shrink-0">
              {t('internationalScopeLabel')}
            </span>
            <span className="truncate text-slate-700">
              {t('evaluatingInternational')}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-indigo-700 font-medium shrink-0 text-[10px]">
            <span>{t('crossBorderPill')}</span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border-b border-emerald-200/70 px-3 sm:px-6 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] text-emerald-900 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-800 uppercase tracking-wider text-[9px] bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300/60 shrink-0">
              {t('nationalScopeLabel')}
            </span>
            <span className="truncate text-slate-700">
              {t('evaluatingNational')}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-emerald-700 font-medium shrink-0 text-[10px]">
            <span>{t('sbbNbaPill')}</span>
          </div>
        </div>
      )}

      {/* Messages Scroll View with 60fps performance scroll */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-0 relative scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-3 sm:space-y-4 py-8 px-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm border ${
              jurisdiction === 'international'
                ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                : 'bg-ayur-100 text-ayur-700 border-ayur-200'
            }`}>
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h4 className="text-sm sm:text-base font-bold font-heading text-slate-900">
              {jurisdiction === 'international' ? t('beginInternational') : t('beginAssessment')}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
              {jurisdiction === 'international'
                ? 'Assess patentability, WIPO GRATK mandatory disclosures, PCT 30-month national phase entries, US FDA DSHEA structure/function claims, and EU THMPD 15-year rule for botanical formulations.'
                : 'Enter patent claims, botanical compositions, or active compounds (e.g. Azadirachta indica, Tinospora cordifolia) to assess novelty, Section 3(p) TK anticipation, Section 3(e) synergy, and NBA ABS compliance.'}
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
            <span>{t('latestResponse')}</span>
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
        title={t('uploadModalTitle')}
      >
        <FileDragDrop />
      </Modal>

      {/* Statutory Filing & Compliance Modal */}
      <StatutoryFormModal />

      {/* Relational Knowledge Graph Visualizer Modal */}
      <OntologyGraphModal
        isOpen={isOntologyOpen}
        onClose={() => setIsOntologyOpen(false)}
      />

      {/* 3-Step Guided Intake Dialogue Wizard */}
      <IntakeWizardModal
        isOpen={isIntakeWizardOpen}
        onClose={() => setIsIntakeWizardOpen(false)}
      />

      {/* Ministry of AYUSH PFC Escalation Drawer */}
      <FacilitatorEscalationModal
        isOpen={isFacilitatorModalOpen}
        onClose={() => setIsFacilitatorModalOpen(false)}
        conversationSummary={messages.filter(m => m.role === 'assistant' && m.content).map(m => m.content).join('\n\n')}
        jurisdiction={jurisdiction}
      />
    </div>
  );
}