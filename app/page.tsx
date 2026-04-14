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
  folderId?: string;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  classIds: string[];
}

interface Progress {
  classId: string;
  type: string;
  score?: number;
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
  return <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
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
              <div className="flex gap-2">
                <button
                  className="bg-[#0f3460] hover:bg-[#1a4a7a] text-white rounded-xl px-4 py-3 transition-colors flex items-center gap-2"
                  onClick={() => fileRef.current?.click()}
                  disabled={fileLoading}
                >
                  {fileLoading ? <Spinner /> : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload
                    </>
                  )}
                </button>
                <button
                  className="bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl px-4 py-3 transition-colors flex items-center gap-2"
                  onClick={handleYouTube}
                  disabled={ytLoading}
                >
                  {ytLoading ? <Spinner /> : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      YouTube
                    </>
                  )}
                </button>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,.docx" className="hidden" onChange={handleFile} />
            </div>

            <textarea
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#e94560] transition-colors resize-y min-h-[200px]"
              placeholder="Or paste your class materials, notes, or content here..."
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
                <div key={c.id} className="bg-[#16213e] rounded-xl p-5 border border-white/10 hover:border-[#e94560]/50 transition-colors">
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

type StudyTab = 'notes' | 'chat' | 'flashcards' | 'quiz' | 'studyplan' | 'podcast' | 'summary';

const tabLabels: Record<StudyTab, string> = {
  notes: 'Notes',
  chat: 'Chat',
  flashcards: 'Flashcards',
  quiz: 'Quiz',
  studyplan: 'Study Plan',
  podcast: 'Podcast',
  summary: 'Summary',
};

