'use client';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* HEADER - Fixed, establishes top boundary */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-white/5 h-16">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="text-white font-semibold text-lg">VillagePrep</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How it Works</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a>
          </nav>
          
          <button
            onClick={onGetStarted}
            className="px-5 py-2 rounded-lg bg-[#14b8a6] text-white text-sm font-medium hover:bg-[#0d9488] transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* MAIN CONTENT - 1280px container, centered */}
      <main className="max-w-[1280px] mx-auto px-6">
        
        {/* SECTION 1: HERO - 120px top margin (safe zone), 2-column split */}
        <section className="pt-[120px] pb-[160px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT COLUMN (spans 6/12) - Headline + Subtext + CTA */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
                AI-Powered Study Platform
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                Study Smarter,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14b8a6] to-[#0d9488]">
                  Not Harder
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                Upload your notes and let AI generate flashcards, quizzes, and summaries instantly. Save hours of prep time and ace your exams.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold text-lg hover:shadow-lg hover:shadow-[#14b8a6]/30 transition-all duration-300"
                >
                  Start Studying Free
                </button>
                <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-6 text-gray-500 text-sm pt-4">
                <span className="flex items-center gap-2">✓ No credit card</span>
                <span className="flex items-center gap-2">✓ Free forever</span>
              </div>
            </div>

            {/* RIGHT COLUMN (spans 6/12) - Biology Flashcards */}
            <div className="hidden lg:block">
              <div className="space-y-4">
                {/* Flashcard Window */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-3 text-gray-400 text-sm">Biology Flashcards</span>
                  </div>
                  
                  <div className="p-5 space-y-3">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-white font-medium mb-1">What is photosynthesis?</p>
                      <p className="text-gray-400 text-sm">The process by which plants convert sunlight into energy...</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-white font-medium mb-1">Mitochondria function?</p>
                      <p className="text-gray-400 text-sm">Powerhouse of the cell - produces ATP.</p>
                    </div>
                  </div>
                </div>
                
                {/* Stats Row - fills the width */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#14b8a6] to-[#0d9488] rounded-xl px-5 py-4">
                    <div className="text-white text-2xl font-bold">94%</div>
                    <div className="text-white/80 text-xs">Quiz Score</div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-5 py-4 border border-white/10">
                    <div className="text-white text-2xl font-bold">🔥 5</div>
                    <div className="text-gray-400 text-xs">Day Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: STATS - 160px from hero, full width bar */}
        <section className="py-[80px] border-y border-white/5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Active Students' },
              { value: '500K+', label: 'Flashcards Created' },
              { value: '1M+', label: 'Questions Answered' },
              { value: '4.9★', label: 'User Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center lg:text-left">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: FEATURES - 160px from stats, 4-column grid */}
        <section id="features" className="py-[160px]">
          <div className="mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl">
              Powerful AI tools that transform how you study
            </p>
          </div>

          {/* 4-COLUMN GRID - Spans full width */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🎴',
                title: 'Smart Flashcards',
                desc: 'AI-generated from any material with spaced repetition.',
              },
              {
                icon: '❓',
                title: 'Practice Quizzes',
                desc: 'Unlimited quizzes with instant feedback.',
              },
              {
                icon: '📝',
                title: 'Auto Notes',
                desc: 'Transform PDFs into clean study notes.',
              },
              {
                icon: '💬',
                title: 'AI Tutor',
                desc: '24/7 AI assistant for all your questions.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-[#14b8a6]/30 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: HOW IT WORKS - 160px from features, 3-column horizontal */}
        <section id="how-it-works" className="py-[160px] bg-white/[0.02] -mx-6 px-6">
          <div className="mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Three simple steps to better grades</p>
          </div>

          {/* 3 COLUMNS - Distributed across full width */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Upload Your Content', desc: 'Drag and drop PDFs, documents, or paste your notes directly into the app.' },
              { step: '02', title: 'AI Generates Materials', desc: 'Our AI instantly creates flashcards, quizzes, and summaries from your content.' },
              { step: '03', title: 'Start Studying', desc: 'Learn with interactive tools, track your progress, and ace your exams.' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-7xl font-bold text-[#14b8a6]/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: CTA - 160px from how it works */}
        <section className="py-[160px]">
          <div className="bg-gradient-to-r from-[#14b8a6]/10 to-[#0d9488]/10 rounded-2xl p-10 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  Ready to Transform Your Study Sessions?
                </h2>
                <p className="text-xl text-gray-400 leading-relaxed mb-8">
                  Join thousands of students studying smarter with AI. Get started for free today.
                </p>
              </div>
              <div className="flex flex-col items-start lg:items-end gap-4">
                <button
                  onClick={onGetStarted}
                  className="px-10 py-5 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold text-xl hover:shadow-xl hover:shadow-[#14b8a6]/30 transition-all duration-300"
                >
                  Get Started Free →
                </button>
                <span className="text-gray-500">No credit card required</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
