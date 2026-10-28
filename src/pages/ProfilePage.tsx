import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { SEED_CAREERS } from '../../server/config/seedData.ts';
import {
  User,
  GraduationCap,
  Building2,
  Code2,
  Save,
  CheckCircle2,
  Github,
  Linkedin,
  Clock,
  Target
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    degree: user?.degree || 'B.Tech',
    branch: user?.branch || 'Computer Science and Engineering',
    currentYear: user?.currentYear || '3rd Year',
    graduationYear: user?.graduationYear || '2026',
    cgpa: user?.cgpa || '',
    targetCareer: user?.targetCareer || 'AI/ML Engineer',
    timeAvailability: user?.timeAvailability || '2 hours/day',
    careerGoal: user?.careerGoal || '',
    github: user?.github || '',
    linkedin: user?.linkedin || ''
  });

  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateUser({
        ...formData,
        skills
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md mb-2">
            <User className="h-3.5 w-3.5 text-indigo-400" />
            Student Credentials
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Keep your academic status and verified skill set updated for accurate AI recommendations.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="h-4 w-4" /> Changes saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Personal Details */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <h2 className="text-base font-bold text-white">Academic Profile</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">College / University</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Degree</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Branch</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Current Academic Year</label>
              <select
                name="currentYear"
                value={formData.currentYear}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Fresh Graduate">Fresh Graduate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Graduation Year</label>
              <input
                type="text"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">CGPA / Percentage</label>
              <input
                type="text"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Placement Role</label>
              <select
                name="targetCareer"
                value={formData.targetCareer}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                {SEED_CAREERS.map((c) => (
                  <option key={c.id} value={c.careerName}>{c.careerName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <h2 className="text-base font-bold text-white">Verified Technical Skills</h2>
          <p className="text-xs text-slate-400">These skills are used to calculate match percentages and identify skill gaps.</p>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-indigo-400 hover:text-rose-400 ml-1 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. PyTorch, Docker)"
              className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Target Goal & Socials */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <h2 className="text-base font-bold text-white">Placement Goals & Portfolios</h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Career Goal Vision</label>
            <textarea
              rows={3}
              name="careerGoal"
              value={formData.careerGoal}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">GitHub URL</label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3 text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
