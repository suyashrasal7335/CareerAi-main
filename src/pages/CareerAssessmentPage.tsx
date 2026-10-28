import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { CareerMatchResult } from '../types/index.ts';
import { Compass, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface CareerAssessmentPageProps {
  onAssessmentComplete: (results: CareerMatchResult[]) => void;
  onNavigate: (tab: string) => void;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: { label: string; desc: string; value: string; skills?: string[]; interests?: string[] }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'focus',
    title: 'Which engineering domain appeals to you the most?',
    subtitle: 'Think about what you would genuinely enjoy working on for 40 hours a week.',
    options: [
      { label: 'Intelligent AI & Machine Learning', desc: 'Predictive models, neural networks, natural language, and data algorithms', value: 'ai', skills: ['Python', 'Machine Learning', 'Mathematics'], interests: ['AI', 'Data'] },
      { label: 'Full Stack & Modern Web Software', desc: 'Interactive client applications, REST/GraphQL APIs, and databases', value: 'web', skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'], interests: ['Web', 'Coding'] },
      { label: 'Business Analytics & Data Storytelling', desc: 'Transforming messy spreadsheets into executive dashboards and insights', value: 'data', skills: ['SQL', 'Excel', 'Power BI'], interests: ['Data', 'Business'] },
      { label: 'Cloud Infrastructure & Security', desc: 'Automated CI/CD pipelines, container orchestration, and network defense', value: 'systems', skills: ['Linux', 'Docker', 'AWS', 'Networking'], interests: ['Cloud', 'Cybersecurity'] }
    ]
  },
  {
    id: 'codingComfort',
    title: 'How would you rate your current coding proficiency?',
    subtitle: 'Be honest—CareerAI uses this to calculate realistic preparation timelines.',
    options: [
      { label: 'Beginner / Foundation', desc: 'Understand variables, loops, conditional statements, and basic functions', value: 'beginner' },
      { label: 'Intermediate / Applied', desc: 'Built multi-file scripts, familiar with OOP principles and Git version control', value: 'intermediate' },
      { label: 'Advanced / Production', desc: 'Solved complex data structures, used frameworks, comfortable with APIs and DBs', value: 'advanced' }
    ]
  },
  {
    id: 'mathAffinity',
    title: 'How comfortable are you with quantitative mathematics?',
    subtitle: 'Calculus, Linear Algebra, Probability distributions, and Statistics.',
    options: [
      { label: 'Strongly comfortable', desc: 'I enjoy formulas, matrix multiplications, probability, and statistical hypotheses', value: 'high', skills: ['Statistics', 'Mathematics'] },
      { label: 'Moderate / Pragmatic', desc: 'Comfortable with basic statistics, averages, and standard formulas when needed', value: 'moderate' },
      { label: 'Prefer visual / logical logic', desc: 'I prefer building UI components, system flows, and user experiences over math', value: 'low' }
    ]
  },
  {
    id: 'workStyle',
    title: 'What type of engineering problems do you prefer tackling?',
    subtitle: 'Choose what gives you the most satisfaction upon completion.',
    options: [
      { label: 'Training and optimizing algorithms', desc: 'Tuning hyperparameters, evaluating precision/recall, and handling data pipelines', value: 'algorithms' },
      { label: 'Building product features users interact with', desc: 'Designing responsive interfaces, smooth animations, and end-to-end flows', value: 'product' },
      { label: 'Automating developer workflows and reliability', desc: 'Setting up automated deployments, testing, and scaling cloud infrastructure', value: 'infra' },
      { label: 'Synthesizing metrics into business decisions', desc: 'Writing complex SQL queries, analyzing customer funnels, and executive charts', value: 'analytics' }
    ]
  },
  {
    id: 'timeline',
    title: 'What is your target preparation window for campus placements?',
    subtitle: 'How soon do you need to be interview-ready?',
    options: [
      { label: 'Within 3 to 4 months (Urgent)', desc: 'Need immediate high-yield focus on highest probability campus requirements', value: '3m' },
      { label: '6 to 9 months (Standard Season)', desc: 'Ideal timeline to build 2 portfolio capstones and bridge 3-4 skill gaps', value: '6m' },
      { label: '12+ months (Pre-final year)', desc: 'Ample runway for in-depth foundational mastery and competitive coding', value: '12m' }
    ]
  },
  {
    id: 'companyType',
    title: 'What kind of employer culture aligns best with your goals?',
    subtitle: 'Different employers look for different skill distributions.',
    options: [
      { label: 'High-growth Product Startup', desc: 'Wear multiple hats, ship code rapidly, direct responsibility', value: 'startup' },
      { label: 'Tier-1 Large Tech MNC', desc: 'Rigorous DSA, system design standards, structured mentorship', value: 'mnc' },
      { label: 'Enterprise IT & Consulting', desc: 'Established processes, multi-client exposure, reliable onboarding', value: 'consulting' },
      { label: 'Open to any strong opportunity', desc: 'Prioritizing entry into the technical workforce', value: 'any' }
    ]
  }
];

export const CareerAssessmentPage: React.FC<CareerAssessmentPageProps> = ({
  onAssessmentComplete,
  onNavigate
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const currentQ = QUESTIONS[currentIdx];

  const handleSelectOption = (value: string, opt: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: value,
      skills: Array.from(new Set([...(prev.skills || []), ...(opt.skills || [])])),
      interests: Array.from(new Set([...(prev.interests || []), ...(opt.interests || [])]))
    }));
  };

  const handleNext = async () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Final submission
      setLoading(true);
      try {
        const res = await api.submitAssessment(answers);
        onAssessmentComplete(res.recommendations);
      } catch (err) {
        console.error('Assessment submit error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950 py-12">
      <div className="w-full max-w-2xl p-6 sm:p-10 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur-sm">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Question {currentIdx + 1} of {QUESTIONS.length}</span>
            <span className="font-mono text-indigo-400">{Math.round(((currentIdx + 1) / QUESTIONS.length) * 100)}% Complete</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{currentQ.title}</h2>
          <p className="text-xs text-slate-400 mt-1">{currentQ.subtitle}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQ.options.map((opt) => {
            const isSelected = answers[currentQ.id] === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelectOption(opt.value, opt)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-4 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-slate-100">{opt.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</div>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-slate-700 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {currentIdx > 0 ? (
            <button
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            disabled={!answers[currentQ.id] || loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 text-xs font-semibold shadow-md transition-colors disabled:opacity-40"
          >
            {loading ? (
              'Calculating Matches...'
            ) : currentIdx === QUESTIONS.length - 1 ? (
              <>View Career Recommendations <Sparkles className="h-4 w-4" /></>
            ) : (
              <>Continue <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
