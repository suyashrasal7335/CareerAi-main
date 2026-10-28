import React, { useState } from 'react';
import { SEED_CAREERS, CareerSeed } from '../../server/config/seedData.ts';
import {
  Compass,
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

interface ExploreCareersPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const ExploreCareersPage: React.FC<ExploreCareersPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const filtered = SEED_CAREERS.filter((c) => {
    const matchSearch =
      c.careerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchDiff = !difficultyFilter || c.difficulty === difficultyFilter;
    return matchSearch && matchDiff;
  });

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md mb-2">
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            13 Verified Tech Tracks
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explore Engineering & Tech Careers
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Examine prerequisite requirements, compensation projections, and curriculum roadmaps for modern college placement paths.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or skill (e.g. Python, SQL)..."
              className="rounded-lg border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-56 sm:w-64"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Career Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((career) => (
          <div
            key={career.id}
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-indigo-400">{career.difficulty} Level</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {career.estPreparationMonths}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {career.careerName}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {career.tagline}
                </p>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Required Skills:</div>
                <div className="flex flex-wrap gap-1.5">
                  {career.requiredSkills.slice(0, 5).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      {skill}
                    </span>
                  ))}
                  {career.requiredSkills.length > 5 && (
                    <span className="px-2 py-0.5 text-slate-500 text-[11px]">
                      +{career.requiredSkills.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="font-mono text-emerald-400 text-[11px]">
                {career.avgSalaryRange.split('/')[1] || career.avgSalaryRange}
              </span>
              <button
                onClick={() => onNavigate('career-detail', career.id)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
              >
                Track Details <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
