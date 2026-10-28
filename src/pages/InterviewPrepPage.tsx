import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { InterviewSession, InterviewAnswerRecord } from '../types/index.ts';
import { SEED_CAREERS } from '../../server/config/seedData.ts';
import {
  Mic,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  RotateCcw,
  Award,
  Bot,
  User as UserIcon,
  HelpCircle
} from 'lucide-react';

export const InterviewPrepPage: React.FC = () => {
  const { user } = useAuth();
  const [career, setCareer] = useState(user?.targetCareer || 'AI/ML Engineer');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [interviewType, setInterviewType] = useState<'Technical' | 'HR' | 'Behavioral' | 'System Design'>('Technical');

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [latestEval, setLatestEval] = useState<InterviewAnswerRecord | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setLatestEval(null);
    try {
      const res = await api.startInterview(career, difficulty, interviewType);
      setSession(res.session);
    } catch (err) {
      console.error('Interview start error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !currentAnswer.trim() || evaluating) return;
    setEvaluating(true);
    try {
      const res = await api.submitInterviewAnswer(session.id, currentAnswer.trim());
      setSession(res.session);
      setLatestEval(res.evaluation);
      setCurrentAnswer('');
    } catch (err) {
      console.error('Answer submission error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const currentQ = session && !session.completed
    ? session.questions[session.currentQuestionIndex]
    : null;

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md mb-2">
          <Mic className="h-3.5 w-3.5 text-indigo-400" />
          Interactive Mock Interview Simulator
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Placement Interview Preparation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Simulate real campus placement rounds with immediate answer scoring, constructive feedback, and follow-up challenges.
        </p>
      </div>

      {/* Configuration Form (when no active session) */}
      {!session ? (
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6 max-w-2xl mx-auto">
          <div>
            <h2 className="text-lg font-bold text-white">Configure Your Mock Interview</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select the target role and challenge parameters.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Job Track</label>
              <select
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                {SEED_CAREERS.map((c) => (
                  <option key={c.id} value={c.careerName}>{c.careerName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Interview Round Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Technical">Technical Domain Round</option>
                  <option value="System Design">System Architecture / Design</option>
                  <option value="HR">HR & Cultural Fit</option>
                  <option value="Behavioral">Behavioral (STAR Method)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner (Foundational concepts)</option>
                  <option value="Intermediate">Intermediate (Standard Campus Tier)</option>
                  <option value="Advanced">Advanced (Product Company Tier-1)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? 'Initializing AI Interviewer...' : 'Begin Mock Interview'}
          </button>
        </div>
      ) : session.completed ? (
        /* Finished: Final Interview Report */
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Interview Completed</div>
              <h2 className="text-2xl font-bold text-white mt-1">Official Mock Placement Report</h2>
              <div className="text-xs text-slate-400">{session.career} · {session.interviewType} Round</div>
            </div>

            <button
              onClick={() => setSession(null)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Start Another Session
            </button>
          </div>

          {/* Scores Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Technical Depth</div>
              <div className="text-3xl font-bold font-mono text-indigo-400 mt-1">{session.report?.technicalScore}%</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Communication</div>
              <div className="text-3xl font-bold font-mono text-cyan-400 mt-1">{session.report?.communicationScore}%</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Problem Solving</div>
              <div className="text-3xl font-bold font-mono text-violet-400 mt-1">{session.report?.problemSolvingScore}%</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-center">
              <div className="text-xs text-emerald-400">Overall Score</div>
              <div className="text-3xl font-bold font-mono text-emerald-300 mt-1">{session.report?.overallScore}%</div>
            </div>
          </div>

          {/* Feedback Notes */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wide">Recruiter Assessment Summary</div>
            <p className="text-xs text-slate-300 leading-relaxed">{session.report?.feedback}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Strong Competencies Demonstrated
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {session.report?.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Target Areas for Improvement
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {session.report?.areasForImprovement.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Active Interview in Progress */
        <div className="space-y-6">
          {/* Status Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span>Question {session.currentQuestionIndex + 1} of {session.questions.length}</span>
            <span className="font-semibold text-indigo-400">{session.career} · {session.interviewType}</span>
          </div>

          {/* Question Card */}
          {currentQ && (
            <div className="p-6 rounded-2xl border border-indigo-500/30 bg-slate-900/60 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Bot className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                  Interviewer ({currentQ.category})
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                "{currentQ.question}"
              </p>
            </div>
          )}

          {/* Previous Evaluation Card (if just answered one) */}
          {latestEval && (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  Previous Answer Score: {latestEval.score}/10
                </span>
                <span className="text-[11px] text-slate-400">Immediate Feedback</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="text-emerald-300">
                  <strong className="block text-emerald-400 font-semibold mb-1">Strengths:</strong>
                  {latestEval.strengths.join(' · ')}
                </div>
                <div className="text-amber-300">
                  <strong className="block text-amber-400 font-semibold mb-1">Could Improve:</strong>
                  {latestEval.weaknesses.join(' · ')}
                </div>
              </div>

              {latestEval.betterAnswer && (
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <strong className="text-indigo-400 block mb-0.5">Top-Tier Candidate Model Answer:</strong>
                  <p className="italic text-slate-400">{latestEval.betterAnswer}</p>
                </div>
              )}
            </div>
          )}

          {/* Answer Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Your Spoken/Written Response:</span>
              <span className="text-slate-500">Structure with context, trade-offs, and metrics</span>
            </div>

            <textarea
              rows={6}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="State your answer clearly. Explain your thought process, architecture decisions, and edge-case considerations..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || evaluating}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {evaluating ? (
                  'Evaluating Answer...'
                ) : (
                  <>Submit Answer <Send className="h-3.5 w-3.5" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
