'use client';

import { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0f]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#14b8a6]/5 to-transparent" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[120px]" style={{ background: '#14b8a6' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] mb-6">
            <span className="text-white text-3xl font-bold">V</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Welcome to VillagePrep</h2>
          <p className="text-gray-400 text-lg">
            {step === 'email' ? 'Enter your email to sign in' : 'Enter the code sent to your email'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {step === 'email' ? (
            <>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendCode()}
              />
              <Button onClick={sendCode} loading={loading} className="w-full mt-4">
                Send Code
              </Button>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <span className="text-gray-400 text-sm">Code sent to </span>
                <span className="text-white">{email}</span>
                <button onClick={() => setStep('email')} className="text-[#14b8a6] text-sm ml-2">Change</button>
              </div>
              <Input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
                className="text-center text-2xl tracking-[0.5em]"
                maxLength={6}
              />
              <Button onClick={verifyCode} loading={loading} className="w-full mt-4">
                Verify Code
              </Button>
              <p className="text-gray-500 text-xs text-center mt-3">
                Role detected: <span className="text-[#14b8a6]">{role || 'student'}</span>
              </p>
            </>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>

        <p className="text-gray-500 text-sm text-center mt-8">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}