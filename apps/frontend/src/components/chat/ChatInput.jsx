import React, { useState, useCallback } from 'react';
import { Send, Paperclip, Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { useChatStream } from '../../hooks/useChatStream';
import { useDocumentStore } from '../../store/documentStore';
import { useChatStore } from '../../store/chatStore';
import { useLanguageStore } from '../../store/languageStore';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useT } from '../../config/i18n';

export function ChatInput() {
  const [query, setQuery] = useState('');
  const { submitQuery, isStreaming } = useChatStream();
  const { setIsUploadModalOpen } = useDocumentStore();
  const { jurisdiction, setJurisdiction } = useChatStore();
  const { isTranslating, isSpeaking } = useLanguageStore();
  const t = useT();

  const isInternational = jurisdiction === 'international';

  // Voice input — streams transcript directly into query state
  const handleTranscript = useCallback((text) => {
    setQuery(text);
  }, []);

  const { isListening, isSupported, startListening, stopListening } = useVoiceInput({
    onTranscript: handleTranscript,
  });

  const handleSend = (e) => {
    e?.preventDefault();
    if (!query.trim() || isStreaming || isTranslating) return;
    const textToSend = query.trim();
    if (isListening) {
      stopListening();
    }
    setQuery('');
    submitQuery(textToSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative w-full">
      <div
        className={`flex items-end gap-1.5 sm:gap-2 bg-alabaster-100 border rounded-2xl p-1.5 sm:p-2 transition-all shadow-inner ${
          isListening
            ? 'border-red-400 ring-2 ring-red-100'
            : isInternational
            ? 'border-indigo-200/80 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100'
            : 'border-sage-200 focus-within:border-ayur-600 focus-within:ring-2 focus-within:ring-ayur-100'
        }`}
      >
        {/* Attach Document */}
        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className={`p-1.5 sm:p-2 transition-colors shrink-0 cursor-pointer ${
            isInternational
              ? 'text-slate-400 hover:text-indigo-700'
              : 'text-slate-400 hover:text-ayur-700'
          }`}
          title={t('attachDocument')}
          aria-label={t('attachDocument')}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Voice Input Mic Button */}
        {isSupported && (
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            className={`p-1.5 sm:p-2 transition-all shrink-0 cursor-pointer rounded-lg ${
              isListening
                ? 'text-red-500 bg-red-50 animate-pulse'
                : isInternational
                ? 'text-slate-400 hover:text-indigo-700 hover:bg-indigo-50'
                : 'text-slate-400 hover:text-ayur-700 hover:bg-ayur-50'
            }`}
            title={isListening ? t('listening') : t('speakQuery')}
            aria-label={isListening ? t('listening') : t('speakQuery')}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        )}


        {/* Textarea */}
        <textarea
          rows={1}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? t('listening')
              : isInternational
              ? t('placeholderInternational')
              : t('placeholderDomestic')
          }
          className="flex-1 bg-transparent border-0 resize-none text-[11px] sm:text-xs text-slate-800 placeholder:text-slate-400 focus:ring-0 p-1.5 sm:p-2 max-h-28 sm:max-h-32 focus:outline-none leading-relaxed"
        />

        {/* Mode pill badge */}
        <button
          type="button"
          onClick={() => setJurisdiction(isInternational ? 'national' : 'international')}
          className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border self-center shrink-0 cursor-pointer transition-colors ${
            isInternational
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          }`}
          title="Click to switch jurisdiction"
        >
          <span>{isInternational ? t('globalModePill') : t('domesticModePill')}</span>
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!query.trim() || isStreaming || isTranslating}
          className={`p-2 sm:p-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
            query.trim() && !isStreaming && !isTranslating
              ? isInternational
                ? 'bg-indigo-700 hover:bg-indigo-800 text-white shadow-sm'
                : 'bg-ayur-700 hover:bg-ayur-800 text-white shadow-glow-mint'
              : 'bg-sage-100 text-slate-400 cursor-not-allowed'
          }`}
          aria-label={t('sendQuery')}
        >
          {isTranslating ? (
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </button>
      </div>

      {/* Status bar below input */}
      {(isListening || isTranslating || isSpeaking) && (
        <div
          className={`flex items-center gap-1.5 mt-1.5 px-3 text-[10px] font-semibold ${
            isListening
              ? 'text-red-500'
              : isSpeaking
              ? 'text-ayur-600'
              : 'text-slate-500'
          }`}
        >
          {isListening && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
              {t('listening')}
            </>
          )}
          {isTranslating && !isListening && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              {t('translating')}
            </>
          )}
          {isSpeaking && !isListening && !isTranslating && (
            <>
              <Volume2 className="w-3 h-3" />
              {t('playingAudio')}
            </>
          )}
        </div>
      )}
    </form>
  );
}
