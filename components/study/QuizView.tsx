'use client';

import { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types';
import { Button } from '@/components/ui/Button';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number, answers: number[]) => void;
}

export function QuizView({ questions, onComplete }: QuizViewProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (timeLeft === null || showResult) return;
    if (timeLeft <= 0) {
      handleComplete();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, showResult]);

  function handleAnswer(index: number) {
    const newAnswers = [...answers];
    newAnswers[current] = index;
    setAnswers(newAnswers);

    // Auto-advance after a short delay
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1);
      } else {
        handleComplete(newAnswers);
      }
    }, 500);
  }

  function handleComplete(finalAnswers?: number[]) {
    const final = finalAnswers || answers;
    const score = final.filter((a, i) => a === questions[i].correct).length;
    setShowResult(true);
    onComplete?.(score, questions.length, final);
  }

  function handleNext() {
    if (current < questions.length - 1 && answers[current] !== undefined) {
      setCurrent(current + 1);
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (questions.length === 0) return null;

  const question = questions[current];
  const isComplete = showResult || answers.length >= questions.length;

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAnswer: handleAnswer,
    onNext: handleNext,
    isQuizMode: true,
    currentOptions: question.options.length,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 flex justify-between items-center min-w-0">
        <div className="text-gray-400 text-sm truncate">
          Question {current + 1} of {questions.length}
        </div>
        {timeLeft !== null && (
          <div className={`text-sm font-mono ${timeLeft < 60 ? 'text-red-400' : 'text-gray-400'}`}>
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="mb-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] transition-all duration-300"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl text-white font-medium mb-4 sm:mb-6 break-words overflow-wrap-anywhere">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((option, i) => {
            const answered = answers[current] !== undefined;
            const isSelected = answers[current] === i;
            const isCorrect = question.correct === i;
            
            let bg = 'bg-white/5 border-white/10 hover:bg-white/10';
            if (showResult) {
              if (isCorrect) bg = 'bg-emerald-500/20 border-emerald-500';
              else if (isSelected && !isCorrect) bg = 'bg-red-500/20 border-red-500';
            } else if (answered && isSelected) {
              bg = isCorrect ? 'bg-emerald-500/20 border-emerald-500' : 'bg-red-500/20 border-red-500';
            }

            return (
              <button
                key={i}
                onClick={() => !answered && handleAnswer(i)}
                disabled={answered || showResult}
                className={`w-full text-left border rounded-xl px-3 sm:px-4 py-3 text-white text-sm sm:text-base transition-colors break-words overflow-wrap-anywhere ${bg}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {(answers[current] !== undefined || showResult) && (
          <div className="mt-4 p-3 rounded-lg bg-[#14b8a6]/10 border border-[#14b8a6]/20">
            <p className="text-sm text-gray-300 break-words overflow-wrap-anywhere">{question.explanation}</p>
          </div>
        )}
      </div>

      {isComplete && (
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">
            {answers.filter((a, i) => a === questions[i].correct).length} / {questions.length}
          </div>
          <p className="text-gray-400 mb-4">
            {answers.filter((a, i) => a === questions[i].correct).length >= questions.length * 0.8 
              ? 'Excellent!' 
              : answers.filter((a, i) => a === questions[i].correct).length >= questions.length * 0.6 
              ? 'Good job!' 
              : 'Keep practicing!'}
          </p>
          <Button onClick={() => { setCurrent(0); setAnswers([]); setShowResult(false); }}>
            Try Again
          </Button>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp mode="quiz" />
    </div>
  );
}