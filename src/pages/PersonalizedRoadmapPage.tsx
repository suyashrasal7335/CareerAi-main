import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Roadmap, RoadmapMonth, RoadmapTask } from '../types/index.ts';
import { SEED_CAREERS } from '../../server/config/seedData.ts';
import {
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  FolderGit2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PersonalizedRoadmapPageProps {
  careerId?: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const PersonalizedRoadmapPage: React.FC<PersonalizedRoadmapPageProps> = ({
  careerId,
  onNavigate
}) => {
  const { user, updateUser } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<number[]>([1, 2]);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const selectedCareer = careerId || (user?.targetCareer ? SEED_CAREERS.find(c => c.careerName.toLowerCase() === user?.targetCareer?.toLowerCase())?.id : 'ai-ml-engineer') || 'ai-ml-engineer';

  useEffect(() => {
    loadRoadmap();
  }, [careerId, user?.targetCareer]);

  const loadRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.getRoadmap(selectedCareer);
      if (res.roadmap) {
        setRoadmap(res.roadmap);
      } else {
        // Auto-generate if not existing
        handleGenerate(selectedCareer);
      }
    } catch (err) {
      console.warn('Roadmap load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (targetId: string) => {
    setGenerating(true);
    try {
      const res = await api.generateRoadmap(targetId, 6);
      setRoadmap(res.roadmap);
      setExpandedMonths([1, 2]);
    } catch (err) {
      console.error('Roadmap generate error:', err);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      const nextStatus = currentStatus === 'completed' ? 'in-progress' : 'completed';
      const res = await api.updateTaskStatus(taskId, nextStatus);
      setRoadmap(res.roadmap);
    } catch (err) {
      console.error('Task update error:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const toggleMonth = (mNum: number) => {
    setExpandedMonths(prev =>
      prev.includes(mNum) ? prev.filter(m => m !== mNum) : [...prev, mNum]
    );
  };

  const completed = roadmap?.completedTasks || 0;
  const total = roadmap?.totalTasks || 1;
  const progressPct = Math.round((completed / total) * 100);

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md mb-2">
            <Target className="h-3.5 w-3.5 text-indigo-400" />
            Dynamic Milestone Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personalized Career Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Tailored 6-month progression for <strong>{roadmap?.careerTitle || user?.targetCareer || 'AI/ML Engineer'}</strong> aligned with your weekly learning capacity.
          </p>
        </div>

        <button
          onClick={() => handleGenerate(selectedCareer)}
          disabled={generating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {generating ? 'Rebuilding with AI...' : 'Regenerate Roadmap'}
        </button>
      </div>

      {loading || generating ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
          Building month-by-month syllabus tailored to your skill gaps...
        </div>
      ) : roadmap ? (
        <div className="space-y-6">
          {/* Progress Tracker Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-400">Overall Roadmap Completion</div>
              <div className="text-2xl font-bold font-mono text-white">
                {progressPct}% <span className="text-xs font-normal text-slate-400">({completed} of {total} deliverables completed)</span>
              </div>
            </div>

            <div className="w-full sm:w-72">
              <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Month Cards */}
          <div className="space-y-4">
            {roadmap.months.map((month) => {
              const isExpanded = expandedMonths.includes(month.monthNumber);
              const monthCompletedTasks = month.tasks.filter(t => t.status === 'completed').length;
              const isMonthFinished = monthCompletedTasks === month.tasks.length;

              return (
                <div
                  key={month.monthNumber}
                  className={`rounded-2xl border transition-all ${
                    isMonthFinished
                      ? 'border-emerald-500/30 bg-slate-900/40'
                      : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                  }`}
                >
                  {/* Month Accordion Header */}
                  <div
                    onClick={() => toggleMonth(month.monthNumber)}
                    className="p-5 sm:p-6 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                        isMonthFinished
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        M{month.monthNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{month.title}</h3>
                          {isMonthFinished && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{month.focus}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block text-right text-xs">
                        <span className="font-mono font-semibold text-slate-300">{monthCompletedTasks}/{month.tasks.length}</span>
                        <span className="text-slate-400"> tasks</span>
                      </div>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Month Body */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-4">
                      {/* Topics & Goals */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                          <div className="font-semibold text-indigo-300 mb-1">Topics Covered:</div>
                          <div className="flex flex-wrap gap-1">
                            {month.topics.map((top, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                                {top}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                          <div className="font-semibold text-indigo-300 mb-1">Milestone Goals:</div>
                          <ul className="space-y-0.5 text-slate-300 text-[11px]">
                            {month.goals.map((g, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span>{g}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Tasks List */}
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-semibold text-slate-300">Deliverable Tasks (Click to toggle completion):</div>
                        {month.tasks.map((task) => {
                          const isDone = task.status === 'completed';
                          const isUpdating = updatingTaskId === task.id;

                          return (
                            <div
                              key={task.id}
                              onClick={() => handleToggleTask(task.id, task.status)}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                                isDone
                                  ? 'border-emerald-500/20 bg-emerald-950/10'
                                  : 'border-slate-800/80 bg-slate-950 hover:border-slate-700'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-600 hover:text-slate-400" />
                                )}
                              </div>

                              <div className="flex-1">
                                <div className={`text-xs font-bold ${isDone ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                                  {task.title}
                                </div>
                                <p className={`text-[11px] mt-0.5 leading-relaxed ${isDone ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {task.description}
                                </p>
                              </div>

                              <div className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {task.estimatedHours}h
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Month Projects */}
                      {month.projects.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <FolderGit2 className="h-4 w-4 text-violet-400" />
                            <span className="text-slate-300">Milestone Project: <strong className="text-white">{month.projects[0]}</strong></span>
                          </div>
                          <button
                            onClick={() => onNavigate('projects')}
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            View Specs <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
