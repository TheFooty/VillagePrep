'use client';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* HEADER - Anchored to very top */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="text-white font-semibold text-lg">VillagePrep</span>
          </div>
          
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How it Works</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a>
          </nav>
          
          {/* CTA */}
          <button
            onClick={onGetStarted}
            className="px-5 py-2 rounded-lg bg-[#14b8a6] text-white text-sm font-medium hover:bg-[#0d9488] transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* HERO - Starts immediately below header, no vertical centering */}
      <section className="pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-[100px] items-start">
            {/* LEFT COLUMN - Content */}
            <div className="pt-8">
              {/* Tag - 80px from top of viewport (64px header + 16px) */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
                  AI-Powered Study Platform
                </span>
              </div>
              
              {/* Headline */}
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                Study Smarter,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14b8a6] to-[#0d9488]">
                  Not Harder
                </span>
              </h1>
              
              {/* Subtext - line-height 1.6 */}
              <p className="text-xl text-gray-400 mb-8 leading-[1.6] max-w-lg">
                Upload your notes and let AI generate flashcards, quizzes, and summaries instantly. Save hours of prep time.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
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

              {/* Trust badges */}
              <div className="flex items-center gap-6 text-gray-500 text-sm">
                <span className="flex items-center gap-2">✓ No credit card</span>
                <span className="flex items-center gap-2">✓ Free forever</span>
              </div>
            </div>

            {/* RIGHT COLUMN - Flashcard window, positioned close to text (100px gap) */}
            <div className="hidden lg:block pt-8">
              <div className="relative">
                {/* Main Window */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  {/* Window Header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-3 text-gray-400 text-sm">Biology Flashcards</span>
                  </div>
                  
                  {/* Window Content */}
                  <div className="p-6 space-y-4">
                    <div className="bg-white/5 rounded-xl p-5">
                      <p className="text-white font-medium mb-2">What is photosynthesis?</p>
                      <p className="text-gray-400 text-sm">The process by which plants convert sunlight into energy...</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-5">
                      <p className="text-white font-medium mb-2">Mitochondria function?</p>
                      <p className="text-gray-400 text-sm">Powerhouse of the cell - produces ATP.</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <span className="px-3 py-1 rounded-full bg-[#14b8a6]/20 text-[#14b8a6] text-xs">Easy</span>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-gray-400 text-xs">12 cards left</span>
                    </div>
                  </div>
                </div>
                
                {/* Stats Row - Logically attached below window, not floating */}
                <div className="flex gap-4 mt-6">
                  <div className="flex-1 bg-gradient-to-br from-[#14b8a6] to-[#0d9488] rounded-xl px-5 py-4">
                    <div className="text-white text-2xl font-bold">94%</div>
                    <div className="text-white/80 text-xs">Quiz Score</div>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-xl px-5 py-4 border border-white/10">
                    <div className="text-white text-2xl font-bold">🔥 5</div>
                    <div className="text-gray-400 text-xs">Day Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR - Full width, continuous from hero */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-[1200px] mx-auto px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Active Students' },
              { value: '500K+', label: 'Flashcards Created' },
              { value: '1M+', label: 'Questions Answered' },
              { value: '4.9★', label: 'User Rating' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES - Grid layout, anchored top */}
      <section id="features" className="py-20">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl leading-[1.6]">
              Powerful AI tools that transform how you study
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-gray-400 leading-[1.6]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - 3 columns */}
      <section id="how-it-works" className="py-20 bg-white/[0.02]">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Three simple steps to better grades</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload', desc: 'Upload PDFs, docs, or paste your notes' },
              { step: '02', title: 'Generate', desc: 'AI creates flashcards and quizzes' },
              { step: '03', title: 'Study', desc: 'Learn with interactive tools' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-[#14b8a6]/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-[1.6]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Anchored section */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="bg-gradient-to-r from-[#14b8a6]/10 to-[#0d9488]/10 rounded-2xl p-10 lg:p-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Ready to Transform Your Study Sessions?
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-[1.6]">
                Join thousands of students studying smarter with AI
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <button
                  onClick={onGetStarted}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold text-lg hover:shadow-lg hover:shadow-[#14b8a6]/30 transition-all duration-300"
                >
                  Get Started Free →
                </button>
                <span className="text-gray-500 self-center">No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER - Anchored to bottom */}
      <footer className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-8 py-8">
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
