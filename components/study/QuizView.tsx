'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { QuizQuestion } from '@/types';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number, answers: number[]) => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '42rem',
    margin: '0 auto',
  },
  header: {
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: 0,
  },
  questionCount: {
    color: '#a1a1aa',
    fontSize: '0.875rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  timer: {
    fontSize: '0.875rem',
    fontFamily: 'monospace',
  },
  timerWarning: {
    color: '#f87171',
  },
  progressBar: {
    height: '0.375rem',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(to right, #10b981, #059669)',
    transition: 'all 300ms',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  question: {
    fontSize: '1.125rem',
    lineHeight: 1.75,
    color: '#fafafa',
    fontWeight: 500,
    marginBottom: '1.5rem',
    wordBreak: 'break-word' as const,
  },
  optionsGrid: {
    display: 'grid',
    gap: '0.75rem',
  },
  optionButton: {
    width: '100%',
    textAlign: 'left' as const,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    color: '#fafafa',
    fontSize: '0.9375rem',
    transition: 'all 150ms',
    backgroundColor: 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  optionCorrect: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: '#10b981',
  },
  optionIncorrect: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: '#ef4444',
  },
  optionSelected: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: '#10b981',
  },
  explanation: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.15)',
  },
  explanationText: {
    fontSize: '0.875rem',
    color: '#d4d4d8',
    wordBreak: 'break-word' as const,
  },
  resultContainer: {
    textAlign: 'center' as const,
  },
  score: {
    fontSize: '3rem',
    fontWeight: 700,
    color: '#fafafa',
    marginBottom: '0.5rem',
  },
  scoreMessage: {
    color: '#a1a1aa',
    marginBottom: '1.5rem',
  },
  tryAgainButton: {
    padding: '0.625rem 1.5rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms',
  },
};

export const QuizView = memo(function QuizView({ questions, onComplete }: QuizViewProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const handleAnswer = useCallback((index: number) => {
    const newAnswers = [...answers];
    newAnswers[current] = index;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1);
      } else {
        const final = newAnswers;
        const score = final.filter((a, i) => a === questions[i].correct).length;
        setShowResult(true);
        onComplete?.(score, questions.length, final);
      }
    }, 500);
  }, [answers, current, questions, onComplete]);

  const handleNext = useCallback(() => {
    if (current < questions.length - 1 && answers[current] !== undefined) {
      setCurrent(current + 1);
    }
  }, [current, questions.length, answers]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getScoreMessage = useCallback((score: number, total: number): string => {
    const pct = score / total;
    if (pct >= 0.8) return 'Excellent!';
    if (pct >= 0.6) return 'Good job!';
    return 'Keep practicing!';
  }, []);

  const currentOptions = questions[current]?.options.length ?? 4;

  useKeyboardShortcuts({
    onAnswer: handleAnswer,
    onNext: handleNext,
    isQuizMode: true,
    currentOptions,
  });

  useEffect(() => {
    if (timeLeft === null || showResult || questions.length === 0) return;
    if (timeLeft <= 0) {
      const final = answers;
      const score = final.filter((a, i) => a === questions[i].correct).length;
      setShowResult(true);
      onComplete?.(score, questions.length, final);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, showResult, answers, questions, onComplete]);

  if (questions.length === 0) {
    return (
      <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '24px' }}>
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1rem',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.4 }}>❓</div>
          <h3 style={{ color: '#fafafa', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No questions</h3>
          <p style={{ color: '#71717a', fontSize: '14px' }}>Generate a quiz from your study materials to get started.</p>
        </div>
      </div>
    );
  }

  const question = questions[current];
  const isComplete = showResult || answers.length >= questions.length;
  const answered = answers[current] !== undefined;
  const correctCount = answers.filter((a, i) => a === questions[i].correct).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.questionCount}>
          Question {current + 1} of {questions.length}
        </div>
        {timeLeft !== null && (
          <div style={{
            ...styles.timer,
            ...(timeLeft < 60 ? styles.timerWarning : { color: '#a1a1aa' })
          }}>
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${((current + 1) / questions.length) * 100}%`
          }}
        />
      </div>

      <div style={styles.card}>
        <h3 style={styles.question}>{question.question}</h3>

        <div style={styles.optionsGrid}>
          {question.options.map((option, i) => {
            const isSelected = answers[current] === i;
            const isCorrect = question.correct === i;

            let optionStyle: React.CSSProperties = { ...styles.optionButton };
            if (showResult) {
              if (isCorrect) optionStyle = { ...optionStyle, ...styles.optionCorrect };
              else if (isSelected && !isCorrect) optionStyle = { ...optionStyle, ...styles.optionIncorrect };
            } else if (answered && isSelected) {
              optionStyle = isCorrect
                ? { ...optionStyle, ...styles.optionCorrect }
                : { ...optionStyle, ...styles.optionIncorrect };
            } else if (isSelected) {
              optionStyle = { ...optionStyle, ...styles.optionSelected };
            }

            return (
              <button
                key={i}
                onClick={() => !answered && handleAnswer(i)}
                disabled={answered || showResult}
                style={optionStyle}
                onMouseEnter={(e) => {
                  if (!answered && !showResult) {
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)';
                    e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!answered && !showResult) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                  }
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        {(answers[current] !== undefined || showResult) && (
          <div style={styles.explanation}>
            <p style={styles.explanationText}>{question.explanation}</p>
          </div>
        )}
      </div>

      {isComplete && (
        <div style={styles.resultContainer}>
          <div style={styles.score}>
            {correctCount} / {questions.length}
          </div>
          <p style={styles.scoreMessage}>
            {getScoreMessage(correctCount, questions.length)}
          </p>
          <button
            style={styles.tryAgainButton}
            onClick={() => { setCurrent(0); setAnswers([]); setShowResult(false); }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Try Again
          </button>
        </div>
      )}

      <KeyboardShortcutsHelp mode="quiz" />

      <style>{`
        @media (max-width: 640px) {
          .container {
            padding: 0 16px;
          }
        }
      `}</style>
    </div>
  );
});
