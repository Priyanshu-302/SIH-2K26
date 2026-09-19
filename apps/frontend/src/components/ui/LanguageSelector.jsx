import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, Loader2 } from 'lucide-react';
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../../store/languageStore';
import { useT } from '../../config/i18n';

/**
 * LanguageSelector — premium language picker for the Ayur-IP header.
 * Shows current language with flag + native script label.
 * Dropdown grid of 9 language pills with animated open/close.
 */
export function LanguageSelector() {
  const { selectedLanguage, isTranslating, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const t = useT();

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)
    || SUPPORTED_LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={t('selectLanguage')}
        aria-label={t('selectLanguage')}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
          isOpen
            ? 'bg-ayur-50 border-ayur-400 text-ayur-800 shadow-sm'
            : 'bg-white border-sage-200 text-slate-600 hover:border-ayur-300 hover:text-ayur-700 hover:bg-ayur-50'
        }`}
      >
        {isTranslating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-ayur-600" />
        ) : (
          <Globe className="w-3.5 h-3.5" />
        )}
        {/* Show native label on wider screens, just flag on mobile */}
        <span className="hidden sm:inline max-w-[56px] truncate">
          {currentLang.nativeLabel}
        </span>
        <span className="sm:hidden text-sm">{currentLang.flag}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 z-50 bg-white border border-sage-200 rounded-2xl shadow-elevated p-3 w-64 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-sage-100">
            <Globe className="w-3.5 h-3.5 text-ayur-600" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {t('selectLanguage')}
            </span>
            {isTranslating && (
              <span className="ml-auto text-[10px] text-ayur-600 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {t('translating')}
              </span>
            )}
          </div>

          {/* Language Grid — 3 columns */}
          <div className="grid grid-cols-3 gap-1.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === selectedLanguage;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-ayur-700 border-ayur-700 text-white shadow-glow-mint'
                      : 'bg-sage-50 border-sage-200 text-slate-600 hover:bg-ayur-50 hover:border-ayur-300 hover:text-ayur-700'
                  }`}
                >
                  {/* Selected checkmark badge */}
                  {isSelected && (
                    <span className="absolute top-1 right-1">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span className={`text-[10px] font-bold leading-tight ${isSelected ? 'text-white' : ''}`}>
                    {lang.nativeLabel}
                  </span>
                  <span className={`text-[8px] uppercase tracking-wide leading-none ${isSelected ? 'text-ayur-100' : 'text-slate-400'}`}>
                    {lang.code}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Info footer */}
          <p className="text-[9px] text-slate-400 mt-2.5 pt-2 border-t border-sage-100 leading-snug">
            🇮🇳 Powered by Bhashini — MeitY National Language Mission
          </p>
        </div>
      )}
    </div>
  );
}
