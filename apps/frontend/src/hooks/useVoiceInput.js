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

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      recognizerRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      addToast({
        type: 'error',
        message: 'Voice input not supported in this browser. Please use Chrome or Edge.',
      });
      return;
    }

    // If already listening — stop
    if (isListening) {
      stopListening();
      return;
    }

    finalTranscriptRef.current = '';

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
      let interimBuffer = '';
      let finalBuffer = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalBuffer += result[0].transcript;
        } else {
          interimBuffer += result[0].transcript;
        }
      }

      finalTranscriptRef.current = finalBuffer;
      setInterimText(interimBuffer);

      // Push combined (final + interim) to parent textarea in real-time
      if (onTranscript) {
        onTranscript(finalBuffer + interimBuffer);
      }
    };

    recognizer.onerror = (event) => {
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
      // Commit final transcript to parent
      if (onTranscript && finalTranscriptRef.current) {
        onTranscript(finalTranscriptRef.current.trim());
      }
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
