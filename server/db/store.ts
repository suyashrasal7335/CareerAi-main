import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { SEED_CAREERS, SEED_PROJECTS, SEED_RESOURCES, CareerSeed, ProjectSeed, ResourceSeed } from '../config/seedData.ts';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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

export interface AssessmentRecord {
  id: string;
  userId: string;
  answers: Record<string, any>;
  scores: Record<string, number>;
  recommendations: any[];
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

export interface ResumeAnalysisRecord {
  id: string;
  userId: string;
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

interface DBData {
  users: User[];
  conversations: Conversation[];
  roadmaps: Roadmap[];
  assessments: AssessmentRecord[];
  interviewSessions: InterviewSession[];
  resumeAnalyses: ResumeAnalysisRecord[];
  careerProfiles: CareerSeed[];
  projects: ProjectSeed[];
  resources: ResourceSeed[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'careerai_db.json');

class DatabaseStore {
  private data: DBData;

  constructor() {
    this.data = {
      users: [],
      conversations: [],
      roadmaps: [],
      assessments: [],
      interviewSessions: [],
      resumeAnalyses: [],
      careerProfiles: SEED_CAREERS,
      projects: SEED_PROJECTS,
      resources: SEED_RESOURCES
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || [],
          conversations: parsed.conversations || [],
          roadmaps: parsed.roadmaps || [],
          assessments: parsed.assessments || [],
          interviewSessions: parsed.interviewSessions || [],
          resumeAnalyses: parsed.resumeAnalyses || [],
          careerProfiles: SEED_CAREERS, // Always keep fresh seeds
          projects: SEED_PROJECTS,
          resources: SEED_RESOURCES
        };
      } else {
        this.seedDemoUser();
        this.persist();
      }

      // Check if demo user exists
      if (!this.data.users.find(u => u.email === 'demo@careerai.dev')) {
        this.seedDemoUser();
        this.persist();
      }
    } catch (err) {
      console.error('Error initializing database file:', err);
    }
  }

