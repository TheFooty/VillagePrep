'use client';

import { useState } from 'react';
import { Flashcard } from '@/types';
import { Button } from '@/components/ui/Button';
import { getInitialProgress, calculateNextReview, Quality, FlashcardProgress } from '@/lib/spaced-repetition';

interface FlashcardViewProps {
  cards: Flashcard[];
  onMaster?: (index: number, progress: FlashcardProgress) => void;
}

export function FlashcardView({ cards, onMaster }: FlashcardViewProps) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<FlashcardProgress>(getInitialProgress());

  if (cards.length === 0) return null;

  const card = cards[current];

  function handleRate(quality: Quality) {
    const newProgress = calculateNextReview(quality, progress);
    setProgress(newProgress);
    onMaster?.(current, newProgress);

    setFlipped(false);
    if (current < cards.length - 1) {
      setCurrent(current + 1);
    } else {
      setCurrent(0);
    }
  }

  const mastery = progress.repetitions >= 6 ? 100 : progress.repetitions * 17;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{current + 1} / {cards.length}</span>
          <span>{mastery}% mastery</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] transition-all duration-500"
            style={{ width: `${mastery}%` }}
          />
        </div>
      </div>

      <div 
        className="min-h-[200px] bg-white/5 border border-white/10 rounded-2xl p-8 flex items-center justify-center cursor-pointer mb-6"
        onClick={() => setFlipped(!flipped)}
      >
        <p className="text-xl text-white text-center">{flipped ? card.back : card.front}</p>
      </div>

      {flipped && (
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => handleRate(0)}>
            Still Learning
          </Button>
          <Button variant="secondary" onClick={() => handleRate(2)}>
            Know It
          </Button>
          <Button onClick={() => handleRate(3)}>
            Easy
          </Button>
        </div>
      )}

      <div className="flex justify-center gap-2 mt-4">
        <button onClick={() => { setCurrent(0); setFlipped(false); }} className="text-gray-400 hover:text-white text-sm">
          Restart
        </button>
        <span className="text-gray-500">•</span>
        <button onClick={() => setFlipped(!flipped)} className="text-gray-400 hover:text-white text-sm">
          {flipped ? 'Show Question' : 'Show Answer'}
        </button>
      </div>
    </div>
  );
}