'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

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
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    checkSession(abortController.signal);
    
    return () => {
      abortController.abort();
      abortControllerRef.current = null;
    };
  }, []);

  async function checkSession(signal?: AbortSignal) {
    try {
      const res = await fetch('/api/auth', { signal });
      const data = await res.json();
      if (data.authenticated && data.email) {
        setUser({ email: data.email, role: data.role });
      }
    } catch {
      // Silent fail - user will be logged out
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
    } catch {
      // Silent fail - logout locally regardless
    } finally {
      setUser(null);
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