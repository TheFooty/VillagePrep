'use client';

import { useState } from 'react';
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

  async function sendCode() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setError(data.error || 'Too many attempts. Try clearing codes below.');
          return;
        }
        setError(data.error || 'Failed to send code');
        return;
      }
      setRole(data.role);
      setStep('code');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function clearMyCodes() {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/auth?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setError('');
        setStep('email');
        setCode('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to clear codes. Try again.');
      }
    } catch {
      setError('Failed to reset. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid code');
        return;
      }
      onLogin({ email: data.email, role: data.role, userId: data.userId });
    } catch {
      setError('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

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
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                autoFocus
              />
              <button type="submit" className="login-btn" disabled={loading || !email}>
                {loading ? 'Sending...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={(e) => { e.preventDefault(); verifyCode(); }}>
              <div className="code-header">
                <span className="code-sent-to">Sent to {email}</span>
                <button type="button" className="code-change" onClick={() => setStep('email')}>
                  Change
                </button>
              </div>
              <input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="login-input code-input"
                maxLength={6}
                autoFocus
              />
              <button type="submit" className="login-btn" disabled={loading || code.length < 6}>
                {loading ? 'Verifying...' : 'Verify'}
              </button>
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
        
        .code-change:hover {
          text-decoration: underline;
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
