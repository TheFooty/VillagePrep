'use client';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] w-full">
      {/* NAV BAR - Fixed at very top */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 border-b border-white/5 h-20">
        <div className="h-full px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-white font-bold text-xl">VillagePrep</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-3 rounded-xl bg-[#14b8a6] text-white font-semibold hover:bg-[#0d9488] transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* 12-COLUMN GRID WRAPPER */}
      <div className="grid grid-cols-12 gap-6 px-12">
        
        {/* HERO SECTION - Starts at row 1, spans all 12 columns, 150px from top */}
        <section className="col-span-12 pt-[150px] pb-[200px]">
          <div className="grid grid-cols-12 gap-8">
            
            {/* LEFT SIDE - Columns 1-6: Text content */}
            <div className="col-span-6 flex flex-col justify-start space-y-8">
              {/* Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-sm font-medium w-fit">
                <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
                AI-Powered Study Platform
              </div>
              
              {/* Headline - Large, visible, not cropped */}
              <h1 className="text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight">
                Study<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14b8a6] to-[#0d9488]">
                  Smarter
                </span>
              </h1>
              
              {/* Subtext */}
              <p className="text-2xl text-gray-400 leading-relaxed max-w-xl">
                Upload your notes. AI generates flashcards, quizzes, and summaries instantly.
              </p>
              
              {/* CTAs */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={onGetStarted}
                  className="px-10 py-5 rounded-2xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold text-xl hover:shadow-2xl hover:shadow-[#14b8a6]/30 hover:-translate-y-1 transition-all duration-300"
                >
                  Start Free →
                </button>
                <button className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xl hover:bg-white/10 transition-all">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* RIGHT SIDE - Columns 7-12: Graphics on FAR RIGHT */}
            <div className="col-span-6 flex items-center justify-end">
              <div className="w-full max-w-lg space-y-6">
                {/* Flashcard Window - Large, fills the right side */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border-b border-white/10">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <span className="ml-4 text-gray-400 font-medium">Biology Flashcards</span>
                  </div>
                  
                  <div className="p-8 space-y-5">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <p className="text-white font-semibold text-xl mb-2">What is photosynthesis?</p>
                      <p className="text-gray-400 text-lg">The process by which plants convert sunlight into chemical energy...</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6">
                      <p className="text-white font-semibold text-xl mb-2">Mitochondria function?</p>
                      <p className="text-gray-400 text-lg">Powerhouse of the cell - produces ATP through cellular respiration.</p>
                    </div>
                  </div>
                </div>
                
                {/* Stats Row - Below window, attached */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-[#14b8a6] to-[#0d9488] rounded-2xl px-8 py-6 shadow-lg shadow-[#14b8a6]/20">
                    <div className="text-white text-4xl font-bold">94%</div>
                    <div className="text-white/80 text-base">Quiz Score</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10">
                    <div className="text-white text-4xl font-bold">🔥 5</div>
                    <div className="text-gray-400 text-base">Day Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAR - Full width (cols 1-12), 200px space above */}
        <section className="col-span-12 py-16 border-y border-white/5 bg-white/[0.02]">
          <div className="grid grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Active Students' },
              { value: '500K+', label: 'Flashcards Created' },
              { value: '1M+', label: 'Questions Answered' },
              { value: '4.9★', label: 'User Rating' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-500 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES - 200px space above, 4 columns spanning full width */}
        <section className="col-span-12 pt-[200px] pb-[200px]">
          <div className="mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Everything You Need
            </h2>
            <p className="text-2xl text-gray-400 max-w-3xl">
              Powerful AI tools that transform how you study
            </p>
          </div>

          {/* 4-COLUMN GRID - Far left to far right */}
          <div className="grid grid-cols-4 gap-8">
            {[
              {
                icon: '🎴',
                title: 'Smart Flashcards',
                desc: 'AI-generated from any material with spaced repetition built-in.',
              },
              {
                icon: '❓',
                title: 'Practice Quizzes',
                desc: 'Unlimited quizzes with instant feedback and progress tracking.',
              },
              {
                icon: '📝',
                title: 'Auto Notes',
                desc: 'Transform messy PDFs into clean, organized study notes.',
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
        </section>

        {/* HOW IT WORKS - 200px space, 3 columns full width */}
        <section className="col-span-12 pt-[200px] pb-[200px] bg-white/[0.02] -mx-12 px-12">
          <div className="mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">How It Works</h2>
            <p className="text-2xl text-gray-400">Three simple steps to better grades</p>
          </div>

          <div className="grid grid-cols-3 gap-16">
            {[
              { step: '01', title: 'Upload', desc: 'Drag and drop PDFs, documents, or paste your notes directly into the app.' },
              { step: '02', title: 'Generate', desc: 'Our AI instantly creates flashcards, quizzes, and summaries.' },
              { step: '03', title: 'Study', desc: 'Learn with interactive tools and track your progress.' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-8xl font-bold text-[#14b8a6]/20 mb-6">{item.step}</div>
                <h3 className="text-2xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA - 200px space */}
        <section className="col-span-12 pt-[200px] pb-[200px]">
          <div className="bg-gradient-to-r from-[#14b8a6]/10 to-[#0d9488]/10 rounded-3xl p-16">
            <div className="grid grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                  Ready to Transform Your Study Sessions?
                </h2>
                <p className="text-2xl text-gray-400 leading-relaxed">
                  Join thousands of students studying smarter with AI
                </p>
              </div>
              <div className="flex flex-col items-end gap-6">
                <button
                  onClick={onGetStarted}
                  className="px-12 py-6 rounded-2xl bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold text-2xl hover:shadow-2xl hover:shadow-[#14b8a6]/30 hover:-translate-y-1 transition-all duration-300"
                >
                  Get Started Free →
                </button>
                <p className="text-gray-500 text-xl">No credit card required</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER - Full width */}
      <footer className="border-t border-white/10">
        <div className="px-12 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="text-white font-bold text-xl">VillagePrep</span>
            </div>
            <p className="text-gray-500 text-lg">
              © 2024 VillagePrep
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
