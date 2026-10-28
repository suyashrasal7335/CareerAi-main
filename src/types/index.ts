export interface User {
  id: string;
  name: string;
  email: string;
  college?: string;
  degree?: string;
  branch?: string;
  currentYear?: string;
  graduationYear?: string;
  cgpa?: string;
  skills: string[];
  interests: string[];
  careerPreferences?: {
    preferredCareer?: string;
    workPreference?: string;
    industryPreference?: string;
    higherStudiesVsJob?: string;
    startupVsMnc?: string;
    workEnvironment?: string;
    expectedSalaryRange?: string;
    preferredLocation?: string;
  };
  timeAvailability?: string;
  careerGoal?: string;
  targetCareer?: string;
  github?: string;
  linkedin?: string;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CareerSeed {
  id: string;
  careerName: string;
  tagline: string;
  description: string;
  roles: string[];
  requiredSkills: string[];
  optionalSkills: string[];
  preferredInterests: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estPreparationMonths: string;
  avgSalaryRange: string;
  marketDemand: 'High' | 'Very High' | 'Growing' | 'Explosive';
  overview: string;
  responsibilities: string[];
  toolsAndTech: string[];
  beginnerMilestones: string[];
  intermediateMilestones: string[];
  advancedMilestones: string[];
  interviewTopics: string[];
  certifications: string[];
}

export interface CareerMatchResult {
  careerId: string;
  careerName: string;
  tagline: string;
  matchScore: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estPreparationMonths: string;
  avgSalaryRange: string;
  marketDemand: string;
  reasons: string[];
  strengths: string[];
  missingSkills: string[];
  developingSkills: string[];
  recommendedNextStep: string;
  roles: string[];
}

export interface SkillGapItem {
  skill: string;
  status: 'strong' | 'developing' | 'missing';
  importance: 'Essential' | 'Recommended' | 'Bonus';
  whyItMatters: string;
  prerequisites: string[];
  estimatedHoursToLearn: number;
  recommendedOrder: number;
}

export interface SkillGapReport {
  careerName: string;
  matchScore: number;
  strongCount: number;
  developingCount: number;
  missingCount: number;
  skills: SkillGapItem[];
  overview: string;
  primaryAction: string;
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
  estimatedHours: number;
  resources?: string[];
}

export interface RoadmapMonth {
  monthNumber: number;
  title: string;
  focus: string;
  topics: string[];
  goals: string[];
  tasks: RoadmapTask[];
  projects: string[];
}

export interface Roadmap {
  id: string;
  userId: string;
  careerId: string;
  careerTitle: string;
  durationMonths: number;
  totalTasks: number;
  completedTasks: number;
  months: RoadmapMonth[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyPlan {
  topic: string;
  estimatedMinutes: number;
  rationale: string;
  planBreakdown: { time: string; task: string }[];
  quickQuiz: string;
}

export interface ProjectSeed {
  id: string;
  title: string;
  career: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  technologies: string[];
  skills: string[];
  description: string;
  problemStatement: string;
  features: string[];
  architecture: string;
  estDuration: string;
  portfolioValue: string;
}

export interface ResourceSeed {
  id: string;
  title: string;
  type: 'Course' | 'Documentation' | 'YouTube' | 'Book' | 'Practice' | 'Certification';
  url: string;
  provider: string;
  career: string;
  skills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isFree: boolean;
  description: string;
}

export interface ResumeAnalysis {
  id: string;
  fileName: string;
  score: number;
  atsScore: number;
  targetCareer: string;
  strengths: string[];
  improvements: string[];
  missingSkills: string[];
  recommendedChanges: string[];
  careerAlignment: string;
  extractedSkills: string[];
  createdAt: string;
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  category: string;
  idealAnswer?: string;
}

export interface InterviewAnswerRecord {
  questionId: string;
  questionText: string;
  userTranscript: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  betterAnswer: string;
  followUpQuestion?: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  career: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  interviewType: 'Technical' | 'HR' | 'Behavioral' | 'Coding' | 'System Design';
  currentQuestionIndex: number;
  questions: InterviewQuestionItem[];
  answers: InterviewAnswerRecord[];
  completed: boolean;
  report?: {
    technicalScore: number;
    communicationScore: number;
    problemSolvingScore: number;
    overallScore: number;
    feedback: string;
    strengths: string[];
    areasForImprovement: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface PlacementReadinessReport {
  overallScore: number;
  indicator: 'Early Stage' | 'Promising' | 'Placement Ready' | 'Job Ready';
  breakdown: {
    skillsScore: number;
    projectsScore: number;
    resumeScore: number;
    interviewScore: number;
    roadmapScore: number;
  };
  keyWins: string[];
  immediatePriorities: string[];
  summary: string;
}
