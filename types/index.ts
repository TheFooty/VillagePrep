export type UserRole = 'teacher' | 'student';

export interface User {
  email: string;
  role: UserRole;
  userId?: string;
  id?: string;
}

export interface VPClass {
  id: string;
  name: string;
  content: string;
  description?: string;
  testDate: string;
  teacherEmail: string;
  folderId?: string;
  shareCode?: string;
  isPublic?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  classIds: string[];
}

export interface StudySet {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  folder_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface StudySetFile {
  id: string;
  study_set_id: string;
  file_name: string;
  content: string;
  file_type: string;
  created_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizResult {
  date: string;
  score: number;
  total: number;
}

export type StudyTab = 'notes' | 'chat' | 'flashcards' | 'quiz' | 'studyplan' | 'podcast' | 'summary';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface StoredData {
  myDocs: string;
  classNotes: Record<string, string>;
  messages: Message[];
  selectedClassId: string | null;
  enrolledClasses: string[];
}

export interface GeneratedContent {
  id: string;
  study_set_id: string;
  content_type: 'notes' | 'flashcards' | 'quiz' | 'studyplan' | 'podcast' | 'summary';
  content: string | object;
  created_at: string;
}

export interface ChatHistory {
  id: string;
  user_id: string;
  study_set_id?: string;
  class_id?: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  class_id?: string;
  study_set_id?: string;
  activity_type: string;
  duration_seconds: number;
  started_at: string;
  ended_at?: string;
}

export const tabLabels: Record<StudyTab, string> = {
  notes: '📝 Notes',
  chat: '💬 Chat',
  flashcards: '🎴 Flashcards',
  quiz: '❓ Quiz',
  studyplan: '📅 Plan',
  podcast: '🎙️ Podcast',
  summary: '📋 Summary'
};

export const studyTabIcons: Record<StudyTab, string> = {
  notes: '📝',
  chat: '💬',
  flashcards: '🎴',
  quiz: '❓',
  studyplan: '📅',
  podcast: '🎙️',
  summary: '📋'
};