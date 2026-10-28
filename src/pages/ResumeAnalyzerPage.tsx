import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { ResumeAnalysis } from '../types/index.ts';
import {
  FileCheck2,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

const SAMPLE_STUDENT_RESUME = `ALEX RIVERA
B.Tech in Computer Science and Engineering | 8.7 CGPA | Batch of 2026
Email: alex.rivera@example.com | GitHub: github.com/alexrivera-demo | LinkedIn: linkedin.com/in/alexrivera-demo

EDUCATION:
National Institute of Technology
B.Tech in Computer Science and Engineering, 2022 - 2026
Coursework: Data Structures, Algorithms, Database Management, Operating Systems, Machine Learning

TECHNICAL SKILLS:
- Languages: Python, C++, SQL, JavaScript
- Frameworks & Libraries: NumPy, Pandas, Scikit-Learn, React, Express
- Developer Tools: Git, Linux, Jupyter Notebook, Postman

PROJECTS:
1. Student Placement Performance Analytics Dashboard
- Analyzed 5,000+ placement records to discover correlation between CGPA, project count, and salary offers.
- Cleaned dataset using Python Pandas and built SQL queries for branch distributions.
- Created interactive Power BI visualizations with custom DAX measures.

2. Customer Churn Prediction System
- Built supervised classification models using Logistic Regression and Random Forest.
- Handled class imbalance using SMOTE and achieved 85% accuracy on test set.
- Serialized model using Joblib and served predictions via local script.

EXTRACURRICULAR & LEADERSHIP:
- Technical Lead, Campus Open Source Club: Hosted 3 Git and Python workshops for 120+ first-year students.
- Finalist, Regional College Hackathon 2024.`;

export const ResumeAnalyzerPage: React.FC = () => {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('My_Resume.txt');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      setError('Please provide at least 50 characters of resume text to evaluate.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.analyzeResume(
        resumeText,
        fileName,
        user?.targetCareer || 'AI/ML Engineer'
      );
      setAnalysis(res.analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setResumeText(text);
    };
    reader.readAsText(file);
  };

  const loadSample = () => {
    setResumeText(SAMPLE_STUDENT_RESUME);
    setFileName('Alex_Rivera_Resume_2026.txt');
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md mb-2">
          <FileCheck2 className="h-3.5 w-3.5 text-indigo-400" />
          Recruiter & ATS Optimization
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Resume & ATS Keyword Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Targeting: <strong className="text-white">{user?.targetCareer || 'AI/ML Engineer'}</strong>. Scan your resume for keyword match rates, formatting readability, and impact framing.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Paste your resume text below:</span>
            <button
              onClick={loadSample}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Insert Sample Student Resume
            </button>
          </div>

          <textarea
            rows={12}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your education, skills, projects, and work experience text here..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
          />

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-white transition-colors">
              <Upload className="h-4 w-4" />
              <span>Import .txt / .md / source</span>
              <input type="file" accept=".txt,.md,.rtf" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleAnalyze}
              disabled={loading || !resumeText.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? 'Evaluating ATS Metrics...' : 'Analyze Resume'}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4 text-xs text-slate-300">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> What ATS Scanners Look For:
          </h3>
          <ul className="space-y-2 text-slate-400">
            <li>• <strong>Hard Technical Keywords</strong>: Exact matches for languages, frameworks, and database engines.</li>
            <li>• <strong>Google X-Y-Z Formula</strong>: "Accomplished [X] as measured by [Y], by doing [Z]".</li>
            <li>• <strong>Clean Single-Column Layout</strong>: Multi-column tables often confuse standard parsing bots.</li>
            <li>• <strong>Live Artifacts</strong>: Working GitHub repo links with clean READMEs and deployed demos.</li>
          </ul>
        </div>
      </div>

      {/* Analysis Output */}
      {analysis && (
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-8 animate-fadeIn">
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400 font-medium">Evaluated Document:</div>
              <h2 className="text-xl font-bold text-white">{analysis.fileName}</h2>
              <div className="text-xs text-slate-400 mt-1">{analysis.careerAlignment}</div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-slate-400">Overall Score</div>
                <div className="text-4xl font-extrabold font-mono text-indigo-400 mt-1">{analysis.score}/100</div>
              </div>

              <div className="text-center">
                <div className="text-xs text-slate-400">ATS Readability</div>
                <div className="text-4xl font-extrabold font-mono text-emerald-400 mt-1">{analysis.atsScore}/100</div>
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Strong Elements
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {analysis.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Constructive Improvements
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {analysis.improvements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">!</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wide">
              High-Demand Missing Keywords for {analysis.targetCareer}
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((sk) => (
                <span key={sk} className="px-3 py-1 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/40 text-xs font-medium">
                  + {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Changes */}
          <div className="p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
              Actionable Bullet Point Rewrites
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {analysis.recommendedChanges.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
