import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { OnboardingPage } from './pages/OnboardingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AIChatPage } from './pages/AIChatPage.tsx';
import { CareerAssessmentPage } from './pages/CareerAssessmentPage.tsx';
import { CareerRecommendationsPage } from './pages/CareerRecommendationsPage.tsx';
import { CareerDetailsPage } from './pages/CareerDetailsPage.tsx';
import { SkillGapPage } from './pages/SkillGapPage.tsx';
import { PersonalizedRoadmapPage } from './pages/PersonalizedRoadmapPage.tsx';
import { ProjectsPage } from './pages/ProjectsPage.tsx';
import { LearningResourcesPage } from './pages/LearningResourcesPage.tsx';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage.tsx';
import { InterviewPrepPage } from './pages/InterviewPrepPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { ExploreCareersPage } from './pages/ExploreCareersPage.tsx';
import { CareerMatchResult } from './types/index.ts';

const AppContent: React.FC = () => {
  const { user, loading, loginDemo } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [tabParam, setTabParam] = useState<string | undefined>(undefined);
  const [assessmentResults, setAssessmentResults] = useState<CareerMatchResult[]>([]);

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    setTabParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAssessmentComplete = (results: CareerMatchResult[]) => {
    setAssessmentResults(results);
    setCurrentTab('recommendations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickDemo = async () => {
    await loginDemo();
    setCurrentTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-indigo-500 animate-ping" />
          <span>Loading CareerAI Engine...</span>
        </div>
      </div>
    );
  }

  // Determine if active view is an authenticated workspace view
  const workspaceTabs = [
    'dashboard',
    'chat',
    'recommendations',
    'roadmap',
    'skill-gap',
    'projects',
    'resources',
    'resume',
    'interview',
    'profile'
  ];

  const isWorkspace = workspaceTabs.includes(currentTab) && !!user;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Universal Navbar */}
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        {/* Workspace Sidebar (visible on authenticated desktop screens) */}
        {isWorkspace && (
          <Sidebar
            currentTab={currentTab}
            onNavigate={handleNavigate}
            targetCareer={user?.targetCareer || 'AI/ML Engineer'}
          />
        )}

        {/* Page Routing */}
        <main className="flex-1 min-w-0">
          {currentTab === 'landing' && (
            <LandingPage
              onNavigate={handleNavigate}
              onQuickDemo={handleQuickDemo}
            />
          )}

          {currentTab === 'about' && (
            <AboutPage onNavigate={handleNavigate} />
          )}

          {currentTab === 'login' && (
            <LoginPage onNavigate={handleNavigate} />
          )}

          {currentTab === 'register' && (
            <RegisterPage onNavigate={handleNavigate} />
          )}

          {currentTab === 'onboarding' && (
            <OnboardingPage onNavigate={handleNavigate} />
          )}

          {currentTab === 'dashboard' && (
            user ? (
              <DashboardPage onNavigate={handleNavigate} />
            ) : (
              <LoginPage onNavigate={handleNavigate} />
            )
          )}

          {currentTab === 'chat' && (
            user ? (
              <AIChatPage onNavigate={handleNavigate} />
            ) : (
              <LoginPage onNavigate={handleNavigate} />
            )
          )}

          {currentTab === 'assessment' && (
            <CareerAssessmentPage
              onAssessmentComplete={handleAssessmentComplete}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'recommendations' && (
            <CareerRecommendationsPage
              initialRecommendations={assessmentResults.length > 0 ? assessmentResults : undefined}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'career-detail' && (
            <CareerDetailsPage
              careerId={tabParam || 'ai-ml-engineer'}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'skill-gap' && (
            <SkillGapPage
              careerId={tabParam}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'roadmap' && (
            user ? (
              <PersonalizedRoadmapPage
                careerId={tabParam}
                onNavigate={handleNavigate}
              />
            ) : (
              <LoginPage onNavigate={handleNavigate} />
            )
          )}

          {currentTab === 'projects' && (
            <ProjectsPage onNavigate={handleNavigate} />
          )}

          {currentTab === 'resources' && (
            <LearningResourcesPage />
          )}

          {currentTab === 'resume' && (
            user ? (
              <ResumeAnalyzerPage />
            ) : (
              <LoginPage onNavigate={handleNavigate} />
            )
          )}

          {currentTab === 'interview' && (
            user ? (
              <InterviewPrepPage />
            ) : (
              <LoginPage onNavigate={handleNavigate} />
            )
          )}

          {currentTab === 'careers' && (
            <ExploreCareersPage onNavigate={handleNavigate} />
          )}

          {currentTab === 'profile' && (
            user ? (
              <ProfilePage />
            ) : (
              <LoginPage onNavigate={handleNavigate} />
            )
          )}
        </main>
      </div>

      {/* Global Minimal Footer for Public Pages */}
      {!isWorkspace && currentTab !== 'chat' && (
        <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">CareerAI</span>
              <span>·</span>
              <span>AI-powered roadmap from student to career</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button onClick={() => handleNavigate('careers')} className="hover:text-slate-200">13 Career Tracks</button>
              <button onClick={() => handleNavigate('assessment')} className="hover:text-slate-200">Assessment</button>
              <button onClick={() => handleNavigate('about')} className="hover:text-slate-200">Philosophy</button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
