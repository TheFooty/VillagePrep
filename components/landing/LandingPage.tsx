'use client';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* HERO SECTION - Full Width 50/50 Split */}
      <section className="min-h-screen flex items-center">
        <div className="w-full grid lg:grid-cols-2">
          {/* LEFT COLUMN - Content aligned left */}
          <div className="flex flex-col justify-center px-12 lg:px-20 py-20">
            {/* Tag */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
                AI-Powered Study Platform
              </span>
            </div>
            
            {/* Headline - Large, left-aligned */}
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 leading-[0.95] tracking-tight text-left">
              Study<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14b8a6] to-[#0d9488]">
                Smarter
              </span>
            </h1>
            
            {/* Subtext */}
            <p className="text-xl lg:text-2xl text-gray-400 mb-10 leading-relaxed max-w-xl text-left">
              Upload your notes. AI generates flashcards, quizzes, and summaries instantly.
            </p>
            
            {/* CTA */}
            <div className="flex gap-4">
              <button
                onClick={onGetStarted}
                className="px-10 py-5 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold text-lg hover:shadow-lg hover:shadow-[#14b8a6]/30 hover:-translate-y-1 transition-all duration-300"
              >
                Start Studying Free
              </button>
              <button className="px-10 py-5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all">
                View Demo
              </button>
            </div>

            {/* Trust badges - horizontal row */}
            <div className="flex items-center gap-8 mt-12 text-gray-500">
              <span className="flex items-center gap-2">✓ No credit card</span>
              <span className="flex items-center gap-2">✓ Free forever</span>
              <span className="flex items-center gap-2">✓ Cancel anytime</span>
            </div>
          </div>

          {/* RIGHT COLUMN - Visual fills the space */}
          <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#14b8a6]/5 to-transparent px-12">
            <div className="w-full max-w-xl">
              {/* Main Window - Large, fills space */}
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                {/* Window Header */}
                <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-gray-400 font-medium">Biology Flashcards</span>
                </div>
                
                {/* Window Content - Larger */}
                <div className="p-8 space-y-6">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <p className="text-white font-semibold mb-3 text-xl">What is photosynthesis?</p>
                    <p className="text-gray-400 text-lg">The process by which plants convert sunlight into chemical energy...</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <p className="text-white font-semibold mb-3 text-xl">Mitochondria function?</p>
                    <p className="text-gray-400 text-lg">Powerhouse of the cell - produces ATP through cellular respiration.</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <span className="px-4 py-2 rounded-full bg-[#14b8a6]/20 text-[#14b8a6] text-sm font-medium">Easy</span>
                    <span className="px-4 py-2 rounded-full bg-white/10 text-gray-400 text-sm">12 cards left</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats - Positioned to fill space */}
              <div className="flex justify-between mt-8">
                <div className="bg-gradient-to-br from-[#14b8a6] to-[#0d9488] rounded-2xl px-8 py-6 shadow-lg shadow-[#14b8a6]/20">
                  <div className="text-white text-4xl font-bold">94%</div>
                  <div className="text-white/80 text-base">Quiz Score</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10">
                  <div className="text-white text-4xl font-bold">🔥</div>
                  <div className="text-gray-400 text-base">5 Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR - Full Width, Edge to Edge */}
      <section className="w-full border-y border-white/5 bg-white/[0.02]">
        <div className="w-full px-12 lg:px-20 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {[
              { value: '10K+', label: 'Active Students' },
              { value: '500K+', label: 'Flashcards Created' },
              { value: '1M+', label: 'Questions Answered' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center lg:text-left">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-500 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES - 4 Column Grid, Full Width */}
      <section className="w-full px-12 lg:px-20 py-32">
        <div className="w-full">
          {/* Header - Left aligned */}
          <div className="mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl">
              Powerful AI tools that transform how you study
            </p>
          </div>

          {/* 4 Column Grid - Fills entire width */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🎴',
                title: 'Smart Flashcards',
                desc: 'AI-generated from any material. Spaced repetition built-in.',
              },
              {
                icon: '❓',
                title: 'Practice Quizzes',
                desc: 'Unlimited quizzes with instant feedback and progress tracking.',
              },
              {
                icon: '📝',
                title: 'Auto Notes',
                desc: 'Transform PDFs into clean, organized study notes instantly.',
              },
              {
                icon: '💬',
                title: 'AI Tutor',
                desc: '24/7 AI assistant for explanations and questions.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-[#14b8a6]/30 transition-all h-full"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - Full Width with large visuals */}
      <section className="w-full px-12 lg:px-20 py-32 bg-white/[0.02]">
        <div className="w-full">
          <div className="mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">How It Works</h2>
            <p className="text-xl text-gray-400">Three simple steps to better grades</p>
          </div>

          {/* 3 Columns with large step numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Upload Your Content', desc: 'Drag and drop PDFs, documents, or paste your notes directly into the app.' },
              { step: '02', title: 'AI Generates Materials', desc: 'Our AI instantly creates flashcards, quizzes, and summaries from your content.' },
              { step: '03', title: 'Start Studying', desc: 'Learn with interactive tools, track your progress, and ace your exams.' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-8xl font-bold text-[#14b8a6]/10 mb-6">{item.step}</div>
                <h3 className="text-2xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Full Width Split */}
      <section className="w-full px-12 lg:px-20 py-32">
        <div className="w-full bg-gradient-to-r from-[#14b8a6]/10 to-[#0d9488]/10 rounded-3xl p-12 lg:p-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Ready to Transform Your Study Sessions?
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Join thousands of students who are studying smarter, not harder. 
                Get started for free today.
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-6">
              <button
                onClick={onGetStarted}
                className="px-12 py-6 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold text-xl hover:shadow-xl hover:shadow-[#14b8a6]/30 hover:-translate-y-1 transition-all duration-300"
              >
                Get Started Free →
              </button>
              <p className="text-gray-500 text-lg">No credit card required • Free forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER - Full Width */}
      <footer className="w-full border-t border-white/10">
        <div className="w-full px-12 lg:px-20 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <span className="text-white font-bold text-xl block">VillagePrep</span>
                <span className="text-gray-500">AI-powered study tools</span>
              </div>
            </div>
            
            <div className="flex gap-12 text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">Help</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
            
            <p className="text-gray-600">
              © 2024 VillagePrep
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
