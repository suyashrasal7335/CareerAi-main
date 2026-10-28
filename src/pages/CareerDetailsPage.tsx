import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { CareerSeed } from '../types/index.ts';
import { SEED_CAREERS } from '../../server/config/seedData.ts';
import {
  Compass,
  ArrowLeft,
  Target,
  Award,
  Layers,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  FolderGit2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface CareerDetailsPageProps {
  careerId: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const CareerDetailsPage: React.FC<CareerDetailsPageProps> = ({
  careerId,
  onNavigate
}) => {
  const [career, setCareer] = useState<CareerSeed | null>(null);

  useEffect(() => {
    const found = SEED_CAREERS.find(c => c.id === careerId || c.careerName.toLowerCase() === careerId.toLowerCase()) || SEED_CAREERS[0];
    setCareer(found);
  }, [careerId]);

  if (!career) return null;

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <button
        onClick={() => onNavigate('careers')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to All Career Tracks
      </button>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="font-semibold text-indigo-400">{career.difficulty} Level</span>
              <span>·</span>
              <span>Timeline: {career.estPreparationMonths}</span>
              <span>·</span>
              <span className="text-emerald-400 font-mono">{career.marketDemand} Demand</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{career.careerName}</h1>
            <p className="text-sm text-slate-300 leading-relaxed">{career.description}</p>
            <div className="text-xs text-slate-400 font-mono pt-1">
              Estimated Compensation: <span className="text-emerald-400 font-semibold">{career.avgSalaryRange}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigate('roadmap', career.id)}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Target className="h-4 w-4" /> Generate 6-Month Roadmap
            </button>
            <button
              onClick={() => onNavigate('skill-gap', career.id)}
              className="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp className="h-4 w-4" /> Check My Skill Gaps
            </button>
          </div>
        </div>
      </div>

      {/* Overview & Responsibilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="h-4 w-4 text-indigo-400" /> Track Overview
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">{career.overview}</p>
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2">Common Job Titles in Industry</div>
            <div className="flex flex-wrap gap-1.5">
              {career.roles.map((role) => (
                <span key={role} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-emerald-400" /> Daily Responsibilities
          </h2>
          <ul className="space-y-2 text-xs text-slate-300">
            {career.responsibilities.map((resp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold shrink-0">•</span>
                <span className="leading-relaxed">{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3-Tier Roadmap Milestones */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">3-Tier Skill Progression Roadmap</h2>
          <p className="text-xs text-slate-400 mt-1">From absolute beginner syntax to placement-ready production mastery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wide">
              Level 1: Beginner Milestones
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {career.beginnerMilestones.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold shrink-0">1.{i + 1}</span>
                  <span className="leading-relaxed">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wide">
              Level 2: Intermediate Milestones
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {career.intermediateMilestones.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">2.{i + 1}</span>
                  <span className="leading-relaxed">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="text-xs font-bold font-mono text-violet-400 uppercase tracking-wide">
              Level 3: Advanced & Placement
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {career.advancedMilestones.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold shrink-0">3.{i + 1}</span>
                  <span className="leading-relaxed">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tools, Technologies, and Interview Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-violet-400" /> Core Tech Stack & Tools
          </h2>
          <div className="flex flex-wrap gap-2">
            {career.toolsAndTech.map((t) => (
              <span key={t} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium">
                {t}
              </span>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-400 mb-2">High-Yield Certifications</div>
            <ul className="space-y-1 text-xs text-slate-300">
              {career.certifications.map((c, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-rose-400" /> Common Placement Interview Topics
          </h2>
          <ul className="space-y-2 text-xs text-slate-300">
            {career.interviewTopics.map((topic, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0">Q:</span>
                <span className="leading-relaxed">{topic}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigate('interview')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 border border-slate-700 transition-colors"
            >
              Practice Mock Interview for {career.careerName} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
