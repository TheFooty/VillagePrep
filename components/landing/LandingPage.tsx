'use client';

import { useState, useEffect } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <span className="logo-mark">V</span>
            <span className="logo-text">VillagePrep</span>
          </a>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How it Works</a>
            <button onClick={onGetStarted} className="nav-cta">
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className={`hero-badge ${mounted ? 'visible' : ''}`}>
            <span className="badge-dot"></span>
            <span>AI-Powered Learning</span>
          </div>
          
          <h1 className={`hero-title ${mounted ? 'visible' : ''}`}>
            <span className="title-line">Study</span>
            <span className="title-line accent">Smarter.</span>
          </h1>
          
          <p className={`hero-sub ${mounted ? 'visible' : ''}`}>
            Transform your notes into flashcards, quizzes, and study plans with AI. 
            Built for students who want to actually remember what they learn.
          </p>
          
          <div className={`hero-actions ${mounted ? 'visible' : ''}`}>
            <button onClick={onGetStarted} className="btn-primary">
              Get Started Free
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="btn-secondary">Watch Demo</button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className={`hero-visual ${mounted ? 'visible' : ''}`}>
          <div className="card-stack">
            <div className="study-card card-1">
              <div className="card-header">
                <span className="card-dot red"></span>
                <span className="card-dot yellow"></span>
                <span className="card-dot green"></span>
                <span className="card-title">Bio Chapter 5</span>
              </div>
              <div className="card-body">
                <p className="card-question">What is the function of mitochondria?</p>
                <p className="card-hint">Click to reveal answer</p>
              </div>
              <div className="card-footer">
                <span className="card-tag">Cell Biology</span>
                <span className="card-count">24 cards</span>
              </div>
            </div>

            <div className="study-card card-2">
              <div className="card-header">
                <span className="card-dot red"></span>
                <span className="card-dot yellow"></span>
                <span className="card-dot green"></span>
                <span className="card-title">Chemistry</span>
              </div>
              <div className="card-body">
                <p className="card-question">Describe the process of photosynthesis</p>
                <p className="card-hint">Click to reveal answer</p>
              </div>
              <div className="card-footer">
                <span className="card-tag">Botany</span>
                <span className="card-count">18 cards</span>
              </div>
            </div>

            <div className="stats-float stat-1">
              <span className="stat-value">2,847</span>
              <span className="stat-label">Cards Studied</span>
            </div>
            
            <div className="stats-float stat-2">
              <span className="stat-value">94%</span>
              <span className="stat-label">Quiz Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stats-inner">
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-name">Active Students</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">500K+</span>
            <span className="stat-name">Cards Created</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">1M+</span>
            <span className="stat-name">Questions Answered</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">4.9</span>
            <span className="stat-name">Average Rating</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="features-header">
          <h2 className="section-title">Everything you need<br/>to ace your exams</h2>
          <p className="section-sub">Powerful AI tools that do the heavy lifting so you can focus on learning.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎴</div>
            <h3 className="feature-title">Smart Flashcards</h3>
            <p className="feature-desc">AI generates flashcards from any material. Spaced repetition ensures you never forget.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">❓</div>
            <h3 className="feature-title">Practice Quizzes</h3>
            <p className="feature-desc">Unlimited quizzes with instant feedback. Track your progress over time.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3 className="feature-title">Auto Notes</h3>
            <p className="feature-desc">Upload PDFs or paste text. AI transforms messy content into clean notes.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3 className="feature-title">AI Tutor</h3>
            <p className="feature-desc">Ask anything, anytime. Get explanations that actually make sense.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="how">
        <div className="how-header">
          <h2 className="section-title">How it works</h2>
          <p className="section-sub">Three steps from confusion to mastery.</p>
        </div>
        
        <div className="steps">
          <div className="step">
            <span className="step-num">01</span>
            <div className="step-content">
              <h3 className="step-title">Upload your material</h3>
              <p className="step-desc">Drag and drop a PDF, paste your notes, or type directly. Whatever you have.</p>
            </div>
          </div>
          
          <div className="step">
            <span className="step-num">02</span>
            <div className="step-content">
              <h3 className="step-title">AI generates content</h3>
              <p className="step-desc">In seconds, you get flashcards, quizzes, and study notes ready to use.</p>
            </div>
          </div>
          
          <div className="step">
            <span className="step-num">03</span>
            <div className="step-content">
              <h3 className="step-title">Study and track</h3>
              <p className="step-desc">Learn with interactive tools. Watch your scores improve over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to transform<br/>how you study?</h2>
          <p className="cta-sub">Join thousands of students who stopped cramming and started learning.</p>
          <button onClick={onGetStarted} className="btn-primary btn-large">
            Start Studying Free
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <p className="cta-note">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-mark small">V</span>
            <span className="logo-text small">VillagePrep</span>
          </div>
          <p className="footer-copy">© 2024 VillagePrep</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        :root {
          --bg: #09090b;
          --bg-elevated: #18181b;
          --border: #27272a;
          --text: #fafafa;
          --text-muted: #a1a1aa;
          --text-dim: #71717a;
          --accent: #10b981;
          --accent-hover: #059669;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .landing-page {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', system-ui, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }
        
        /* Navigation */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 0 48px;
          height: 72px;
          display: flex;
          align-items: center;
          background: rgba(9, 9, 11, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }
        
        .nav-inner {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        
        .logo-mark {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          color: white;
        }
        
        .logo-text {
          font-weight: 600;
          font-size: 18px;
          color: var(--text);
        }
        
        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        
        .nav-link {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .nav-link:hover {
          color: var(--text);
        }
        
        .nav-cta {
          background: var(--accent);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        
        .nav-cta:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }

        .nav-cta:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        /* Hero */
        .hero {
          min-height: 100vh;
          padding: 140px 48px 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          max-width: 1400px;
          margin: 0 auto;
          align-items: center;
        }
        
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          color: var(--accent);
          margin-bottom: 32px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .hero-badge.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .badge-dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        
        .hero-title {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: clamp(56px, 8vw, 96px);
          font-weight: 700;
          line-height: 0.95;
          letter-spacing: -0.03em;
          margin-bottom: 32px;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s;
        }
        
        .hero-title.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .title-line {
          display: block;
        }
        
        .title-line.accent {
          color: var(--accent);
        }
        
        .hero-sub {
          font-size: 18px;
          line-height: 1.7;
          color: var(--text-muted);
          max-width: 480px;
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
        }
        
        .hero-sub.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .hero-actions {
          display: flex;
          gap: 16px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s;
        }
        
        .hero-actions.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-primary:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(16, 185, 129, 0.3);
        }

        .btn-primary:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          background: transparent;
          color: var(--text);
          border: 1px solid var(--border);
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-secondary:hover {
          background: var(--bg-elevated);
          border-color: var(--text-dim);
        }

        .btn-secondary:focus-visible {
          outline: 2px solid var(--border);
          outline-offset: 2px;
        }

        /* Hero Visual */
        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transform: translateX(40px);
          transition: opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s;
        }
        
        .hero-visual.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .card-stack {
          position: relative;
          width: 100%;
          max-width: 420px;
        }
        
        .study-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          position: relative;
        }
        
        .card-1 {
          transform: rotate(-3deg);
          z-index: 2;
        }
        
        .card-2 {
          transform: rotate(2deg) translateY(-20px);
          z-index: 1;
          opacity: 0.7;
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        
        .card-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .card-dot.red { background: #ef4444; }
        .card-dot.yellow { background: #eab308; }
        .card-dot.green { background: #22c55e; }
        
        .card-title {
          margin-left: 8px;
          font-size: 12px;
          color: var(--text-dim);
        }
        
        .card-body {
          margin-bottom: 16px;
        }
        
        .card-question {
          font-size: 15px;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 8px;
        }
        
        .card-hint {
          font-size: 12px;
          color: var(--text-dim);
        }
        
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .card-tag {
          font-size: 11px;
          padding: 4px 10px;
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent);
          border-radius: 100px;
          font-weight: 500;
        }
        
        .card-count {
          font-size: 12px;
          color: var(--text-dim);
        }
        
        .stats-float {
          position: absolute;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          z-index: 3;
        }
        
        .stat-1 {
          top: -20px;
          right: -40px;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
        }
        
        .stat-2 {
          bottom: 40px;
          left: -50px;
        }
        
        .stat-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }
        
        .stat-1 .stat-value {
          color: white;
        }
        
        .stat-label {
          font-size: 11px;
          color: var(--text-dim);
        }
        
        .stat-1 .stat-label {
          color: rgba(255,255,255,0.8);
        }
        
        /* Stats */
        .stats {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 48px;
        }
        
        .stats-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .stat-item {
          text-align: center;
          flex: 1;
        }
        
        .stat-number {
          display: block;
          font-size: 36px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }
        
        .stat-name {
          font-size: 14px;
          color: var(--text-dim);
        }
        
        .stat-divider {
          width: 1px;
          height: 48px;
          background: var(--border);
        }
        
        /* Features */
        .features {
          padding: 120px 48px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .features-header {
          text-align: center;
          margin-bottom: 64px;
        }
        
        .section-title {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 700;
          line-height: 1.1;
          color: var(--text);
          margin-bottom: 16px;
        }
        
        .section-sub {
          font-size: 18px;
          color: var(--text-muted);
          max-width: 500px;
          margin: 0 auto;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        
        .feature-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px;
          transition: all 0.3s;
        }
        
        .feature-card:hover {
          border-color: var(--accent);
          transform: translateY(-4px);
        }
        
        .feature-icon {
          font-size: 40px;
          margin-bottom: 20px;
        }
        
        .feature-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        
        .feature-desc {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-muted);
        }
        
        /* How */
        .how {
          padding: 120px 48px;
          background: var(--bg-elevated);
        }
        
        .how-header {
          text-align: center;
          margin-bottom: 64px;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .steps {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        
        .step {
          display: flex;
          gap: 32px;
          align-items: flex-start;
        }
        
        .step-num {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 48px;
          font-weight: 700;
          color: var(--accent);
          opacity: 0.3;
          line-height: 1;
        }
        
        .step-content {
          flex: 1;
          padding-top: 8px;
        }
        
        .step-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }
        
        .step-desc {
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-muted);
        }
        
        /* CTA */
        .cta {
          padding: 120px 48px;
        }
        
        .cta-inner {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
        }
        
        .cta-title {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 700;
          line-height: 1.1;
          color: var(--text);
          margin-bottom: 16px;
        }
        
        .cta-sub {
          font-size: 18px;
          color: var(--text-muted);
          margin-bottom: 32px;
        }
        
        .btn-large {
          padding: 18px 36px;
          font-size: 18px;
        }
        
        .cta-note {
          margin-top: 16px;
          font-size: 14px;
          color: var(--text-dim);
        }
        
        /* Footer */
        .footer {
          border-top: 1px solid var(--border);
          padding: 32px 48px;
        }
        
        .footer-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .logo-mark.small {
          width: 28px;
          height: 28px;
          font-size: 14px;
        }
        
        .logo-text.small {
          font-size: 15px;
        }
        
        .footer-copy {
          font-size: 14px;
          color: var(--text-dim);
        }
        
        /* Responsive */
        @media (max-width: 1024px) {
          .hero {
            grid-template-columns: 1fr;
            gap: 48px;
            padding-top: 120px;
          }
          
          .hero-visual {
            order: -1;
          }
          
          .card-stack {
            max-width: 320px;
          }
          
          .stats-float {
            display: none;
          }
          
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .nav {
            padding: 0 24px;
          }
          
          .nav-links {
            gap: 16px;
          }
          
          .nav-link {
            display: none;
          }
          
          .hero {
            padding: 100px 24px 60px;
          }
          
          .hero-actions {
            flex-direction: column;
          }
          
          .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
          }
          
          .stats {
            padding: 32px 24px;
          }
          
          .stats-inner {
            flex-wrap: wrap;
            gap: 24px;
          }
          
          .stat-item {
            flex: 1 1 40%;
          }
          
          .stat-divider {
            display: none;
          }
          
          .features, .how, .cta {
            padding: 80px 24px;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .footer {
            padding: 24px;
          }
          
          .footer-inner {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
