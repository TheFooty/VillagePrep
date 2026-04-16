'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { User, VPClass } from '@/types';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

interface StudentProgress {
  email: string;
  lastActivity: string;
  avgScore: number;
  quizzesCompleted: number;
}

interface ClassAnalytics {
  totalStudents: number;
  avgScore: number;
  activeToday: number;
  topTopics: string[];
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#09090b',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoIcon: {
    width: '2rem',
    height: '2rem',
    borderRadius: '0.5rem',
    background: 'linear-gradient(to bottom right, #10b981, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fafafa',
    fontWeight: 600,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userEmail: {
    color: '#a1a1aa',
    fontSize: '0.875rem',
  },
  badge: {
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    backgroundColor: 'rgba(16,185,129,0.15)',
    color: '#10b981',
    fontSize: '0.75rem',
  },
  logoutBtn: {
    color: '#a1a1aa',
    fontSize: '0.875rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '64rem',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#fafafa',
  },
  createBtn: {
    padding: '0.625rem 1rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '5rem 0',
  },
  emptyIcon: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
  },
  emptyText: {
    color: '#a1a1aa',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))',
    gap: '1rem',
  },
  classCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 150ms',
  },
  classCardHover: {
    borderColor: 'rgba(16,185,129,0.3)',
  },
  classCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  className: {
    color: '#fafafa',
    fontWeight: 500,
    fontSize: '1.125rem',
  },
  classDesc: {
    color: '#a1a1aa',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },
  classTest: {
    color: '#10b981',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  },
  shareCodeLabel: {
    color: '#71717a',
    fontSize: '0.75rem',
  },
  shareCode: {
    color: '#fafafa',
    fontFamily: 'monospace',
  },
  classCardFooter: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: '#71717a',
  },
  backBtn: {
    color: '#a1a1aa',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem',
    padding: '1rem',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '2.25rem',
    fontWeight: 700,
    color: '#fafafa',
  },
  statValueAccent: {
    color: '#10b981',
  },
  statLabel: {
    color: '#a1a1aa',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },
  tableTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#fafafa',
    marginBottom: '1rem',
  },
  tableContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    color: '#a1a1aa',
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  td: {
    padding: '0.75rem 1rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  tdText: {
    color: '#fafafa',
  },
  tdTextMuted: {
    color: '#a1a1aa',
  },
  scoreBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
  },
  chartContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginTop: '2rem',
  },
  chartTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#fafafa',
    marginBottom: '1rem',
  },
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.5rem',
    height: '8rem',
  },
  chartBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: '0.25rem 0.25rem 0 0',
    background: 'linear-gradient(to top, #10b981, #059669)',
  },
  chartLabel: {
    color: '#71717a',
    fontSize: '0.75rem',
  },
  chartFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.5rem',
    color: '#71717a',
    fontSize: '0.875rem',
  },
  modal: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    backgroundColor: '#18181b',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1rem',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '28rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#fafafa',
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    color: '#fafafa',
    fontSize: '0.875rem',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    height: '8rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    color: '#fafafa',
    fontSize: '0.875rem',
    resize: 'none' as const,
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  cancelBtn: {
    flex: 1,
    padding: '0.625rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#fafafa',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 1,
    padding: '0.625rem 1rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  toast: {
    position: 'fixed' as const,
    bottom: '1rem',
    right: '1rem',
    zIndex: 50,
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  toastError: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
  },
  toastSuccess: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    border: '1px solid #10b981',
    color: '#6ee7b7',
  },
};

