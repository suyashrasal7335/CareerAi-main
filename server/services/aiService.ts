import { GoogleGenAI } from '@google/genai';
import { User, ChatMessage, RoadmapMonth } from '../db/store.ts';
import { CareerEngine } from './careerEngine.ts';
import { SEED_CAREERS } from '../config/seedData.ts';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const MODEL_NAME = process.env.AI_MODEL || 'gemini-3.8-flash';

export class AIService {
  /**
   * Career Chatbot with User Profile Context Awareness
   */
  static async chatWithCareerAI(
    user: User,
    history: ChatMessage[],
    userMessage: string
  ): Promise<string> {
    const client = getAIClient();

    const userProfileSummary = `
Student Profile:
- Name: ${user.name}
- Education: ${user.degree || 'Degree'} in ${user.branch || 'Engineering'}, ${user.college || 'University'} (Year: ${user.currentYear || '3rd Year'}, Grad: ${user.graduationYear || '2026'}, CGPA: ${user.cgpa || '8.5'})
- Target Career: ${user.targetCareer || 'Software / AI'}
- Skills: ${(user.skills || []).join(', ') || 'Python, C++, SQL, Git'}
- Interests: ${(user.interests || []).join(', ') || 'Coding, AI, Data'}
- Available Daily Time: ${user.timeAvailability || '1-2 hours/day'}
- Career Goal: ${user.careerGoal || 'Secure a high-paying product company role'}
- Preferences: Work: ${user.careerPreferences?.workPreference || 'Full-time'}, Company: ${user.careerPreferences?.startupVsMnc || 'Product MNC / Startup'}, Environment: ${user.careerPreferences?.workEnvironment || 'Hybrid'}
`.trim();

    const systemInstruction = `
You are CareerAI, an expert career mentor, technical advisor, learning planner, and placement coach for college students and fresh graduates.

YOUR PERSONALITY & RULES:
1. Tone: Encouraging, honest, practical, personalized, and beginner-friendly.
2. Context Awareness: Always use the student's profile context provided. Never ask for their branch or skills if already given.
3. Radical Honesty: Do NOT blindly tell students that every career is trivial. If their current skills do not match a career, clearly explain the gap and give an actionable bridge.
4. AI Safety: Do not claim certainty about someone's future (avoid "You will definitely get placed"). Say "Based on your current profile, this path is a strong fit...".
5. Practical Advice: Recommend specific technologies, portfolio projects, exact milestones, and interview tactics instead of vague advice.
6. Formatting: Use clean markdown, bullet points, and code snippets when relevant. Keep responses structured and scannable.
`.trim();

    if (!client) {
      // High-quality contextual fallback
      return this.generateFallbackChatResponse(user, userMessage);
    }

    try {
      // Build conversation turns
      const recentMessages = history.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'CareerAI'}: ${m.content}`).join('\n\n');
      const prompt = `
System Context:
${systemInstruction}

${userProfileSummary}

Conversation History:
${recentMessages}

User's Latest Query:
${userMessage}

Respond directly as CareerAI with tailored advice:
`.trim();

      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      return response.text || this.generateFallbackChatResponse(user, userMessage);
    } catch (err) {
      console.error('Gemini chat error:', err);
      return this.generateFallbackChatResponse(user, userMessage);
    }
  }

  /**
   * AI-Enhanced Career Recommendations
   */
  static async recommendCareersAI(user: User, assessmentAnswers?: Record<string, any>): Promise<any[]> {
    const baselineMatches = CareerEngine.calculateCareerMatches(user);
    const client = getAIClient();

    if (!client) {
      return baselineMatches;
    }

    try {
      const prompt = `
You are an expert AI Career Matchmaker. Review this student's profile and baseline matches. Return an array of top 5 career recommendations with personalized reasons, strengths, skill gaps, and next steps in valid JSON format.

Student Profile:
- Degree: ${user.degree} ${user.branch} (${user.currentYear})
- Skills: ${user.skills.join(', ')}
- Interests: ${user.interests.join(', ')}
- Target/Preference: ${user.targetCareer || user.careerPreferences?.preferredCareer || 'Not specified'}
- Available Time: ${user.timeAvailability}
- Assessment Answers: ${JSON.stringify(assessmentAnswers || {})}

Top Baseline Candidates:
${baselineMatches.slice(0, 5).map(m => `- ${m.careerName} (Baseline Match: ${m.matchScore}%)`).join('\n')}

Output must be a JSON array of objects with keys:
- careerId (e.g. 'ai-ml-engineer')
- careerName (string)
- matchScore (number between 50 and 96)
- reasons (array of strings explaining why this matches)
- strengths (array of user's matching skills)
- missingSkills (array of critical missing skills)
- difficulty ('Beginner' | 'Intermediate' | 'Advanced')
- estPreparationMonths (string, e.g. '5–7 months')
- recommendedNextStep (string)

Return ONLY valid JSON.
`;

      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with enriched seed data
        return parsed.map((item: any) => {
          const original = baselineMatches.find(b => b.careerId === item.careerId || b.careerName.toLowerCase() === item.careerName?.toLowerCase()) || baselineMatches[0];
          return {
            ...original,
            ...item,
            careerId: original.careerId,
            careerName: original.careerName,
            matchScore: typeof item.matchScore === 'number' ? item.matchScore : original.matchScore,
            roles: original.roles,
            avgSalaryRange: original.avgSalaryRange,
            marketDemand: original.marketDemand
          };
        });
      }
    } catch (err) {
      console.warn('AI recommendation refinement error, using baseline engine:', err);
    }

    return baselineMatches;
  }

  /**
   * Personalized Roadmap Generator
   */
  static async generatePersonalizedRoadmapAI(
    user: User,
    targetCareerId: string,
    durationMonths: number = 6
  ): Promise<RoadmapMonth[]> {
    const career = SEED_CAREERS.find(c => c.id === targetCareerId) || SEED_CAREERS[0];
    const skillGap = CareerEngine.analyzeSkillGaps(user, career.id);
    const client = getAIClient();

    if (!client) {
      return this.generateAlgorithmicRoadmap(user, career, durationMonths, skillGap);
    }

    try {
      const prompt = `
Generate a personalized, month-by-month career roadmap for a student aiming to become a "${career.careerName}".
Duration: ${durationMonths} months.
Student Skills: ${user.skills.join(', ')}.
Missing Skills: ${skillGap.skills.filter(s => s.status === 'missing').map(s => s.skill).join(', ')}.
Available Time: ${user.timeAvailability || '2 hours/day'}.

Return a JSON array of ${durationMonths} month objects with keys:
- monthNumber (1 to ${durationMonths})
- title (string)
- focus (string)
- topics (array of 3-4 strings)
- goals (array of 2 strings)
- tasks (array of 3 task objects: { id: "t_mX_Y", title: string, description: string, status: "not-started", estimatedHours: number })
- projects (array of 1 string project title)

Return ONLY valid JSON.
`;

      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn('AI roadmap generation error, using fallback template:', err);
    }

    return this.generateAlgorithmicRoadmap(user, career, durationMonths, skillGap);
  }

  /**
   * Resume Analyzer
   */
  static async analyzeResumeAI(resumeText: string, targetCareer: string = 'Software Developer'): Promise<any> {
    const client = getAIClient();

    if (!client) {
      return this.generateFallbackResumeAnalysis(resumeText, targetCareer);
    }

    try {
      const prompt = `
Analyze the following student resume for the target role of "${targetCareer}".
Act as a senior technical recruiter and ATS evaluation system.

Resume Text:
"""
${resumeText.slice(0, 5000)}
"""

Evaluate thoroughly and return a JSON object with:
- score: number (overall quality 0 to 100)
- atsScore: number (ATS readability and keyword density 0 to 100)
- careerAlignment: string (1-2 sentences on how well this resume matches ${targetCareer})
- strengths: array of 4 bullet points highlighting strong aspects
- improvements: array of 3-4 constructive critiques
- missingSkills: array of 5-8 high-demand skills/keywords missing for ${targetCareer}
- recommendedChanges: array of 3 actionable bullet points (e.g. rewrite bullet points with X-Y-Z formula)
- extractedSkills: array of detected skills found in resume

Return ONLY valid JSON.
`;

      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      console.warn('Gemini resume evaluation error:', err);
      return this.generateFallbackResumeAnalysis(resumeText, targetCareer);
    }
  }

  /**
   * AI Interview Simulator: Question Generation
   */
  static async generateInterviewQuestionsAI(
    career: string,
    difficulty: string,
    interviewType: string
  ): Promise<{ id: string; question: string; category: string; idealAnswer?: string }[]> {
    const client = getAIClient();

    if (!client) {
      return this.getFallbackInterviewQuestions(career, difficulty, interviewType);
    }

    try {
      const prompt = `
You are an expert technical interviewer conducting a mock interview for the role of "${career}".
Interview Type: ${interviewType} (${difficulty} difficulty).

Generate 4 realistic interview questions.
Return a JSON array of 4 objects:
- id: string ("q1", "q2", "q3", "q4")
- question: string (the interviewer's prompt)
- category: string (e.g., "Algorithms", "System Design", "Behavioral", "Core Concepts")
- idealAnswer: string (brief 2-3 sentence overview of what a strong candidate covers)

Return ONLY valid JSON.
`;

      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (err) {
      console.warn('Interview question generation error:', err);
    }

    return this.getFallbackInterviewQuestions(career, difficulty, interviewType);
  }

  /**
   * AI Interview Simulator: Answer Evaluation
   */
  static async evaluateInterviewAnswerAI(
    career: string,
    interviewType: string,
    question: string,
    userAnswer: string
  ): Promise<any> {
    const client = getAIClient();

    if (!client) {
      return this.getFallbackAnswerEvaluation(userAnswer);
    }

    try {
      const prompt = `
Role: Senior Interviewer for "${career}" (${interviewType} round).
Question asked: "${question}"
Candidate Answer: "${userAnswer}"

Evaluate this answer. Return a JSON object with:
- score: number (1 to 10 scale)
- strengths: array of 2 bullet points
- weaknesses: array of 2 bullet points
- betterAnswer: string (a crisp, high-scoring model answer that a top-tier candidate would give)
- followUpQuestion: string (a logical follow-up question the interviewer would ask next)

Return ONLY valid JSON.
`;

      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      console.warn('Gemini interview answer eval error:', err);
      return this.getFallbackAnswerEvaluation(userAnswer);
    }
  }

  /**
   * Daily Learning Planner: "What should I learn today?"
   */
  static async generateDailyPlanAI(user: User, targetCareer: string): Promise<any> {
    const client = getAIClient();

    if (!client) {
      return {
        topic: 'Core Technical Project & Concepts',
        estimatedMinutes: 60,
        rationale: `Consistent daily progress builds confidence for ${targetCareer} campus placements.`,
        planBreakdown: [
          { time: '20 min', task: 'Deep-dive theoretical concept & syntax' },
          { time: '25 min', task: 'Hands-on practical code implementation' },
          { time: '10 min', task: 'Solve 2 practice questions / debugging' },
          { time: '5 min', task: 'Commit to GitHub and update roadmap task' }
        ],
        quickQuiz: 'What is the primary trade-off in this topic, and when would you avoid using it?'
      };
    }

    try {
      const prompt = `
Generate a high-impact, 60-minute daily learning plan for student ${user.name}.
Target Career: ${targetCareer}.
Skills: ${user.skills.join(', ')}.

Return a JSON object:
- topic: string (specific focused topic, e.g. "Decision Tree Splitting Criteria" or "React Query Caching")
- estimatedMinutes: number (60)
- rationale: string (why this matters for placement right now)
- planBreakdown: array of 4 objects { time: string, task: string }
- quickQuiz: string (1 placement interview question to test comprehension)

Return ONLY valid JSON.
`;

      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return {
        topic: 'Foundational Problem Solving & Pipeline Design',
        estimatedMinutes: 60,
        rationale: `Preparation for upcoming technical screening rounds.`,
        planBreakdown: [
          { time: '20 min', task: 'Review core algorithm complexity & design pattern' },
          { time: '25 min', task: 'Code the solution end-to-end' },
          { time: '10 min', task: 'Test edge cases & error handlers' },
          { time: '5 min', task: 'Log progress on CareerAI roadmap' }
        ],
        quickQuiz: 'Can you articulate the time and space complexity of your implementation?'
      };
    }
  }

  // --- Fallback Handlers ---

  private static generateFallbackChatResponse(user: User, message: string): string {
    const query = message.toLowerCase();
    const target = user.targetCareer || 'Software Engineering';

    if (query.includes('which career') || query.includes('best for me') || query.includes('recommend')) {
      const matches = CareerEngine.calculateCareerMatches(user);
      const top = matches[0];
      return `### Career Recommendations for ${user.name}\n\nBased on your background in **${user.degree || 'Degree'} ${user.branch || 'Engineering'}** and current skills in **${(user.skills || []).slice(0, 4).join(', ')}**:\n\n1. **${top.careerName}** — **${top.matchScore}% Match**\n   - **Why?** ${top.reasons.join(' ')}\n   - **Key Strengths:** ${top.strengths.slice(0, 3).join(', ')}\n   - **Next Skill to Learn:** ${top.missingSkills[0] || 'Advanced concepts'}\n\n2. **${matches[1].careerName}** — **${matches[1].matchScore}% Match**\n   - **Why?** ${matches[1].reasons[0]}\n\nWould you like me to generate a personalized month-by-month roadmap for **${top.careerName}**?`;
    }

    if (query.includes('missing') || query.includes('skill gap')) {
      const gap = CareerEngine.analyzeSkillGaps(user, target.toLowerCase().replace(/[\/\s]/g, '-'));
      const missing = gap.skills.filter(s => s.status === 'missing').slice(0, 4);
      return `### Skill Gap Breakdown for ${target}\n\nHere is what you have vs. what recruiters expect for campus placements:\n\n- **Skills You Have:** ${(user.skills || []).slice(0, 5).join(', ')}\n- **Critical Missing Skills:**\n${missing.map(m => `  - **${m.skill}**: ${m.whyItMatters} (Est. ${m.estimatedHoursToLearn} hrs)`).join('\n')}\n\n**Action Item:** ${gap.primaryAction}`;
    }

    if (query.includes('roadmap') || query.includes('month')) {
      return `### 6-Month Placement Roadmap for ${target}\n\nHere is your structured progression:\n\n- **Month 1:** Core Fundamentals & Advanced Language Idioms\n- **Month 2:** Algorithms, Data Structures & Relational Systems\n- **Month 3:** Framework Mastery & Full-featured Project\n- **Month 4:** Advanced Architecture & Production Tooling\n- **Month 5:** Capstone Deployment & Cloud Hosting\n- **Month 6:** ATS Resume Tailoring & Mock Technical Interviews\n\nCheck your **Personalized Roadmap** tab to toggle tasks and track your live completion percentage!`;
    }

    if (query.includes('project') || query.includes('portfolio')) {
      return `### Recommended Projects for ${target}\n\nTo stand out to recruiters, avoid generic tutorial projects. Build these instead:\n\n1. **Production-Grade Capstone**: Build a multi-tier application with authentication, database indexing, and containerized Docker deployment.\n2. **Domain-Specific Tool**: Build a project addressing a real campus or student problem with measurable metrics.\n\nVisit the **Projects** tab to view complete architectural blueprints and step-by-step guides.`;
    }

    if (query.includes('resume')) {
      return `### Resume Optimization Advice\n\nFor tech placements:\n1. **Use the Google X-Y-Z formula**: "Accomplished [X] as measured by [Y], by doing [Z]".\n2. **Single-Column ATS Layout**: Avoid double columns, tables, or complex graphic bars for skills.\n3. **Include Live Links**: Every project must have a working GitHub repo with a clean README and live deployed link.\n\nUse our **Resume Analyzer** tab to test your ATS score right now!`;
    }

    return `Hello ${user.name}! As your Career Copilot, I'm here to help you navigate your journey toward becoming a successful **${target}**.\n\nI can help you with:\n- Identifying which career path matches your interests\n- Pinpointing missing skills & generating month-by-month learning plans\n- Recommending portfolio projects that impress tech recruiters\n- Conducting real-time mock interviews with scoring\n\nWhat would you like to focus on today?`;
  }

  private static generateAlgorithmicRoadmap(user: User, career: any, durationMonths: number, skillGap: any): RoadmapMonth[] {
    const missing = skillGap.skills.filter((s: any) => s.status === 'missing');
    const months: RoadmapMonth[] = [];

    const monthFocuses = [
      { title: 'Core Foundations & Language Proficiency', focus: 'Master syntax, computational thinking, and tooling' },
      { title: 'Core Libraries & Data Management', focus: 'Build strong data manipulation and database querying habits' },
      { title: 'Applied Engineering & Architecture', focus: 'Translate fundamentals into modular services' },
      { title: 'Advanced Frameworks & Deployment', focus: 'Containerization, cloud deployment, and system reliability' },
      { title: 'Capstone Project & Portfolio Engineering', focus: 'Complete an end-to-end production-grade portfolio showcase' },
      { title: 'Placement Preparation & Interview Mastery', focus: 'Technical problem-solving rounds and behavioral STAR stories' }
    ];

    for (let m = 1; m <= durationMonths; m++) {
      const idx = (m - 1) % monthFocuses.length;
      const f = monthFocuses[idx];
      const assignedSkill = missing[(m - 1) % (missing.length || 1)]?.skill || career.requiredSkills[0];

      months.push({
        monthNumber: m,
        title: `Month ${m}: ${f.title}`,
        focus: f.focus,
        topics: [assignedSkill, `${career.careerName} best practices`, 'Code Quality', 'Testing'],
        goals: [`Solidify mastery of ${assignedSkill}`, `Build milestone deliverable for Month ${m}`],
        tasks: [
          { id: `t_${m}_1`, title: `Learn core concepts of ${assignedSkill}`, description: `Complete official docs and tutorials on ${assignedSkill}.`, status: 'not-started', estimatedHours: 12 },
          { id: `t_${m}_2`, title: `Hands-on mini-project using ${assignedSkill}`, description: `Build a clean, documented mini-module with error handling.`, status: 'not-started', estimatedHours: 14 },
          { id: `t_${m}_3`, title: `Solve 10 practice placement questions`, description: `Test understanding with timed technical questions.`, status: 'not-started', estimatedHours: 8 }
        ],
        projects: [`${career.careerName} Milestone Project #${m}`]
      });
    }

    return months;
  }

  private static generateFallbackResumeAnalysis(resumeText: string, targetCareer: string) {
    const text = resumeText.toLowerCase();
    const hasPython = text.includes('python');
    const hasReact = text.includes('react');
    const hasSql = text.includes('sql');
    const hasGit = text.includes('git');

    const detected: string[] = [];
    if (hasPython) detected.push('Python');
    if (hasReact) detected.push('React');
    if (hasSql) detected.push('SQL');
    if (hasGit) detected.push('Git');
    if (text.includes('javascript')) detected.push('JavaScript');
    if (text.includes('c++')) detected.push('C++');
    if (text.includes('docker')) detected.push('Docker');

    return {
      score: 78,
      atsScore: 82,
      careerAlignment: `The resume demonstrates a solid academic baseline with relevant project work suitable for entry-level ${targetCareer} openings.`,
      strengths: [
        'Clear educational timeline with degree, institution, and graduation year.',
        'Good technical skill keywords listed in an easy-to-parse format.',
        'Included practical academic or personal development projects.',
        'Clean single-column structure favorable for standard ATS scrapers.'
      ],
      improvements: [
        'Bullet points describe tasks rather than quantified business/engineering impact.',
        `Missing cloud deployment and modern CI/CD tooling standard for ${targetCareer}.`,
        'Add live URLs for hosted applications and clean GitHub repositories.'
      ],
      missingSkills: ['Docker', 'AWS / Cloud Deployment', 'Unit Testing', 'CI/CD Pipelines', 'System Design Basics'],
      recommendedChanges: [
        'Quantify achievements: Use numbers, percentages, or performance metrics in at least 3 bullet points.',
        'Add a "Technical Skills" section with distinct categories: Languages, Frameworks, Tools, and Databases.',
        'Ensure contact information includes LinkedIn, GitHub, and professional email.'
      ],
      extractedSkills: detected.length > 0 ? detected : ['Python', 'SQL', 'Git', 'Problem Solving']
    };
  }

  private static getFallbackInterviewQuestions(career: string, difficulty: string, interviewType: string) {
    if (interviewType === 'HR' || interviewType === 'Behavioral') {
      return [
        { id: 'q1', question: 'Tell me about yourself, your technical background, and why you are interested in this role.', category: 'Introduction', idealAnswer: 'Elevator pitch covering CS education, passion for tech, key projects built, and alignment with the company mission.' },
        { id: 'q2', question: 'Describe a difficult bug or technical challenge you faced in a project and how you resolved it.', category: 'Problem Solving (STAR)', idealAnswer: 'Situation, Task, Action taken (debugging methodology, logging), and the final Result with lessons learned.' },
        { id: 'q3', question: 'How do you handle working on a team when another developer disagrees with your architectural choice?', category: 'Collaboration', idealAnswer: 'Active listening, evaluating trade-offs with objective data/benchmarks, and committing to team decisions.' },
        { id: 'q4', question: 'Where do you see your technical career progressing over the next 2 to 3 years?', category: 'Career Vision', idealAnswer: 'Demonstrates curiosity, eagerness to master system depth, and desire to contribute to production features.' }
      ];
    }

    return [
      { id: 'q1', question: `What are the core foundational principles of ${career}, and how do they impact system performance?`, category: 'Core Concepts', idealAnswer: 'Clear definition with trade-offs between speed, memory, and maintainability.' },
      { id: 'q2', question: 'Explain how you would diagnose and debug a high-latency issue in a production application.', category: 'Troubleshooting & Profiling', idealAnswer: 'Network inspection, CPU/memory profiling, query optimization with EXPLAIN, and caching layers.' },
      { id: 'q3', question: 'Walk me through how you choose between SQL and NoSQL for a given application requirement.', category: 'Architecture & Data', idealAnswer: 'ACID guarantees vs horizontal scaling, structured relational constraints vs flexible schema documents.' },
      { id: 'q4', question: `What are the security best practices you always adhere to when building software for ${career}?`, category: 'Security & Quality', idealAnswer: 'Input validation, parameterized queries, secret management via environment variables, and principle of least privilege.' }
    ];
  }

  private static getFallbackAnswerEvaluation(answer: string) {
    const len = answer.trim().length;
    let score = 7;
    if (len < 50) score = 5;
    else if (len > 250) score = 8;

    return {
      score,
      strengths: [
        'Addressed the prompt directly with relevant domain terminology.',
        'Demonstrated clear conceptual familiarity with engineering trade-offs.'
      ],
      weaknesses: [
        'Could provide more concrete quantitative metrics or real-world project examples.',
        'Answer could follow the structured STAR (Situation-Task-Action-Result) format more explicitly.'
      ],
      betterAnswer: `A top candidate would structure this by first stating the core definition, detailing a specific project where they implemented it, explaining the latency/memory trade-offs considered, and summarizing the measurable outcome.`,
      followUpQuestion: 'How would your solution scale if the traffic volume or dataset grew by 100x?'
    };
  }
}
