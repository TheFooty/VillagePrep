'use client';

import { useState } from 'react';
import { Flashcard } from '@/types';
import { Button } from '@/components/ui/Button';

interface AudioFlashcardsProps {
  cards: Flashcard[];
}

export function AudioFlashcards({ cards }: AudioFlashcardsProps) {
  const [current, setCurrent] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  function speak(text: string) {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech not supported in this browser');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function handlePlayFront() {
    speak(cards[current].front);
  }

  function handlePlayBack() {
    speak(cards[current].back);
  }

  function handlePlayAll() {
    speak(`${cards[current].front}. ${cards[current].back}`);
  }

  if (!isEnabled) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🔊</div>
        <h3 className="text-white font-medium mb-2">Audio Flashcards</h3>
        <p className="text-gray-400 text-sm mb-4">
          Enable audio to hear flashcards read aloud using text-to-speech.
        </p>
        <Button onClick={() => setIsEnabled(true)}>Enable Audio</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-gray-400 text-sm">
          {current + 1} / {cards.length}
        </span>
        <button 
          onClick={() => setIsEnabled(false)}
          className="text-gray-400 hover:text-white text-sm"
        >
          Disable Audio
        </button>
      </div>

      <div className="min-h-[150px] bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center mb-6">
        <p className="text-xl text-white text-center">{cards[current].front}</p>
      </div>

      <div className="flex justify-center gap-3 mb-4">
        <Button 
          variant="secondary" 
          onClick={handlePlayFront}
          disabled={speaking}
        >
          🔊 Question
        </Button>
        <Button 
          variant="secondary" 
          onClick={handlePlayBack}
          disabled={speaking}
        >
          🔊 Answer
        </Button>
        <Button 
          onClick={handlePlayAll}
          disabled={speaking}
        >
          🔊 Both
        </Button>
      </div>

      <div className="flex justify-center gap-2">
        <button 
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="text-gray-400 hover:text-white disabled:opacity-50"
        >
          ← Previous
        </button>
        <span className="text-gray-500">•</span>
        <button 
          onClick={() => setCurrent(Math.min(cards.length - 1, current + 1))}
          disabled={current === cards.length - 1}
          className="text-gray-400 hover:text-white disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}