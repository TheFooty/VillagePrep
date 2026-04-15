'use client';

import { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* SECTION 1: HERO - Full 100vh, nothing else visible */}
      <section className="h-screen min-h-[700px] flex flex-col justify-center px-8 relative overflow-hidden">
        <div className="max-w-[1100px] mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-[100px] items-center">
            {/* Left: Content */}
            <div>
              {/* Tag */}
              <div className="mb-10">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
                  AI-Powered Study Platform
                </span>
              </div>
              
              {/* Headline - 40px margin below */}
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-10 leading-[1.1] tracking-tight">
                Study Smarter,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14b8a6] to-[#0d9488]">
                  Not Harder
                </span>
              </h1>
              
              {/* Sub-headline - 40px margin below */}
              <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-lg">
                Upload your notes and let AI generate flashcards, quizzes, and summaries instantly.
              </p>
              
              {/* CTA Button */}
              <button
                onClick={onGetStarted}
                className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold text-lg hover:shadow-lg hover:shadow-[#14b8a6]/30 transition-all duration-300"
              >
                Start Studying Free
              </button>
            </div>

            {/* Right: Biology Flashcard Window - 100px distance from text */}
            <div className="hidden lg:block">
              <div className="w-[380px] ml-auto">
                {/* Window Frame */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  {/* Window Header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-4 text-gray-500 text-sm">Biology Flashcards</span>
                  </div>
                  
                  {/* Window Content */}
                  <div className="p-6 space-y-4">
                    <div className="bg-white/5 rounded-xl p-5">
                      <p className="text-white font-medium mb-2 text-lg">What is photosynthesis?</p>
                      <p className="text-gray-500">The process by which plants convert sunlight into energy...</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-5">
                      <p className="text-white font-medium mb-2 text-lg">Mitochondria function?</p>
                      <p className="text-gray-500">Powerhouse of the cell - produces ATP.</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating Score Badge - Below, not overlapping */}
                <div className="mt-6 flex justify-end">
                  <div className="bg-gradient-to-br from-[#14b8a6] to-[#0d9488] rounded-xl px-5 py-3">
                    <div className="text-white text-2xl font-bold">94%</div>
                    <div className="text-white/80 text-sm">Quiz Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SOCIAL PROOF BAR - 150px padding above and below */}
      <section className="py-[150px] border-y border-white/5">
        <div className="max-w-[1100px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
            {[
              { value: '10K+', label: 'Students' },
              { value: '500K+', label: 'Flashcards' },
              { value: '1M+', label: 'Questions' },
              { value: '4.9★', label: 'Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-white mb-4">{stat.value}</div>
                <div className="text-gray-500 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES - Only visible after scrolling, 150px from previous */}
      <section className="pt-[150px] pb-[150px] px-8">
        <div className="max-w-[1100px] mx-auto">
          {/* Section Header - 40px gap between title and subtitle */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-10">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful AI tools that transform how you study
            </p>
          </div>

          {/* Feature Grid - 40px internal padding on cards */}
          <div className="grid md:grid-cols-2 gap-10">
            {[
              {
                icon: '🎴',
                title: 'Smart Flashcards',
                desc: 'Upload any material and get AI-generated flashcards instantly. Study with spaced repetition to maximize retention.',
              },
              {
                icon: '❓',
                title: 'Practice Quizzes',
                desc: 'Generate unlimited quizzes from your content. Get instant feedback and track your progress over time.',
              },
              {
                icon: '📝',
                title: 'Auto Notes',
                desc: 'Transform messy PDFs and docs into clean, organized study notes with key points highlighted.',
              },
              {
                icon: '💬',
                title: 'AI Tutor Chat',
                desc: 'Ask questions about any topic. Get explanations, examples, and clarifications 24/7.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 hover:border-[#14b8a6]/30 transition-all"
              >
                <div className="text-4xl mb-8">{feature.icon}</div>
                <h3 className="text-2xl font-semibold text-white mb-6">{feature.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS - 150px from previous */}
      <section className="pt-[150px] pb-[150px] px-8 bg-white/[0.02]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-10">How It Works</h2>
            <p className="text-xl text-gray-400">Three simple steps to better grades</p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              { step: '01', title: 'Upload', desc: 'Upload PDFs, docs, or paste your notes' },
              { step: '02', title: 'Generate', desc: 'AI creates flashcards and quizzes' },
              { step: '03', title: 'Study', desc: 'Learn with interactive tools' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-7xl font-bold text-[#14b8a6]/20 mb-8">{item.step}</div>
                <h3 className="text-2xl font-semibold text-white mb-6">{item.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA - 150px from previous */}
      <section className="pt-[150px] pb-[150px] px-8">
        <div className="max-w-[1100px] mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-10">
            Ready to Transform Your Study Sessions?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students studying smarter with AI
          </p>
          <button
            onClick={onGetStarted}
            className="px-12 py-5 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold text-xl hover:shadow-lg hover:shadow-[#14b8a6]/30 transition-all duration-300"
          >
            Get Started Free
          </button>
          <p className="text-gray-500 mt-10 text-lg">No credit card required</p>
        </div>
      </section>

      {/* FOOTER - Clean separation */}
      <footer className="border-t border-white/10 py-16 px-8">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-white font-semibold text-lg">VillagePrep</span>
          </div>
          <p className="text-gray-500 text-base">
            © 2024 VillagePrep
          </p>
        </div>
      </footer>
    </div>
  );
}
