import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Target,
  FolderGit2,
  BookOpen,
  FileCheck2,
  Mic,
  Compass,
  User,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  targetCareer?: string;
  readinessScore?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  targetCareer = 'AI/ML Engineer',
  readinessScore = 72
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Career Chat', icon: MessageSquare, highlight: true },
    { id: 'recommendations', label: 'Career Matches', icon: Sparkles },
    { id: 'roadmap', label: 'Personalized Roadmap', icon: Target },
    { id: 'skill-gap', label: 'Skill Gap Analysis', icon: TrendingUp },
    { id: 'projects', label: 'Portfolio Projects', icon: FolderGit2 },
    { id: 'resources', label: 'Learning Resources', icon: BookOpen },
    { id: 'resume', label: 'Resume ATS Analyzer', icon: FileCheck2 },
    { id: 'interview', label: 'Mock Interview Prep', icon: Mic },
    { id: 'assessment', label: 'Retake Assessment', icon: Compass },
    { id: 'profile', label: 'Profile & Settings', icon: User }
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-800 bg-slate-950 p-4 min-h-[calc(100vh-4rem)]">
      {/* Target Role Mini Widget */}
      <div className="mb-5 p-3 rounded-xl border border-slate-800/80 bg-slate-900/60">
        <div className="text-[11px] text-slate-400 font-medium">Target Placement Role</div>
        <div className="text-sm font-bold text-slate-100 truncate mt-0.5">{targetCareer}</div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">Readiness Score</span>
          <span className="font-mono font-semibold text-emerald-400">{readinessScore}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(100, readinessScore)}%` }}
          />
        </div>
      </div>

      {/* Nav List */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'} ${item.highlight ? 'text-violet-400' : ''}`} />
              <span className="truncate">{item.label}</span>
              {item.highlight && !isActive && (
                <span className="ml-auto text-[10px] text-violet-400 font-mono">AI</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* CareerAI Assurance footer note */}
      <div className="pt-4 border-t border-slate-900 text-[11px] text-slate-400 leading-relaxed">
        Explainable AI guidelines grounded in real placement syllabi.
      </div>
    </aside>
  );
};
