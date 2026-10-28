import React from 'react';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  FileCheck2,
  Mic,
  CheckCircle2,
  BrainCircuit,
  GraduationCap,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SEED_CAREERS } from '../../server/config/seedData.ts';

interface LandingPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onQuickDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onQuickDemo }) => {
  const sampleCareers = SEED_CAREERS.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-32 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Designed for College Students & Fresh Graduates
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none text-balance">
            Find the career path that's right for you.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CareerAI analyzes your skills, interests, goals, and experience to create a personalized roadmap toward your ideal career.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('assessment')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Start Your Career Assessment
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Chat with CareerAI
            </button>
          </div>

          {/* Quick Demo shortcut */}
          <div className="mt-6 text-xs text-slate-400 flex items-center justify-center gap-2">
            <span>Evaluating for placement?</span>
            <button
              onClick={onQuickDemo}
              className="text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Explore instant demo student profile (Alex Rivera)
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-b border-slate-900 bg-slate-950/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">System Architecture</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">How CareerAI Guides Your Transition</p>
            <p className="mt-3 text-slate-400 text-sm">
              We eliminate guesswork by combining transparent algorithmic match scoring with Gemini AI reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Profile & Assessment',
                desc: 'Input your college branch, current coding languages, and personal interests to establish a baseline profile.'
              },
              {
                step: '02',
                title: 'Explainable Matching',
                desc: 'See exactly why you match target roles (e.g. 87% AI/ML fit) with clear strengths and identified skill gaps.'
              },
              {
                step: '03',
                title: 'Personalized Roadmap',
                desc: 'Receive a month-by-month learning plan with specific projects and curated resources to bridge gaps.'
              },
              {
                step: '04',
                title: 'Placement Readiness',
                desc: 'Refine your resume with ATS scoring and practice mock technical interviews to walk into placements confident.'
              }
            ].map((col) => (
              <div key={col.step} className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 relative">
                <div className="text-2xl font-mono font-bold text-indigo-400/60 mb-3">{col.step}</div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">{col.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{col.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Career Paths Preview */}
      <section className="py-20 border-b border-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Curated Syllabi</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white">Explore 13+ High-Demand Tech Paths</p>
              <p className="mt-2 text-slate-400 text-sm">Detailed milestone checklists, real compensation ranges, and prerequisite maps.</p>
            </div>
            <button
              onClick={() => onNavigate('careers')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Browse all 13 career tracks <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleCareers.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>{c.difficulty} Level</span>
                    <span>{c.estPreparationMonths}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{c.careerName}</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-2">{c.tagline}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                    {c.requiredSkills.slice(0, 4).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {s}
                      </span>
                    ))}
                    {c.requiredSkills.length > 4 && (
                      <span className="px-2 py-0.5 text-slate-500">+{c.requiredSkills.length - 4} more</span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400">{c.avgSalaryRange.split('/')[1] || c.avgSalaryRange}</span>
                  <button
                    onClick={() => onNavigate('career-detail', c.id)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    View Track <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="py-20 border-b border-slate-900 bg-slate-950/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Student Superpowers</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">Full-Stack Career Intelligence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Context-Aware AI Chatbot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Remembers your branch, current semester, target career, and skill levels. No repeating yourself or receiving generic textbook summaries.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Visual Skill Gap Matrix</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Highlights exactly which libraries, frameworks, or algorithmic concepts you need to learn next with estimated study hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Resume ATS Scorer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates keyword density and impact framing using the Google X-Y-Z formula to ensure your resume passes recruiter filtering.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Mock Interview Coach</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulates real technical, system design, and HR rounds with instant scoring (1-10) and ideal model answers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Active Task Progress Tracker</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check off tasks as you finish them. Your Placement Readiness Score automatically updates live across your dashboard.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">30+ Portfolio Blueprints</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Avoid toy to-do apps. Build industry-grade capstones with multi-tier architectures, Docker deployment, and testing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-20 border-b border-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Student Voices</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">From Confusion to Placement Confidence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "I was overwhelmed by 50 different YouTube roadmaps. CareerAI showed me my 3 exact missing skills for Data Science and gave me a 6-month plan that got me placed.",
                name: "Rohan Sharma",
                college: "B.Tech CSE, Batch of 2025",
                role: "Associate Data Scientist @ FinTech"
              },
              {
                quote: "The mock interview module prepared me for tough follow-up questions on system design and database indexing. The feedback was brutal but accurate.",
                name: "Ananya Iyer",
                college: "IT Engineering, Batch of 2026",
                role: "Full Stack Engineer Intern"
              },
              {
                quote: "The Resume ATS analysis told me why my resume was getting rejected. I rewritten my bullet points with the suggested impact metrics and got 4 interview calls.",
                name: "David Chen",
                college: "Computer Engineering, 4th Year",
                role: "Cloud Engineering Aspirant"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 flex flex-col justify-between">
                <p className="text-xs text-slate-300 leading-relaxed italic mb-6">"{t.quote}"</p>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-[11px] text-indigo-400">{t.college}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-indigo-950/20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to find your ideal tech career roadmap?
          </h2>
          <p className="mt-4 text-base text-slate-300 max-w-xl mx-auto">
            Take the 3-minute career assessment or chat directly with CareerAI to start building your placement readiness score today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('assessment')}
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
            >
              Start Free Assessment
            </button>
            <button
              onClick={onQuickDemo}
              className="w-full sm:w-auto rounded-xl border border-slate-800 bg-slate-900 px-6 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Test with Demo Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