const tabIcons: Record<StudyTab, string> = {
  notes: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  flashcards: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  quiz: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  studyplan: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  podcast: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
  summary: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
};

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
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
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
    fetch('/api/classes').then(r => r.json()).then(setClasses);
    fetch(`/api/folders?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => setFolders(data.folders || []));
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
        }),
      });
      const data = await res.json();
      return data.text as string;
    } finally {
      setAiLoading(false);
    }
  }

  async function loadContent(type: StudyTab) {
    setTab(type);
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
        const cards = JSON.parse(clean) as Flashcard[];
        setFlashcards(cards);
        setFlipped(new Array(cards.length).fill(false));
      } else if (type === 'quiz') {
        const clean = text.replace(/```json|```/g, '').trim();
        setQuiz(JSON.parse(clean) as QuizQuestion[]);
        setAnswers([]);
      }
    } catch (err) {
      console.error('Error loading content:', err);
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

  async function createFolder() {
    if (!newFolderName.trim()) return;
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, name: newFolderName }),
    });
    const data = await res.json();
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

        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#16213e] rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">My Study Materials</h3>
                  <div className="flex gap-2">
                    <button
                      className="bg-[#0f3460] hover:bg-[#1a4a7a] text-white rounded-lg px-3 py-1.5 text-sm transition-colors"
                      onClick={() => fileRef.current?.click()}
                      disabled={fileLoading}
                    >
                      {fileLoading ? 'Loading...' : '+ File'}
                    </button>
                    <button
                      className="bg-[#e94560] hover:bg-[#d63d56] text-white rounded-lg px-3 py-1.5 text-sm transition-colors"
                      onClick={handleYouTube}
                      disabled={ytLoading}
                    >
                      {ytLoading ? 'Loading...' : '+ YouTube'}
                    </button>
                  </div>
                </div>
                {myDocs ? (
                  <div>
                    <p className="text-emerald-400 text-sm mb-3">{myDocs.length.toLocaleString()} characters loaded</p>
                    <button
                      className="text-red-400 text-sm hover:text-red-300"
                      onClick={() => setMyDocs('')}
                    >
                      Clear all
                    </button>
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">Upload files or paste content to start studying</p>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,.docx" className="hidden" onChange={handleFile} />
              </div>

              <div className="bg-[#16213e] rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Folders</h3>
                  <button
                    className="text-[#e94560] text-sm hover:text-[#d63d56]"
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
                        className="bg-[#1a1a2e] rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                        style={{ borderLeftColor: folder.color, borderLeftWidth: '3px' }}
                      >
                        <div className="font-medium text-white text-sm">{folder.name}</div>
                        <div className="text-white/40 text-xs mt-1">{folder.classIds?.length || 0} items</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">No folders yet. Create one to organize your classes.</p>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Classes</h3>
                {classes.length > 0 ? (
                  <div className="grid gap-4">
                    {classes.map(c => (
                      <div key={c.id} className="bg-[#16213e] rounded-xl p-5 border border-white/10 hover:border-[#e94560]/50 transition-colors">
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
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#16213e] rounded-2xl p-6 border border-white/10">
                <h3 className="font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Classes</span>
                    <span className="text-white font-medium">{classes.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Enrolled</span>
                    <span className="text-white font-medium">{enrolledClasses.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Folders</span>
                    <span className="text-white font-medium">{folders.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {showFolderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#16213e] rounded-2xl p-6 w-full max-w-md border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Create Folder</h3>
              <input
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#e94560] transition-colors mb-4"
                placeholder="Folder name"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createFolder()}
              />
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-[#0f3460] hover:bg-[#1a4a7a] text-white rounded-xl py-3 transition-colors"
                  onClick={() => setShowFolderModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl py-3 transition-colors"
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
            disabled={fileLoading}
          >
            {fileLoading ? 'Loading...' : '+ Notes'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,.docx" className="hidden" onChange={handleFile} />
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
        {(Object.keys(tabLabels) as StudyTab[]).map(t => (
          <button
            key={t}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              tab === t
                ? 'bg-[#e94560] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => loadContent(t)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tabIcons[t]} />
            </svg>
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
                <button className="w-full bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl py-3 mb-4" onClick={() => loadContent('notes')}>
                  Regenerate Notes
                </button>
                <div className="bg-[#16213e] border border-white/10 rounded-xl p-6">
                  <pre className="text-white text-sm whitespace-pre-wrap font-sans">{notes}</pre>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-white/60 mb-4">Click "Notes" to generate AI-powered study notes</p>
                <button className="bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl px-6 py-3" onClick={() => loadContent('notes')}>
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
                <button className="w-full bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl py-3 mb-4" onClick={() => loadContent('summary')}>
                  Regenerate Summary
                </button>
                <div className="bg-[#16213e] border border-white/10 rounded-xl p-6">
                  <pre className="text-white text-sm whitespace-pre-wrap">{summary}</pre>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <button className="bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl px-6 py-3" onClick={() => loadContent('summary')}>
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
                <button className="w-full bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl py-3 mb-4" onClick={() => loadContent('podcast')}>
                  Regenerate Podcast Script
                </button>
                <div className="bg-[#16213e] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#e94560] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                        <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span className="text-white font-semibold">Podcast Script</span>
                  </div>
                  <pre className="text-white/80 text-sm whitespace-pre-wrap">{podcast}</pre>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <button className="bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl px-6 py-3" onClick={() => loadContent('podcast')}>
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
            {aiLoading ? <div className="flex justify-center py-20"><Spinner /></div> : flashcards.length === 0 ? (
              <div className="text-center py-20">
                <button className="bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl px-6 py-3" onClick={() => loadContent('flashcards')}>
                  Generate Flashcards
                </button>
              </div>
            ) : (
              <>
                <button className="w-full bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl py-3 mb-4" onClick={() => loadContent('flashcards')}>
                  New Cards
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
            {aiLoading ? <div className="flex justify-center py-20"><Spinner /></div> : quiz.length === 0 ? (
              <div className="text-center py-20">
                <button className="bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl px-6 py-3" onClick={() => loadContent('quiz')}>
                  Generate Quiz
                </button>
              </div>
            ) : (
              <>
                <button className="w-full bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl py-3 mb-4" onClick={() => loadContent('quiz')}>
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
            {aiLoading ? <div className="flex justify-center py-20"><Spinner /></div> : studyPlan ? (
              <>
                <button className="w-full bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl py-3 mb-4" onClick={() => loadContent('studyplan')}>
                  Regenerate
                </button>
                <pre className="bg-[#16213e] border border-white/10 rounded-xl p-5 text-white text-sm whitespace-pre-wrap">{studyPlan}</pre>
              </>
            ) : (
              <div className="text-center py-20">
                <button className="bg-[#e94560] hover:bg-[#d63d56] text-white rounded-xl px-6 py-3" onClick={() => loadContent('studyplan')}>
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
