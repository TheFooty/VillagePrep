'use client';

import { useState, useEffect, useRef } from 'react';
import { User, VPClass, Folder, StudySet, StudyTab, Message, Flashcard, QuizQuestion } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const tabLabels: Record<StudyTab, string> = {
  notes: 'Notes',
  chat: 'Chat',
  flashcards: 'Flashcards',
  quiz: 'Quiz',
  studyplan: 'Study Plan',
  podcast: 'Podcast',
  summary: 'Summary',
};

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  toast?: { message: string; type: string } | null;
}

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [classes, setClasses] = useState<VPClass[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [selectedClass, setSelectedClass] = useState<VPClass | null>(null);
  const [selectedStudySet, setSelectedStudySet] = useState<StudySet | null>(null);
  const [tab, setTab] = useState<StudyTab>('notes');
  const [myDocs, setMyDocs] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [notes, setNotes] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [flashcardCount, setFlashcardCount] = useState(10);
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizLength, setQuizLength] = useState(5);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const chatBottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClasses();
    fetchFolders();
    fetchStudySets();
    fetchEnrolledClasses();
  }, []);

  useEffect(() => {
    chatBottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchClasses() {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  }

  async function fetchFolders() {
    try {
      const res = await fetch(`/api/folders?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setFolders(data.folders || []);
    } catch (err) {
      console.error('Failed to fetch folders:', err);
    }
  }

  async function fetchStudySets() {
    try {
      const res = await fetch(`/api/study-sets?userId=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setStudySets(data.studySets || []);
    } catch (err) {
      console.error('Failed to fetch study sets:', err);
    }
  }

  async function fetchEnrolledClasses() {
    try {
      const res = await fetch(`/api/enroll?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setEnrolledClasses(data.classes || []);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    }
  }

  const combinedContent = [
    selectedClass?.content || '',
    myDocs ? `\n\n--- MY NOTES ---\n${myDocs}` : '',
  ].join('');

  async function callAi(type: StudyTab, extraMessages?: Message[]): Promise<string | null> {
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
          flashcardCount,
          quizDifficulty,
          quizLength,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setToast({ message: data.error || 'Something went wrong', type: 'error' });
        return null;
      }
      return data.text as string;
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to connect to AI', type: 'error' });
      return null;
    } finally {
      setAiLoading(false);
    }
  }

  async function loadContent(type: StudyTab) {
    setTab(type);
    if (aiLoading) return;
    
    setAiLoading(true);
    try {
      const text = await callAi(type);
      if (!text) return;

      if (type === 'notes') setNotes(text);
      else if (type === 'flashcards') {
        try {
          const clean = text.replace(/```json|```/g, '').trim();
          let cards = JSON.parse(clean) as Flashcard[];
          if (!Array.isArray(cards)) throw new Error('Not an array');
          setFlashcards(cards);
          setFlipped(new Array(cards.length).fill(false));
          setToast({ message: `Generated ${cards.length} flashcards!`, type: 'success' });
        } catch {
          setToast({ message: 'Could not parse flashcards', type: 'error' });
          setFlashcards([]);
        }
      } else if (type === 'quiz') {
        try {
          const clean = text.replace(/```json|```/g, '').trim();
          let parsed = JSON.parse(clean) as QuizQuestion[];
          if (!Array.isArray(parsed)) throw new Error('Not an array');
          setQuiz(parsed);
          setAnswers([]);
          setToast({ message: `Generated ${parsed.length} quiz questions!`, type: 'success' });
        } catch {
          setToast({ message: 'Could not parse quiz', type: 'error' });
          setQuiz([]);
        }
      } else if (type === 'chat') {
        // handled below
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

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        setToast({ message: data.error || 'Failed to parse file', type: 'error' });
        return;
      }
      setMyDocs(prev => prev ? prev + '\n\n' + data.text : data.text);
      setToast({ message: 'File uploaded!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to upload file', type: 'error' });
    }
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white font-semibold">VillagePrep</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#14b8a6]/20 text-[#14b8a6] text-xs">{user.role}</span>
          <button onClick={onLogout} className="text-gray-400 hover:text-white text-sm">Sign out</button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg border backdrop-blur-sm animate-slide-in ${
          toast.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
        }`}>
          {toast.message}
        </div>
      )}

      {/* File Upload */}
      <div className="bg-[#14b8a6]/10 border-b border-[#14b8a6]/20 px-6 py-3">
        <label className="cursor-pointer px-4 py-2 rounded-lg bg-[#14b8a6]/20 text-[#14b8a6] hover:bg-[#14b8a6]/30 transition-colors text-sm">
          Upload Material
          <input type="file" className="hidden" onChange={handleFile} accept=".txt,.md,.docx,.pdf,.csv" />
        </label>
        {myDocs && (
          <span className="ml-3 text-gray-400 text-sm">{myDocs.length.toLocaleString()} chars</span>
        )}
      </div>

      {/* Study Tabs */}
      <div className="flex gap-2 px-4 py-3 bg-[#0a0a0f]/80 backdrop-blur-sm border-b border-white/5 overflow-x-auto">
        {(Object.keys(tabLabels) as StudyTab[]).map((t) => (
          <button
            key={t}
            className={`px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
              tab === t ? 'bg-[#14b8a6] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => loadContent(t)}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {aiLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : tab === 'notes' && notes ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {notes}
            </ReactMarkdown>
          </div>
        ) : tab === 'chat' ? (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`p-4 rounded-xl ${m.role === 'user' ? 'bg-[#14b8a6]/10 ml-8' : 'bg-white/5 mr-8'}`}>
                <p className="text-white whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            <div ref={chatBottom} />
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Ask anything..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#14b8a6] focus:outline-none"
              />
              <button onClick={sendChat} className="px-4 py-2 rounded-lg bg-[#14b8a6] text-white hover:bg-[#0d9488]">Send</button>
            </div>
          </div>
        ) : tab === 'flashcards' && flashcards.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-2">
                {[5, 10, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => { setFlashcardCount(n as 5|10|20); loadContent('flashcards'); }}
                    className={`px-3 py-1 rounded-full text-xs ${flashcardCount === n ? 'bg-[#14b8a6]' : 'bg-white/10'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            {flashcards.map((card, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer min-h-[120px] flex items-center justify-center"
                onClick={() => setFlipped(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
              >
                <p className="text-white text-center">
                  {flipped[i] ? card.back : card.front}
                </p>
              </div>
            ))}
          </div>
        ) : tab === 'quiz' && quiz.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-gray-400 text-sm">{quiz.length} questions</span>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => { setQuizDifficulty(d); loadContent('quiz'); }}
                    className={`px-3 py-1 rounded-full text-xs ${quizDifficulty === d ? 'bg-[#14b8a6]' : 'bg-white/10'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            {quiz.map((q, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-white font-medium mb-3">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      className={`w-full text-left border border-white/10 rounded-lg px-4 py-3 text-white text-sm transition-colors ${
                        answers[i] !== undefined
                          ? q.correct === oi
                            ? 'bg-emerald-500/30 border-emerald-500'
                            : answers[i] === oi
                            ? 'bg-red-500/30 border-red-500'
                            : 'opacity-50'
                          : 'hover:bg-white/10'
                      }`}
                      onClick={() => {
                        if (answers[i] === undefined) {
                          setAnswers(prev => { const n = [...prev]; n[i] = oi; return n; });
                        }
                      }}
                      disabled={answers[i] !== undefined}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {answers[i] !== undefined && (
                  <p className="text-gray-500 text-sm mt-2">{q.explanation}</p>
                )}
              </div>
            ))}
            {answers.length === quiz.length && answers.length > 0 && (
              <div className="text-center p-4 rounded-xl bg-[#14b8a6]/10 border border-[#14b8a6]/30">
                <p className="text-[#14b8a6] font-medium">
                  Score: {answers.filter((a, i) => a === quiz[i].correct).length}/{quiz.length}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">
              {selectedClass ? `Select a study tool above` : 'Select a class or upload materials to study'}
            </p>
            <button
              onClick={() => loadContent(tab)}
              className="px-6 py-3 rounded-lg bg-[#14b8a6] text-white hover:bg-[#0d9488] transition-colors"
            >
              Generate {tabLabels[tab]}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}