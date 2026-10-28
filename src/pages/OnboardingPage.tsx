import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Code2,
  Clock,
  Target,
  Briefcase
} from 'lucide-react';

interface OnboardingPageProps {
  onNavigate: (tab: string) => void;
}

const PROGRAMMING_SKILLS = ['C', 'C++', 'Java', 'Python', 'JavaScript', 'TypeScript'];
const WEB_SKILLS = ['HTML', 'CSS', 'React', 'Node.js', 'Express', 'Tailwind CSS'];
const DATA_SKILLS = ['SQL', 'Excel', 'Power BI', 'Tableau', 'Pandas', 'NumPy', 'Statistics'];
const AI_SKILLS = ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'];
const CLOUD_SKILLS = ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'];
const SECURITY_SKILLS = ['Networking', 'Linux', 'Ethical Hacking', 'Cloud Security'];

const INTEREST_OPTIONS = [
  'Coding',
  'Data',
  'AI',
  'Cybersecurity',
  'Cloud',
  'Design',
  'Business',
  'Research',
  'Management'
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [cgpa, setCgpa] = useState(user?.cgpa || '8.2');
  const [degree, setDegree] = useState(user?.degree || 'B.Tech');
  const [branch, setBranch] = useState(user?.branch || 'Computer Science and Engineering');
  const [currentYear, setCurrentYear] = useState(user?.currentYear || '3rd Year');
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear || '2026');

  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || ['Python', 'SQL', 'Git']);
  const [customSkill, setCustomSkill] = useState('');

  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || ['AI', 'Coding']);

  const [careerPref, setCareerPref] = useState({
    preferredCareer: user?.targetCareer || 'AI/ML Engineer',
    workPreference: 'Full-time Job',
    higherStudiesVsJob: 'Direct Job Placement',
    startupVsMnc: 'Fast-paced Startup / Product MNC',
    workEnvironment: 'Hybrid',
    expectedSalaryRange: '10 – 18 LPA'
  });

  const [timeAvailability, setTimeAvailability] = useState(user?.timeAvailability || '2 hours/day');
  const [careerGoal, setCareerGoal] = useState(
    user?.careerGoal || 'I want to get placed as an AI/ML Engineer within the next 9 months.'
  );

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateUser({
        cgpa,
        degree,
        branch,
        currentYear,
        graduationYear,
        skills: selectedSkills,
        interests: selectedInterests,
        careerPreferences: careerPref,
        timeAvailability,
        careerGoal,
        targetCareer: careerPref.preferredCareer,
        onboardingCompleted: true
      });
      onNavigate('dashboard');
    } catch (err) {
      console.error('Onboarding update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Step {step} of 6</span>
            <span className="font-semibold text-indigo-400">
              {step === 1 && 'Education Details'}
              {step === 2 && 'Technical Skills'}
              {step === 3 && 'Aptitude & Interests'}
              {step === 4 && 'Career Preferences'}
              {step === 5 && 'Time Availability'}
              {step === 6 && 'Career Goal'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Education */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Academic Background</h2>
              <p className="text-xs text-slate-400 mt-1">This helps CareerAI calibrate your course prerequisites and placement timelines.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Branch / Specialization</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Current Academic Year</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
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
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Current CGPA or Percentage</label>
                <input
                  type="text"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 8.5 / 85%"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Recruiters use CGPA thresholds for eligibility screening.</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Select Your Current Skills</h2>
              <p className="text-xs text-slate-400 mt-1">Select the technologies you have coded with or feel comfortable with.</p>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2">Programming Languages</div>
                <div className="flex flex-wrap gap-2">
                  {PROGRAMMING_SKILLS.map((s) => {
                    const sel = selectedSkills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          sel
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {sel ? '✓ ' : '+ '}{s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2">Web & Backend</div>
                <div className="flex flex-wrap gap-2">
                  {WEB_SKILLS.map((s) => {
                    const sel = selectedSkills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          sel
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {sel ? '✓ ' : '+ '}{s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2">Data & Analytics</div>
                <div className="flex flex-wrap gap-2">
                  {DATA_SKILLS.map((s) => {
                    const sel = selectedSkills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          sel
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {sel ? '✓ ' : '+ '}{s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2">AI, ML & Math</div>
                <div className="flex flex-wrap gap-2">
                  {AI_SKILLS.map((s) => {
                    const sel = selectedSkills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          sel
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {sel ? '✓ ' : '+ '}{s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2">Cloud & Security</div>
                <div className="flex flex-wrap gap-2">
                  {[...CLOUD_SKILLS, ...SECURITY_SKILLS].map((s) => {
                    const sel = selectedSkills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          sel
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {sel ? '✓ ' : '+ '}{s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Skill Input */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-300 mb-1.5">Add custom skill</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="e.g. Next.js, FastAPI, OpenCV"
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">What Excites You?</h2>
              <p className="text-xs text-slate-400 mt-1">Select the disciplines you find engaging or enjoy reading about.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-semibold flex items-center justify-between">
                      {interest}
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Career Preferences */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Placement Preferences</h2>
              <p className="text-xs text-slate-400 mt-1">Tell us your targets regarding company type and work culture.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Career Track</label>
                <select
                  value={careerPref.preferredCareer}
                  onChange={(e) => setCareerPref(prev => ({ ...prev, preferredCareer: e.target.value }))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                  <option value="Cloud Engineer">Cloud Engineer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Software Developer">Software Developer (Core / SDE)</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Mobile App Developer">Mobile App Developer</option>
                  <option value="Database Engineer">Database Engineer</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Company Environment</label>
                  <select
                    value={careerPref.startupVsMnc}
                    onChange={(e) => setCareerPref(prev => ({ ...prev, startupVsMnc: e.target.value }))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Fast-paced Startup / Product MNC">Product Startup / High-growth MNC</option>
                    <option value="Tier-1 FAANG / Large Tech MNC">Tier-1 Large Tech Enterprise</option>
                    <option value="IT Services & Consulting">IT Services & Consulting Firm</option>
                    <option value="Open to all">Open to all opportunities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Setup</label>
                  <select
                    value={careerPref.workEnvironment}
                    onChange={(e) => setCareerPref(prev => ({ ...prev, workEnvironment: e.target.value }))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Hybrid">Hybrid (2-3 days office)</option>
                    <option value="Remote">100% Remote</option>
                    <option value="In-office">In-office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Expected Entry Package Range</label>
                <select
                  value={careerPref.expectedSalaryRange}
                  onChange={(e) => setCareerPref(prev => ({ ...prev, expectedSalaryRange: e.target.value }))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="6 – 10 LPA">6 – 10 LPA</option>
                  <option value="10 – 18 LPA">10 – 18 LPA</option>
                  <option value="18 – 30 LPA">18 – 30+ LPA</option>
                  <option value="Competitive Market Rate">Competitive Market Rate</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Time Availability */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Daily Learning Commitment</h2>
              <p className="text-xs text-slate-400 mt-1">How much time can you dedicate outside college coursework?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: '30 minutes / day', sub: 'Light pace, maintenance and steady reading' },
                { label: '1 hour / day', sub: 'Standard progress, 1 concept + small exercises' },
                { label: '2 hours / day', sub: 'Recommended for campus placement prep (6–9 mo)' },
                { label: '3+ hours / day', sub: 'Intensive bootcamp pace for rapid transformation' }
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setTimeAvailability(opt.label)}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    timeAvailability === opt.label
                      ? 'border-indigo-500 bg-indigo-500/15 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-100">{opt.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Career Goal */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">State Your Target Career Goal</h2>
              <p className="text-xs text-slate-400 mt-1">CareerAI uses this vision to prioritize your roadmap milestones.</p>
            </div>

            <div>
              <textarea
                rows={4}
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. I want to crack a top product company or AI startup placement as an AI/ML Engineer in the next 9 months."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400">Quick suggestions:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  'Place as an AI/ML Engineer within 12 months with 15+ LPA package',
                  'Become a Full Stack Developer building scalable cloud applications',
                  'Crack SDE-1 coding and system design rounds for top product companies',
                  'Transition into Data Science with an end-to-end portfolio'
                ].map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => setCareerGoal(sugg)}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-left"
                  >
                    "{sugg}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
            >
              Next Step <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinish}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-2.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Building Roadmap...' : 'Launch My Career Dashboard →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
