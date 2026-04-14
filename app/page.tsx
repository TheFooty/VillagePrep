'use client';

import { useState, useRef, useEffect } from 'react';

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
    throw new Error(data.error || `File parser failed (${res.status})`);
  }
  return data.text as string;
}

function Spinner() {
  return (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
      <div className="absolute inset-0 bg-[#1a1a2e]">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#e94560]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0f3460]/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e94560]/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-10 w-full max-w-[440px] border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e94560] rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-[#e94560]">Village</span>Prep
          </h1>
          <p className="text-white/60 text-sm">Your smart study companion</p>
        </div>

        <div className="space-y-4">
          {step === 'email' ? (
            <>
              <input
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/40 outline-none focus:border-[#e94560] transition-colors"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendCode()}
              />
              <button
                className="w-full bg-[#e94560] hover:bg-[#d63d56] disabled:bg-[#e94560]/50 text-white rounded-xl py-4 font-semibold transition-colors flex items-center justify-center gap-2"
                onClick={sendCode}
                disabled={loading || !email}
              >
                {loading ? <Spinner /> : 'Get Started'}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-white/60 text-sm">Enter the code sent to</p>
                <p className="text-white font-medium">{email}</p>
              </div>
              <input
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-center text-2xl letter-spacing-[0.5em] placeholder-white/30 outline-none focus:border-[#e94560] transition-colors"
                type="text"
                placeholder="000000"
                value={code}
                maxLength={6}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && verifyCode()}
              />
              <button
                className="w-full bg-[#e94560] hover:bg-[#d63d56] disabled:bg-[#e94560]/50 text-white rounded-xl py-4 font-semibold transition-colors flex items-center justify-center gap-2"
                onClick={verifyCode}
                disabled={loading || code.length < 6}
              >
                {loading ? <Spinner /> : 'Verify'}
              </button>
              <button
                className="w-full text-white/50 hover:text-white text-sm transition-colors"
                onClick={() => { setStep('email'); setCode(''); setError(''); }}
              >
                ← Change email
              </button>
            </>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2">{error}</p>
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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/classes').then(r => r.json()).then(setClasses);
  }, []);

  async function handlePdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfLoading(true);
    try {
      const text = await parseFile(file);
      setContent(prev => prev ? prev + '\n\n' + text : text);
    } catch (err: any) {
      alert(err.message || 'Could not read file. Try pasting text instead.');
    } finally {
      setPdfLoading(false);
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
    <div className="min-h-screen bg-[#1a1a2e]">
      <header className="bg-[#16213e] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e94560] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">VillagePrep</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm hidden sm:inline">{user.email}</span>
          <button
            onClick={onLogout}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-[#16213e] rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Class</h2>
          
          <div className="space-y-4">
            <input
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#e94560] transition-colors"
              placeholder="Class name (e.g., AP Chemistry - Period 3)"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="flex-1 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#e94560] transition-colors"
                type="date"
                value={testDate}
                onChange={e => setTestDate(e.target.value)}
              />
              <button
                className="bg-[#0f3460] hover:bg-[#1a4a7a] text-white rounded-xl px-5 py-3 transition-colors flex items-center justify-center gap-2"
                onClick={() => fileRef.current?.click()}
                disabled={pdfLoading}
              >
                {pdfLoading ? <Spinner /> : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload File
                  </>
                )}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,.docx" className="hidden" onChange={handlePdf} />
            </div>

            <textarea
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#e94560] transition-colors resize-y min-h-[200px]"
              placeholder="Paste your class materials, notes, syllabus, or exam questions here..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />

            <button
              className="w-full bg-[#e94560] hover:bg-[#d63d56] disabled:bg-[#e94560]/50 text-white rounded-xl py-4 font-semibold transition-colors"
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
                <div
                  key={c.id}
                  className="bg-[#16213e] rounded-xl p-5 border border-white/10 hover:border-[#e94560]/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-white text-lg mb-1">{c.name}</div>
                      <div className="text-white/50 text-sm">{c.content.length.toLocaleString()} characters</div>
                      {c.testDate && (
                        <div className="text-[#e94560] text-sm mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Test: {new Date(c.testDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-[#0f3460] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#e94560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

type StudyTab = 'chat' | 'flashcards' | 'quiz' | 'studyplan';

function StudentPortal({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [classes, setClasses] = useState<VPClass[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<string[]>([]);
  const [classNotes, setClassNotes] = useState<Record<string, string>>({});
  const [selectedClass, setSelectedClass] = useState<VPClass | null>(null);
  const [myDocs, setMyDocs] = useState<string>('');
  const [tab, setTab] = useState<StudyTab>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [studyPlan, setStudyPlan] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatBottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/classes').then(r => r.json()).then(setClasses);
    fetch(`/api/enroll?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        setEnrolledClasses(data.classes || []);
        data.classes.forEach((classId: string) => {
          fetch(`/api/notes?email=${encodeURIComponent(user.email)}&classId=${encodeURIComponent(classId)}`)
            .then(r => r.json())
            .then(data => setClassNotes(prev => ({ ...prev, [classId]: data.notes || '' })));
        });
      });
  }, [user.email]);

  useEffect(() => {
    chatBottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const combinedContent = [
    selectedClass?.content || '',
    myDocs ? `\n\n--- MY NOTES ---\n${myDocs}` : '',
    classNotes[selectedClass?.id || ''] ? `\n\n--- CLASS NOTES ---\n${classNotes[selectedClass?.id || '']}` : '',
  ].join('');

  async function handlePdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfLoading(true);
    try {
      const text = await parseFile(file);
      setMyDocs(prev => prev ? prev + '\n\n' + text : text);
    } catch (err: any) {
      alert(err.message || 'Could not read that PDF.');
    } finally {
      setPdfLoading(false);
      if (fileRef.current) fileRef.current.value = '';
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
        }),
      });
      const data = await res.json();
      return data.text as string;
    } finally {
      setAiLoading(false);
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

  async function loadFlashcards() {
    setTab('flashcards');
    setFlashcards([]);
    const text = await callAi('flashcards');
    if (!text) return;
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const cards = JSON.parse(clean) as Flashcard[];
      setFlashcards(cards);
      setFlipped(new Array(cards.length).fill(false));
    } catch {
      setFlashcards([{ front: 'Error parsing', back: text }]);
    }
  }

  async function loadQuiz() {
    setTab('quiz');
    setQuiz([]);
    setAnswers([]);
    const text = await callAi('quiz');
    if (!text) return;
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      setQuiz(JSON.parse(clean) as QuizQuestion[]);
    } catch {
      console.error('Quiz parse error', text);
    }
  }

  async function loadStudyPlan() {
    setTab('studyplan');
    setStudyPlan('');
    const text = await callAi('studyplan');
    if (text) setStudyPlan(text);
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

  if (!selectedClass) {
    return (
      <div className="min-h-screen bg-[#1a1a2e]">
        <header className="bg-[#16213e] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e94560] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">VillagePrep</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm hidden sm:inline">{user.email}</span>
            <button onClick={onLogout} className="text-white/60 hover:text-white text-sm transition-colors">
              Sign out
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-[#16213e] rounded-2xl p-6 border border-white/10 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-5 h-5 text-[#e94560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-semibold text-white">My Study Materials</p>
            </div>
            <p className="text-white/50 text-sm mb-4">Upload your own notes or PDFs to study alongside class materials.</p>
            <div className="flex gap-3">
              <button
                className="bg-[#0f3460] hover:bg-[#1a4a7a] text-white rounded-xl px-4 py-2.5 transition-colors flex items-center gap-2"
                onClick={() => fileRef.current?.click()}
                disabled={pdfLoading}
              >
                {pdfLoading ? <Spinner /> : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload File
                  </>
                )}
              </button>
              {myDocs && (
                <button
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl px-4 py-2.5 transition-colors"
                  onClick={() => setMyDocs('')}
                >
                  Clear
                </button>
              )}
            </div>
            {myDocs && (
              <p className="mt-3 text-emerald-400 text-sm">{myDocs.length.toLocaleString()} characters loaded</p>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,.docx" className="hidden" onChange={handlePdf} />
          </div>

          <h3 className="text-xl font-bold text-white mb-4">Available Classes</h3>
          {classes.length > 0 ? (
            <div className="grid gap-4">
              {classes.map(c => (
                <div
                  key={c.id}
                  className="bg-[#16213e] rounded-xl p-5 border border-white/10 hover:border-[#e94560]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-white text-lg">{c.name}</div>
                      <div className="text-white/50 text-sm">by {c.teacherEmail.split('@')[0]}</div>
                    </div>
                    <div className="w-10 h-10 bg-[#0f3460] rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#e94560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  {c.testDate && (
                    <div className="text-[#e94560] text-sm mb-3 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Test: {new Date(c.testDate).toLocaleDateString()}
                    </div>
                  )}
                  <textarea
                    className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/40 outline-none focus:border-[#e94560] transition-colors resize-none mb-3"
                    placeholder="Add personal notes..."
                    rows={2}
                    value={classNotes[c.id] || ''}
                    onChange={e => setClassNotes(prev => ({ ...prev, [c.id]: e.target.value }))}
                    onBlur={() => saveNotes(c.id, classNotes[c.id] || '')}
                  />
                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl py-2.5 font-medium transition-colors"
                      onClick={() => { setSelectedClass(c); setMessages([]); }}
                    >
                      Study Now
                    </button>
                    {!enrolledClasses.includes(c.id) && (
                      <button
                        className="bg-[#0f3460] hover:bg-[#1a4a7a] text-white rounded-xl px-4 py-2.5 transition-colors"
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
            <p className="text-white/40 text-center py-8">No classes available yet.</p>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <header className="bg-[#16213e] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => setSelectedClass(null)}
          className="text-white hover:text-[#e94560] transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-white font-semibold hidden sm:inline">{selectedClass.name}</span>
        <span className="text-white font-semibold sm:hidden">{selectedClass.name.slice(0, 15)}...</span>
        <div className="flex items-center gap-3">
          <button
            className="bg-[#0f3460] hover:bg-[#1a4a7a] text-white rounded-xl px-3 py-1.5 text-sm transition-colors"
            onClick={() => fileRef.current?.click()}
            disabled={pdfLoading}
          >
            {pdfLoading ? 'Loading...' : '+ Notes'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,.docx" className="hidden" onChange={handlePdf} />
          <button onClick={onLogout} className="text-white/60 hover:text-white text-sm transition-colors">
            Sign out
          </button>
        </div>
      </header>

      {myDocs && (
        <div className="bg-[#e94560]/20 border-b border-[#e94560]/30 px-6 py-2 flex items-center justify-between">
          <span className="text-white/80 text-sm">My notes included ({myDocs.length.toLocaleString()} chars)</span>
          <button onClick={() => setMyDocs('')} className="text-white/60 hover:text-white text-sm">Clear</button>
        </div>
      )}

      <div className="flex gap-2 px-4 py-3 bg-[#16213e] border-b border-white/10 overflow-x-auto">
        {(['chat', 'flashcards', 'quiz', 'studyplan'] as StudyTab[]).map(t => (
          <button
            key={t}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t
                ? 'bg-[#e94560] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => {
              if (t === 'flashcards') loadFlashcards();
              else if (t === 'quiz') loadQuiz();
              else if (t === 'studyplan') loadStudyPlan();
              else setTab('chat');
            }}
          >
            {t === 'chat' ? 'Chat' : t === 'flashcards' ? 'Flashcards' : t === 'quiz' ? 'Quiz' : 'Study Plan'}
          </button>
        ))}
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {tab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-300px)]">
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
              {messages.length === 0 && (
                <p className="text-white/40 text-center mt-20">Ask me anything about {selectedClass.name}...</p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 rounded-2xl text-sm max-w-[80%] ${
                    m.role === 'user'
                      ? 'bg-[#e94560] text-white ml-auto rounded-br-sm'
                      : 'bg-[#16213e] text-white mr-auto rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {aiLoading && (
                <div className="bg-[#16213e] text-white px-4 py-3 rounded-2xl rounded-bl-sm max-w-[80%] flex items-center gap-2">
                  <Spinner /> Thinking...
                </div>
              )}
              <div ref={chatBottom} />
            </div>
            <div className="pt-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-[#16213e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#e94560] transition-colors"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask a question..."
                />
                <button
                  className="bg-[#e94560] hover:bg-[#d63d56] disabled:bg-[#e94560]/50 text-white rounded-xl px-5 py-3 font-medium transition-colors"
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
            {aiLoading && <div className="flex justify-center py-20"><Spinner /></div>}
            {flashcards.length === 0 && !aiLoading && (
              <p className="text-white/40 text-center py-20">Generate flashcards to start studying!</p>
            )}
            {flashcards.length > 0 && (
              <>
                <button className="w-full bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl py-3 mb-4" onClick={loadFlashcards}>
                  Generate New Cards
                </button>
                <div className="grid gap-4">
                  {flashcards.map((fc, i) => (
                    <div
                      key={i}
                      className="bg-[#16213e] border border-white/10 rounded-xl p-6 cursor-pointer hover:border-[#e94560]/50 transition-colors min-h-[140px] flex items-center justify-center"
                      onClick={() => setFlipped(f => f.map((v, j) => j === i ? !v : v))}
                    >
                      <div className="text-center">
                        <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
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
            {aiLoading && <div className="flex justify-center py-20"><Spinner /></div>}
            {quiz.length === 0 && !aiLoading && (
              <p className="text-white/40 text-center py-20">Generate a quiz to test your knowledge!</p>
            )}
            {quiz.length > 0 && (
              <>
                <button className="w-full bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl py-3 mb-4" onClick={loadQuiz}>
                  New Quiz
                </button>
                {quiz.map((q, qi) => (
                  <div key={qi} className="bg-[#16213e] border border-white/10 rounded-xl p-5 mb-4">
                    <p className="text-white font-medium mb-3">{qi + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const answered = answers[qi] !== undefined;
                        const isSelected = answers[qi] === oi;
                        const isCorrect = q.correct === oi;
                        let bg = 'bg-[#1a1a2e] hover:bg-[#0f3460]';
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
                      <p className="text-white/60 text-sm mt-2">{q.explanation}</p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === 'studyplan' && (
          <div>
            {aiLoading && <div className="flex justify-center py-20"><Spinner /></div>}
            {studyPlan && (
              <>
                <button className="w-full bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl py-3 mb-4" onClick={loadStudyPlan}>
                  Regenerate
                </button>
                <pre className="bg-[#16213e] border border-white/10 rounded-xl p-5 text-white text-sm whitespace-pre-wrap">{studyPlan}</pre>
              </>
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

  function handleLogin(user: User) {
    window.localStorage.setItem('villageprep-user', JSON.stringify(user));
    setUser(user);
  }

  function handleLogout() {
    window.localStorage.removeItem('villageprep-user');
    setUser(null);
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (user.role === 'teacher') return <TeacherPortal user={user} onLogout={handleLogout} />;
  return <StudentPortal user={user} onLogout={handleLogout} />;
}
