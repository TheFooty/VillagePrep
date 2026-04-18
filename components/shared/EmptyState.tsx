'use client';

import { Button } from '@/components/ui/Button';

type EmptyStateType = 'classes' | 'study-sets' | 'folders' | 'files' | 'flashcards' | 'quiz' | 'notes' | 'chat' | 'generic';

interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: string;
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const emptyMessages: Record<EmptyStateType, { icon: string; title: string; description: string }> = {
  'classes': {
    icon: '📚',
    title: 'No classes yet',
    description: 'Join a class with a share code or wait for your teacher to create one.',
  },
  'study-sets': {
    icon: '🎴',
    title: 'No study sets',
    description: 'Upload materials to create your first study set.',
  },
  'folders': {
    icon: '📁',
    title: 'No folders',
    description: 'Create folders to organize your study materials.',
  },
  'files': {
    icon: '📄',
    title: 'No files uploaded',
    description: 'Upload PDF, DOCX, TXT, or image files to get started.',
  },
  'flashcards': {
    icon: '🎴',
    title: 'No flashcards',
    description: 'Generate flashcards from your study materials to get started.',
  },
  'quiz': {
    icon: '❓',
    title: 'No quiz questions',
    description: 'Generate a quiz from your study materials to get started.',
  },
  'notes': {
    icon: '📝',
    title: 'No notes yet',
    description: 'Upload materials or generate notes from your content.',
  },
  'chat': {
    icon: '💬',
    title: 'Start a conversation',
    description: 'Ask me anything about your study material!',
  },
  'generic': {
    icon: '📦',
    title: 'Nothing here yet',
    description: 'Get started by adding some content.',
  },
};

export function EmptyState({ type = 'generic', icon, title, description, onAction, actionLabel }: EmptyStateProps) {
  const messages = emptyMessages[type];

  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">{icon || messages.icon}</div>
      <h3 className="empty-state-title">{title || messages.title}</h3>
      <p className="empty-state-description">{description || messages.description}</p>
      {onAction && actionLabel && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
      <style>{`
        .empty-state-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 16px;
          text-align: center;
        }
        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.4;
        }
        .empty-state-title {
          font-size: 18px;
          font-weight: 600;
          color: #fafafa;
          margin-bottom: 8px;
        }
        .empty-state-description {
          font-size: 14px;
          color: #71717a;
          max-width: 320px;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
}