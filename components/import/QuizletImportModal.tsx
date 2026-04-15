'use client';

import { useState } from 'react';
import { useQuizletImport } from '@/hooks/useQuizletImport';
import { Button } from '@/components/ui/Button';

interface QuizletImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (flashcards: { front: string; back: string }[], title: string) => void;
}

export function QuizletImportModal({ isOpen, onClose, onImport }: QuizletImportModalProps) {
  const [text, setText] = useState('');
  const [format, setFormat] = useState<'auto' | 'csv'>('auto');
  const { importFromText, isImporting, error, clearError } = useQuizletImport();

  if (!isOpen) return null;

  const handleImport = async () => {
    clearError();
    const result = await importFromText(text, format);
    
    if (result) {
      onImport(result.flashcards, result.title);
      setText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Import from Quizlet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Paste your flashcards below. Supported formats:
        </p>

        <ul className="text-gray-500 text-xs mb-4 space-y-1 list-disc list-inside">
          <li>Term - Definition</li>
          <li>Term | Definition</li>
          <li>Term (tab) Definition</li>
          <li>CSV format</li>
        </ul>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFormat('auto')}
            className={`px-3 py-1 rounded-full text-xs ${
              format === 'auto' ? 'bg-[#14b8a6]' : 'bg-white/10'
            }`}
          >
            Auto-detect
          </button>
          <button
            onClick={() => setFormat('csv')}
            className={`px-3 py-1 rounded-full text-xs ${
              format === 'csv' ? 'bg-[#14b8a6]' : 'bg-white/10'
            }`}
          >
            CSV
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Term 1 - Definition 1&#10;Term 2 - Definition 2&#10;..."
          className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm placeholder-gray-500 focus:border-[#14b8a6] focus:outline-none resize-none"
        />

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}

        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!text.trim() || isImporting}
            className="flex-1"
          >
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </div>
    </div>
  );
}
