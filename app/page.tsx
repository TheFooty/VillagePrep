'use client';

import { useState, useRef, useEffect } from 'react';

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
    console.error('Failed to load:', e);
    return null;
  }
}

function parseMarkdown(text: string): string {
  if (!text) return '';
  let html = text;
  
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  
  html = html.replace(/\|(.+)\|/g, '<td>$1</td>');
  html = html.replace(/\|([^|]+)\|([^|]+)\|([^|]+)\|/g, '<tr><td>$1</td><td>$2</td><td>$3</td></tr>');
  
  html = html.replace(/```[\s\S]*?```/g, '');
  
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br/>');
  
  return `<div class="markdown-content">${html}</div>`;
}

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div 
      className="animate-fade-in"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div 
      className="markdown-content text-sm text-gray-300 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}

interface User {
  email: string;
  role: 'teacher' | 'student';
}

interface VPClass {
  id: string;
  name: string;
  content: string;
  testDate: string;
  teacherEmail: string;
  folderId?: string;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  classIds: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Flashcard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

async function parseFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/parse-pdf', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({ error: 'Invalid parser response' }));
  if (!res.ok || data.error) {
    throw new Error(data.error || 'File parser failed');
  }
  return data.text as string;
}

async function getYouTubeTranscript(url: string): Promise<string> {
  const res = await fetch('/api/youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Failed to get transcript');
  }
  return data.text;
}

