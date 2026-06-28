import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getToken } from '../lib/auth';

function useOnScreen(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const FadeSection = ({ children, className = '' }) => {
  const [ref, visible] = useOnScreen(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
      }}
    >
      {children}
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, index }) => {
  const [ref, visible] = useOnScreen(0.1);
  return (
    <div
      ref={ref}
      className="group relative bg-gradient-to-b from-bg-800/80 to-bg-900/80 border border-border-subtle rounded-xl p-6 hover:border-accent/40 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease-out ${index * 0.08}s, transform 0.6s ease-out ${index * 0.08}s`,
      }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 text-accent flex items-center justify-center text-lg mb-4 group-hover:scale-110 group-hover:shadow-[0_0_16px_var(--accent-glow)] transition-all duration-400">
          {icon}
        </div>
        <h3 className="text-text-100 font-semibold text-sm mb-2 group-hover:text-accent-light transition-colors duration-300">{title}</h3>
        <p className="text-text-300 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

const shapes = [
  { size: 80, x: '15%', y: '20%', anim: 'float1 14s ease-in-out infinite', bg: 'rgba(139,124,255,0.08)', radius: '50%' },
  { size: 50, x: '80%', y: '15%', anim: 'float2 10s ease-in-out infinite alternate', bg: 'rgba(139,124,255,0.06)', radius: '8px' },
  { size: 30, x: '70%', y: '70%', anim: 'float3 12s ease-in-out infinite', bg: 'rgba(167,158,255,0.08)', radius: '50%' },
  { size: 60, x: '10%', y: '75%', anim: 'float1 16s ease-in-out infinite reverse', bg: 'rgba(99,102,241,0.06)', radius: '4px' },
  { size: 40, x: '50%', y: '10%', anim: 'float2 9s ease-in-out infinite', bg: 'rgba(139,124,255,0.05)', radius: '50%' },
  { size: 100, x: '45%', y: '80%', anim: 'float3 18s ease-in-out infinite', bg: 'rgba(99,102,241,0.04)', radius: '50%' },
];

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (getToken()) {
      navigate('/board', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ background: 'var(--bg-950)' }}>
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10%, -10%); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15%, 15%); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(5%, 5%); }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-bg-950/80 backdrop-blur-xl border-b border-border">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-dark rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-[0_0_12px_var(--accent-glow)]">JT</div>
          <span className="text-text-100 font-bold text-base">JobTracker</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-bg-700 transition no-underline" style={{ color: '#8E8DA0' }}>Sign In</Link>
          <Link to="/register" className="bg-gradient-to-r from-accent to-accent-dark text-sm font-semibold px-5 py-2 rounded-lg hover:brightness-110 transition-all no-underline shadow-[0_0_16px_var(--accent-glow)]" style={{ color: '#FFF' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,124,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,124,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute rounded-full blur-[140px] opacity-25" style={{ width: '600px', height: '600px', background: '#7C6FFF', top: '-15%', right: '-5%', animation: 'float1 14s ease-in-out infinite' }} />
        <div className="absolute rounded-full blur-[140px] opacity-20" style={{ width: '450px', height: '450px', background: '#A78BFA', bottom: '-10%', left: '-5%', animation: 'float2 10s ease-in-out infinite alternate' }} />
        <div className="absolute rounded-full blur-[120px] opacity-15" style={{ width: '350px', height: '350px', background: '#6366F1', top: '40%', left: '60%', animation: 'float3 16s ease-in-out infinite' }} />

        {shapes.map((s, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              width: s.size,
              height: s.size,
              left: s.x,
              top: s.y,
              background: s.bg,
              borderRadius: s.radius,
              animation: s.anim,
              border: '1px solid rgba(139,124,255,0.06)',
            }}
          />
        ))}

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-accent/10 to-accent-tint border border-accent/20 rounded-full px-5 py-2 mb-4 shadow-[0_0_20px_var(--accent-glow)]" style={{ animation: 'subtlePulse 3s ease-in-out infinite' }}>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-accent text-sm font-medium tracking-wider">AI-POWERED JOB TRACKING</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-4" style={{ letterSpacing: '-0.03em' }}>
            <span className="text-text-100">Track smarter.</span><br />
            <span className="bg-gradient-to-r from-accent via-accent-light to-accent bg-clip-text text-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 4s ease-in-out infinite' }}>
              Land faster.
            </span>
          </h1>

          <p className="text-text-300 text-lg md:text-xl max-w-2xl mx-auto leading-[1.7]">
            Your AI career co-pilot. Organise applications, tailor resumes, ace interviews, and
            close the gap between where you are and where you want to be.
          </p>

          <div style={{ height: '60px' }} />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link to="/register" className="inline-flex items-center gap-3 bg-gradient-to-r from-accent to-accent-dark font-semibold px-8 py-4 rounded-lg text-base hover:brightness-110 transition-all no-underline active:scale-[0.97] shadow-[0_0_24px_var(--accent-glow)] hover:shadow-[0_0_40px_var(--accent-glow)]" style={{ color: '#FFF' }}>
              Get Started Free
              <span className="text-lg" style={{ color: '#FFF' }}>→</span>
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 bg-transparent border border-border-bright font-medium px-8 py-4 rounded-lg text-base hover:bg-accent-tint hover:border-accent transition-all no-underline" style={{ color: '#F0EFF5' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <FadeSection>
        <section className="px-6 py-28 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-accent text-xs font-semibold tracking-widest mb-4 uppercase" style={{ color: 'var(--accent)' }}>Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-text-100 mb-4">Everything you need to land the role</h2>
            <p className="text-text-300 text-sm leading-relaxed" style={{ textAlign: 'center', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto' }}>AI agents do the heavy lifting — you focus on what matters.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon="🗂" index={0} title="Kanban Board" desc="Drag-and-drop job tracking across 6 stages. See stats and weekly trends at a glance." />
            <FeatureCard icon="✂" index={1} title="Resume Tailor" desc="Rewrite your resume bullets to match any job description using semantic search and LLM." />
            <FeatureCard icon="🔍" index={2} title="Company Research" desc="Auto-researches company culture and news when you add a job. No extra effort needed." />
            <FeatureCard icon="🎤" index={3} title="Mock Interview" desc="Voice-powered interview coach with real-time answer evaluation and scoring." />
            <FeatureCard icon="📊" index={4} title="ATS Analyser" desc="Upload your resume PDF and compare it against any job description. Get a score 0-100." />
            <FeatureCard icon="📈" index={5} title="Career Roadmap" desc="AI analyses your job targets and builds a 5-step learning plan to close skill gaps." />
            <FeatureCard icon="🧠" index={6} title="AI Quiz Generator" desc="Generate 5-question MCQs on any topic. Test yourself, save scores, track progress." />
            <FeatureCard icon="🔔" index={7} title="Follow-up Reminders" desc="Automatic detection of stale applications with AI-drafted follow-up emails." />
            <FeatureCard icon="📋" index={8} title="Dashboard Analytics" desc="Track total applications, interviews, offers, and weekly application trends." />
          </div>
        </section>
      </FadeSection>

      {/* How it works */}
      <FadeSection>
        <section className="px-6 py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/3 to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block text-accent text-xs font-semibold tracking-widest mb-4 uppercase" style={{ color: 'var(--accent)' }}>How it works</span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-100 mb-4">Three steps to supercharge your job hunt</h2>
              <p className="text-text-300 text-sm leading-relaxed" style={{ textAlign: 'center', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto' }}>From adding jobs to landing offers — your AI co-pilot works alongside you.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
              {[
                { step: '01', title: 'Add Jobs', desc: 'Log applications with role, company, and job description. Your Kanban board organises everything at a glance.' },
                { step: '02', title: 'AI Works Magic', desc: 'Agents research companies, tailor resumes, analyse fit, and prep you for interviews — automatically.' },
                { step: '03', title: 'Land Offers', desc: 'Track progress, close skill gaps with a personalised roadmap, and never miss a follow-up again.' },
              ].map((item, i) => (
                <div key={item.step} className="relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 text-accent font-bold text-xl flex items-center justify-center mb-6 shadow-[0_0_20px_var(--accent-glow)]">
                    {item.step}
                  </div>
                  <h3 className="text-text-100 font-semibold text-base mb-3">{item.title}</h3>
                  <p className="text-text-300 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* CTA */}
      <FadeSection>
        <section className="px-6 py-28">
          <div className="max-w-2xl mx-auto text-center relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-accent/5 to-transparent border border-accent/10 pointer-events-none" style={{ margin: '-1px' }} />
            <div className="relative z-10 px-8 py-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-100 mb-4">Ready to land your next role?</h2>
              <p className="text-text-300 text-sm leading-relaxed" style={{ textAlign: 'center', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>Join JobTracker and let AI handle the busywork while you focus on acing interviews.</p>
              <div style={{ height: '48px' }} />
              <Link to="/register" className="inline-flex items-center gap-3 bg-gradient-to-r from-accent to-accent-dark font-semibold px-8 py-4 rounded-lg text-base hover:brightness-110 transition-all no-underline active:scale-[0.97] shadow-[0_0_24px_var(--accent-glow)] hover:shadow-[0_0_40px_var(--accent-glow)]" style={{ color: '#FFF' }}>
                Get Started Free
                <span className="text-lg" style={{ color: '#FFF' }}>→</span>
              </Link>
            </div>
          </div>
        </section>
      </FadeSection>

      {/* Footer */}
      <footer className="border-t border-border-subtle px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-accent to-accent-dark rounded-lg flex items-center justify-center font-bold text-xs text-white">JT</div>
            <span className="text-text-200 font-bold text-sm">JobTracker</span>
          </div>
          <p className="text-text-400 text-xs">Track smarter. Land faster.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
