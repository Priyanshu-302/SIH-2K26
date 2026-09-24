import { create } from 'zustand';

/**
 * Supported languages for Bhashini multilingual UI.
 * key    = ISO-639 language code used by Bhashini API
 * label  = Native script display name
 * flag   = Flag emoji for the selector
 * bcp47  = BCP-47 locale tag for Web Speech API (SpeechRecognition)
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English',    nativeLabel: 'English',    flag: '🇬🇧', bcp47: 'en-IN' },
  { code: 'hi', label: 'Hindi',      nativeLabel: 'हिन्दी',       flag: '🇮🇳', bcp47: 'hi-IN' },
  { code: 'ta', label: 'Tamil',      nativeLabel: 'தமிழ்',       flag: '🇮🇳', bcp47: 'ta-IN' },
  { code: 'te', label: 'Telugu',     nativeLabel: 'తెలుగు',      flag: '🇮🇳', bcp47: 'te-IN' },
  { code: 'kn', label: 'Kannada',    nativeLabel: 'ಕನ್ನಡ',       flag: '🇮🇳', bcp47: 'kn-IN' },
  { code: 'bn', label: 'Bengali',    nativeLabel: 'বাংলা',       flag: '🇮🇳', bcp47: 'bn-IN' },
  { code: 'mr', label: 'Marathi',    nativeLabel: 'मराठी',       flag: '🇮🇳', bcp47: 'mr-IN' },
  { code: 'gu', label: 'Gujarati',   nativeLabel: 'ગુજરાતી',     flag: '🇮🇳', bcp47: 'gu-IN' },
  { code: 'ml', label: 'Malayalam',  nativeLabel: 'മലയാളം',     flag: '🇮🇳', bcp47: 'ml-IN' },
];

const STORAGE_KEY = 'ayur_language';

export const useLanguageStore = create((set) => ({
  /** Currently selected ISO-639 language code */
  selectedLanguage: (typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEY) || 'en'
    : 'en'),

  /** True while a Bhashini translation API call is in-flight */
  isTranslating: false,

  /** True while TTS audio is playing */
  isSpeaking: false,

  setLanguage: (code) => {
    const valid = SUPPORTED_LANGUAGES.some((l) => l.code === code);
    if (!valid) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, code);
    }
    set({ selectedLanguage: code });
  },

  setIsTranslating: (val) => set({ isTranslating: val }),
  setIsSpeaking: (val) => set({ isSpeaking: val }),
}));
