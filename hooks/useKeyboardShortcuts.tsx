'use client';

import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsProps {
  onFlip?: () => void;
  onRate?: (quality: 0 | 2 | 3) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onAnswer?: (index: number) => void;
  isFlipped?: boolean;
  isQuizMode?: boolean;
  currentOptions?: number;
}

export function useKeyboardShortcuts({
  onFlip,
  onRate,
  onNext,
  onPrev,
  onAnswer,
  isFlipped = false,
  isQuizMode = false,
  currentOptions = 4,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          onFlip?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrev?.();
          break;
        case '1':
          if (isFlipped && !isQuizMode) {
            onRate?.(0); // Still Learning
          } else if (isQuizMode && currentOptions >= 1) {
            onAnswer?.(0);
          }
          break;
        case '2':
          if (isFlipped && !isQuizMode) {
            onRate?.(2); // Know It
          } else if (isQuizMode && currentOptions >= 2) {
            onAnswer?.(1);
          }
          break;
        case '3':
          if (isFlipped && !isQuizMode) {
            onRate?.(3); // Easy
          } else if (isQuizMode && currentOptions >= 3) {
            onAnswer?.(2);
          }
          break;
        case '4':
          if (isQuizMode && currentOptions >= 4) {
            onAnswer?.(3);
          }
          break;
      }
    },
    [onFlip, onRate, onNext, onPrev, onAnswer, isFlipped, isQuizMode, currentOptions]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Keyboard shortcuts help component
export function KeyboardShortcutsHelp({ mode = 'flashcards' }: { mode?: 'flashcards' | 'quiz' }) {
  const shortcuts = mode === 'flashcards' 
    ? [
        { key: 'Space', action: 'Flip card' },
        { key: '← →', action: 'Navigate' },
        { key: '1', action: 'Still Learning' },
        { key: '2', action: 'Know It' },
        { key: '3', action: 'Easy' },
      ]
    : [
        { key: '1-4', action: 'Select answer' },
        { key: 'Space', action: 'Next question' },
      ];

  return (
    <div className="fixed bottom-4 left-4 z-40 hidden md:flex">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-400 border border-white/10">
        <div className="font-medium text-gray-300 mb-2">Keyboard Shortcuts</div>
        <div className="space-y-1">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300 font-mono">
                {key}
              </kbd>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
