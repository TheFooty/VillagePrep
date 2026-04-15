'use client';

import { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Navigation - Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="text-white font-semibold text-lg">VillagePrep</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-5 py-2 rounded-lg bg-[#14b8a6] text-white text-sm font-medium hover:bg-[#0d9488] transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section - Massive Breathing Room */}
      <section className="pt-40 pb-40 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-sm mb-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] animate-pulse" />
                AI-Powered Study Platform
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
                Study Smarter,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14b8a6] to-[#0d9488]">
                  Not Harder
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-lg">
                Upload your notes and let AI generate flashcards, quizzes, and summaries instantly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold text-lg hover:shadow-lg hover:shadow-[#14b8a6]/30 transition-all duration-300"
                >
                  Start Studying Free
                </button>
              </div>
            </div>

            {/* Right: Visual - Completely Separate */}
            <div className="hidden lg:flex justify-end">
              <div className="relative w-[400px]">
                {/* Main Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-white font-medium mb-1">What is photosynthesis?</p>
                      <p className="text-gray-500 text-sm">The process by which plants convert sunlight into energy...</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-white font-medium mb-1">Mitochondria function?</p>
                      <p className="text-gray-500 text-sm">Powerhouse of the cell - produces ATP.</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating Badge - Far Right */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#14b8a6] to-[#0d9488] rounded-xl px-4 py-3 shadow-lg">
                  <div className="text-white text-xl font-bold">94%</div>
                  <div className="text-white/80 text-xs">Quiz Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Single Row, Minimal */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
            {[
              { value: '10K+', label: 'Students' },
              { value: '500K+', label: 'Flashcards' },
              { value: '1M+', label: 'Questions' },
              { value: '4.9★', label: 'Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Wide Spacing */}
      <section className="py-40 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-bold text-white mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful AI tools that transform how you study
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              {
                icon: '🎴',
                title: 'Smart Flashcards',
                desc: 'Upload any material and get AI-generated flashcards instantly.',
              },
              {
                icon: '❓',
                title: 'Practice Quizzes',
                desc: 'Generate unlimited quizzes from your content.',
              },
              {
                icon: '📝',
                title: 'Auto Notes',
                desc: 'Transform messy PDFs into clean, organized study notes.',
              },
              {
                icon: '💬',
                title: 'AI Tutor',
                desc: 'Ask questions and get explanations 24/7.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 hover:border-[#14b8a6]/30 transition-all"
              >
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Minimal Steps */}
      <section className="py-40 px-8 bg-white/[0.02]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-bold text-white mb-6">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              { step: '01', title: 'Upload', desc: 'Upload PDFs, docs, or paste your notes' },
              { step: '02', title: 'Generate', desc: 'AI creates flashcards and quizzes' },
              { step: '03', title: 'Study', desc: 'Learn with interactive tools' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-6xl font-bold text-[#14b8a6]/20 mb-6">{item.step}</div>
                <h3 className="text-2xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Massive Space */}
      <section className="py-40 px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Transform Your Study Sessions?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of students studying smarter with AI
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-5 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold text-xl hover:shadow-lg hover:shadow-[#14b8a6]/30 transition-all duration-300"
          >
            Get Started Free
          </button>
          <p className="text-gray-500 mt-8">No credit card required</p>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-white/10 py-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-white font-semibold">VillagePrep</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 VillagePrep • Built for students
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
