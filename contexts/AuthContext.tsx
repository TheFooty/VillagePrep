'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  role: 'teacher' | 'student';
  userId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<{ error?: string }>;
  verify: (email: string, code: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.authenticated && data.email) {
        setUser({ email: data.email, role: data.role });
      }
    } catch (err) {
      console.error('Session check failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string): Promise<{ error?: string }> {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error };
      }
      return {};
    } catch (err) {
      return { error: 'Failed to send code' };
    }
  }

  async function verify(email: string, code: string): Promise<{ error?: string }> {
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error };
      }
      setUser({ email: data.email, role: data.role, userId: data.userId });
      return {};
    } catch (err) {
      return { error: 'Verification failed' };
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, verify, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}