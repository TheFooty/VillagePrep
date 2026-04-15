'use client';

import { useState, useEffect } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0f]">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(20, 184, 166, 0.15) 0%, transparent 50%)`,
        }}
      />
      
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>
      
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[150px]" style={{ background: '#14b8a6' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[150px]" style={{ background: '#0d9488' }} />

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-sm mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
          AI-Powered Study Tools
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-in break-words" style={{ fontFamily: 'Libre Baskerville, Georgia, serif' }}>
          Master Any Subject with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14b8a6] to-[#0d9488]">AI</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto animate-fade-in stagger-2 break-words">
          Generate flashcards, quizzes, study notes, and podcasts from your class materials. 
          VillagePrep uses AI to help you learn smarter, not harder.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-3">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold text-lg hover:shadow-lg hover:shadow-[#14b8a6]/30 hover:-translate-y-1 transition-all duration-300"
          >
            Get Started Free
          </button>
          <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 hover:border-[#14b8a6]/30 transition-all">
            View Demo
          </button>
        </div>
      </div>

      {/* Features Preview */}
      <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto px-4 animate-fade-in stagger-4">
        {[
          { icon: '🎴', label: 'Flashcards', desc: 'AI-generated' },
          { icon: '❓', label: 'Quizzes', desc: 'Test yourself' },
          { icon: '📝', label: 'Notes', desc: 'Auto-summarized' },
          { icon: '💬', label: 'Chat', desc: 'Ask anything' },
        ].map((feature, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-[#14b8a6]/30 transition-colors">
            <div className="text-2xl mb-2">{feature.icon}</div>
            <div className="text-white font-medium">{feature.label}</div>
            <div className="text-gray-500 text-sm">{feature.desc}</div>
          </div>
        ))}
      </div>

      <footer className="absolute bottom-6 text-gray-500 text-sm">
        © 2024 VillagePrep • Built for students, by students
      </footer>
    </div>
  );
}