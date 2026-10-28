import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  PlacementReadinessReport,
  Roadmap,
  DailyPlan,
  CareerMatchResult
} from '../types/index.ts';
import {
  Sparkles,
  Target,
  TrendingUp,
  MessageSquare,
  FileCheck2,
  Mic,
  FolderGit2,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [readiness, setReadiness] = useState<PlacementReadinessReport | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [readinessRes, roadmapRes, dailyRes] = await Promise.all([
          api.getPlacementReadiness(),
          api.getRoadmap(),
          api.getDailyPlan(user?.targetCareer)
        ]);
        setReadiness(readinessRes.readiness);
        setRoadmap(roadmapRes.roadmap);
        setDailyPlan(dailyRes.dailyPlan);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      const nextStatus = currentStatus === 'completed' ? 'in-progress' : 'completed';
      const updated = await api.updateTaskStatus(taskId, nextStatus);
      setRoadmap(updated.roadmap);
      // Refresh readiness
      const refreshedReadiness = await api.getPlacementReadiness();
      setReadiness(refreshedReadiness.readiness);
    } catch (err) {
      console.error('Task status update error:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const targetRole = user?.targetCareer || 'AI/ML Engineer';
  const overallReadiness = readiness?.overallScore || 72;
  const roadmapPct = roadmap && roadmap.totalTasks > 0
    ? Math.round((roadmap.completedTasks / roadmap.totalTasks) * 100)
    : 42;

  // Find next active task
  let activeTask: any = null;
  if (roadmap) {
    for (const m of roadmap.months) {
      for (const t of m.tasks) {
        if (t.status !== 'completed') {
          activeTask = { ...t, monthTitle: m.title };
          break;
        }
      }
      if (activeTask) break;
    }
  }

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md mb-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Academic Year {user?.currentYear || '3rd Year'} · {user?.degree || 'B.Tech'} {user?.branch || 'CSE'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Target Career: <strong className="text-white font-semibold">{targetRole}</strong> · Placement Window: <span className="text-slate-400">{user?.graduationYear || '2026'} Campus Season</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Chat with CareerAI
            </button>
            <button
              onClick={() => onNavigate('recommendations')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Switch Target Role
            </button>
          </div>
        </div>
      </div>

      {/* 4 Score Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Career Match</div>
          <div className="text-3xl font-bold font-mono text-indigo-400 mt-2">87%</div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>High alignment with skills</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Placement Readiness</div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-2">{overallReadiness}%</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Status: <span className="text-emerald-300 font-medium">{readiness?.indicator || 'Placement Ready'}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Roadmap Progress</div>
          <div className="text-3xl font-bold font-mono text-violet-400 mt-2">{roadmapPct}%</div>
          <div className="text-[11px] text-slate-400 mt-2">
            {roadmap?.completedTasks || 7} of {roadmap?.totalTasks || 18} tasks done
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 font-medium">Skills Coverage</div>
          <div className="text-3xl font-bold font-mono text-cyan-400 mt-2">68%</div>
          <div className="text-[11px] text-slate-400 mt-2">
            {(user?.skills || []).length} verified skills
          </div>
        </div>
      </div>

      {/* Middle Row: "What should I learn today?" + "Continue Learning" */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Plan Widget (2 columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">What should I learn today?</h2>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {dailyPlan?.estimatedMinutes || 60} Minutes
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4">
              <div className="text-xs text-slate-400 font-medium">Today's Focus Topic:</div>
              <div className="text-base font-bold text-slate-100 mt-0.5">{dailyPlan?.topic || 'Decision Trees & Feature Importance'}</div>
              <p className="text-xs text-slate-400 mt-1">{dailyPlan?.rationale}</p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-xs font-semibold text-slate-300">Suggested 60-Minute Plan:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {dailyPlan?.planBreakdown.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
                    <span className="font-mono text-indigo-400 font-bold shrink-0">{item.time}</span>
                    <span className="text-slate-300">{item.task}</span>
                  </div>
                ))}
              </div>
            </div>

            {dailyPlan?.quickQuiz && (
              <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-xs">
                <span className="font-semibold text-indigo-300">Placement Prep Question: </span>
                <span className="text-slate-300">{dailyPlan.quickQuiz}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Grounded in your 6-month roadmap</span>
            <button
              onClick={() => onNavigate('roadmap')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Open Full Roadmap <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Continue Learning + AI Recommendation (1 column) */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Active Task Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Continue Learning</span>
              <Target className="h-4 w-4 text-violet-400" />
            </div>

            {activeTask ? (
              <div>
                <div className="text-[11px] text-slate-400 truncate">{activeTask.monthTitle}</div>
                <h3 className="text-sm font-bold text-white mt-1 mb-2">{activeTask.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{activeTask.description}</p>

                <button
                  onClick={() => handleToggleTask(activeTask.id, activeTask.status)}
                  disabled={updatingTaskId === activeTask.id}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {updatingTaskId === activeTask.id ? 'Updating...' : 'Mark Task as Completed'}
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                All roadmap tasks completed! Ready to simulate full-length mock interviews.
              </div>
            )}
          </div>

          {/* AI Recommendation Card */}
          <div className="p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900/80 to-indigo-950/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">AI Recommendation</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              "Your Python and SQL scores are solid. Dedicate this week to completing the <strong>Customer Churn Prediction</strong> project to showcase end-to-end model training on GitHub."
            </p>
            <button
              onClick={() => onNavigate('projects')}
              className="mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Explore Project Specs <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Placement Readiness Breakdown */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">Indicative Placement Readiness Breakdown</h2>
            <p className="text-xs text-slate-400">Transparent composition of your {overallReadiness}% score across key hiring pillars.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Status: {readiness?.indicator || 'Placement Ready'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Technical Skills', score: readiness?.breakdown.skillsScore || 78, tip: 'Core syntax & algorithms' },
            { label: 'Portfolio Projects', score: readiness?.breakdown.projectsScore || 65, tip: 'End-to-end applications' },
            { label: 'Resume ATS', score: readiness?.breakdown.resumeScore || 82, tip: 'Keywords & impact metrics' },
            { label: 'Mock Interview', score: readiness?.breakdown.interviewScore || 70, tip: 'Technical & communication' },
            { label: 'Roadmap Tasks', score: readiness?.breakdown.roadmapScore || 68, tip: 'Consistent milestones' }
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-xs text-slate-400">{item.label}</div>
              <div className="text-2xl font-bold font-mono text-slate-100 my-1">{item.score}%</div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 truncate">{item.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('resume')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-left transition-colors"
        >
          <FileCheck2 className="h-5 w-5 text-indigo-400 mb-2" />
          <div className="text-xs font-bold text-white">Test Resume on ATS</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Audit missing keywords</div>
        </button>

        <button
          onClick={() => onNavigate('interview')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-left transition-colors"
        >
          <Mic className="h-5 w-5 text-violet-400 mb-2" />
          <div className="text-xs font-bold text-white">Practice Mock Interview</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Real-time AI evaluation</div>
        </button>

        <button
          onClick={() => onNavigate('skill-gap')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-left transition-colors"
        >
          <TrendingUp className="h-5 w-5 text-emerald-400 mb-2" />
          <div className="text-xs font-bold text-white">View Skill Gaps</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Compare skills vs role</div>
        </button>

        <button
          onClick={() => onNavigate('projects')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-left transition-colors"
        >
          <FolderGit2 className="h-5 w-5 text-amber-400 mb-2" />
          <div className="text-xs font-bold text-white">Portfolio Blueprints</div>
          <div className="text-[11px] text-slate-400 mt-0.5">30+ production projects</div>
        </button>
      </div>
    </div>
  );
};
