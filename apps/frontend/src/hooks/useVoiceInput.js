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
      let interimBuffer = '';
      let finalBuffer = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = (result[0]?.transcript || '').trim();
        if (!text) continue;

        if (result.isFinal) {
          if (finalBuffer && !finalBuffer.endsWith(' ')) {
            finalBuffer += ' ' + text;
          } else {
            finalBuffer += text;
          }
        } else {
          if (interimBuffer && !interimBuffer.endsWith(' ')) {
            interimBuffer += ' ' + text;
          } else {
            interimBuffer += text;
          }
        }
      }

      finalTranscriptRef.current = finalBuffer;
      setInterimText(interimBuffer);

      const combined = (finalBuffer && interimBuffer)
        ? `${finalBuffer.trim()} ${interimBuffer.trim()}`
        : (finalBuffer || interimBuffer).trim();

      // Push combined (final + interim) to parent textarea in real-time
      if (onTranscript && !isCancelledRef.current) {
        onTranscript(combined);
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
        onTranscript(finalTranscriptRef.current.trim());
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
