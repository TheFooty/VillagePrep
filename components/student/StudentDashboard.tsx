'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { User, StudyTab, Message, Flashcard, QuizQuestion } from '@/types';

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
}

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
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
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const chatBottom = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    chatBottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save content to cloud when it changes
  useEffect(() => {
    if (!user.userId || !myDocs) return;
    
    const saveTimer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.userId, 
            type: 'class_content', 
            content: myDocs 
          }),
        });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 2000);
    
    return () => clearTimeout(saveTimer);
  }, [myDocs, user.userId]);

  const showToast = useCallback((message: string, type: string = 'info') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  async function callAi(type: StudyTab, extraMessages?: Message[]): Promise<string | null> {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          messages: extraMessages || messages,
          classContent: myDocs,
          className: 'Study Session',
          flashcardCount,
          quizDifficulty,
          quizLength: 5,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        showToast(data.error || 'Something went wrong', 'error');
        return null;
      }
      return data.text as string;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to connect', 'error');
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

      if (type === 'notes') {
        setNotes(text);
        // Save notes to cloud
        if (user.userId) {
          try {
            await fetch('/api/user-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                userId: user.userId, 
                type: 'notes', 
                content: text 
              }),
            });
          } catch {
            // Silent fail for notes saving
          }
        }
      } else if (type === 'flashcards') {
        try {
          const clean = text.replace(/```json|```/g, '').trim();
          let cards = JSON.parse(clean) as Flashcard[];
          if (!Array.isArray(cards)) throw new Error('Not an array');
          setFlashcards(cards);
          setFlipped(new Array(cards.length).fill(false));
          showToast(`Generated ${cards.length} flashcards!`, 'success');
        } catch {
          showToast('Could not parse flashcards. Please try again.', 'error');
          setFlashcards([]);
        }
      } else if (type === 'quiz') {
        try {
          const clean = text.replace(/```json|```/g, '').trim();
          let parsed = JSON.parse(clean) as QuizQuestion[];
          if (!Array.isArray(parsed)) throw new Error('Not an array');
          setQuiz(parsed);
          setAnswers([]);
          showToast(`Generated ${parsed.length} questions!`, 'success');
        } catch {
          showToast('Could not parse quiz. Please try again.', 'error');
          setQuiz([]);
        }
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'An unexpected error occurred', 'error');
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
    
    setAiLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        showToast(data.error || 'Failed to parse file', 'error');
        return;
      }
      setMyDocs(data.text);
      showToast(`File uploaded! ${data.truncated ? '(content truncated)' : ''}`, 'success');
    } catch {
      showToast('Failed to upload file', 'error');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-mark small">V</div>
          <span className="logo-text">VillagePrep</span>
        </div>
        <div className="header-right">
          <span className="user-email">{user.email}</span>
          <span className="user-role">{user.role}</span>
          <button onClick={onLogout} className="logout-btn">Sign out</button>
        </div>
      </header>

      <div className="upload-bar">
        <label className="upload-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Upload Material
          <input type="file" className="hidden" onChange={handleFile} accept=".txt,.md,.docx,.pdf,.csv" />
        </label>
        {myDocs && (
          <span className="upload-status">
            {myDocs.length.toLocaleString()} chars loaded
            {saveStatus === 'saving' && ' (saving...)'}
            {saveStatus === 'saved' && ' (saved)'}
            {saveStatus === 'error' && ' (save failed)'}
          </span>
        )}
      </div>

      <nav className="tab-nav">
        {(Object.keys(tabLabels) as StudyTab[]).map((t) => (
          <button
            key={t}
            onClick={() => loadContent(t)}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            disabled={aiLoading}
          >
            {tabLabels[t]}
          </button>
        ))}
      </nav>

      <main className="dashboard-main">
        {aiLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Generating content...</p>
          </div>
        ) : tab === 'notes' && notes ? (
          <div className="content-card prose">
            <pre className="notes-content">{notes}</pre>
          </div>
        ) : tab === 'chat' ? (
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <p>Ask me anything about your study material!</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`chat-msg ${m.role}`}>{m.content}</div>
                ))
              )}
              <div ref={chatBottom} />
            </div>
            <div className="chat-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Ask anything..."
              />
              <button onClick={sendChat} disabled={!input.trim()}>Send</button>
            </div>
          </div>
        ) : tab === 'flashcards' && flashcards.length > 0 ? (
          <div className="flashcards">
            <div className="flashcard-controls">
              {[5, 10, 20].map(n => (
                <button
                  key={n}
                  onClick={() => { setFlashcardCount(n); loadContent('flashcards'); }}
                  className={`count-btn ${flashcardCount === n ? 'active' : ''}`}
                  disabled={aiLoading}
                >
                  {n} cards
                </button>
              ))}
            </div>
            {flashcards.map((card, i) => (
              <div
                key={i}
                className="flashcard"
                onClick={() => setFlipped(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
              >
                <p className="flashcard-text">{flipped[i] ? card.back : card.front}</p>
                <span className="flashcard-hint">{flipped[i] ? 'Back' : 'Front'} - Click to flip</span>
              </div>
            ))}
          </div>
        ) : tab === 'quiz' && quiz.length > 0 ? (
          <div className="quiz">
            <div className="quiz-controls">
              <span>{quiz.length} questions</span>
              {(['easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => { setQuizDifficulty(d); loadContent('quiz'); }}
                  className={`count-btn ${quizDifficulty === d ? 'active' : ''}`}
                  disabled={aiLoading}
                >
                  {d}
                </button>
              ))}
            </div>
            {quiz.map((q, i) => (
              <div key={i} className="quiz-card">
                <p className="quiz-question">{i + 1}. {q.question}</p>
                <div className="quiz-options">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      className={`quiz-option ${
                        answers[i] !== undefined
                          ? q.correct === oi
                            ? 'correct'
                            : answers[i] === oi
                            ? 'wrong'
                            : 'disabled'
                          : ''
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
                  <p className="quiz-explanation">{q.explanation}</p>
                )}
              </div>
            ))}
            {answers.length === quiz.length && answers.length > 0 && (
              <div className="quiz-score">
                Score: {answers.filter((a, i) => a === quiz[i].correct).length}/{quiz.length}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <p>Upload materials or generate content using the tools above</p>
            <button onClick={() => loadContent(tab)} className="generate-btn" disabled={aiLoading}>
              Generate {tabLabels[tab]}
            </button>
          </div>
        )}
      </main>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        
        .dashboard-page {
          min-height: 100vh;
          background: #09090b;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #fafafa;
        }
        
        .dashboard-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          height: 64px;
          background: rgba(9, 9, 11, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #27272a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-mark {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: white;
        }
        
        .logo-text {
          font-weight: 600;
          font-size: 16px;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .user-email {
          font-size: 13px;
          color: #a1a1aa;
        }
        
        .user-role {
          padding: 4px 10px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .logout-btn {
          background: none;
          border: none;
          color: #71717a;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
        }
        
        .logout-btn:hover {
          color: #fafafa;
        }
        
        .upload-bar {
          padding: 12px 24px;
          background: #18181b;
          border-bottom: 1px solid #27272a;
          display: flex;
          align-items: center;
          gap: 16px;
          padding-top: 80px;
        }
        
        .upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .upload-btn:hover {
          background: rgba(16, 185, 129, 0.25);
        }
        
        .hidden {
          display: none;
        }
        
        .upload-status {
          font-size: 13px;
          color: #71717a;
        }
        
        .tab-nav {
          display: flex;
          gap: 8px;
          padding: 16px 24px;
          overflow-x: auto;
          border-bottom: 1px solid #27272a;
        }
        
        .tab-btn {
          padding: 10px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #71717a;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .tab-btn:hover:not(:disabled) {
          background: #18181b;
          color: #a1a1aa;
        }
        
        .tab-btn.active {
          background: #10b981;
          color: white;
        }
        
        .tab-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .dashboard-main {
          padding: 32px 24px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 16px;
        }
        
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #27272a;
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .content-card {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 24px;
        }
        
        .notes-content {
          color: #a1a1aa;
          font-size: 15px;
          line-height: 1.7;
          white-space: pre-wrap;
          font-family: inherit;
        }
        
        .chat-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .chat-empty {
          text-align: center;
          padding: 40px;
          color: #71717a;
        }
        
        .chat-messages {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .chat-msg {
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 15px;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        
        .chat-msg.user {
          background: #10b981;
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        
        .chat-msg.assistant {
          background: #18181b;
          border: 1px solid #27272a;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        
        .chat-input {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        
        .chat-input input {
          flex: 1;
          padding: 14px 16px;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 12px;
          font-size: 15px;
          color: #fafafa;
          outline: none;
          font-family: inherit;
        }
        
        .chat-input input:focus {
          border-color: #10b981;
        }
        
        .chat-input button {
          padding: 14px 24px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        
        .chat-input button:hover:not(:disabled) {
          background: #059669;
        }
        
        .chat-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .flashcards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .flashcard-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .count-btn {
          padding: 6px 14px;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 100px;
          font-size: 13px;
          color: #a1a1aa;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        
        .count-btn.active {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }
        
        .count-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .flashcard {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        
        .flashcard:hover {
          border-color: #10b981;
        }
        
        .flashcard-text {
          font-size: 18px;
          color: #fafafa;
          margin-bottom: 12px;
        }
        
        .flashcard-hint {
          font-size: 12px;
          color: #71717a;
        }
        
        .quiz {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .quiz-controls {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 14px;
          color: #a1a1aa;
        }
        
        .quiz-card {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 20px;
        }
        
        .quiz-question {
          font-size: 16px;
          font-weight: 500;
          color: #fafafa;
          margin-bottom: 16px;
        }
        
        .quiz-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .quiz-option {
          padding: 12px 16px;
          background: #09090b;
          border: 1px solid #27272a;
          border-radius: 10px;
          font-size: 14px;
          color: #fafafa;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .quiz-option:hover:not(.disabled):not(:disabled) {
          border-color: #10b981;
        }
        
        .quiz-option.correct {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
        }
        
        .quiz-option.wrong {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }
        
        .quiz-option.disabled {
          opacity: 0.5;
        }
        
        .quiz-explanation {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #27272a;
          font-size: 13px;
          color: #71717a;
        }
        
        .quiz-score {
          text-align: center;
          padding: 16px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          color: #10b981;
        }
        
        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }
        
        .empty-state p {
          font-size: 15px;
          color: #71717a;
          margin-bottom: 16px;
        }
        
        .generate-btn {
          padding: 12px 24px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        
        .generate-btn:hover:not(:disabled) {
          background: #059669;
        }
        
        .generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 14px 20px;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 12px;
          font-size: 14px;
          animation: slideIn 0.3s ease;
          z-index: 100;
        }
        
        .toast.error {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
        }
        
        .toast.success {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          color: #6ee7b7;
        }
        
        .toast.info {
          background: rgba(139, 92, 246, 0.1);
          border-color: #8b5cf6;
          color: #c4b5fd;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 640px) {
          .user-email {
            display: none;
          }

          .dashboard-main {
            padding: 24px 16px;
          }

          .tab-nav {
            padding: 12px 16px;
            gap: 4px;
          }

          .tab-btn {
            padding: 8px 12px;
            font-size: 13px;
          }

          .upload-bar {
            padding: 12px 16px;
            padding-top: 80px;
            flex-wrap: wrap;
          }

          .header-right {
            gap: 8px;
          }

          .logout-btn {
            padding: 6px 10px;
            font-size: 12px;
          }

          .toast {
            left: 16px;
            right: 16px;
            bottom: 16px;
          }

          .flashcard {
            padding: 20px;
          }

          .flashcard-text {
            font-size: 16px;
          }

          .quiz-question {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