function Spinner() {
  return (
    <div className="w-5 h-5 relative">
      <div className="absolute inset-0 rounded-full border-2 border-white/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#14b8a6] animate-spin" />
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-[#14b8a6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-[#14b8a6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-[#14b8a6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] transition-transform duration-[2000ms] ease-out"
          style={{
            background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)',
            left: '50%',
            top: '50%',
            transform: `translate(${mousePosition.x * 0.02 - 300}px, ${mousePosition.y * 0.02 - 300}px)`,
          }}
        />
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]" style={{ background: '#14b8a6' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]" style={{ background: '#6366f1' }} />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl font-bold">VillagePrep</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white text-sm transition-colors">How It Works</a>
            <a href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a>
          </div>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-[#14b8a6] hover:bg-[#0d9488] text-white text-sm font-medium rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className={`transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-xs font-medium mb-6">
              ✨ AI-Powered Study Assistant
            </span>
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-bold leading-tight mb-6 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-white">Find your perfect</span>
            <br />
            <span className="bg-gradient-to-r from-[#14b8a6] to-[#6366f1] bg-clip-text text-transparent">
              study path
            </span>
          </h1>
          
          <p className={`text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Upload your notes, PDFs, or paste content from any source. 
            VillagePrep uses AI to generate flashcards, quizzes, study plans, 
            and more—all personalized to your learning style.
          </p>
          
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] flex items-center gap-2 group"
            >
              Start Studying Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="px-8 py-4 border border-gray-700 hover:border-[#14b8a6] text-gray-300 hover:text-white font-medium rounded-full transition-all duration-300">
              See How It Works
            </button>
          </div>
        </div>

        {/* Mock Preview Card */}
        <div className={`mt-20 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
          <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
            {/* Window controls */}
            <div className="bg-[#1a1a1f] px-4 py-3 flex items-center gap-2 border-b border-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="flex-1 text-center">
                <span className="text-gray-500 text-xs">villageprep.net / study</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </span>
              </div>
            </div>
            
            {/* Chat UI Mock */}
            <div className="bg-[#0f0f14] p-6 grid grid-cols-4 gap-4 min-h-[300px]">
              {/* Sidebar */}
              <div className="col-span-1 space-y-2">
                <div className="text-sm font-semibold text-white mb-4">VillagePrep</div>
                <button className="w-full text-left px-3 py-2 rounded-lg bg-[#14b8a6]/20 text-[#14b8a6] text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 text-sm hover:bg-white/5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Classes
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 text-sm hover:bg-white/5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Flashcards
                </button>
              </div>
              
              {/* Chat area */}
              <div className="col-span-3 space-y-4">
                <div className="text-sm text-gray-300">
                  <span className="text-white font-medium">Generate study materials</span>
                </div>
                
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-[#14b8a6] text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm max-w-[80%]">
                    Create flashcards for my AP Chemistry notes
                  </div>
                </div>
                
                {/* AI response */}
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1f] border border-gray-800 text-gray-300 px-4 py-3 rounded-2xl rounded-bl-sm text-sm max-w-[90%]">
                    <p className="mb-3">Here are 10 flashcards for your AP Chemistry notes:</p>
                    <div className="space-y-2">
                      {['Atom structure', 'Periodic trends', 'Chemical bonding', 'Acids & Bases', 'Thermodynamics'].map((term, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#0f0f14] px-3 py-2 rounded-lg border border-gray-800">
                          <span className="text-white text-sm">{term}</span>
                          <span className="text-xs text-gray-500">Click to flip</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button className="px-3 py-1.5 rounded-full border border-gray-700 hover:border-[#14b8a6] text-xs text-gray-300 transition-colors">
                    Generate Quiz
                  </button>
                  <button className="px-3 py-1.5 rounded-full border border-gray-700 hover:border-[#14b8a6] text-xs text-gray-300 transition-colors">
                    Study Plan
                  </button>
                  <button className="px-3 py-1.5 rounded-full border border-gray-700 hover:border-[#14b8a6] text-xs text-gray-300 transition-colors">
                    Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to <span className="text-[#14b8a6]">ace</span> your classes
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Upload any study material and let AI do the heavy lifting
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📝', title: 'Smart Notes', desc: 'AI generates organized notes from any content' },
              { icon: '🃏', title: 'Flashcards', desc: 'Auto-created flashcards for spaced repetition' },
              { icon: '❓', title: 'Practice Quizzes', desc: 'Test your knowledge with AI-generated quizzes' },
              { icon: '📅', title: 'Study Plans', desc: 'Personalized day-by-day study schedules' },
              { icon: '🎙️', title: 'Podcast Scripts', desc: 'Listen to your notes on the go' },
              { icon: '📺', title: 'YouTube Support', desc: 'Extract text from any educational video' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#14b8a6]/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#14b8a6] transition-colors">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#14b8a6] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-semibold">VillagePrep</span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 VillagePrep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
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
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setRole(data.role);
      setEmail(normalizedEmail);
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
      const trimmedCode = code.trim();
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: trimmedCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onLogin({ email: data.email, role: data.role });
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ background: '#14b8a6' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]" style={{ background: '#6366f1' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      </div>
      
      <div className="relative z-10 card-elevated rounded-3xl p-8 w-full max-w-[420px]">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center shadow-lg shadow-[#14b8a6]/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-2xl font-bold">VillagePrep</span>
        </div>

        <div className="space-y-4">
          {step === 'email' ? (
            <>
              <input
                className="input-field w-full text-base"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendCode()}
              />
              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={sendCode}
                disabled={loading || !email}
              >
                {loading ? <Spinner /> : 'Continue →'}
              </button>
            </>
          ) : (
            <>
              <input
                className="input-field w-full text-center text-2xl tracking-[0.5em]"
                type="text"
                placeholder="000000"
                value={code}
                maxLength={6}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && verifyCode()}
              />
              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={verifyCode}
                disabled={loading || code.length < 6}
              >
                {loading ? <Spinner /> : 'Sign In'}
              </button>
              <button
                className="w-full text-gray-500 hover:text-white text-sm transition-colors text-center"
                onClick={() => { setStep('email'); setCode(''); setError(''); }}
              >
                ← Change email
              </button>
            </>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 animate-fade-in">{error}</p>
          )}

          {role && (
            <p className="text-center text-emerald-400 text-sm bg-emerald-500/10 rounded-lg py-2">
              {role === 'teacher' ? 'Teacher account detected' : 'Student account detected'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TeacherPortal({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [classes, setClasses] = useState<VPClass[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [testDate, setTestDate] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [ytLoading, setYtLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/classes').then(r => r.json()).then(setClasses);
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    try {
      const text = await parseFile(file);
      setContent(prev => prev ? prev + '\n\n' + text : text);
    } catch (err: any) {
      alert(err.message || 'Could not read file.');
    } finally {
      setFileLoading(false);
    }
  }

  async function handleYouTube() {
    const url = prompt('Enter YouTube URL:');
    if (!url) return;
    setYtLoading(true);
    try {
      const text = await getYouTubeTranscript(url);
      setContent(prev => prev ? prev + '\n\n--- YOUTUBE TRANSCRIPT ---\n' + text : text);
    } catch (err: any) {
      alert(err.message || 'Could not get transcript.');
    } finally {
      setYtLoading(false);
    }
  }

  async function saveClass() {
    if (!name || !content) return;
    setSaving(true);
    const cls: VPClass = {
      id: Date.now().toString(),
      name,
      content,
      testDate,
      teacherEmail: user.email,
    };
    await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cls),
    });
    setClasses(prev => [...prev, cls]);
    setName('');
    setContent('');
    setTestDate('');
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const myClasses = classes.filter(c => c.teacherEmail === user.email);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center shadow-lg shadow-[#14b8a6]/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl font-bold">VillagePrep</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm hidden sm:inline">{user.email}</span>
            <button onClick={onLogout} className="text-gray-500 hover:text-white text-sm transition-all hover:bg-white/5 px-3 py-2 rounded-lg">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="card-elevated rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Class</h2>
          
          <div className="space-y-4">
            <input
              className="input-field w-full"
              placeholder="Class name (e.g., AP Chemistry - Period 3)"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="input-field flex-1"
                type="date"
                value={testDate}
                onChange={e => setTestDate(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => fileRef.current?.click()}
                  disabled={fileLoading}
                >
                  {fileLoading ? <Spinner /> : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      File
                    </>
                  )}
                </button>
                <button
                  className="bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl px-4 py-3 transition-colors flex items-center gap-2"
                  onClick={handleYouTube}
                  disabled={ytLoading}
                >
                  {ytLoading ? <Spinner /> : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                      </svg>
                      YouTube
                    </>
                  )}
                </button>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
            </div>

            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#14b8a6] transition-colors resize-y min-h-[200px]"
              placeholder="Paste your class materials, notes, or content here..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />

            <button
              className="w-full bg-[#14b8a6] hover:bg-[#0d9488] disabled:opacity-50 text-white rounded-xl py-4 font-semibold transition-colors"
              onClick={saveClass}
              disabled={saving || !name || !content}
            >
              {saved ? '✓ Class Created!' : saving ? 'Saving...' : 'Create Class'}
            </button>
          </div>
        </div>

        {myClasses.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Your Classes</h3>
            <div className="grid gap-4">
              {myClasses.map(c => (
                <div key={c.id} className="bg-[#0f0f14] rounded-xl p-5 border border-white/10 hover:border-[#14b8a6]/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-white text-lg mb-1">{c.name}</div>
                      <div className="text-gray-500 text-sm">{c.content.length.toLocaleString()} characters</div>
                      {c.testDate && (
                        <div className="text-[#14b8a6] text-sm mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Test: {new Date(c.testDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#14b8a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

type StudyTab = 'notes' | 'chat' | 'flashcards' | 'quiz' | 'studyplan' | 'podcast' | 'summary';

function StudentPortal({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [classes, setClasses] = useState<VPClass[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<string[]>([]);
  const [classNotes, setClassNotes] = useState<Record<string, string>>({});
  const [selectedClass, setSelectedClass] = useState<VPClass | null>(null);
  const [myDocs, setMyDocs] = useState<string>('');
  const [tab, setTab] = useState<StudyTab>('notes');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [flashcardCount, setFlashcardCount] = useState<5 | 10 | 20>(10);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizLength, setQuizLength] = useState<5 | 10 | 15>(5);
  const [studyPlan, setStudyPlan] = useState('');
  const [podcast, setPodcast] = useState('');
  const [summary, setSummary] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [ytLoading, setYtLoading] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const chatBottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      if (stored.myDocs) setMyDocs(stored.myDocs);
      if (stored.classNotes) setClassNotes(stored.classNotes);
      if (stored.messages) setMessages(stored.messages);
      if (stored.enrolledClasses) setEnrolledClasses(stored.enrolledClasses);
    }
    fetch('/api/classes').then(r => r.json()).then(setClasses);
    fetch(`/api/folders?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => setFolders(data.folders || []));
    fetch(`/api/enroll?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        setEnrolledClasses(prev => stored?.enrolledClasses || data.classes || []);
        (data.classes || []).forEach((classId: string) => {
          fetch(`/api/notes?email=${encodeURIComponent(user.email)}&classId=${encodeURIComponent(classId)}`)
            .then(r => r.json())
            .then(data => setClassNotes(prev => ({ ...prev, [classId]: data.notes || '' })));
        });
      });
  }, [user.email]);

  useEffect(() => {
    const sync = async () => {
      const stored = loadFromStorage();
      const cloudDocs = await loadFromCloud(user.email, 'files');
      setMyDocs(cloudDocs || stored?.myDocs || '');
      
      const cloudMessages = await loadFromCloud(user.email, 'chat');
      if (cloudMessages) {
        try { setMessages(JSON.parse(cloudMessages)); } 
        catch { setMessages(stored?.messages || []); }
      }
    };
    sync();
  }, [user.email]);

  useEffect(() => {
    saveToStorage({ myDocs, classNotes, messages, enrolledClasses, selectedClassId: selectedClass?.id || null });
    saveToCloud(user.email, 'files', myDocs);
    saveToCloud(user.email, 'chat', JSON.stringify(messages));
  }, [myDocs, messages, enrolledClasses, selectedClass]);

  useEffect(() => {
    chatBottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const combinedContent = [
    selectedClass?.content || '',
    myDocs ? `\n\n--- MY NOTES ---\n${myDocs}` : '',
    classNotes[selectedClass?.id || ''] ? `\n\n--- CLASS NOTES ---\n${classNotes[selectedClass?.id || '']}` : '',
  ].join('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    try {
      const text = await parseFile(file);
      setMyDocs(prev => prev ? prev + '\n\n' + text : text);
    } catch (err: any) {
      alert(err.message || 'Could not read file.');
    } finally {
      setFileLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleYouTube() {
    const url = prompt('Enter YouTube URL to add transcript:');
    if (!url) return;
    setYtLoading(true);
    try {
      const text = await getYouTubeTranscript(url);
      setMyDocs(prev => prev ? prev + '\n\n--- YOUTUBE TRANSCRIPT ---\n' + text : text);
    } catch (err: any) {
      alert(err.message || 'Could not get transcript.');
    } finally {
      setYtLoading(false);
    }
  }

  async function callAi(type: StudyTab, extraMessages?: Message[]) {
    if (!combinedContent && type !== 'chat') return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          messages: extraMessages || messages,
          classContent: combinedContent,
          className: selectedClass?.name || 'General Study',
          testDate: selectedClass?.testDate || '',
          customPrompt: type === 'flashcards' ? `Generate exactly ${flashcardCount} flashcards. Respond with valid JSON array.` : type === 'quiz' ? `Generate ${quizLength} ${quizDifficulty} multiple choice questions. Make them ${quizDifficulty === 'easy' ? 'straightforward with basic recall' : quizDifficulty === 'medium' ? 'require understanding and application' : 'challenging with complex reasoning and edge cases'}. Respond with valid JSON.` : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || data.text || 'Something went wrong. Please try again.');
        return null;
      }
      return data.text as string;
    } catch (err: any) {
      alert(err.message || 'Failed to connect to AI');
      return null;
    } finally {
      setAiLoading(false);
    }
  }

  async function loadContent(type: StudyTab, forceRegenerate = false) {
    setTab(type);
    
    if (forceRegenerate) {
      setAiLoading(true);
      try {
        const text = await callAi(type);
        if (!text) return;
        
        if (type === 'notes') setNotes(text);
        else if (type === 'summary') setSummary(text);
        else if (type === 'podcast') setPodcast(text);
        else if (type === 'studyplan') setStudyPlan(text);
        else if (type === 'flashcards') {
          const clean = text.replace(/```json|```/g, '').trim();
          let cards = JSON.parse(clean) as Flashcard[];
          if (cards.length > flashcardCount) cards = cards.slice(0, flashcardCount);
          setFlashcards(cards);
          setFlipped(new Array(cards.length).fill(false));
        } else if (type === 'quiz') {
          const clean = text.replace(/```json|```/g, '').trim();
          let parsed = JSON.parse(clean) as QuizQuestion[];
          if (parsed.length > quizLength) parsed = parsed.slice(0, quizLength);
          setQuiz(parsed);
          setAnswers([]);
        }
      } catch (err) {
        console.error('Error loading content:', err);
      } finally {
        setAiLoading(false);
      }
    }
  }

  async function sendChat() {
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    const reply = await callAi('chat', newMessages);
    if (reply) setMessages([...newMessages, { role: 'assistant', content: reply }]);
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, name: newFolderName }),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    if (data.folder) {
      setFolders(prev => [...prev, data.folder]);
    }
    setNewFolderName('');
    setShowFolderModal(false);
  }

  async function enroll(classId: string) {
    await fetch('/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, classId }),
    });
    setEnrolledClasses(prev => prev.includes(classId) ? prev : [...prev, classId]);
  }

  async function saveNotes(classId: string, notes: string) {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, classId, notes }),
    });
    setClassNotes(prev => ({ ...prev, [classId]: notes }));
  }

  const tabLabels: Record<StudyTab, string> = {
    notes: 'Notes', chat: 'Chat', flashcards: 'Flashcards',
    quiz: 'Quiz', studyplan: 'Study Plan', podcast: 'Podcast', summary: 'Summary',
  };

  if (!selectedClass) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center shadow-lg shadow-[#14b8a6]/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">VillagePrep</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm hidden sm:inline">{user.email}</span>
              <button onClick={onLogout} className="text-gray-500 hover:text-white text-sm transition-all hover:bg-white/5 px-3 py-2 rounded-lg">
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gradient-to-br from-[#0f0f14] to-[#16161d] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-black/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">My Study Materials</h3>
                  <div className="flex gap-2">
                    <button
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm transition-all"
                      onClick={() => fileRef.current?.click()}
                      disabled={fileLoading}
                    >
                      {fileLoading ? 'Loading...' : '+ File'}
                    </button>
                    <button
                      className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:shadow-lg hover:shadow-[#14b8a6]/20 text-white rounded-lg px-3 py-1.5 text-sm transition-all"
                      onClick={handleYouTube}
                      disabled={ytLoading}
                    >
                      {ytLoading ? 'Loading...' : '+ YouTube'}
                    </button>
                  </div>
                </div>
                {myDocs ? (
                  <div>
                    <p className="text-emerald-400 text-sm mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {myDocs.length.toLocaleString()} characters loaded
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:shadow-lg hover:shadow-[#14b8a6]/20 text-white rounded-lg py-2 text-sm transition-all"
                        onClick={() => {
                          setSelectedClass({ id: 'my-files', name: 'My Files', content: myDocs, testDate: '', teacherEmail: user.email });
                          setMessages([]);
                        }}
                      >
                        Start Studying →
                      </button>
                      <button
                        className="text-red-400 text-sm hover:text-red-300 px-3"
                        onClick={() => setMyDocs('')}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Upload files or paste content to start studying</p>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
              </div>

              <div className="bg-gradient-to-br from-[#0f0f14] to-[#16161d] rounded-2xl p-6 border border-white/5 shadow-xl shadow-black/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Folders</h3>
                  <button
                    className="text-[#14b8a6] text-sm hover:text-[#0d9488] transition-all hover:bg-[#14b8a6]/10 px-3 py-1 rounded-lg"
                    onClick={() => setShowFolderModal(true)}
                  >
                    + New Folder
                  </button>
                </div>
                {folders.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {folders.map(folder => (
                      <div
                        key={folder.id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                        style={{ borderLeftColor: folder.color, borderLeftWidth: '3px' }}
                      >
                        <div className="font-medium text-white text-sm">{folder.name}</div>
                        <div className="text-gray-500 text-xs mt-1">{folder.classIds?.length || 0} items</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No folders yet. Create one to organize your classes.</p>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Classes</h3>
                {classes.length > 0 ? (
                  <div className="grid gap-4">
                    {classes.map(c => (
                      <div key={c.id} className="group bg-gradient-to-br from-[#0f0f14] to-[#16161d] rounded-2xl p-5 border border-white/5 hover:border-[#14b8a6]/50 transition-all hover:shadow-xl hover:shadow-[#14b8a6]/5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold text-white text-lg group-hover:text-[#14b8a6] transition-colors">{c.name}</div>
                            <div className="text-gray-500 text-sm">by {c.teacherEmail.split('@')[0]}</div>
                          </div>
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#14b8a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        </div>
                        {c.testDate && (
                          <div className="text-[#14b8a6] text-sm mb-3 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Test: {new Date(c.testDate).toLocaleDateString()}
                          </div>
                        )}
                        <textarea
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 outline-none focus:border-[#14b8a6] transition-colors resize-none mb-3"
                          placeholder="Add personal notes..."
                          rows={2}
                          value={classNotes[c.id] || ''}
                          onChange={e => setClassNotes(prev => ({ ...prev, [c.id]: e.target.value }))}
                          onBlur={() => saveNotes(c.id, classNotes[c.id] || '')}
                        />
                        <div className="flex gap-2">
                          <button
                            className="flex-1 bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl py-2.5 font-medium transition-colors"
                            onClick={() => { setSelectedClass(c); setMessages([]); }}
                          >
                            Study Now
                          </button>
                          {!enrolledClasses.includes(c.id) && (
                            <button
                              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl px-4 py-2.5 transition-colors"
                              onClick={() => enroll(c.id)}
                            >
                              Enroll
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No classes available yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0f0f14] rounded-2xl p-6 border border-white/10">
                <h3 className="font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Classes</span>
                    <span className="text-white font-medium">{classes.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Enrolled</span>
                    <span className="text-white font-medium">{enrolledClasses.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Folders</span>
                    <span className="text-white font-medium">{folders.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {showFolderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f14] rounded-2xl p-6 w-full max-w-md border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Create Folder</h3>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#14b8a6] transition-colors mb-4"
                placeholder="Folder name"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createFolder()}
              />
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-3 transition-colors"
                  onClick={() => setShowFolderModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl py-3 transition-colors"
                  onClick={createFolder}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="bg-[#0f0f14] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => setSelectedClass(null)}
          className="text-white hover:text-[#14b8a6] transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-white font-semibold hidden sm:inline">{selectedClass?.name}</span>
        <span className="text-white font-semibold sm:hidden">{selectedClass?.name?.slice(0, 15)}...</span>
        <div className="flex items-center gap-3">
          <button
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl px-3 py-1.5 text-sm transition-colors"
            onClick={() => fileRef.current?.click()}
            disabled={fileLoading}
          >
            {fileLoading ? 'Loading...' : '+ Notes'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
          <button onClick={onLogout} className="text-gray-400 hover:text-white text-sm transition-colors">
            Sign out
          </button>
        </div>
      </header>

      {myDocs && (
        <div className="bg-[#14b8a6]/20 border-b border-[#14b8a6]/30 px-6 py-2 flex items-center justify-between">
          <span className="text-white/80 text-sm">My notes included ({myDocs.length.toLocaleString()} chars)</span>
          <button onClick={() => setMyDocs('')} className="text-white/60 hover:text-white text-sm">Clear</button>
        </div>
      )}

      <div className="flex gap-2 px-4 py-3 bg-[#0a0a0f]/80 backdrop-blur-sm border-b border-white/5 overflow-x-auto">
        {(Object.keys(tabLabels) as StudyTab[]).map((t, i) => (
          <button
            key={t}
            className={`tab-button whitespace-nowrap animate-fade-in stagger-${i + 1} ${
              tab === t ? 'active' : ''
            }`}
            onClick={() => loadContent(t)}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === 'notes' && (
          <div>
            {aiLoading ? (
              <div className="flex justify-center py-20"><Spinner /></div>
            ) : notes ? (
              <>
                <button className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl py-3 mb-4 font-medium hover:shadow-lg hover:shadow-[#14b8a6]/20 transition-all duration-300" onClick={() => loadContent('notes')}>
                  Regenerate Notes
                </button>
                <div className="bg-[#16161d] border border-white/10 rounded-2xl p-8 overflow-auto shadow-2xl shadow-black/20">
                  <MarkdownContent content={notes} />
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-4">Click "Notes" to generate AI-powered study notes</p>
                <button className="bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl px-6 py-3" onClick={() => loadContent('notes')}>
                  Generate Notes
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'summary' && (
          <div>
            {aiLoading ? (
              <div className="flex justify-center py-20"><Spinner /></div>
            ) : summary ? (
              <>
                <button className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl py-3 mb-4 font-medium hover:shadow-lg hover:shadow-[#14b8a6]/20 transition-all duration-300" onClick={() => loadContent('summary')}>
                  Regenerate Summary
                </button>
                <div className="bg-[#16161d] border border-white/10 rounded-2xl p-8 overflow-auto shadow-2xl shadow-black/20">
                  <MarkdownContent content={summary} />
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <button className="bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl px-6 py-3" onClick={() => loadContent('summary')}>
                  Generate Summary
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'podcast' && (
          <div>
            {aiLoading ? (
              <div className="flex justify-center py-20"><Spinner /></div>
            ) : podcast ? (
              <>
                <button className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl py-3 mb-4 font-medium hover:shadow-lg hover:shadow-[#14b8a6]/20 transition-all duration-300" onClick={() => loadContent('podcast')}>
                  Regenerate Podcast Script
                </button>
                <div className="bg-[#16161d] border border-white/10 rounded-2xl p-8 overflow-auto shadow-2xl shadow-black/20">
                  <MarkdownContent content={podcast} />
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <button className="bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl px-6 py-3 font-medium hover:shadow-lg hover:shadow-[#14b8a6]/20 transition-all duration-300" onClick={() => loadContent('podcast')}>
                  Generate Podcast Script
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-300px)]">
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
              {messages.length === 0 && (
                <p className="text-gray-500 text-center mt-20">Ask me anything about {selectedClass?.name}...</p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 rounded-2xl text-sm max-w-[80%] ${
                    m.role === 'user'
                      ? 'bg-[#14b8a6] text-white ml-auto rounded-br-sm'
                      : 'bg-[#0f0f14] text-white mr-auto rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {aiLoading && (
                <div className="bg-[#0f0f14] text-white px-4 py-3 rounded-2xl rounded-bl-sm max-w-[80%] flex items-center gap-2">
                  <Spinner /> Thinking...
                </div>
              )}
              <div ref={chatBottom} />
            </div>
            <div className="pt-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-[#0f0f14] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#14b8a6] transition-colors"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask a question..."
                />
                <button
                  className="bg-[#14b8a6] hover:bg-[#0d9488] disabled:opacity-50 text-white rounded-xl px-5 py-3 font-medium transition-colors"
                  onClick={sendChat}
                  disabled={aiLoading || !input.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'flashcards' && (
          <div>
            {aiLoading ? <div className="flex justify-center py-20"><Spinner /></div> : flashcards.length === 0 ? (
              <div className="text-center py-20 space-y-6">
                <div className="flex gap-2 justify-center">
                  {([5, 10, 20] as const).map(c => (
                    <button
                      key={c}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${flashcardCount === c ? 'bg-[#14b8a6] text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                      onClick={() => setFlashcardCount(c)}
                    >
                      {c} cards
                    </button>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => loadContent('flashcards', true)}>
                  Generate Flashcards
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">{flashcards.length} cards</span>
                  <button className="text-[#14b8a6] text-sm hover:text-white" onClick={() => loadContent('flashcards', true)}>
                    Regenerate
                  </button>
                </div>
                <div className="grid gap-4">
                  {flashcards.map((fc, i) => (
                    <div
                      key={i}
                      className="bg-[#0f0f14] border border-white/10 rounded-xl p-6 cursor-pointer hover:border-[#14b8a6]/50 transition-colors min-h-[140px] flex items-center justify-center"
                      onClick={() => setFlipped(f => f.map((v, j) => j === i ? !v : v))}
                    >
                      <div className="text-center">
                        <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                          {flipped[i] ? 'Answer' : 'Question'}
                        </div>
                        <div className="text-white font-medium">{flipped[i] ? fc.back : fc.front}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'quiz' && (
          <div>
            {aiLoading ? <div className="flex justify-center py-20"><Spinner /></div> : quiz.length === 0 ? (
              <div className="text-center py-20 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map(d => (
                      <button
                        key={d}
                        className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${quizDifficulty === d ? 'bg-[#14b8a6] text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        onClick={() => setQuizDifficulty(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {([5, 10, 15] as const).map(l => (
                      <button
                        key={l}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${quizLength === l ? 'bg-[#14b8a6] text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        onClick={() => setQuizLength(l)}
                      >
                        {l} Q
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={() => loadContent('quiz', true)}>
                  Generate Quiz
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">{quiz.length} questions • {quizDifficulty}</span>
                  <button className="text-[#14b8a6] text-sm hover:text-white" onClick={() => loadContent('quiz', true)}>
                    Regenerate
                  </button>
                </div>
                {quiz.map((q, qi) => (
                  <div key={qi} className="bg-[#0f0f14] border border-white/10 rounded-xl p-5 mb-4">
                    <p className="text-white font-medium mb-3">{qi + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const answered = answers[qi] !== undefined;
                        const isSelected = answers[qi] === oi;
                        const isCorrect = q.correct === oi;
                        let bg = 'bg-white/5 hover:bg-white/10';
                        if (answered && isSelected && isCorrect) bg = 'bg-emerald-500/30 border-emerald-500';
                        if (answered && isSelected && !isCorrect) bg = 'bg-red-500/30 border-red-500';
                        if (answered && !isSelected && isCorrect) bg = 'bg-emerald-500/20 border-emerald-500';
                        return (
                          <button
                            key={oi}
                            className={`w-full text-left border border-white/10 rounded-lg px-4 py-3 text-white text-sm transition-colors ${bg}`}
                            onClick={() => {
                              if (answered) return;
                              setAnswers(a => { const n = [...a]; n[qi] = oi; return n; });
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {answers[qi] !== undefined && (
                      <p className="text-gray-500 text-sm mt-2">{q.explanation}</p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === 'studyplan' && (
          <div>
            {aiLoading ? <div className="flex justify-center py-20"><Spinner /></div> : studyPlan ? (
              <>
                <button className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl py-3 mb-4 font-medium hover:shadow-lg hover:shadow-[#14b8a6]/20 transition-all duration-300" onClick={() => loadContent('studyplan')}>
                  Regenerate
                </button>
                <div className="bg-[#16161d] border border-white/10 rounded-2xl p-8 overflow-auto shadow-2xl shadow-black/20">
                  <MarkdownContent content={studyPlan} />
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <button className="bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl px-6 py-3 font-medium hover:shadow-lg hover:shadow-[#14b8a6]/20 transition-all duration-300" onClick={() => loadContent('studyplan')}>
                  Generate Study Plan
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem('villageprep-user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        window.localStorage.removeItem('villageprep-user');
      }
    }
    return null;
  });

  const [showLanding, setShowLanding] = useState(true);

  function handleLogin(user: User) {
    window.localStorage.setItem('villageprep-user', JSON.stringify(user));
    setUser(user);
  }

  function handleLogout() {
    window.localStorage.removeItem('villageprep-user');
    setUser(null);
    setShowLanding(true);
  }

  function handleGetStarted() {
    setShowLanding(false);
  }

  if (showLanding && !user) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }
  
  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (user.role === 'teacher') return <TeacherPortal user={user} onLogout={handleLogout} />;
  return <StudentPortal user={user} onLogout={handleLogout} />;
}
