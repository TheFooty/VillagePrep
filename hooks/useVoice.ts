'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// Minimal SpeechRecognition interface
type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: { resultIndex: number; results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

// SpeechRecognition result types
type SpeechRecognitionResultList = SpeechRecognitionResult[];

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionType;

interface UseVoiceProps {
  onTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
}

export function useVoice({ onTranscript, onError }: UseVoiceProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const win = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        onTranscript?.(fullTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        onError?.(new Error(event.error));
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    synthesisRef.current = window.speechSynthesis;

    return () => {
      recognitionRef.current?.stop();
      synthesisRef.current?.cancel();
    };
  }, [onTranscript, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      onError?.(new Error('Speech recognition not supported'));
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    } catch (error) {
      onError?.(error as Error);
    }
  }, [onError]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, rate: number = 1) => {
    if (!synthesisRef.current) {
      onError?.(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current.speak(utterance);
  }, [onError]);

  const stopSpeaking = useCallback(() => {
    synthesisRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const isSupported = typeof window !== 'undefined' && 
    !!((window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition || 
       (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition) &&
    !!(window as unknown as { speechSynthesis?: unknown }).speechSynthesis;

  return {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported,
  };
}

// Hook specifically for flashcard audio
export function useFlashcardAudio() {
  const { speak, stopSpeaking, isSpeaking, isSupported } = useVoice();
  const [autoPlay, setAutoPlay] = useState(false);

  const speakCard = useCallback((front: string, back: string, flipped: boolean, rate: number = 0.9) => {
    if (!isSupported) return;
    
    const text = flipped ? back : front;
    speak(text, rate);
  }, [speak, isSupported]);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay(prev => !prev);
  }, []);

  return {
    speakCard,
    stopSpeaking,
    isSpeaking,
    autoPlay,
    toggleAutoPlay,
    isSupported,
  };
}
