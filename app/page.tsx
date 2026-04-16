'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { LandingPage } from '@/components/landing/LandingPage';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        
        if (!isMounted) return;
        
        if (data.authenticated && data.email) {
          const newUser = { email: data.email, role: data.role };
          setUser(newUser);
          // Don't store user in localStorage for security
        } else {
          setUser(null);
        }
      } catch {
        if (!isMounted) return;
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  function handleLogin(user: User) {
    setUser(user);
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch {
      // Silent fail on logout
    }
    setUser(null);
    setShowLanding(true);
  }

  function handleGetStarted() {
    setShowLanding(false);
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09090b',
        color: '#10b981',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontSize: '18px',
      }}>
        Loading...
      </div>
    );
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
