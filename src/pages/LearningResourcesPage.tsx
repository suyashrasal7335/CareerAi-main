import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { ResourceSeed } from '../types/index.ts';
import { SEED_CAREERS } from '../../server/config/seedData.ts';
import {
  BookOpen,
  ExternalLink,
  Video,
  Award,
  FileText,
  Code2,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

export const LearningResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<ResourceSeed[]>([]);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, [selectedCareer, selectedType]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await api.getResources(selectedCareer || undefined, selectedType || undefined);
      setResources(res.resources);
    } catch (err) {
      console.warn('Resources fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'YouTube': return <Video className="h-4 w-4 text-rose-400" />;
      case 'Course': return <GraduationCap className="h-4 w-4 text-indigo-400" />;
      case 'Practice': return <Code2 className="h-4 w-4 text-emerald-400" />;
      case 'Certification': return <Award className="h-4 w-4 text-amber-400" />;
      case 'Book': return <BookOpen className="h-4 w-4 text-cyan-400" />;
      default: return <FileText className="h-4 w-4 text-violet-400" />;
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md mb-2">
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            Verified Curricula
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Curated Learning Resources
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Vetted interactive tutorials, official documentation, video deep dives, and practice platforms.
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Formats</option>
            <option value="Course">Courses</option>
            <option value="Documentation">Documentation</option>
            <option value="YouTube">YouTube Masterclasses</option>
            <option value="Practice">Practice Platforms</option>
            <option value="Book">Foundational Books</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading verified resources...</div>
      ) : resources.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30">
          <p className="text-xs text-slate-400">No resources found matching the criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    {getTypeIcon(res.type)}
                    {res.type}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${res.isFree ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                    {res.isFree ? 'Free Access' : 'Verified Paid'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white line-clamp-1">{res.title}</h3>
                  <div className="text-[11px] text-indigo-400 font-medium mt-0.5">by {res.provider}</div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {res.description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {res.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">{res.difficulty} Level</span>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Visit Resource <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
