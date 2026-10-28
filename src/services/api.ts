import {
  User,
  Conversation,
  CareerSeed,
  CareerMatchResult,
  SkillGapReport,
  Roadmap,
  DailyPlan,
  ProjectSeed,
  ResourceSeed,
  ResumeAnalysis,
  InterviewSession,
  PlacementReadinessReport
} from '../types/index.ts';

const TOKEN_KEY = 'careerai_jwt_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY)
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data && data.error) errMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  async register(data: any): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    tokenStorage.set(res.token);
    return res;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    tokenStorage.set(res.token);
    return res;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    return request<{ user: User }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  logout(): void {
    tokenStorage.clear();
  },

  // Chat
  async sendChatMessage(message: string, conversationId?: string): Promise<{
    conversationId: string;
    message: any;
    conversation: Conversation;
  }> {
    return request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId })
    });
  },

  async getChatHistory(): Promise<{ conversations: Conversation[] }> {
    return request('/api/chat/history');
  },

  async getConversation(id: string): Promise<{ conversation: Conversation }> {
    return request(`/api/chat/${id}`);
  },

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    return request(`/api/chat/${id}`, { method: 'DELETE' });
  },

  async clearConversation(id: string): Promise<{ conversation: Conversation }> {
    return request(`/api/chat/clear/${id}`, { method: 'POST' });
  },

  // Careers & Assessment
  async getCareers(): Promise<{ careers: CareerSeed[] }> {
    return request('/api/careers');
  },

  async getCareerById(id: string): Promise<{ career: CareerSeed }> {
    return request(`/api/careers/${id}`);
  },

  async getCareerRecommendations(data?: any): Promise<{ recommendations: CareerMatchResult[] }> {
    return request('/api/careers/recommend', {
      method: 'POST',
      body: JSON.stringify(data || {})
    });
  },

  async submitAssessment(answers: Record<string, any>): Promise<{ recommendations: CareerMatchResult[] }> {
    return request('/api/assessment', {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  // Skill Gap
  async getSkillGap(careerId?: string): Promise<{ report: SkillGapReport }> {
    const query = careerId ? `?careerId=${encodeURIComponent(careerId)}` : '';
    return request(`/api/skill-gap${query}`);
  },

  // Roadmap
  async getRoadmap(careerId?: string): Promise<{ roadmap: Roadmap | null }> {
    const query = careerId ? `?careerId=${encodeURIComponent(careerId)}` : '';
    return request(`/api/roadmap${query}`);
  },

  async generateRoadmap(careerId?: string, durationMonths: number = 6): Promise<{ roadmap: Roadmap }> {
    return request('/api/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify({ careerId, durationMonths })
    });
  },

  async updateTaskStatus(taskId: string, status: 'not-started' | 'in-progress' | 'completed'): Promise<{ roadmap: Roadmap }> {
    return request(`/api/roadmap/task/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async getDailyPlan(career?: string): Promise<{ dailyPlan: DailyPlan }> {
    const query = career ? `?career=${encodeURIComponent(career)}` : '';
    return request(`/api/roadmap/daily-plan${query}`);
  },

  // Projects & Resources
  async getProjects(career?: string, difficulty?: string): Promise<{ projects: ProjectSeed[] }> {
    const params = new URLSearchParams();
    if (career) params.append('career', career);
    if (difficulty) params.append('difficulty', difficulty);
    return request(`/api/projects?${params.toString()}`);
  },

  async getResources(career?: string, type?: string): Promise<{ resources: ResourceSeed[] }> {
    const params = new URLSearchParams();
    if (career) params.append('career', career);
    if (type) params.append('type', type);
    return request(`/api/resources?${params.toString()}`);
  },

  // Resume
  async analyzeResume(resumeText: string, fileName?: string, targetCareer?: string): Promise<{ analysis: ResumeAnalysis }> {
    return request('/api/resume/analyze', {
      method: 'POST',
      body: JSON.stringify({ resumeText, fileName, targetCareer })
    });
  },

  async getResumeHistory(): Promise<{ history: ResumeAnalysis[] }> {
    return request('/api/resume/history');
  },

  // Interview Prep
  async startInterview(career: string, difficulty: string, interviewType: string): Promise<{ session: InterviewSession }> {
    return request('/api/interview/start', {
      method: 'POST',
      body: JSON.stringify({ career, difficulty, interviewType })
    });
  },

  async submitInterviewAnswer(sessionId: string, answerText: string): Promise<{ evaluation: any; session: InterviewSession }> {
    return request('/api/interview/answer', {
      method: 'POST',
      body: JSON.stringify({ sessionId, answerText })
    });
  },

  async getInterviewSession(id: string): Promise<{ session: InterviewSession }> {
    return request(`/api/interview/${id}`);
  },

  // Placement Readiness
  async getPlacementReadiness(): Promise<{ readiness: PlacementReadinessReport }> {
    return request('/api/placement-readiness');
  }
};
