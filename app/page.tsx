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
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <div style={styles.logo}>
          <span style={styles.logoV}>V</span>
          <span style={styles.logoText}>illagPrep</span>
        </div>
        <p style={styles.loginSub}>
          {step === 'email'
            ? 'Sign in with your Village School email'
            : `Code sent to ${email} — check your inbox`}
        </p>

        {step === 'email' ? (
          <>
            <input
              style={styles.input}
              type="email"
              placeholder="you@thevillageschool.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendCode()}
            />
            <button style={styles.btn} onClick={sendCode} disabled={loading || !email}>
              {loading ? 'Sending…' : 'Send Code →'}
            </button>
          </>
        ) : (
          <>
            <input
              style={styles.input}
              type="text"
              placeholder="6-digit code"
              value={code}
              maxLength={6}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifyCode()}
              autoFocus
            />
            <button style={styles.btn} onClick={verifyCode} disabled={loading || code.length < 6}>
              {loading ? 'Verifying…' : 'Sign In →'}
            </button>
            <button
              style={{ ...styles.btn, background: 'transparent', color: '#6b7280', marginTop: 8 }}
              onClick={() => { setStep('email'); setCode(''); setError(''); }}
            >
              ← Back
            </button>
          </>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {role && (
          <p style={styles.roleBadge}>
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
    <div style={styles.portalWrap}>
      <header style={styles.header}>
        <span style={styles.headerLogo}>VillagePrep</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={styles.headerEmail}>{user.email}</span>
          <button style={styles.logoutBtn} onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <div style={styles.portalBody}>
        <h2 style={styles.sectionTitle}>Add a Class</h2>

        <div style={styles.card}>
          <input
            style={styles.input}
            placeholder="Class name (e.g. AP Chemistry – Period 3)"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <input
              style={{ ...styles.input, marginBottom: 0, flex: 1 }}
              type="date"
              value={testDate}
              onChange={e => setTestDate(e.target.value)}
              title="Test date (optional)"
            />
            <button
              style={{ ...styles.btn, marginTop: 0, whiteSpace: 'nowrap' }}
              onClick={() => fileRef.current?.click()}
              disabled={pdfLoading}
            >
              {pdfLoading ? 'Reading PDF…' : '📎 Upload PDF'}
            </button>
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handlePdf} />
          </div>

          <textarea
            style={styles.textarea}
            placeholder="Paste notes, syllabus, past exam questions, or rubrics here…"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={10}
          />

          <button style={styles.btn} onClick={saveClass} disabled={saving || !name || !content}>
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Publish Class →'}
          </button>
        </div>

        {myClasses.length > 0 && (
          <>
            <h2 style={{ ...styles.sectionTitle, marginTop: 32 }}>Your Classes</h2>
            <div style={styles.classGrid}>
              {myClasses.map(c => (
                <div key={c.id} style={styles.classCard}>
                  <div style={styles.classCardName}>{c.name}</div>
                  <div style={styles.classCardMeta}>{c.content.length.toLocaleString()} chars</div>
                  {c.testDate && (
                    <div style={styles.classCardMeta}>
                      📅 Test: {new Date(c.testDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
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

  const enrolledClassObjects = classes.filter(c => enrolledClasses.includes(c.id));
  const availableClasses = classes.filter(c => !enrolledClasses.includes(c.id));

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
      <div style={styles.portalWrap}>
        <header style={styles.header}>
          <span style={styles.headerLogo}>VillagePrep</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={styles.headerEmail}>{user.email}</span>
            <button style={styles.logoutBtn} onClick={onLogout}>Sign out</button>
          </div>
        </header>
        <div style={styles.portalBody}>
          <h2 style={styles.sectionTitle}>Classes & Study Materials</h2>

          {/* Own materials upload */}
          <div style={{ ...styles.card, marginBottom: 24 }}>
            <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#1e293b' }}>
              📁 Your Own Materials
            </p>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#64748b' }}>
              Upload your own notes or PDFs — the AI will use these alongside your teacher's material.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                style={{ ...styles.btn, marginTop: 0 }}
                onClick={() => fileRef.current?.click()}
                disabled={pdfLoading}
              >
                {pdfLoading ? 'Reading…' : '📎 Upload PDF'}
              </button>
              {myDocs && (
                <button
                  style={{ ...styles.btn, marginTop: 0, background: '#ef4444' }}
                  onClick={() => setMyDocs('')}
                >
                  Clear My Notes
                </button>
              )}
            </div>
            {myDocs && (
              <p style={{ marginTop: 10, fontSize: 13, color: '#16a34a' }}>
                ✓ {myDocs.length.toLocaleString()} characters loaded from your files
              </p>
            )}
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handlePdf} />
          </div>

          {classes.length > 0 ? (
            <div style={styles.classGrid}>
              {classes.map(c => (
                <div key={c.id} style={styles.classCard}>
                  <div style={styles.classCardName}>{c.name}</div>
                  <div style={styles.classCardMeta}>by {c.teacherEmail.split('@')[0]}</div>
                  {c.testDate && (
                    <div style={{ ...styles.classCardMeta, color: '#ef4444', fontWeight: 600 }}>
                      📅 Test: {new Date(c.testDate).toLocaleDateString()}
                    </div>
                  )}
                  <textarea
                    style={{ ...styles.textarea, marginTop: 12, height: 80, fontSize: 13 }}
                    placeholder="Add your personal notes for this class…"
                    value={classNotes[c.id] || ''}
                    onChange={e => setClassNotes(prev => ({ ...prev, [c.id]: e.target.value }))}
                    onBlur={() => saveNotes(c.id, classNotes[c.id] || '')}
                  />
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button
                      style={{ ...styles.btn, flex: 1 }}
                      onClick={() => { setSelectedClass(c); setMessages([]); }}
                    >
                      Study This Class →
                    </button>
                    {!enrolledClasses.includes(c.id) && (
                      <button
                        style={{ ...styles.btn, flex: 0.8, background: '#2563eb' }}
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
            <p style={{ color: '#94a3b8' }}>No classes yet — ask your teacher to add one.</p>
          )}

          {myDocs && (
            <button
              style={{ ...styles.btn, marginTop: 20 }}
              onClick={() => {
                setSelectedClass({ id: 'personal', name: 'My Notes', content: '', testDate: '', teacherEmail: '' });
              }}
            >
              Study My Own Notes Only →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Study view ───────────────────────────────────────────────────────────────

  return (
    <div style={styles.portalWrap}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => setSelectedClass(null)}>← Back</button>
        <span style={styles.headerLogo}>{selectedClass.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            style={{ ...styles.btn, marginTop: 0, fontSize: 13, padding: '6px 14px' }}
            onClick={() => fileRef.current?.click()}
            disabled={pdfLoading}
          >
            {pdfLoading ? 'Reading…' : '+ My Notes'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handlePdf} />
          <button style={styles.logoutBtn} onClick={onLogout}>Sign out</button>
        </div>
      </header>

      {myDocs && (
        <div style={styles.myDocsBanner}>
          📎 Your notes included ({myDocs.length.toLocaleString()} chars)
          <button onClick={() => setMyDocs('')} style={styles.clearDocsBtn}>✕</button>
        </div>
      )}

      <div style={styles.tabs}>
        {(['chat', 'flashcards', 'quiz', 'studyplan'] as StudyTab[]).map(t => (
          <button
            key={t}
            style={{ ...styles.tabBtn, ...(tab === t ? styles.tabBtnActive : {}) }}
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

      <div style={styles.studyBody}>
        {/* CHAT */}
        {tab === 'chat' && (
          <div style={styles.chatWrap}>
            <div style={styles.chatMessages}>
              {messages.length === 0 && (
                <p style={styles.emptyChat}>Ask anything about {selectedClass.name}…</p>
              )}
              {messages.map((m, i) => (
                <div key={i} style={m.role === 'user' ? styles.userMsg : styles.aiMsg}>
                  {m.content}
                </div>
              ))}
              {aiLoading && <div style={styles.aiMsg}>Thinking…</div>}
              <div ref={chatBottom} />
            </div>
            <div style={styles.chatInput}>
              <div style={styles.quickChips}>
                {['Summarize key topics', 'What should I focus on?', 'Make a practice question'].map(q => (
                  <button key={q} style={styles.chip} onClick={() => { setInput(q); }}>
                    {q}
                  </button>
                ))}
              </div>
              <div style={styles.chatRow}>
                <input
                  style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="Ask a question…"
                />
                <button style={{ ...styles.btn, marginTop: 0 }} onClick={sendChat} disabled={aiLoading || !input.trim()}>
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FLASHCARDS */}
        {tab === 'flashcards' && (
          <div>
            {aiLoading && <p style={styles.loadingText}>Generating flashcards…</p>}
            {flashcards.length > 0 && (
              <>
                <button style={{ ...styles.btn, marginBottom: 20 }} onClick={loadFlashcards}>
                  🔄 Regenerate
                </button>
                <div style={styles.cardGrid}>
                  {flashcards.map((fc, i) => (
                    <div
                      key={i}
                      style={styles.flashcard}
                      onClick={() => setFlipped(f => f.map((v, j) => j === i ? !v : v))}
                    >
                      <div style={styles.flashcardInner}>
                        {flipped[i] ? (
                          <>
                            <div style={styles.flashcardLabel}>Answer</div>
                            <div style={styles.flashcardText}>{fc.back}</div>
                          </>
                        ) : (
                          <>
                            <div style={styles.flashcardLabel}>Question</div>
                            <div style={styles.flashcardText}>{fc.front}</div>
                          </>
                        )}
                        <div style={styles.flashcardHint}>tap to flip</div>
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
            {aiLoading && <p style={styles.loadingText}>Generating quiz…</p>}
            {quiz.length > 0 && (
              <>
                <button style={{ ...styles.btn, marginBottom: 20 }} onClick={loadQuiz}>
                  🔄 New Quiz
                </button>
                {quiz.map((q, qi) => (
                  <div key={qi} style={styles.quizCard}>
                    <p style={styles.quizQuestion}>{qi + 1}. {q.question}</p>
                    <div>
                      {q.options.map((opt, oi) => {
                        const answered = answers[qi] !== undefined;
                        const isSelected = answers[qi] === oi;
                        const isCorrect = q.correct === oi;
                        let bg = '#f1f5f9';
                        if (answered && isSelected && isCorrect) bg = '#dcfce7';
                        if (answered && isSelected && !isCorrect) bg = '#fee2e2';
                        if (answered && !isSelected && isCorrect) bg = '#dcfce7';
                        return (
                          <button
                            key={oi}
                            style={{ ...styles.quizOption, background: bg }}
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
                      <p style={{ fontSize: 14, color: '#475569', marginTop: 8 }}>
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
            {aiLoading && <p style={styles.loadingText}>Building your study plan…</p>}
            {studyPlan && (
              <>
                <button style={{ ...styles.btn, marginBottom: 20 }} onClick={loadStudyPlan}>
                  🔄 Regenerate
                </button>
                <div style={styles.planCard}>
                  <pre style={styles.planText}>{studyPlan}</pre>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('villageprep-user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem('villageprep-user');
      }
    }
    setHydrated(true);
  }, []);

  function handleLogin(user: User) {
    window.localStorage.setItem('villageprep-user', JSON.stringify(user));
    setUser(user);
  }

  function handleLogout() {
    window.localStorage.removeItem('villageprep-user');
    setUser(null);
  }

  if (!hydrated) return null;
  if (!user) return <LoginScreen onLogin={handleLogin} />;
  if (user.role === 'teacher') return <TeacherPortal user={user} onLogout={handleLogout} />;
  return <StudentPortal user={user} onLogout={handleLogout} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  loginWrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
    fontFamily: '"DM Sans", system-ui, sans-serif',
  },
  loginCard: {
    background: '#fff',
    borderRadius: 20,
    padding: '48px 40px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    fontSize: 32,
    fontWeight: 800,
    marginBottom: 8,
    letterSpacing: '-1px',
  },
  logoV: {
    color: '#2563eb',
  },
  logoText: {
    color: '#0f172a',
  },
  loginSub: {
    color: '#64748b',
    fontSize: 15,
    marginBottom: 28,
    marginTop: 4,
  },
  input: {
    border: '2px solid #e2e8f0',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 15,
    width: '100%',
    boxSizing: 'border-box' as const,
    marginBottom: 12,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  btn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '13px 20px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginTop: 4,
    fontFamily: 'inherit',
    transition: 'background 0.2s',
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 10,
  },
  roleBadge: {
    marginTop: 12,
    fontSize: 14,
    color: '#16a34a',
    background: '#f0fdf4',
    borderRadius: 8,
    padding: '8px 12px',
    textAlign: 'center' as const,
  },
  portalWrap: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: '"DM Sans", system-ui, sans-serif',
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  headerEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 14,
    cursor: 'pointer',
    color: '#475569',
    fontFamily: 'inherit',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: 15,
    cursor: 'pointer',
    color: '#2563eb',
    fontWeight: 600,
    fontFamily: 'inherit',
    padding: 0,
  },
  portalBody: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '32px 24px',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 16,
    marginTop: 0,
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    border: '1px solid #e2e8f0',
  },
  textarea: {
    border: '2px solid #e2e8f0',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 15,
    width: '100%',
    boxSizing: 'border-box' as const,
    marginBottom: 12,
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    outline: 'none',
  },
  classGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16,
  },
  classCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  classCardName: {
    fontWeight: 700,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 6,
  },
  classCardMeta: {
    fontSize: 13,
    color: '#64748b',
  },
  myDocsBanner: {
    background: '#eff6ff',
    borderBottom: '1px solid #bfdbfe',
    padding: '10px 28px',
    fontSize: 14,
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  clearDocsBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    color: '#3b82f6',
    marginLeft: 'auto',
  },
  tabs: {
    display: 'flex',
    gap: 4,
    padding: '12px 20px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    color: '#64748b',
    fontFamily: 'inherit',
    transition: 'background 0.15s, color 0.15s',
  },
  tabBtnActive: {
    background: '#eff6ff',
    color: '#2563eb',
  },
  studyBody: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '28px 24px',
  },
  chatWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: 'calc(100vh - 220px)',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    paddingBottom: 16,
  },
  emptyChat: {
    color: '#94a3b8',
    textAlign: 'center' as const,
    marginTop: 80,
  },
  userMsg: {
    background: '#2563eb',
    color: '#fff',
    padding: '12px 18px',
    borderRadius: '18px 18px 6px 18px',
    maxWidth: '75%',
    alignSelf: 'flex-end' as const,
    fontSize: 15,
    lineHeight: 1.5,
  },
  aiMsg: {
    background: '#f1f5f9',
    color: '#0f172a',
    padding: '12px 18px',
    borderRadius: '18px 18px 18px 6px',
    maxWidth: '85%',
    alignSelf: 'flex-start' as const,
    fontSize: 15,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap' as const,
  },
  quickChips: {
    display: 'flex',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap' as const,
  },
  chip: {
    background: '#f1f5f9',
    border: 'none',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 13,
    cursor: 'pointer',
    color: '#475569',
    fontFamily: 'inherit',
  },
  chatInput: {
    paddingTop: 12,
    borderTop: '1px solid #e2e8f0',
  },
  chatRow: {
    display: 'flex',
    gap: 10,
  },
  loadingText: {
    color: '#94a3b8',
    textAlign: 'center' as const,
    marginTop: 60,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 16,
  },
  flashcard: {
    background: '#fff',
    border: '2px solid #e2e8f0',
    borderRadius: 16,
    padding: 24,
    cursor: 'pointer',
    minHeight: 160,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'box-shadow 0.2s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  flashcardInner: {
    textAlign: 'center' as const,
    width: '100%',
  },
  flashcardLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#94a3b8',
    marginBottom: 12,
  },
  flashcardText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#0f172a',
    lineHeight: 1.5,
  },
  flashcardHint: {
    marginTop: 16,
    fontSize: 12,
    color: '#cbd5e1',
  },
  quizCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  quizQuestion: {
    fontWeight: 700,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 16,
    marginTop: 0,
  },
  quizOption: {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: '12px 16px',
    marginBottom: 8,
    cursor: 'pointer',
    fontSize: 15,
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  planCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  planText: {
    fontFamily: 'inherit',
    fontSize: 15,
    lineHeight: 1.8,
    color: '#1e293b',
    whiteSpace: 'pre-wrap' as const,
    margin: 0,
  },
};