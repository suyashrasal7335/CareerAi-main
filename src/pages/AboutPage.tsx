import React from 'react';
import { Compass, ShieldCheck, CheckCircle2, Cpu, GraduationCap, Target } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            Our Mission & Architecture
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Bridging the Gap from Student to Career
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Every year, millions of college graduates enter the job market without clear direction on what skills actually move the needle for technical campus placements.
          </p>
        </div>

        {/* The Problem */}
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 mb-12 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-rose-400" />
            The College Career Dilemma
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            College curricula often lag behind rapidly evolving engineering landscapes. Students hear buzzwords like "AI/ML", "DevOps", and "Full Stack", but don't know:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-2">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span> Which career is genuinely suitable for their personal aptitude
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span> What exact skills are missing between them and a shortlisted resume
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span> What sequence of topics to study first without wasting months
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span> Which projects prove competency versus which look like tutorials
            </li>
          </ul>
        </div>

        {/* Explainable AI Pillar */}
        <div className="p-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/20 mb-12 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            Our Pillar: Explainable AI
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We reject the black-box AI model where an LLM arbitrarily declares: <em>"You should become a Data Scientist."</em>
          </p>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="text-emerald-400 font-semibold">Recommended Career: Data Scientist (Match: 86%)</div>
            <div className="text-slate-400">Why?</div>
            <div>✓ Strong Python & SQL foundation detected</div>
            <div>✓ Academic mathematics & statistics coursework aligned</div>
            <div>✓ Explicit interest in AI and quantitative reasoning</div>
            <div className="text-amber-400 pt-1">Identified Gaps to Bridge:</div>
            <div>⚠ Advanced probability distributions</div>
            <div>⚠ End-to-end model deployment & Docker containerization</div>
            <div className="text-indigo-400 pt-1">Recommended Next Step:</div>
            <div>Complete the Customer Churn Prediction project.</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every match percentage is broken down mathematically through skill overlap, interest correlation, and verified course syllabi.
          </p>
        </div>

        {/* AI Safety Commitment */}
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 mb-12 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            AI Safety & Realistic Expectations
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            CareerAI will never falsely promise guaranteed jobs or exact salary commitments. Salary bands are realistic estimates based on market indices and vary according to location, company tier, and personal interview performance.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Our Placement Readiness Score is designed as an indicative progress tracker to motivate steady, daily habit building rather than a high-stakes exam.
          </p>
        </div>

        {/* Back to Home CTA */}
        <div className="text-center">
          <button
            onClick={() => onNavigate('assessment')}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
          >
            Start Your Assessment Now
          </button>
        </div>
      </div>
    </div>
  );
};
