import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Compass,
  MessageSquare,
  Sparkles,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  FileText,
  Target,
  Briefcase
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, logout, loginDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Career<span className="text-indigo-400">AI</span>
              </span>
              <span className="hidden sm:block text-[11px] text-slate-400 -mt-1 font-medium">
                Student to Career Copilot
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4 text-sm font-medium">
            {!user ? (
              <>
                <button
                  onClick={() => onNavigate('landing')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    currentTab === 'landing' ? 'text-white bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate('assessment')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    currentTab === 'assessment' ? 'text-white bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Career Assessment
                </button>
                <button
                  onClick={() => onNavigate('careers')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    currentTab === 'careers' ? 'text-white bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Explore Careers
                </button>
                <button
                  onClick={() => onNavigate('about')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    currentTab === 'about' ? 'text-white bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  About
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    currentTab === 'dashboard' ? 'text-white bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate('chat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    currentTab === 'chat' ? 'text-white bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                  AI Chat
                </button>
                <button
                  onClick={() => onNavigate('roadmap')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    currentTab === 'roadmap' ? 'text-white bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  Roadmap
                </button>
                <button
                  onClick={() => onNavigate('interview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    currentTab === 'interview' ? 'text-white bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  Mock Interview
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right CTA / Auth controls */}
        <div className="flex items-center gap-3">
          {!user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={loginDemo}
                className="hidden sm:inline-flex items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 hover:text-white transition-colors"
                title="Log in instantly with seeded student profile"
              >
                Instant Demo Account
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-md transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 text-left p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="font-semibold text-slate-200 truncate max-w-[120px]">{user.name}</div>
                  <div className="text-slate-400 text-[11px] truncate max-w-[120px]">{user.targetCareer || 'Student'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  logout();
                  onNavigate('landing');
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-2">
          {!user ? (
            <>
              <button
                onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                Home
              </button>
              <button
                onClick={() => { onNavigate('assessment'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                Career Assessment
              </button>
              <button
                onClick={() => { onNavigate('careers'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                Explore Careers
              </button>
              <button
                onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                About
              </button>
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => { loginDemo(); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                >
                  Instant Demo Student Login
                </button>
                <button
                  onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2 text-sm text-slate-300 rounded-lg bg-slate-900"
                >
                  Sign In
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                Dashboard
              </button>
              <button
                onClick={() => { onNavigate('chat'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                AI Career Chat
              </button>
              <button
                onClick={() => { onNavigate('recommendations'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                Recommendations
              </button>
              <button
                onClick={() => { onNavigate('roadmap'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                Personalized Roadmap
              </button>
              <button
                onClick={() => { onNavigate('skill-gap'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                Skill Gap Analysis
              </button>
              <button
                onClick={() => { onNavigate('projects'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                Projects
              </button>
              <button
                onClick={() => { onNavigate('resources'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                Learning Resources
              </button>
              <button
                onClick={() => { onNavigate('resume'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                Resume ATS Analyzer
              </button>
              <button
                onClick={() => { onNavigate('interview'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                Mock Interview
              </button>
              <button
                onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 px-3 text-sm text-slate-300 hover:text-white rounded-md"
              >
                My Profile
              </button>
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => { logout(); onNavigate('landing'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2 text-sm text-rose-400 bg-rose-500/10 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
