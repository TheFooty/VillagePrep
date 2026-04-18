'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { User } from '@/types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [role, setRole] = useState<'teacher' | 'student' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Focus input when step changes
  useEffect(() => {
    if (step === 'email' && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (step === 'code' && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [step]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const sendCode = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
        signal: abortControllerRef.current.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError(data.error || 'Too many attempts. Try clearing codes below.');
          setLoading(false);
          return;
        }
        setError(data.error || 'Failed to send code. Please try again.');
        setLoading(false);
        return;
      }

      setRole(data.role);
      setStep('code');
    } catch {
      if (abortControllerRef.current?.signal.aborted) return;
      setError('Network error. Please check your connection and try again.');
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [email]);

  const clearMyCodes = useCallback(async () => {
    if (!email) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    try {
      const res = await fetch(`/api/auth?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
        method: 'DELETE',
        signal: abortControllerRef.current.signal,
      });
      if (res.ok) {
        setError('');
        setStep('email');
        setCode('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to clear codes. Please try again.');
      }
    } catch {
      if (abortControllerRef.current?.signal.aborted) return;
      setError('Failed to reset. Please try again.');
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [email]);

  const verifyCode = useCallback(async () => {
    if (code.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
        signal: abortControllerRef.current.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid code. Please try again.');
        return;
      }

      onLogin({ email: data.email, role: data.role, userId: data.userId });
    } catch {
      if (abortControllerRef.current?.signal.aborted) return;
      setError('Verification failed. Please try again.');
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [code, email, onLogin]);

  const resendCode = useCallback(async () => {
    if (resendCooldown > 0 || loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
        signal: abortControllerRef.current.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError(data.error || 'Too many attempts. Try clearing codes below.');
          return;
        }
        setError(data.error || 'Failed to resend code. Please try again.');
        return;
      }

      setError('');
      setResendCooldown(30);
      setError('Code sent! Check your email.');
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setError((prev) => prev.includes('Code sent') ? prev : '');
      }, 3000);
    } catch {
      if (abortControllerRef.current?.signal.aborted) return;
      setError('Network error. Please try again.');
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [email, resendCooldown, loading]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span className="logo-mark">V</span>
            </div>
            <h1 className="login-title">Welcome back</h1>
            <p className="login-sub">
              {step === 'email' 
                ? 'Enter your email to sign in' 
                : `Code sent to ${email}`}
            </p>
          </div>

          {step === 'email' ? (
            <form className="login-form" onSubmit={(e) => { e.preventDefault(); sendCode(); }}>
              <input
                ref={emailInputRef}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                autoFocus
                disabled={loading}
                autoComplete="email"
              />
              <button type="submit" className="login-btn" disabled={loading || !email.trim()}>
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Sending...
                  </>
                ) : 'Continue'}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={(e) => { e.preventDefault(); verifyCode(); }}>
              <div className="code-header">
                <span className="code-sent-to">Sent to {email}</span>
                <button type="button" className="code-change" onClick={() => setStep('email')} disabled={loading}>
                  Change
                </button>
              </div>
              <input
                ref={codeInputRef}
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="login-input code-input"
                maxLength={6}
                autoFocus
                disabled={loading}
                autoComplete="one-time-code"
              />
              <button type="submit" className="login-btn" disabled={loading || code.length < 6}>
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Verifying...
                  </>
                ) : 'Verify'}
              </button>
              <div className="resend-container">
                <button
                  type="button"
                  className="resend-btn"
                  onClick={resendCode}
                  disabled={loading || resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
              <p className="code-role">Role: <span>{role || 'student'}</span></p>
            </form>
          )}

          {error && (
            <div className="login-error">
              {error}
              {error.includes('Too many') && (
                <button type="button" className="clear-btn" onClick={clearMyCodes}>
                  Clear my codes & try again
                </button>
              )}
            </div>
          )}
        </div>

        <p className="login-footer">
          By continuing, you agree to our Terms of Service
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        
        .login-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #09090b;
          padding: 24px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        
        .login-container {
          width: 100%;
          max-width: 400px;
        }
        
        .login-card {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 20px;
          padding: 40px;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .login-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        
        .logo-mark {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 24px;
          color: white;
        }
        
        .login-title {
          font-size: 24px;
          font-weight: 700;
          color: #fafafa;
          margin-bottom: 8px;
        }
        
        .login-sub {
          font-size: 15px;
          color: #a1a1aa;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .login-input {
          width: 100%;
          padding: 14px 16px;
          background: #09090b;
          border: 1px solid #27272a;
          border-radius: 12px;
          font-size: 16px;
          color: #fafafa;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        
        .login-input::placeholder {
          color: #71717a;
        }
        
        .login-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }

        .login-input:focus-visible {
          outline: none;
        }

        .login-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .code-input {
          text-align: center;
          font-size: 24px;
          letter-spacing: 8px;
        }
        
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .code-sent-to {
          font-size: 13px;
          color: #a1a1aa;
        }
        
        .code-change {
          background: none;
          border: none;
          font-size: 13px;
          color: #10b981;
          cursor: pointer;
          font-family: inherit;
        }
        
        .code-change:hover:not(:disabled) {
          text-decoration: underline;
        }
        
        .code-change:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .login-btn {
          width: 100%;
          padding: 14px 24px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .login-btn:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
        }

        .login-btn:focus-visible {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }

        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .code-role {
          text-align: center;
          font-size: 13px;
          color: #71717a;
          margin-top: 8px;
        }
        
        .code-role span {
          color: #10b981;
          font-weight: 500;
        }

        .resend-container {
          text-align: center;
          margin-top: 8px;
        }

        .resend-btn {
          background: none;
          border: none;
          font-size: 13px;
          color: #10b981;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.2s;
        }

        .resend-btn:hover:not(:disabled) {
          color: #059669;
          text-decoration: underline;
        }

        .resend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-error {
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 14px;
          text-align: center;
        }

        .clear-btn {
          display: block;
          margin: 12px auto 0;
          background: none;
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 8px;
          padding: 8px 16px;
          color: #fca5a5;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .clear-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.6);
        }

        .clear-btn:focus-visible {
          outline: 2px solid #ef4444;
          outline-offset: 2px;
        }

        .btn-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: #52525b;
        }
      `}</style>
    </div>
  );
}
