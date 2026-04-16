'use client';

import { useState, useEffect } from 'react';
import { User, VPClass, Folder, StudySet, StudyTab, Message, Flashcard, QuizQuestion } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { LandingPage } from '@/components/landing/LandingPage';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard';

const STORAGE_KEY = 'villageprep_data';

interface StoredData {
  myDocs: string;
  classNotes: Record<string, string>;
  messages: Message[];
  selectedClassId: string | null;
  enrolledClasses: string[];
}

async function saveToCloud(email: string, type: string, content: string) {
  try {
    await fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type, content }),
    });
  } catch (e) {
    console.error('Failed to save to cloud:', e);
  }
}

async function loadFromCloud(email: string, type: string): Promise<string> {
  try {
    const res = await fetch(`/api/user-data?email=${encodeURIComponent(email)}&type=${type}`);
    const data = await res.json();
    return data.content || '';
  } catch (e) {
    console.error('Failed to load from cloud:', e);
    return '';
  }
}

function saveToStorage(data: StoredData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save:', e);
  }
}

function loadFromStorage(): StoredData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      try {
        const saved = stored as unknown as { villageprep_user?: string };
        if (saved?.villageprep_user) {
          setUser(JSON.parse(saved.villageprep_user));
        }
      } catch {
        localStorage.removeItem('villageprep-user');
      }
    }

    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.email) {
          const newUser = { email: data.email, role: data.role };
          setUser(newUser);
          localStorage.setItem('villageprep-user', JSON.stringify(newUser));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function handleLogin(user: User) {
    localStorage.setItem('villageprep-user', JSON.stringify(user));
    setUser(user);
  }

  async function handleLogout() {
    localStorage.removeItem('villageprep-user');
    await fetch('/api/auth', { method: 'DELETE' }).catch(() => {});
    setUser(null);
    setShowLanding(true);
  }

  function handleGetStarted() {
    setShowLanding(false);
  }

  function showToast(message: string, type: string = 'info') {
    setToast({ message, type });
  }

  if (showLanding && !user) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return user.role === 'teacher' ? (
    <TeacherDashboard user={user} onLogout={handleLogout} />
  ) : (
    <StudentDashboard user={user} onLogout={handleLogout} />
  );
}