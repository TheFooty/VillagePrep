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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09090b',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '20px',
          color: 'white',
        }}>
          V
        </div>
        <div style={{
          color: '#10b981',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: '14px',
          fontWeight: 500,
        }}>
          Loading VillagePrep...
        </div>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #27272a',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
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
