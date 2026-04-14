'use client';

import { useState, useRef, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function parsePdf(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/parse-pdf', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({ error: 'Invalid parser response' }));
  if (!res.ok || data.error) {
    throw new Error(data.error || `PDF parser failed (${res.status})`);
  }
  return data.text as string;
}

// ─── Loading Spinner Component ────────────────────────────────────────────────

function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 font-sans">
      <div className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-[420px] shadow-2xl">
        <div className="text-3xl font-extrabold mb-2 tracking-tight">
          <span className="text-blue-600">V</span>
          <span className="text-slate-900">illagPrep</span>
        </div>
        <p className="text-slate-500 text-sm mt-1 mb-7">
          {step === 'email'
            ? 'Sign in with your Village School email'
            : `Code sent to ${email} — check your inbox`}
        </p>

        {step === 'email' ? (
          <>
            <input
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 font-sans"
              type="email"
              placeholder="you@thevillageschool.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendCode()}
              aria-label="Email address"
            />
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl py-3.5 text-sm font-semibold cursor-pointer transition-colors mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={sendCode}
              disabled={loading || !email}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" /> Sending…
                </span>
              ) : (
                'Send Code →'
              )}
            </button>
          </>
        ) : (
          <>
            <input
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 font-sans"
              type="text"
              placeholder="6-digit code"
              value={code}
              maxLength={6}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifyCode()}
              autoFocus
              aria-label="6-digit verification code"
            />
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl py-3.5 text-sm font-semibold cursor-pointer transition-colors mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={verifyCode}
              disabled={loading || code.length < 6}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" /> Verifying…
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
            <button
              className="w-full bg-transparent text-slate-500 hover:text-slate-700 rounded-xl py-2.5 text-sm font-medium cursor-pointer transition-colors mt-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              onClick={() => { setStep('email'); setCode(''); setError(''); }}
            >
              ← Back
            </button>
          </>
        )}

        {error && (
          <p className="text-red-500 text-sm mt-2.5" role="alert">
            {error}
          </p>
        )}

        {role && (
          <p className="mt-3 text-sm text-green-600 bg-green-50 rounded-lg py-2 px-3 text-center">
            {role === 'teacher' ? '🎓 Teacher account detected' : '📚 Student account detected'}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Teacher Portal ───────────────────────────────────────────────────────────

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
      const text = await parsePdf(file);
      setContent(prev => prev ? prev + '\n\n' + text : text);
    } catch {
      alert('Could not read PDF. Try pasting text instead.');
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
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-7 py-4 flex items-center justify-between sticky top-0 z-50">
        <span className="text-lg font-extrabold text-slate-900 tracking-tight">VillagePrep</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">{user.email}</span>
          <button
            onClick={onLogout}
            className="bg-transparent border border-gray-200 hover:bg-slate-50 text-slate-600 rounded-lg px-3.5 py-1.5 text-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4 mt-0">Add a Class</h2>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <input
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 font-sans mb-3"
            placeholder="Class name (e.g. AP Chemistry – Period 3)"
            value={name}
            onChange={e => setName(e.target.value)}
            aria-label="Class name"
          />

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 font-sans"
              type="date"
              value={testDate}
              onChange={e => setTestDate(e.target.value)}
              aria-label="Test date (optional)"
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl px-5 py-3 text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
              onClick={() => fileRef.current?.click()}
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Reading PDF…
                </span>
              ) : (
                '📎 Upload PDF'
              )}
            </button>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handlePdf} />
          </div>

          <textarea
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 font-sans mb-3 resize-y"
            placeholder="Paste notes, syllabus, past exam questions, or rubrics here…"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={10}
            aria-label="Class content"
          />

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl py-3.5 text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={saveClass}
            disabled={saving || !name || !content}
          >
            {saved ? '✓ Saved!' : saving ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" /> Saving…
              </span>
            ) : 'Publish Class →'}
          </button>
        </div>

        {myClasses.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-4 mt-8">Your Classes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myClasses.map(c => (
                <div
                  key={c.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="font-bold text-slate-900 text-base mb-1.5">{c.name}</div>
                  <div className="text-sm text-slate-500">{c.content.length.toLocaleString()} chars</div>
                  {c.testDate && (
                    <div className="text-sm text-slate-500 mt-1">
                      📅 Test: {new Date(c.testDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Student Portal ───────────────────────────────────────────────────────────

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
        // Load notes for each enrolled class
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
    myDocs ? `\n\n--- STUDENT'S OWN NOTES ---\n${myDocs}` : '',
    classNotes[selectedClass?.id || ''] ? `\n\n--- MY CLASS NOTES ---\n${classNotes[selectedClass?.id || '']}` : '',
  ].join('');

  async function handlePdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfLoading(true);
    try {
      const text = await parsePdf(file);
      setMyDocs(prev => prev ? prev + '\n\n' + text : text);
    } catch {
      alert('Could not read that PDF. Try a different file.');
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
      setFlashcards([{ front: 'Error parsing flashcards', back: text }]);
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

  // ── No class selected ───────────────────────────────────────────────────────

  if (!selectedClass) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-7 py-4 flex items-center justify-between sticky top-0 z-50">
          <span className="text-lg font-extrabold text-slate-900 tracking-tight">VillagePrep</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">{user.email}</span>
            <button
              onClick={onLogout}
              className="bg-transparent border border-gray-200 hover:bg-slate-50 text-slate-600 rounded-lg px-3.5 py-1.5 text-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="max-w-[900px] mx-auto px-6 py-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 mt-0">Classes & Study Materials</h2>

          {/* Own materials upload */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
            <p className="font-semibold text-slate-800 mb-2.5 mt-0">
              📁 Your Own Materials
            </p>
            <p className="text-sm text-slate-500 mb-3 mt-0">
              Upload your own notes or PDFs — the AI will use these alongside your teacher&apos;s material.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => fileRef.current?.click()}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> Reading…
                  </span>
                ) : (
                  '📎 Upload PDF'
                )}
              </button>
              {myDocs && (
                <button
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={() => setMyDocs('')}
                  aria-label="Clear my notes"
                >
                  Clear My Notes
                </button>
              )}
            </div>
            {myDocs && (
              <p className="mt-2.5 text-xs text-green-600 font-medium">
                ✓ {myDocs.length.toLocaleString()} characters loaded from your files
              </p>
            )}
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handlePdf} />
          </div>

          {classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(c => (
                <div
                  key={c.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="font-bold text-slate-900 text-base mb-1">{c.name}</div>
                  <div className="text-sm text-slate-500">by {c.teacherEmail.split('@')[0]}</div>
                  {c.testDate && (
                    <div className="text-sm text-red-500 font-semibold mt-1">
                      📅 Test: {new Date(c.testDate).toLocaleDateString()}
                    </div>
                  )}
                  <textarea
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none transition-colors focus:border-blue-500 font-sans mt-3 h-20 resize-none"
                    placeholder="Add your personal notes for this class…"
                    value={classNotes[c.id] || ''}
                    onChange={e => setClassNotes(prev => ({ ...prev, [c.id]: e.target.value }))}
                    onBlur={() => saveNotes(c.id, classNotes[c.id] || '')}
                    aria-label={`Personal notes for ${c.name}`}
                  />
                  <div className="flex gap-2.5 mt-3">
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => { setSelectedClass(c); setMessages([]); }}
                    >
                      Study This Class →
                    </button>
                    {!enrolledClasses.includes(c.id) && (
                      <button
                        className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            <p className="text-slate-400 text-sm">No classes yet — ask your teacher to add one.</p>
          )}

          {myDocs && (
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-5"
              onClick={() => {
                setSelectedClass({ id: 'personal', name: 'My Notes', content: '', testDate: '', teacherEmail: '' });
              }}
            >
              Study My Own Notes Only →
            </button>
          )}
        </main>
      </div>
    );
  }

  // ── Study view ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-7 py-4 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={() => setSelectedClass(null)}
          className="text-base cursor-pointer text-blue-600 hover:text-blue-700 font-semibold bg-transparent border-none p-0 focus:outline-none focus:underline"
        >
          ← Back
        </button>
        <span className="text-base font-extrabold text-slate-900 tracking-tight hidden sm:inline">{selectedClass.name}</span>
        <span className="text-base font-extrabold text-slate-900 tracking-tight sm:hidden">{selectedClass.name.length > 20 ? selectedClass.name.slice(0, 20) + '…' : selectedClass.name}</span>
        <div className="flex items-center gap-2.5">
          <button
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl px-4 py-1.5 text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => fileRef.current?.click()}
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <span className="flex items-center gap-1">
                <Spinner size="sm" /> Reading…
              </span>
            ) : (
              '+ My Notes'
            )}
          </button>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handlePdf} />
          <button
            onClick={onLogout}
            className="bg-transparent border border-gray-200 hover:bg-slate-50 text-slate-600 rounded-lg px-3.5 py-1.5 text-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </header>

      {myDocs && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 sm:px-7 py-2.5 text-sm text-blue-700 flex items-center gap-3">
          <span>📎 Your notes included ({myDocs.length.toLocaleString()} chars)</span>
          <button
            onClick={() => setMyDocs('')}
            className="text-blue-600 hover:text-blue-800 bg-transparent border-none text-base cursor-pointer ml-auto focus:outline-none focus:underline"
            aria-label="Clear my notes"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-1 px-5 py-3 bg-white border-b border-gray-200 overflow-x-auto">
        {(['chat', 'flashcards', 'quiz', 'studyplan'] as StudyTab[]).map(t => (
          <button
            key={t}
            className={`px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${
              tab === t
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
            onClick={() => {
              if (t === 'flashcards') loadFlashcards();
              else if (t === 'quiz') loadQuiz();
              else if (t === 'studyplan') loadStudyPlan();
              else setTab('chat');
            }}
          >
            {{ chat: '💬 Chat', flashcards: '🃏 Flashcards', quiz: '✏️ Quiz', studyplan: '📅 Study Plan' }[t]}
          </button>
        ))}
      </div>

      <main className="max-w-[900px] mx-auto px-6 py-7">
        {/* CHAT */}
        {tab === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-220px)]">
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
              {messages.length === 0 && (
                <p className="text-slate-400 text-center mt-20">Ask anything about {selectedClass.name}…</p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`px-4.5 py-3 rounded-[18px] text-sm leading-relaxed max-w-[85%] ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white self-end rounded-tr-sm'
                      : 'bg-slate-100 text-slate-900 self-start rounded-tl-sm'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {aiLoading && (
                <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-[18px] rounded-tl-sm self-start max-w-[85%] flex items-center gap-2">
                  <Spinner size="sm" /> Thinking…
                </div>
              )}
              <div ref={chatBottom} />
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 mb-2.5">
                {['Summarize key topics', 'What should I focus on?', 'Make a practice question'].map(q => (
                  <button
                    key={q}
                    className="bg-slate-100 hover:bg-slate-200 border-none rounded-full px-3.5 py-1.5 text-xs cursor-pointer text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setInput(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex gap-2.5">
                <input
                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 font-sans"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="Ask a question…"
                  aria-label="Ask a question"
                />
                <button
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={sendChat}
                  disabled={aiLoading || !input.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FLASHCARDS */}
        {tab === 'flashcards' && (
          <div>
            {aiLoading && (
              <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <p className="text-slate-400 text-sm">Generating flashcards…</p>
              </div>
            )}
            {flashcards.length === 0 && !aiLoading && (
              <p className="text-slate-400 text-center mt-20">No flashcards yet — generate some to start studying!</p>
            )}
            {flashcards.length > 0 && (
              <>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-5"
                  onClick={loadFlashcards}
                >
                  🔄 Regenerate
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {flashcards.map((fc, i) => (
                    <div
                      key={i}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-6 min-h-[160px] cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setFlipped(f => f.map((v, j) => j === i ? !v : v))}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setFlipped(f => f.map((v, j) => j === i ? !v : v))}
                      aria-label={`Flashcard: ${flipped[i] ? 'Answer' : 'Question'}`}
                    >
                      <div className="text-center">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                          {flipped[i] ? 'Answer' : 'Question'}
                        </div>
                        <div className="text-base font-semibold text-slate-900 leading-relaxed">
                          {flipped[i] ? fc.back : fc.front}
                        </div>
                        <div className="mt-4 text-xs text-slate-300">tap to flip</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* QUIZ */}
        {tab === 'quiz' && (
          <div>
            {aiLoading && (
              <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <p className="text-slate-400 text-sm">Generating quiz…</p>
              </div>
            )}
            {quiz.length === 0 && !aiLoading && (
              <p className="text-slate-400 text-center mt-20">No quiz yet — generate one to test your knowledge!</p>
            )}
            {quiz.length > 0 && (
              <>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-5"
                  onClick={loadQuiz}
                >
                  🔄 New Quiz
                </button>
                {quiz.map((q, qi) => (
                  <div key={qi} className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 shadow-sm">
                    <p className="font-bold text-slate-900 text-base mb-4 mt-0">{qi + 1}. {q.question}</p>
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt, oi) => {
                        const answered = answers[qi] !== undefined;
                        const isSelected = answers[qi] === oi;
                        const isCorrect = q.correct === oi;
                        let bgClass = 'bg-slate-100 hover:bg-slate-200';
                        if (answered && isSelected && isCorrect) bgClass = 'bg-green-100 border-green-500';
                        if (answered && isSelected && !isCorrect) bgClass = 'bg-red-100 border-red-500';
                        if (answered && !isSelected && isCorrect) bgClass = 'bg-green-100 border-green-500';
                        return (
                          <button
                            key={oi}
                            className={`w-full text-left border border-gray-200 rounded-xl px-4 py-3 text-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans ${bgClass}`}
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
                      <p className="text-sm text-slate-600 mt-2">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* STUDY PLAN */}
        {tab === 'studyplan' && (
          <div>
            {aiLoading && (
              <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <p className="text-slate-400 text-sm">Building your study plan…</p>
              </div>
            )}
            {studyPlan && (
              <>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-5"
                  onClick={loadStudyPlan}
                >
                  🔄 Regenerate
                </button>
                <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
                  <pre className="font-sans text-sm text-slate-800 leading-relaxed whitespace-pre-wrap m-0">
                    {studyPlan}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

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

