import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { SkillGapReport, SkillGapItem } from '../types/index.ts';
import { SEED_CAREERS } from '../../server/config/seedData.ts';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Compass
} from 'lucide-react';

interface SkillGapPageProps {
  careerId?: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({ careerId, onNavigate }) => {
  const { user } = useAuth();
  const [selectedCareerId, setSelectedCareerId] = useState(
    careerId || (user?.targetCareer ? SEED_CAREERS.find(c => c.careerName.toLowerCase() === user?.targetCareer?.toLowerCase())?.id : 'ai-ml-engineer') || 'ai-ml-engineer'
  );
  const [report, setReport] = useState<SkillGapReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkillGap(selectedCareerId);
  }, [selectedCareerId]);

  const loadSkillGap = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.getSkillGap(id);
      setReport(res.report);
    } catch (err) {
      console.warn('Failed to load skill gap:', err);
    } finally {
      setLoading(false);
    }
  };

  const strongSkills = report?.skills.filter(s => s.status === 'strong') || [];
  const developingSkills = report?.skills.filter(s => s.status === 'developing') || [];
  const missingSkills = report?.skills.filter(s => s.status === 'missing') || [];

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header & Career Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
            Competitive Skills Audit
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Skill Gap Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Compare your verified skill set against the production requirements of tech recruiters.
          </p>
        </div>

        {/* Dropdown to switch analyzed career */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Target Role:</label>
          <select
            value={selectedCareerId}
            onChange={(e) => setSelectedCareerId(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            {SEED_CAREERS.map((c) => (
              <option key={c.id} value={c.id}>{c.careerName}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
          Analyzing skill overlap and prerequisite trees...
        </div>
      ) : report ? (
        <div className="space-y-8">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="text-xs text-slate-400">Target Role Fit</div>
              <div className="text-3xl font-bold font-mono text-indigo-400 mt-1">{report.matchScore}%</div>
              <div className="text-[11px] text-slate-400 mt-1">{report.careerName}</div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="text-xs text-slate-400">Strong (Acquired)</div>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">{strongSkills.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Verified on your profile</div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="text-xs text-slate-400">Developing</div>
              <div className="text-3xl font-bold font-mono text-cyan-400 mt-1">{developingSkills.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Partial or optional skills</div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="text-xs text-slate-400">Critical Gaps</div>
              <div className="text-3xl font-bold font-mono text-amber-400 mt-1">{missingSkills.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Need to bridge for interview</div>
            </div>
          </div>

          {/* AI Synthesis Callout */}
          <div className="p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Analysis Summary</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">{report.overview}</p>
            <div className="mt-3 text-xs text-slate-300 font-medium">
              <span className="text-indigo-400 font-bold">Action Item: </span>
              {report.primaryAction}
            </div>
          </div>

          {/* Detailed Skill Rows */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Skill Matrix Breakdown</h2>

            <div className="space-y-3">
              {report.skills.map((item, idx) => {
                let badgeColor = 'bg-amber-950/40 text-amber-300 border-amber-800/50';
                let statusLabel = 'Missing Gap';
                if (item.status === 'strong') {
                  badgeColor = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50';
                  statusLabel = 'Strong';
                } else if (item.status === 'developing') {
                  badgeColor = 'bg-cyan-950/40 text-cyan-300 border-cyan-800/50';
                  statusLabel = 'Developing';
                }

                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-white">{item.skill}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badgeColor}`}>
                          {statusLabel}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Priority: {item.importance}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.whyItMatters}</p>
                      {item.prerequisites.length > 0 && (
                        <div className="text-[11px] text-slate-400">
                          Prerequisites: <span className="text-slate-300">{item.prerequisites.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                      {item.status === 'missing' && (
                        <div className="text-left sm:text-right text-xs">
                          <div className="text-slate-400 flex items-center gap-1 sm:justify-end">
                            <Clock className="h-3 w-3" /> Est. {item.estimatedHoursToLearn} hrs
                          </div>
                          <div className="text-[11px] text-indigo-400 font-medium">Order #{item.recommendedOrder}</div>
                        </div>
                      )}

                      <button
                        onClick={() => onNavigate('chat')}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Ask AI Tutor
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
