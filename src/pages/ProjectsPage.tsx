import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { ProjectSeed } from '../types/index.ts';
import { SEED_CAREERS } from '../../server/config/seedData.ts';
import {
  FolderGit2,
  Layers,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<ProjectSeed[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<ProjectSeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [selectedCareer, selectedDifficulty]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getProjects(selectedCareer || undefined, selectedDifficulty || undefined);
      setProjects(res.projects);
    } catch (err) {
      console.warn('Projects load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md mb-2">
            <FolderGit2 className="h-3.5 w-3.5 text-indigo-400" />
            Recruiter-Grade Portfolios
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Curated Portfolio Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Move beyond tutorial clones. These end-to-end architectures showcase production system design, tests, and deployment.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCareer}
            onChange={(e) => setSelectedCareer(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Career Tracks</option>
            {SEED_CAREERS.map((c) => (
              <option key={c.id} value={c.careerName}>{c.careerName}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading project blueprints...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30">
          <p className="text-xs text-slate-400">No projects found matching the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => setSelectedProject(proj)}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-indigo-400">{proj.career}</span>
                  <span className="font-mono">{proj.difficulty}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {proj.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {proj.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.technologies.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {proj.estDuration}
                </span>
                <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Architecture <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blueprint Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                  {selectedProject.career} · {selectedProject.difficulty}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedProject.title}</h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-300">Problem Statement</div>
              <p className="text-xs text-slate-400 leading-relaxed">{selectedProject.problemStatement}</p>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-300 mb-2">Key Features to Implement</div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedProject.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="font-bold text-indigo-400 font-sans">Suggested Architecture Blueprint</div>
              <div className="text-slate-300">{selectedProject.architecture}</div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
              <div className="font-bold text-indigo-300 mb-1">Placement Portfolio Value:</div>
              <p className="text-slate-300 leading-relaxed">{selectedProject.portfolioValue}</p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  onNavigate('chat');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
              >
                Discuss Project in AI Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