export function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const [classes, setClasses] = useState<VPClass[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<VPClass | null>(null);
  const [studentRoster, setStudentRoster] = useState<StudentProgress[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [newClass, setNewClass] = useState({ name: '', content: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [view, setView] = useState<'classes' | 'analytics'>('classes');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string, type: string = 'info') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    try {
      const res = await fetch(`/api/classes?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to fetch classes', 'error');
        return;
      }

      setClasses(data.classes || []);
    } catch {
      showToast('Failed to connect to server', 'error');
    }
  }

  async function createClass() {
    if (!newClass.name.trim()) {
      showToast('Class name is required', 'error');
      return;
    }
    setLoading(true);
    try {
      const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClass.name,
          content: newClass.content,
          description: newClass.description,
          teacher_email: user.email,
          shareCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create class', 'error');
        return;
      }
      showToast('Class created successfully!', 'success');
      setShowCreateModal(false);
      setNewClass({ name: '', content: '', description: '' });
      fetchClasses();
    } catch {
      showToast('Failed to create class', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchClassAnalytics(classId: string) {
    try {
      const res = await fetch(`/api/progress?email=${encodeURIComponent(user.email)}&classId=${classId}`);
      const data = await res.json();

      const students: StudentProgress[] = [];
      const scores: number[] = [];
      let activeCount = 0;

      if (data.progress) {
        for (const p of data.progress) {
          scores.push(p.average_score || 0);
          const lastActive = new Date(p.last_accessed);
          const today = new Date();
          if (lastActive.toDateString() === today.toDateString()) {
            activeCount++;
          }
          students.push({
            email: p.email || p.user_email,
            lastActivity: p.last_accessed || p.completed_at,
            avgScore: p.average_score || p.score || 0,
            quizzesCompleted: p.times_completed || 1,
          });
        }
      }

      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      setAnalytics({
        totalStudents: students.length,
        avgScore: avg,
        activeToday: activeCount,
        topTopics: ['Chapter 1', 'Chapter 2', 'Chapter 3'].slice(0, 3),
      });
      setStudentRoster(students);
    } catch {
      showToast('Failed to fetch analytics', 'error');
    }
  }

  function handleClassSelect(cls: VPClass) {
    setSelectedClass(cls);
    fetchClassAnalytics(cls.id);
    setView('analytics');
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  function getScoreBadgeStyle(score: number): React.CSSProperties {
    if (score >= 80) return { backgroundColor: 'rgba(16,185,129,0.2)', color: '#6ee7b7' };
    if (score >= 60) return { backgroundColor: 'rgba(234,179,8,0.2)', color: '#facc15' };
    return { backgroundColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' };
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.875rem' }}>V</span>
          </div>
          <span style={styles.logoText}>VillagePrep</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.userEmail}>{user.email}</span>
          <span style={styles.badge}>teacher</span>
          <button onClick={onLogout} style={styles.logoutBtn}>Sign out</button>
        </div>
      </header>

      {toast && (
        <div style={{
          ...styles.toast,
          ...(toast.type === 'error' ? styles.toastError : styles.toastSuccess)
        }}>
          {toast.message}
        </div>
      )}

      <main style={styles.main}>
        {view === 'classes' ? (
          <>
            <div style={styles.sectionHeader}>
              <h1 style={styles.sectionTitle}>My Classes</h1>
              <button style={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                Create Class
              </button>
            </div>

            {classes.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📚</div>
                <p style={styles.emptyText}>No classes yet. Create your first class to get started.</p>
                <button style={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                  Create Class
                </button>
              </div>
            ) : (
              <div style={styles.grid}>
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => handleClassSelect(cls)}
                    style={styles.classCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    }}
                  >
                    <div style={styles.classCardHeader}>
                      <div>
                        <h3 style={styles.className}>{cls.name}</h3>
                        {cls.description && (
                          <p style={styles.classDesc}>{cls.description}</p>
                        )}
                        {cls.testDate && (
                          <p style={styles.classTest}>Test: {cls.testDate}</p>
                        )}
                      </div>
                      {cls.shareCode && (
                        <div>
                          <p style={styles.shareCodeLabel}>Code</p>
                          <p style={styles.shareCode}>{cls.shareCode}</p>
                        </div>
                      )}
                    </div>
                    <div style={styles.classCardFooter}>
                      <span>View Analytics →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={styles.sectionHeader}>
              <button style={styles.backBtn} onClick={() => setView('classes')}>
                ← Back to Classes
              </button>
              <h1 style={styles.sectionTitle}>{selectedClass?.name}</h1>
            </div>

            <div style={styles.analyticsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{analytics?.totalStudents || 0}</div>
                <div style={styles.statLabel}>Students</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statValue, ...styles.statValueAccent }}>
                  {analytics?.avgScore || 0}%
                </div>
                <div style={styles.statLabel}>Avg Score</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{analytics?.activeToday || 0}</div>
                <div style={styles.statLabel}>Active Today</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>
                  {studentRoster.filter(s => s.quizzesCompleted > 0).length}
                </div>
                <div style={styles.statLabel}>Quizzes Taken</div>
              </div>
            </div>

            <h2 style={styles.tableTitle}>Student Roster</h2>

            {studentRoster.length === 0 ? (
              <div style={{ ...styles.tableContainer, padding: '3rem', textAlign: 'center' }}>
                <div style={{ color: '#a1a1aa' }}>
                  No student data yet. Students need to join and complete quizzes.
                </div>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Student</th>
                      <th style={styles.th}>Last Active</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Quizzes</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentRoster.map((student, i) => (
                      <tr key={i}>
                        <td style={{ ...styles.td, ...styles.tdText }}>{student.email}</td>
                        <td style={{ ...styles.td, ...styles.tdTextMuted }}>{formatDate(student.lastActivity)}</td>
                        <td style={{ ...styles.td, ...styles.tdText, textAlign: 'center' }}>{student.quizzesCompleted}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <span style={{ ...styles.scoreBadge, ...getScoreBadgeStyle(student.avgScore) }}>
                            {student.avgScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={styles.chartContainer}>
              <h2 style={styles.chartTitle}>Performance Trend</h2>
              <div style={styles.chart}>
                {[65, 72, 68, 75, 82, 78, 85].map((score, i) => (
                  <div key={i} style={styles.chartBar}>
                    <div
                      style={{
                        ...styles.chartBarFill,
                        height: `${score}%`,
                      }}
                    />
                    <span style={styles.chartLabel}>Day {i + 1}</span>
                  </div>
                ))}
              </div>
              <div style={styles.chartFooter}>
                <span>Last 7 days</span>
                <span>Average: 75%</span>
              </div>
            </div>
          </>
        )}
      </main>

      {showCreateModal && (
        <div style={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create Class</h2>
            <input
              type="text"
              placeholder="Class Name (e.g., Biology 101)"
              value={newClass.name}
              onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newClass.description}
              onChange={(e) => setNewClass(prev => ({ ...prev, description: e.target.value }))}
              style={{ ...styles.input, marginTop: '1rem' }}
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <textarea
              placeholder="Class content or syllabus..."
              value={newClass.content}
              onChange={(e) => setNewClass(prev => ({ ...prev, content: e.target.value }))}
              style={{ ...styles.textarea, marginTop: '1rem' }}
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button
                style={styles.submitBtn}
                onClick={createClass}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
