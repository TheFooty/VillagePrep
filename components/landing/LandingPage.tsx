'use client';

import { useState, useEffect } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: '🎴',
      title: 'Smart Flashcards',
      description: 'Upload any material and get AI-generated flashcards instantly. Study with spaced repetition to maximize retention.',
      color: 'from-[#14b8a6] to-[#0d9488]',
    },
    {
      icon: '❓',
      title: 'Practice Quizzes',
      description: 'Generate unlimited quizzes from your content. Get instant feedback and track your progress over time.',
      color: 'from-[#8b5cf6] to-[#7c3aed]',
    },
    {
      icon: '📝',
      title: 'Auto Notes',
      description: 'Transform messy PDFs and docs into clean, organized study notes with key points highlighted.',
      color: 'from-[#f59e0b] to-[#d97706]',
    },
    {
      icon: '💬',
      title: 'AI Tutor Chat',
      description: 'Ask questions about any topic. Get explanations, examples, and clarifications 24/7.',
      color: 'from-[#ec4899] to-[#db2777]',
    },
  ];

  const steps = [
    { step: '1', title: 'Upload', desc: 'Upload PDFs, docs, or paste your notes' },
    { step: '2', title: 'Generate', desc: 'AI creates flashcards, quizzes, and summaries' },
    { step: '3', title: 'Study', desc: 'Learn with interactive tools and track progress' },
  ];

  const stats = [
    { value: '10K+', label: 'Students' },
    { value: '500K+', label: 'Flashcards Created' },
    { value: '1M+', label: 'Questions Answered' },
    { value: '4.9★', label: 'User Rating' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-white font-bold text-xl">VillagePrep</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 rounded-lg bg-[#14b8a6] text-white font-medium hover:bg-[#0d9488] transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(20, 184, 166, 0.1) 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }} />
        </div>
        <div className="absolute top-20 left-10 w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[150px] bg-[#14b8a6]" />
        <div className="absolute bottom-0 right-10 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[150px] bg-[#8b5cf6]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
                AI-Powered Study Platform
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Libre Baskerville, Georgia, serif' }}>
                Study Smarter,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14b8a6] to-[#0d9488]">
                  Not Harder
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Upload your class materials and let AI generate flashcards, quizzes, and study notes. 
                Save hours of prep time and ace your exams with personalized learning tools.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold text-lg hover:shadow-lg hover:shadow-[#14b8a6]/30 hover:-translate-y-1 transition-all duration-300"
                >
                  Start Studying Free
                </button>
                <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <span>▶</span> Watch Demo
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">✓ No credit card</span>
                <span className="flex items-center gap-2">✓ Free forever</span>
                <span className="flex items-center gap-2">✓ Cancel anytime</span>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-gray-400 text-sm">Biology Flashcards</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white font-medium mb-2">What is photosynthesis?</p>
                    <p className="text-gray-400 text-sm">The process by which plants convert light energy into chemical energy...</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white font-medium mb-2">Mitochondria function?</p>
                    <p className="text-gray-400 text-sm">Powerhouse of the cell - produces ATP through cellular respiration.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#14b8a6]/20 text-[#14b8a6] text-xs">Easy</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-gray-400 text-xs">12 cards remaining</span>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#14b8a6] to-[#0d9488] rounded-xl p-4 shadow-lg shadow-[#14b8a6]/20">
                <div className="text-white text-2xl font-bold">94%</div>
                <div className="text-white/80 text-xs">Quiz Score</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-white font-medium">🔥 5 Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14b8a6] to-[#0d9488]">
                Ace Your Exams
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful AI tools that transform how you study. Upload once, learn everywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-[#14b8a6]/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#14b8a6]/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#14b8a6]/10 to-[#8b5cf6]/10 rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  See VillagePrep in Action
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  Watch how students are using AI to transform their study sessions. 
                  From flashcards to practice quizzes, see it all work together.
                </p>
                <div className="space-y-4">
                  {[
                    'Upload any PDF, doc, or paste text',
                    'AI generates flashcards in seconds',
                    'Practice with quizzes and track progress',
                    'Ask questions in the AI tutor chat',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#14b8a6]/20 flex items-center justify-center text-[#14b8a6] text-sm">✓</span>
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0a0a0f] rounded-2xl p-6 border border-white/10">
                <div className="flex gap-2 mb-6">
                  {['Flashcards', 'Quiz', 'Notes', 'Chat'].map((tab, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === i ? 'bg-[#14b8a6] text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="bg-white/5 rounded-xl p-6 min-h-[200px]">
                  {activeTab === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🎴</div>
                      <p className="text-white font-medium mb-2">What is the powerhouse of the cell?</p>
                      <p className="text-[#14b8a6]">Click to flip →</p>
                    </div>
                  )}
                  {activeTab === 1 && (
                    <div className="space-y-3">
                      <p className="text-white font-medium mb-4">Which organelle produces energy?</p>
                      {['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi'].map((opt, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${i === 1 ? 'bg-[#14b8a6]/20 border-[#14b8a6]' : 'bg-white/5 border-white/10'}`}>
                          <span className="text-white">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 2 && (
                    <div className="space-y-2 text-sm">
                      <h4 className="text-white font-medium text-lg">Cell Biology Notes</h4>
                      <p className="text-gray-400">• Mitochondria: Powerhouse, produces ATP</p>
                      <p className="text-gray-400">• Nucleus: Contains DNA, control center</p>
                      <p className="text-gray-400">• Ribosomes: Protein synthesis</p>
                    </div>
                  )}
                  {activeTab === 3 && (
                    <div className="space-y-3">
                      <div className="bg-[#14b8a6]/10 rounded-lg p-3 ml-8">
                        <p className="text-gray-300 text-sm">Explain photosynthesis simply</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 mr-8">
                        <p className="text-gray-300 text-sm">Photosynthesis is how plants make food using sunlight, water, and CO2...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Study Sessions?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students who are studying smarter with AI. 
            Start for free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold text-lg hover:shadow-lg hover:shadow-[#14b8a6]/30 transition-all duration-300"
            >
              Get Started Free
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-6">
            No credit card required. Free forever.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <span className="text-white font-bold">VillagePrep</span>
              </div>
              <p className="text-gray-500 text-sm">
                AI-powered study tools for the modern student.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 VillagePrep. Built for students, by students.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