  private seedDemoUser() {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);
    const demoUser: User = {
      id: 'demo-user-101',
      name: 'Alex Rivera',
      email: 'demo@careerai.dev',
      passwordHash,
      college: 'National Institute of Technology',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      currentYear: '3rd Year',
      graduationYear: '2026',
      cgpa: '8.7',
      skills: ['Python', 'SQL', 'C++', 'Git', 'JavaScript', 'Mathematics', 'Statistics', 'HTML', 'CSS'],
      interests: ['AI', 'Data', 'Coding', 'Research'],
      careerPreferences: {
        preferredCareer: 'AI/ML Engineer',
        workPreference: 'Full-time Job',
        industryPreference: 'Tech / AI Startups',
        higherStudiesVsJob: 'Direct Placement',
        startupVsMnc: 'Fast-paced Startup / Product MNC',
        workEnvironment: 'Hybrid',
        expectedSalaryRange: '12 – 18 LPA',
        preferredLocation: 'Bengaluru / Remote'
      },
      timeAvailability: '2 hours/day',
      careerGoal: 'I want to crack a top product company or AI startup placement as an AI/ML Engineer in the next 9 months.',
      targetCareer: 'AI/ML Engineer',
      github: 'https://github.com/alexrivera-demo',
      linkedin: 'https://linkedin.com/in/alexrivera-demo',
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users.push(demoUser);

    // Seed sample conversation for demo
    this.data.conversations.push({
      id: 'conv-demo-1',
      userId: demoUser.id,
      title: 'AI/ML Preparation Roadmap Advice',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hi! I am a 3rd year CSE student. I know Python, basic SQL, and math. How should I prepare for an AI/ML Engineer role?',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: `Welcome, Alex! You have an outstanding foundation for an **AI/ML Engineer** path. With strong **Python**, **C++**, and **Statistics**, you are already past the biggest initial hurdles.\n\n### Your Current Status:\n- **Match Score**: **87%** baseline fit for AI/ML\n- **Core Strengths**: Strong computational background, algorithm fundamentals, Python proficiency.\n- **Key Skill Gaps**: Deep Learning frameworks (PyTorch), MLOps pipelines, and vector retrieval (RAG).\n\n### Recommended 3-Step Strategy:\n1. **Deep Learning Fundamentals**: Study PyTorch and build CNN/Transformer architectures from scratch.\n2. **Applied Portfolio Project**: Build a real-world project like the *Customer Churn Prediction Model* or *AI Resume Keyword Matcher* with FastAPI and Docker.\n3. **Deployment**: Don't stop at Jupyter Notebooks—deploy your models behind REST endpoints.\n\nWould you like me to tailor a month-by-month learning plan or recommend your next project?`,
          timestamp: new Date(Date.now() - 3500000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3500000).toISOString()
    });

    // Seed sample roadmap for demo user
    this.data.roadmaps.push({
      id: 'roadmap-demo-1',
      userId: demoUser.id,
      careerId: 'ai-ml-engineer',
      careerTitle: 'AI/ML Engineer',
      durationMonths: 6,
      totalTasks: 18,
      completedTasks: 7,
      months: [
        {
          monthNumber: 1,
          title: 'Python Mastery, Linear Algebra & Applied Statistics',
          focus: 'Solidify vector math, statistical distributions, and high-performance NumPy/Pandas',
          topics: ['NumPy vectorization', 'Pandas exploratory data analysis', 'Probability distributions', 'Hypothesis testing'],
          goals: ['Clean and analyze 3 messy real-world datasets', 'Implement matrix operations and gradient descent from scratch'],
          tasks: [
            { id: 't-1', title: 'Master NumPy vectorization and broadcasting', description: 'Avoid Python loops, practice tensor reshapes and matrix products.', status: 'completed', estimatedHours: 12 },
            { id: 't-2', title: 'Exploratory Data Analysis with Pandas & Seaborn', description: 'Handle missing values, detect outliers, compute correlation matrices.', status: 'completed', estimatedHours: 14 },
            { id: 't-3', title: 'Inferential statistics & Central Limit Theorem', description: 'Calculate p-values, z-scores, confidence intervals for A/B testing.', status: 'completed', estimatedHours: 10 }
          ],
          projects: ['Student Placement Performance Dashboard']
        },
        {
          monthNumber: 2,
          title: 'Classical Machine Learning Algorithms & Scikit-Learn',
          focus: 'Master regression, classification, regularization, and ensemble algorithms',
          topics: ['Linear & Logistic Regression', 'Decision Trees & Random Forests', 'XGBoost / LightGBM', 'Cross-Validation & Grid Search'],
          goals: ['Understand bias-variance tradeoff', 'Tune hyperparameters to prevent overfitting on test sets'],
          tasks: [
            { id: 't-4', title: 'Implement Linear & Logistic Regression from scratch', description: 'Code cost functions and gradient descent updating without Scikit-Learn.', status: 'completed', estimatedHours: 16 },
            { id: 't-5', title: 'Master Scikit-Learn Pipeline and ColumnTransformer', description: 'Build reproducible pipelines preventing data leakage.', status: 'completed', estimatedHours: 12 },
            { id: 't-6', title: 'Train Gradient Boosted Trees (XGBoost)', description: 'Optimize learning rate, max depth, subsample ratios on tabular datasets.', status: 'completed', estimatedHours: 14 }
          ],
          projects: ['Customer Churn Prediction Model']
        },
        {
          monthNumber: 3,
          title: 'Deep Learning Foundations with PyTorch',
          focus: 'Neural network architectures, backpropagation, and CNNs/Transformers',
          topics: ['Tensors & Autograd', 'Loss Functions & Optimizers (Adam, SGD)', 'Convolutional Neural Networks', 'Transfer Learning'],
          goals: ['Train custom image classifier achieving 92%+ validation accuracy', 'Understand attention mechanisms'],
          tasks: [
            { id: 't-7', title: 'PyTorch Tensor manipulation and Autograd engine', description: 'Understand computational graphs and backward passes.', status: 'completed', estimatedHours: 14 },
            { id: 't-8', title: 'Build a multi-layer perceptron (MLP) for classification', description: 'Implement ReLU activation, Dropout regularization, and CrossEntropyLoss.', status: 'in-progress', estimatedHours: 16 },
            { id: 't-9', title: 'Fine-tune a Pretrained Vision Model (ResNet/ViT)', description: 'Use transfer learning to classify satellite or medical imagery.', status: 'not-started', estimatedHours: 18 }
          ],
          projects: ['Medical Scan Diagnostic Classifier']
        },
        {
          monthNumber: 4,
          title: 'Natural Language Processing & Large Language Models',
          focus: 'Tokenization, embeddings, HuggingFace Transformers, and RAG pipelines',
          topics: ['BPE Tokenization', 'Hugging Face Transformers', 'Vector Embeddings', 'Retrieval-Augmented Generation (RAG)'],
          goals: ['Build a production RAG application connected to domain documents', 'Fine-tune an open-source model with LoRA'],
          tasks: [
            { id: 't-10', title: 'Understand Transformer Architecture & Multi-Head Attention', description: 'Study Query, Key, Value calculations and positional encodings.', status: 'not-started', estimatedHours: 16 },
            { id: 't-11', title: 'Build a Vector Database RAG Search Pipeline', description: 'Index documents using sentence embeddings and query top-k chunks.', status: 'not-started', estimatedHours: 18 },
            { id: 't-12', title: 'Fine-tune open-weights LLMs using LoRA / PEFT', description: 'Fine-tune a lightweight model on instruction dataset using HuggingFace.', status: 'not-started', estimatedHours: 20 }
          ],
          projects: ['AI Resume & ATS Keyword Matcher']
        },
        {
          monthNumber: 5,
          title: 'MLOps, Model Deployment & API Engineering',
          focus: 'Turn research code into production APIs with Docker, FastAPI, and tracking',
          topics: ['FastAPI REST endpoints', 'Docker containerization', 'MLflow experiment tracking', 'Inference latency optimization'],
          goals: ['Deploy a model containerized on Cloud Run or AWS with <200ms latency', 'Set up automated model metrics'],
          tasks: [
            { id: 't-13', title: 'Wrap ML model in high-throughput FastAPI service', description: 'Implement Pydantic schemas, asynchronous workers, and batch prediction.', status: 'not-started', estimatedHours: 14 },
            { id: 't-14', title: 'Containerize ML application using Docker', description: 'Write multi-stage Dockerfiles optimizing image size under 1GB.', status: 'not-started', estimatedHours: 12 },
            { id: 't-15', title: 'Track model experiments with MLflow or Weights & Biases', description: 'Log hyperparameters, training curves, and model artifacts.', status: 'not-started', estimatedHours: 14 }
          ],
          projects: ['Production Inference Microservice']
        },
        {
          monthNumber: 6,
          title: 'Placement Preparation, Mock Interviews & Resume Polishing',
          focus: 'Cracking technical rounds, coding assessments, and system design',
          topics: ['Machine Learning System Design', 'Data Structures & Algorithms', 'Behavioral STAR stories', 'ATS Resume Optimization'],
          goals: ['Complete 5 full mock interviews', 'Finalize portfolio with 3 deployed live projects'],
          tasks: [
            { id: 't-16', title: 'Practice 50 medium LeetCode algorithms', description: 'Focus on Arrays, Two Pointers, Graphs, and Dynamic Programming.', status: 'not-started', estimatedHours: 25 },
            { id: 't-17', title: 'Master ML System Design (Recommender Systems, Search)', description: 'Handle candidate generation, ranking, latency budgets, and cold starts.', status: 'not-started', estimatedHours: 20 },
            { id: 't-18', title: 'Conduct 5 mock AI/ML interviews on CareerAI', description: 'Score above 80% on Technical and Problem-Solving rubrics.', status: 'not-started', estimatedHours: 12 }
          ],
          projects: ['Live Portfolio Website with Deployed Demos']
        }
      ],
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Seed sample resume analysis
    this.data.resumeAnalyses.push({
      id: 'resume-demo-1',
      userId: demoUser.id,
      fileName: 'Alex_Rivera_AI_Resume_2026.pdf',
      score: 82,
      atsScore: 85,
      targetCareer: 'AI/ML Engineer',
      strengths: [
        'Strong academic background in Computer Science with 8.7 CGPA',
        'Demonstrated foundational programming in Python and C++',
        'Included measurable metrics in academic projects',
        'Clean formatting and ATS-readable single-column layout'
      ],
      improvements: [
        'Missing production deployment details: specify FastAPI, Docker, and cloud hosting',
        'Deep learning section lacks PyTorch or Transformer project references',
        'Add quantitative impact statements (e.g., "improved F1-score by 14%")'
      ],
      missingSkills: ['PyTorch', 'MLOps', 'FastAPI', 'Docker', 'Transformers', 'Vector Databases'],
      recommendedChanges: [
        'Add a dedicated "Technologies" section separating Languages, Frameworks, and Tools',
        'Convert passive project descriptions to active impact verbs (Engineered, Architected, Optimized)',
        'Include GitHub repository links with clean README files and live demo links'
      ],
      careerAlignment: 'High alignment for Junior / Entry-Level ML Engineer roles with high placement potential.',
      extractedSkills: ['Python', 'C++', 'SQL', 'Git', 'Pandas', 'NumPy', 'Scikit-Learn', 'Linear Algebra', 'HTML', 'CSS'],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    });
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // Users
  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...userData,
      id: 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;
    const updated = {
      ...this.data.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.users[userIndex] = updated;
    this.persist();
    return updated;
  }

  // Careers
  getCareers(): CareerSeed[] {
    return this.data.careerProfiles;
  }

  getCareerById(id: string): CareerSeed | undefined {
    return this.data.careerProfiles.find(c => c.id === id || c.careerName.toLowerCase() === id.toLowerCase());
  }

  // Projects
  getProjects(careerFilter?: string, difficulty?: string): ProjectSeed[] {
    return this.data.projects.filter(p => {
      const matchCareer = !careerFilter || p.career.toLowerCase().includes(careerFilter.toLowerCase());
      const matchDiff = !difficulty || p.difficulty.toLowerCase() === difficulty.toLowerCase();
      return matchCareer && matchDiff;
    });
  }

  getProjectById(id: string): ProjectSeed | undefined {
    return this.data.projects.find(p => p.id === id);
  }

  // Resources
  getResources(careerFilter?: string, typeFilter?: string): ResourceSeed[] {
    return this.data.resources.filter(r => {
      const matchCareer = !careerFilter || r.career.toLowerCase().includes(careerFilter.toLowerCase());
      const matchType = !typeFilter || r.type.toLowerCase() === typeFilter.toLowerCase();
      return matchCareer && matchType;
    });
  }

  // Conversations & Chat
  getConversationsByUserId(userId: string): Conversation[] {
    return this.data.conversations
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getConversationById(id: string): Conversation | undefined {
    return this.data.conversations.find(c => c.id === id);
  }

  createConversation(userId: string, title?: string, initialMessage?: ChatMessage): Conversation {
    const newConv: Conversation = {
      id: 'conv_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      userId,
      title: title || 'New Career Consultation',
      messages: initialMessage ? [initialMessage] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.conversations.unshift(newConv);
    this.persist();
    return newConv;
  }

  addMessage(conversationId: string, message: ChatMessage): Conversation | undefined {
    const conv = this.data.conversations.find(c => c.id === conversationId);
    if (!conv) return undefined;
    conv.messages.push(message);
    conv.updatedAt = new Date().toISOString();
    this.persist();
    return conv;
  }

  deleteConversation(id: string, userId: string): boolean {
    const initialLen = this.data.conversations.length;
    this.data.conversations = this.data.conversations.filter(c => !(c.id === id && c.userId === userId));
    const deleted = this.data.conversations.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  clearConversation(id: string, userId: string): Conversation | undefined {
    const conv = this.data.conversations.find(c => c.id === id && c.userId === userId);
    if (!conv) return undefined;
    conv.messages = [];
    conv.updatedAt = new Date().toISOString();
    this.persist();
    return conv;
  }

  // Roadmaps
  getRoadmapByUserId(userId: string, careerId?: string): Roadmap | undefined {
    if (careerId) {
      return this.data.roadmaps.find(r => r.userId === userId && r.careerId === careerId);
    }
    return this.data.roadmaps.find(r => r.userId === userId);
  }

  saveRoadmap(roadmap: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>): Roadmap {
    const existingIndex = this.data.roadmaps.findIndex(r => r.userId === roadmap.userId && r.careerId === roadmap.careerId);
    const now = new Date().toISOString();
    if (existingIndex !== -1) {
      const updated: Roadmap = {
        ...this.data.roadmaps[existingIndex],
        ...roadmap,
        updatedAt: now
      };
      this.data.roadmaps[existingIndex] = updated;
      this.persist();
      return updated;
    }
    const created: Roadmap = {
      ...roadmap,
      id: 'rdmp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: now,
      updatedAt: now
    };
    this.data.roadmaps.push(created);
    this.persist();
    return created;
  }

  updateTaskStatus(userId: string, taskId: string, status: 'not-started' | 'in-progress' | 'completed'): Roadmap | undefined {
    const roadmap = this.data.roadmaps.find(r => r.userId === userId);
    if (!roadmap) return undefined;

    let found = false;
    let completedCount = 0;
    let totalCount = 0;

    for (const month of roadmap.months) {
      for (const task of month.tasks) {
        totalCount++;
        if (task.id === taskId) {
          task.status = status;
          found = true;
        }
        if (task.status === 'completed') {
          completedCount++;
        }
      }
    }

    if (!found) return undefined;

    roadmap.totalTasks = totalCount;
    roadmap.completedTasks = completedCount;
    roadmap.updatedAt = new Date().toISOString();
    this.persist();
    return roadmap;
  }

  // Assessments
  saveAssessment(record: Omit<AssessmentRecord, 'id' | 'createdAt'>): AssessmentRecord {
    const created: AssessmentRecord = {
      ...record,
      id: 'asmt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    this.data.assessments.unshift(created);
    this.persist();
    return created;
  }

  getLatestAssessment(userId: string): AssessmentRecord | undefined {
    return this.data.assessments.find(a => a.userId === userId);
  }

  // Interview Sessions
  createInterviewSession(session: Omit<InterviewSession, 'id' | 'createdAt' | 'updatedAt'>): InterviewSession {
    const created: InterviewSession = {
      ...session,
      id: 'intv_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.interviewSessions.unshift(created);
    this.persist();
    return created;
  }

  getInterviewSession(id: string): InterviewSession | undefined {
    return this.data.interviewSessions.find(s => s.id === id);
  }

  getInterviewSessionsByUser(userId: string): InterviewSession[] {
    return this.data.interviewSessions.filter(s => s.userId === userId);
  }

  updateInterviewSession(id: string, updates: Partial<InterviewSession>): InterviewSession | undefined {
    const idx = this.data.interviewSessions.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    const updated = {
      ...this.data.interviewSessions[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.interviewSessions[idx] = updated;
    this.persist();
    return updated;
  }

  // Resume Analyses
  saveResumeAnalysis(analysis: Omit<ResumeAnalysisRecord, 'id' | 'createdAt'>): ResumeAnalysisRecord {
    const created: ResumeAnalysisRecord = {
      ...analysis,
      id: 'resm_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    this.data.resumeAnalyses.unshift(created);
    this.persist();
    return created;
  }

  getResumeAnalysesByUser(userId: string): ResumeAnalysisRecord[] {
    return this.data.resumeAnalyses.filter(r => r.userId === userId);
  }

  getLatestResumeAnalysis(userId: string): ResumeAnalysisRecord | undefined {
    return this.data.resumeAnalyses.find(r => r.userId === userId);
  }
}

export const db = new DatabaseStore();
