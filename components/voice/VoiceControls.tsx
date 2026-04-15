'use client';

import { useFlashcardAudio } from '@/hooks/useVoice';

interface VoiceControlsProps {
  front: string;
  back: string;
  flipped: boolean;
}

export function VoiceControls({ front, back, flipped }: VoiceControlsProps) {
  const { speakCard, stopSpeaking, isSpeaking, autoPlay, toggleAutoPlay, isSupported } =
    useFlashcardAudio();

  if (!isSupported) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => speakCard(front, back, flipped)}
        disabled={isSpeaking}
        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        title="Read aloud"
      >
        {isSpeaking ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        )}
      </button>

      <button
        onClick={toggleAutoPlay}
        className={`p-2 rounded-lg border transition-colors ${
          autoPlay
            ? 'bg-[#14b8a6]/20 border-[#14b8a6] text-[#14b8a6]'
            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
        }`}
        title="Auto-play audio"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
}

// Voice input button for chat
interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
}

export function VoiceInputButton({ onTranscript }: VoiceInputButtonProps) {
  const { isListening, startListening, stopListening, isSupported } = useVoice({
    onTranscript,
  });

  if (!isSupported) return null;

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      className={`p-2 rounded-lg transition-colors ${
        isListening
          ? 'bg-red-500/20 text-red-400 animate-pulse'
          : 'bg-white/5 text-gray-400 hover:text-white'
      }`}
      title={isListening ? 'Stop listening' : 'Voice input'}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    </button>
  );
}

import { useVoice } from '@/hooks/useVoice';
