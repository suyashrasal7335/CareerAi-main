import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { CareerMatchResult } from '../types/index.ts';
import {
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

interface CareerRecommendationsPageProps {
  initialRecommendations?: CareerMatchResult[];
  onNavigate: (tab: string, param?: string) => void;
}

export const CareerRecommendationsPage: React.FC<CareerRecommendationsPageProps> = ({
  initialRecommendations,
  onNavigate
}) => {
  const { user, updateUser } = useAuth();
  const [recommendations, setRecommendations] = useState<CareerMatchResult[]>(
    initialRecommendations || []
  );
  const [loading, setLoading] = useState(!initialRecommendations || initialRecommendations.length === 0);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    if (!initialRecommendations || initialRecommendations.length === 0) {
      loadRecommendations();
    }
  }, [initialRecommendations]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.getCareerRecommendations();
      setRecommendations(res.recommendations);
    } catch (err) {
      console.warn('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetTargetRole = async (careerName: string) => {
    setSelectedRole(careerName);
    try {
      await updateUser({ targetCareer: careerName });
    } catch (err) {
      console.error('Update target role error:', err);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md mb-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Explainable AI Matching Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personalized Career Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Calculated from your verified skills, branch coursework, aptitude answers, and placement timeline.
          </p>
        </div>

        <button
          onClick={() => onNavigate('assessment')}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 self-start md:self-auto"
        >
          <Compass className="h-4 w-4" /> Retake Assessment
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 animate-pulse h-48" />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30">
          <p className="text-sm text-slate-400 mb-4">No recommendations generated yet.</p>
          <button
            onClick={() => onNavigate('assessment')}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white"
          >
            Take 3-Minute Assessment →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec, index) => {
            const isTarget = (user?.targetCareer || '').toLowerCase() === rec.careerName.toLowerCase();
            return (
              <div
                key={rec.careerId}
                className={`p-6 sm:p-8 rounded-2xl border transition-all ${
                  isTarget
                    ? 'border-indigo-500/60 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 shadow-lg shadow-indigo-500/5'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left Column: Title & Meta */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        #{index + 1} Recommendation
                      </span>
                      {isTarget && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Current Active Target
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        Difficulty: <strong className="text-slate-200">{rec.difficulty}</strong>
                      </span>
                      <span className="text-xs text-slate-400">
                        Prep Timeline: <strong className="text-slate-200">{rec.estPreparationMonths}</strong>
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{rec.careerName}</h2>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rec.tagline}</p>
                    </div>

                    {/* Explainable AI Block */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                      <div className="text-xs font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                        Why This Matches You
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {rec.reasons.map((r, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Strengths & Missing Skills Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <div className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Strengths (Skills You Have)
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.strengths.slice(0, 6).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 text-[11px]">
                              {s}
                            </span>
                          ))}
                          {rec.strengths.length === 0 && (
                            <span className="text-xs text-slate-500 italic">Foundational skills in progress</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-amber-400 mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> Skill Gaps to Bridge
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.missingSkills.slice(0, 5).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/50 text-[11px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommended Next Step */}
                    <div className="text-xs text-slate-300 pt-1">
                      <strong className="text-indigo-400">Recommended Next Action: </strong>
                      <span>{rec.recommendedNextStep}</span>
                    </div>
                  </div>

                  {/* Right Column: Match Score & Action Buttons */}
                  <div className="lg:w-64 shrink-0 flex flex-col justify-between items-center lg:items-end border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-6 lg:pt-0 lg:pl-6 text-center lg:text-right">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Match Score</div>
                      <div className="text-4xl sm:text-5xl font-extrabold font-mono text-indigo-400 my-1">
                        {rec.matchScore}%
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Market Demand: <span className="text-emerald-400 font-semibold">{rec.marketDemand}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {rec.avgSalaryRange.split('/')[1] || rec.avgSalaryRange}
                      </div>
                    </div>

                    <div className="w-full space-y-2 mt-6">
                      {!isTarget ? (
                        <button
                          onClick={() => handleSetTargetRole(rec.careerName)}
                          className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          Select as Target Role
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('roadmap')}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1"
                        >
                          View Live Roadmap <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigate('career-detail', rec.careerId)}
                          className="flex-1 py-1.5 px-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-[11px] font-semibold hover:bg-slate-700"
                        >
                          Curriculum
                        </button>
                        <button
                          onClick={() => onNavigate('skill-gap', rec.careerId)}
                          className="flex-1 py-1.5 px-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-[11px] font-semibold hover:bg-slate-700"
                        >
                          Skill Matrix
                        </button>
                      </div>

                      <button
                        onClick={() => onNavigate('chat')}
                        className="w-full py-1.5 rounded-lg text-slate-400 hover:text-indigo-300 text-[11px] font-medium flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Ask AI about this role
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
