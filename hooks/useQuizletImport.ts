'use client';

import { useState, useCallback } from 'react';
import { Flashcard, QuizQuestion } from '@/types';

interface ParsedQuizlet {
  title: string;
  flashcards: Flashcard[];
}

export function useQuizletImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseQuizletText = useCallback((text: string): ParsedQuizlet | null => {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      const flashcards: Flashcard[] = [];
      
      // Try to detect the separator (tab, dash, pipe, etc.)
      const separators = ['\t', ' - ', ' | ', ' → ', '->', ': '];
      let usedSeparator = '\t';
      
      for (const sep of separators) {
        const matchCount = lines.filter(line => line.includes(sep)).length;
        if (matchCount > lines.length * 0.5) {
          usedSeparator = sep;
          break;
        }
      }

      for (const line of lines) {
        const parts = line.split(usedSeparator);
        if (parts.length >= 2) {
          flashcards.push({
            front: parts[0].trim(),
            back: parts.slice(1).join(usedSeparator).trim(),
          });
        }
      }

      if (flashcards.length === 0) {
        throw new Error('No flashcards found. Format: term - definition');
      }

      return {
        title: `Imported Set (${flashcards.length} cards)`,
        flashcards,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse');
      return null;
    }
  }, []);

  const parseQuizletCSV = useCallback((csvText: string): ParsedQuizlet | null => {
    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      const flashcards: Flashcard[] = [];

      for (const line of lines) {
        // Handle quoted CSV values
        const matches = line.match(/(?:"([^"]*)")|([^,]+)/g);
        if (matches && matches.length >= 2) {
          const front = matches[0].replace(/^"|"$/g, '').trim();
          const back = matches[1].replace(/^"|"$/g, '').trim();
          if (front && back) {
            flashcards.push({ front, back });
          }
        }
      }

      if (flashcards.length === 0) {
        throw new Error('No flashcards found in CSV');
      }

      return {
        title: `Imported Set (${flashcards.length} cards)`,
        flashcards,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV');
      return null;
    }
  }, []);

  const generateQuizFromFlashcards = useCallback((flashcards: Flashcard[]): QuizQuestion[] => {
    const quiz: QuizQuestion[] = [];
    
    for (let i = 0; i < flashcards.length && i < 20; i++) {
      const card = flashcards[i];
      // Get 3 random wrong answers from other cards
      const wrongAnswers = flashcards
        .filter((_, idx) => idx !== i)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(f => f.back);

      const options = [...wrongAnswers, card.back].sort(() => Math.random() - 0.5);
      const correct = options.indexOf(card.back);

      quiz.push({
        question: card.front,
        options,
        correct,
        explanation: `The correct answer is: ${card.back}`,
      });
    }

    return quiz;
  }, []);

  const importFromText = useCallback(async (text: string, format: 'auto' | 'csv' = 'auto') => {
    setIsImporting(true);
    setError(null);

    try {
      const result = format === 'csv' 
        ? parseQuizletCSV(text) 
        : parseQuizletText(text);
      
      setIsImporting(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setIsImporting(false);
      return null;
    }
  }, [parseQuizletText, parseQuizletCSV]);

  return {
    importFromText,
    generateQuizFromFlashcards,
    isImporting,
    error,
    clearError: () => setError(null),
  };
}

// Example formats supported:
// Term - Definition
// Term | Definition
// Term\tDefinition (tab-separated)
// Term: Definition
