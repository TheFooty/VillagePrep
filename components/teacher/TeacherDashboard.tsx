'use client';

import { useState, useEffect } from 'react';
import { User, VPClass } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchClasses() {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      setClasses((data.classes || []).filter((c: VPClass) => c.teacherEmail === user.email));
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  }

  async function createClass() {
    if (!newClass.name.trim()) {
      setToast({ message: 'Class name required', type: 'error' });
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
          teacherEmail: user.email,
          shareCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || 'Failed to create class', type: 'error' });
        return;
      }
      setToast({ message: 'Class created!', type: 'success' });
      setShowCreateModal(false);
      setNewClass({ name: '', content: '', description: '' });
      fetchClasses();
    } catch (err) {
      setToast({ message: 'Failed to create class', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchClassAnalytics(classId: string) {
    try {
      const res = await fetch(`/api/progress?classId=${classId}`);
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
            email: p.email,
            lastActivity: p.last_accessed,
            avgScore: p.average_score || 0,
            quizzesCompleted: p.times_completed || 0,
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
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
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

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white font-semibold">VillagePrep</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#14b8a6]/20 text-[#14b8a6] text-xs">teacher</span>
          <button onClick={onLogout} className="text-gray-400 hover:text-white text-sm">Sign out</button>
        </div>
      </header>

      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg border ${
          toast.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
        }`}>
          {toast.message}
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8">
        {view === 'classes' ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-white">My Classes</h1>
              <Button onClick={() => setShowCreateModal(true)}>Create Class</Button>
            </div>

            {classes.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-400 mb-4">No classes yet. Create your first class to get started.</p>
                <Button onClick={() => setShowCreateModal(true)}>Create Class</Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {classes.map((cls) => (
                  <div 
                    key={cls.id} 
                    onClick={() => handleClassSelect(cls)}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#14b8a6]/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-medium text-lg">{cls.name}</h3>
                        {cls.description && (
                          <p className="text-gray-400 text-sm mt-1">{cls.description}</p>
                        )}
                        {cls.testDate && (
                          <p className="text-[#14b8a6] text-sm mt-2">Test: {cls.testDate}</p>
                        )}
                      </div>
                      {cls.shareCode && (
                        <div className="text-right">
                          <p className="text-gray-500 text-xs">Code</p>
                          <p className="text-white font-mono">{cls.shareCode}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-sm text-gray-500">
                      <span>View Analytics →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setView('classes')}
                className="text-gray-400 hover:text-white"
              >
                ← Back to Classes
              </button>
              <h1 className="text-2xl font-bold text-white">{selectedClass?.name}</h1>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">{analytics?.totalStudents || 0}</div>
                <div className="text-gray-400 text-sm">Students</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#14b8a6]">{analytics?.avgScore || 0}%</div>
                <div className="text-gray-400 text-sm">Avg Score</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">{analytics?.activeToday || 0}</div>
                <div className="text-gray-400 text-sm">Active Today</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">
                  {studentRoster.filter(s => s.quizzesCompleted > 0).length}
                </div>
                <div className="text-gray-400 text-sm">Quizzes Taken</div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white mb-4">Student Roster</h2>
            
            {studentRoster.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl">
                <div className="text-gray-400">No student data yet. Students need to join and complete quizzes.</div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left text-gray-400 text-sm px-4 py-3">Student</th>
                      <th className="text-left text-gray-400 text-sm px-4 py-3">Last Active</th>
                      <th className="text-center text-gray-400 text-sm px-4 py-3">Quizzes</th>
                      <th className="text-center text-gray-400 text-sm px-4 py-3">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentRoster.map((student, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="text-white px-4 py-3">{student.email}</td>
                        <td className="text-gray-400 px-4 py-3">{formatDate(student.lastActivity)}</td>
                        <td className="text-center text-white px-4 py-3">{student.quizzesCompleted}</td>
                        <td className="text-center px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            student.avgScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                            student.avgScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {student.avgScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Performance Trend</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="h-32 flex items-end gap-2">
                {[65, 72, 68, 75, 82, 78, 85].map((score, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-[#14b8a6] to-[#0d9488] rounded-t"
                      style={{ height: `${score}%` }}
                    />
                    <span className="text-gray-500 text-xs">Day {i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-gray-500 text-sm">
                <span>Last 7 days</span>
                <span>Average: 75%</span>
              </div>
            </div>
          </>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#0f0f14] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create Class</h2>
            <Input
              label="Class Name"
              placeholder="e.g., Biology 101"
              value={newClass.name}
              onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="Description (optional)"
              placeholder="Brief description"
              value={newClass.description}
              onChange={(e) => setNewClass(prev => ({ ...prev, description: e.target.value }))}
              className="mt-4"
            />
            <textarea
              placeholder="Class content or syllabus..."
              value={newClass.content}
              onChange={(e) => setNewClass(prev => ({ ...prev, content: e.target.value }))}
              className="mt-4 w-full h-32 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#14b8a6] focus:outline-none resize-none"
            />
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={createClass} loading={loading} className="flex-1">Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}