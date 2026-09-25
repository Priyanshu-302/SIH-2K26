/**
 * useVoiceInput — Web Speech API hook for Ayur-IP
 * 
 * Uses the browser's built-in SpeechRecognition API (Chrome/Edge).
 * Streams live interim results into the textarea as the user speaks.
 * Language-aware: respects the currently selected language from languageStore.
 * 
 * Phase 2 upgrade path: swap recognizer with Bhashini ASR for deeper
 * Indian language support when API keys are present.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../store/languageStore';
import { useUIStore } from '../store/uiStore';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/**
 * Merges speech recognition results handling both desktop fragments and mobile cumulative supersets.
 */
function mergeTranscriptResults(results) {
  let combined = '';
  for (let i = 0; i < results.length; i++) {
    const text = (results[i][0]?.transcript || '').trim();
    if (!text) continue;

    if (!combined) {
      combined = text;
      continue;
    }

    const normCombined = combined.toLowerCase().replace(/\s+/g, ' ');
    const normText = text.toLowerCase().replace(/\s+/g, ' ');

    // 1. Mobile Android Chrome cumulative superset
    if (normText.startsWith(normCombined)) {
      combined = text;
    }
    // 2. Already contained in combined string
    else if (normCombined.endsWith(normText) || normCombined.includes(normText)) {
      // no-op
    }
    // 3. Overlapping boundary
    else {
      let overlap = 0;
      const maxOverlap = Math.min(combined.length, text.length);
      for (let len = maxOverlap; len > 0; len--) {
        if (normCombined.endsWith(normText.slice(0, len))) {
          overlap = len;
          break;
        }
      }
      if (overlap > 0) {
        combined = combined + text.slice(overlap);
      } else {
        combined = combined + ' ' + text;
      }
    }
  }
  return combined.trim();
}

/**
 * Strips stuttered or duplicated words/phrases across any speech recognition engine.
 */
function deduplicatePhrases(str) {
  if (!str) return '';
  let s = str.replace(/\s+/g, ' ').trim();

  // 1. Remove repeated adjacent single words (e.g. "is is is" -> "is")
  s = s.replace(/\b(\w+)(?:\s+\1\b)+/gi, '$1');

  // 2. Remove multi-word phrase loops (from 12 words down to 2 words)
  for (let n = 12; n >= 2; n--) {
    const pattern = new RegExp(`\\b((?:\\S+\\s+){${n - 1}}\\S+)(?:\\s+\\1\\b)+`, 'gi');
    s = s.replace(pattern, '$1');
  }

  // 3. Sliding window token deduplication for partial overlaps
  const words = s.split(' ');
  if (words.length >= 4) {
    let changed = true;
    let passes = 0;
    while (changed && passes < 5) {
      changed = false;
      passes++;
      const maxLen = Math.floor(words.length / 2);
      for (let len = maxLen; len >= 2; len--) {
        for (let i = 0; i <= words.length - 2 * len; i++) {
          const p1 = words.slice(i, i + len).join(' ').toLowerCase();
          const p2 = words.slice(i + len, i + 2 * len).join(' ').toLowerCase();
          if (p1 === p2) {
            words.splice(i, len);
            changed = true;
            break;
          }
        }
        if (changed) break;
      }
    }
    s = words.join(' ');
  }

  return s.trim();
}

export function useVoiceInput({ onTranscript }) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isSupported] = useState(() => Boolean(SpeechRecognition));
  
  const recognizerRef = useRef(null);
  const finalTranscriptRef = useRef('');
  
  const { selectedLanguage } = useLanguageStore();
  const { addToast } = useUIStore();

  // Get the BCP-47 locale for Web Speech API
  const getBcp47 = useCallback(() => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
    return lang?.bcp47 || 'en-IN';
  }, [selectedLanguage]);

  const isCancelledRef = useRef(false);

  const stopListening = useCallback(() => {
    isCancelledRef.current = true;
    finalTranscriptRef.current = '';
    setInterimText('');
    setIsListening(false);
    if (recognizerRef.current) {
      try {
        recognizerRef.current.abort();
      } catch (e) {
        // ignore
      }
      recognizerRef.current = null;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      addToast({
        type: 'error',
        message: 'Voice input not supported in this browser. Please use Chrome or Edge.',
      });
      return;
    }

    // If already listening — stop cleanly
    if (isListening) {
      stopListening();
      return;
    }

    isCancelledRef.current = false;
    finalTranscriptRef.current = '';
    setInterimText('');

    const recognizer = new SpeechRecognition();
    recognizer.lang = getBcp47();
    recognizer.continuous = true;        // keep listening until stopped
    recognizer.interimResults = true;    // stream live partial results
    recognizer.maxAlternatives = 1;

    recognizer.onstart = () => {
      setIsListening(true);
      setInterimText('');
    };

    recognizer.onresult = (event) => {
      if (isCancelledRef.current) return;
      
      const merged = mergeTranscriptResults(event.results);
      const clean = deduplicatePhrases(merged);

      finalTranscriptRef.current = clean;
      setInterimText('');

      // Push clean merged transcript to parent in real-time
      if (onTranscript && !isCancelledRef.current && clean) {
        onTranscript(clean);
      }
    };

    recognizer.onerror = (event) => {
      if (isCancelledRef.current) return;
      console.error('[Voice] SpeechRecognition error:', event.error);
      if (event.error === 'not-allowed') {
        addToast({
          type: 'error',
          message: 'Microphone access denied. Please allow microphone in browser settings.',
        });
      } else if (event.error === 'no-speech') {
        // Silently stop — user just didn't speak
      } else {
        addToast({ type: 'error', message: `Voice input error: ${event.error}` });
      }
      stopListening();
    };

    recognizer.onend = () => {
      // Auto-stop UI state when browser ends the session
      setIsListening(false);
      setInterimText('');
      recognizerRef.current = null;
      if (!isCancelledRef.current && onTranscript && finalTranscriptRef.current) {
        const finalClean = deduplicatePhrases(finalTranscriptRef.current);
        onTranscript(finalClean);
      }
      isCancelledRef.current = false;
    };

    recognizerRef.current = recognizer;
    try {
      recognizer.start();
    } catch (err) {
      console.error('[Voice] Failed to start recognition:', err);
      stopListening();
    }
  }, [isSupported, isListening, getBcp47, onTranscript, stopListening, addToast]);


  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    interimText,
    startListening,
    stopListening,
  };
}
