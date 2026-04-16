'use client';

import { useState } from 'react';
import { Flashcard } from '@/types';
import { getInitialProgress, calculateNextReview, Quality, FlashcardProgress } from '@/lib/spaced-repetition';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts';

interface FlashcardViewProps {
  cards: Flashcard[];
  onMaster?: (index: number, progress: FlashcardProgress) => void;
  onRate?: (quality: Quality) => void;
}

export function FlashcardView({ cards, onMaster, onRate }: FlashcardViewProps) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<FlashcardProgress>(getInitialProgress());

  if (cards.length === 0) return null;

  const card = cards[current];

  function handleRate(quality: Quality) {
    const newProgress = calculateNextReview(quality, progress);
    setProgress(newProgress);
    onMaster?.(current, newProgress);
    onRate?.(quality);

    setFlipped(false);
    if (current < cards.length - 1) {
      setCurrent(current + 1);
    } else {
      setCurrent(0);
    }
  }

  function handleNext() {
    if (current < cards.length - 1) {
      setCurrent(current + 1);
      setFlipped(false);
    }
  }

  function handlePrev() {
    if (current > 0) {
      setCurrent(current - 1);
      setFlipped(false);
    }
  }

  useKeyboardShortcuts({
    onFlip: () => setFlipped(!flipped),
    onRate: handleRate,
    onNext: handleNext,
    onPrev: handlePrev,
    isFlipped: flipped,
  });

  const mastery = progress.repetitions >= 6 ? 100 : progress.repetitions * 17;

  return (
    <div className="flashcard-view">
      <div className="progress-header">
        <div className="progress-info">
          <span className="progress-count">{current + 1} / {cards.length}</span>
          <span className="progress-mastery">{mastery}% mastery</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${mastery}%` }} />
        </div>
      </div>

      <div className="flashcard" onClick={() => setFlipped(!flipped)}>
        <p className="flashcard-text">{flipped ? card.back : card.front}</p>
        <span className="flashcard-hint">Click to flip</span>
      </div>

      {flipped && (
        <div className="rating-buttons">
          <button className="rate-btn hard" onClick={() => handleRate(0)}>
            <span className="rate-label">Still Learning</span>
            <span className="rate-key">1</span>
          </button>
          <button className="rate-btn good" onClick={() => handleRate(2)}>
            <span className="rate-label">Know It</span>
            <span className="rate-key">2</span>
          </button>
          <button className="rate-btn easy" onClick={() => handleRate(3)}>
            <span className="rate-label">Easy</span>
            <span className="rate-key">3</span>
          </button>
        </div>
      )}

      <div className="card-controls">
        <button className="control-btn" onClick={() => { setCurrent(0); setFlipped(false); }}>Restart</button>
        <button className="control-btn" onClick={() => setFlipped(!flipped)}>
          {flipped ? 'Show Question' : 'Show Answer'}
        </button>
      </div>

      <KeyboardShortcutsHelp mode="flashcards" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        
        .flashcard-view {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        
        .progress-header {
          margin-bottom: 24px;
        }
        
        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .progress-count {
          color: #a1a1aa;
        }
        
        .progress-mastery {
          color: #10b981;
          font-weight: 600;
        }
        
        .progress-bar {
          height: 6px;
          background: #27272a;
          border-radius: 100px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          border-radius: 100px;
          transition: width 0.5s ease;
        }
        
        .flashcard {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 20px;
          padding: 48px 32px;
          cursor: pointer;
          transition: all 0.3s;
          min-height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        
        .flashcard:hover {
          border-color: #10b981;
          transform: translateY(-2px);
        }
        
        .flashcard-text {
          font-size: 22px;
          color: #fafafa;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        
        .flashcard-hint {
          font-size: 13px;
          color: #71717a;
        }
        
        .rating-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          justify-content: center;
        }
        
        .rate-btn {
          flex: 1;
          max-width: 140px;
          padding: 16px;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-family: inherit;
        }
        
        .rate-btn:hover {
          transform: translateY(-2px);
        }
        
        .rate-btn.hard:hover {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        
        .rate-btn.good:hover {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }
        
        .rate-btn.easy:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }
        
        .rate-label {
          font-size: 14px;
          font-weight: 600;
          color: #fafafa;
        }
        
        .rate-key {
          font-size: 11px;
          color: #71717a;
        }
        
        .card-controls {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 24px;
        }
        
        .control-btn {
          background: none;
          border: none;
          color: #71717a;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.2s;
        }
        
        .control-btn:hover {
          color: #fafafa;
        }
      `}</style>
    </div>
  );
}
