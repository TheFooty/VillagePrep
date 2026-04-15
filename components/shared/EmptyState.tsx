'use client';

import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  type: 'classes' | 'study-sets' | 'folders' | 'files';
  onAction?: () => void;
  actionLabel?: string;
}

const emptyMessages = {
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
};

export function EmptyState({ type, onAction, actionLabel }: EmptyStateProps) {
  const { icon, title, description } = emptyMessages[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm mb-6">{description}</p>
      {onAction && actionLabel && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}