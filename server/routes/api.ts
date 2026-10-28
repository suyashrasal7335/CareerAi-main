import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, User } from '../db/store.ts';
import { generateToken, requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.ts';
import { CareerEngine } from '../services/careerEngine.ts';
import { AIService } from '../services/aiService.ts';
import { SEED_CAREERS } from '../config/seedData.ts';

const router = express.Router();

// ==========================================
// 1. AUTHENTICATION & PROFILE
// ==========================================

router.post('/auth/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      college,
      degree,
      branch,
      currentYear,
      graduationYear,
      cgpa,
      github,
      linkedin
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      college: college || '',
      degree: degree || 'B.Tech',
      branch: branch || 'Computer Science',
      currentYear: currentYear || '3rd Year',
      graduationYear: graduationYear || '2026',
      cgpa: cgpa || '',
      skills: ['Python', 'SQL', 'Git'],
      interests: ['Coding', 'AI', 'Web'],
      careerPreferences: {
        preferredCareer: 'Software Developer',
        workPreference: 'Full-time',
        startupVsMnc: 'Product Company',
        workEnvironment: 'Hybrid'
      },
      timeAvailability: '1-2 hours/day',
      careerGoal: 'Secure a high-paying product company placement',
      targetCareer: 'Full Stack Developer',
      github: github || '',
      linkedin: linkedin || '',
      onboardingCompleted: false
    });

    const token = generateToken(newUser);
    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ token, user: safeUser });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to sign in. Please try again.' });
  }
});

router.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { passwordHash: _, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const updates = req.body;
    // Don't allow password override via profile endpoint
    delete updates.passwordHash;
    delete updates.id;

    const updatedUser = db.updateUser(req.user.id, updates);
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    const { passwordHash: _, ...safeUser } = updatedUser;
    return res.json({ user: safeUser });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ==========================================
// 2. AI CAREER CHAT
// ==========================================

router.post('/chat', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { message, conversationId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    let conv = conversationId ? db.getConversationById(conversationId) : undefined;
    if (!conv || conv.userId !== req.user.id) {
      // Create new conversation
      const title = message.slice(0, 36) + (message.length > 36 ? '...' : '');
      conv = db.createConversation(req.user.id, title);
    }

    const userMsg = {
      id: 'msg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    db.addMessage(conv.id, userMsg);

    // Call AI Service with full user profile awareness
    const aiResponseText = await AIService.chatWithCareerAI(
      req.user,
      conv.messages,
      message.trim()
    );

    const assistantMsg = {
      id: 'msg_' + (Date.now() + 1).toString(36) + Math.random().toString(36).substring(2, 6),
      role: 'assistant' as const,
      content: aiResponseText,
      timestamp: new Date().toISOString()
    };

    const updatedConv = db.addMessage(conv.id, assistantMsg);
    return res.json({
      conversationId: conv.id,
      message: assistantMsg,
      conversation: updatedConv
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Failed to process chat message.' });
  }
});

router.get('/chat/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const conversations = db.getConversationsByUserId(req.user.id);
  return res.json({ conversations });
});

router.get('/chat/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const conv = db.getConversationById(req.params.id);
  if (!conv || conv.userId !== req.user.id) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }
  return res.json({ conversation: conv });
});

router.delete('/chat/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const success = db.deleteConversation(req.params.id, req.user.id);
  return res.json({ success });
});

router.post('/chat/clear/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const cleared = db.clearConversation(req.params.id, req.user.id);
  return res.json({ conversation: cleared });
});

// ==========================================
// 3. CAREERS & RECOMMENDATIONS
// ==========================================

router.get('/careers', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const careers = db.getCareers();
  return res.json({ careers });
});

router.get('/careers/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const career = db.getCareerById(req.params.id);
  if (!career) return res.status(404).json({ error: 'Career not found.' });
  return res.json({ career });
});

router.post('/careers/recommend', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let user = req.user;
    if (!user) {
      // If unauthenticated, use guest payload
      user = {
        id: 'guest',
        name: req.body.name || 'Student',
        email: 'guest@careerai.dev',
        passwordHash: '',
        degree: req.body.degree || 'B.Tech',
        branch: req.body.branch || 'Computer Science',
        skills: req.body.skills || ['Python', 'SQL'],
        interests: req.body.interests || ['Coding', 'Data'],
        careerPreferences: req.body.preferences || {},
        timeAvailability: req.body.timeAvailability || '2 hours/day',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const recommendations = await AIService.recommendCareersAI(user, req.body.assessmentAnswers);
    return res.json({ recommendations });
  } catch (err) {
    console.error('Career recommendation error:', err);
    return res.status(500).json({ error: 'Failed to generate recommendations.' });
  }
});

// ==========================================
// 4. ASSESSMENT
// ==========================================

router.post('/assessment', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { answers } = req.body;
    let user = req.user;
    if (!user) {
      user = {
        id: 'guest',
        name: answers?.name || 'Student',
        email: 'guest@careerai.dev',
        passwordHash: '',
        skills: answers?.skills || ['Python', 'JavaScript'],
        interests: answers?.interests || ['AI', 'Web'],
        degree: answers?.degree || 'B.Tech',
        branch: answers?.branch || 'Computer Science',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const recommendations = await AIService.recommendCareersAI(user, answers);

    // Save assessment record if user is logged in
    if (req.user) {
      const topCareer = recommendations[0]?.careerName || 'Full Stack Developer';
      db.saveAssessment({
        userId: req.user.id,
        answers: answers || {},
        scores: recommendations.reduce((acc, r) => ({ ...acc, [r.careerName]: r.matchScore }), {}),
        recommendations
      });

      // Update user target career
      db.updateUser(req.user.id, {
        targetCareer: topCareer,
        skills: Array.from(new Set([...(req.user.skills || []), ...(answers?.skills || [])])),
        interests: Array.from(new Set([...(req.user.interests || []), ...(answers?.interests || [])]))
      });
    }

    return res.json({ recommendations });
  } catch (err) {
    console.error('Assessment error:', err);
    return res.status(500).json({ error: 'Failed to process career assessment.' });
  }
});

router.get('/assessment/latest', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const record = db.getLatestAssessment(req.user.id);
  return res.json({ assessment: record || null });
});

// ==========================================
// 5. SKILL GAP ANALYSIS
// ==========================================

router.get('/skill-gap', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetCareerId = (req.query.careerId as string) ||
      (req.user?.targetCareer ? SEED_CAREERS.find(c => c.careerName.toLowerCase() === req.user?.targetCareer?.toLowerCase())?.id : undefined) ||
      'ai-ml-engineer';

    const dummyUser: User = req.user || {
      id: 'guest',
      name: 'Student',
      email: 'guest@careerai.dev',
      passwordHash: '',
      skills: ['Python', 'SQL', 'Git'],
      interests: ['AI', 'Data'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const report = CareerEngine.analyzeSkillGaps(dummyUser, targetCareerId);
    return res.json({ report });
  } catch (err) {
    console.error('Skill gap error:', err);
    return res.status(500).json({ error: 'Failed to analyze skill gaps.' });
  }
});

// ==========================================
// 6. PERSONALIZED ROADMAP
// ==========================================

router.get('/roadmap', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const careerId = req.query.careerId as string;
  const roadmap = db.getRoadmapByUserId(req.user.id, careerId);
  return res.json({ roadmap: roadmap || null });
});

router.post('/roadmap/generate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { careerId, durationMonths } = req.body;
    const targetId = careerId || (req.user.targetCareer ? SEED_CAREERS.find(c => c.careerName.toLowerCase() === req.user?.targetCareer?.toLowerCase())?.id : 'ai-ml-engineer') || 'ai-ml-engineer';
    const careerObj = SEED_CAREERS.find(c => c.id === targetId) || SEED_CAREERS[0];

    const months = await AIService.generatePersonalizedRoadmapAI(req.user, careerObj.id, durationMonths || 6);

    let totalTasks = 0;
    months.forEach(m => {
      totalTasks += (m.tasks || []).length;
    });

    const saved = db.saveRoadmap({
      userId: req.user.id,
      careerId: careerObj.id,
      careerTitle: careerObj.careerName,
      durationMonths: durationMonths || 6,
      totalTasks,
      completedTasks: 0,
      months
    });

    // Update user targetCareer
    db.updateUser(req.user.id, { targetCareer: careerObj.careerName });

    return res.json({ roadmap: saved });
  } catch (err) {
    console.error('Roadmap generate error:', err);
    return res.status(500).json({ error: 'Failed to generate personalized roadmap.' });
  }
});

router.put('/roadmap/task/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { status } = req.body;
  if (!['not-started', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid task status' });
  }

  const updatedRoadmap = db.updateTaskStatus(req.user.id, req.params.id, status);
  if (!updatedRoadmap) {
    return res.status(404).json({ error: 'Task or roadmap not found' });
  }
  return res.json({ roadmap: updatedRoadmap });
});

router.get('/roadmap/daily-plan', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dummyUser: User = req.user || {
      id: 'guest',
      name: 'Student',
      email: 'guest@careerai.dev',
      passwordHash: '',
      skills: ['Python', 'SQL', 'Git'],
      interests: ['AI', 'Data'],
      targetCareer: 'AI/ML Engineer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const target = (req.query.career as string) || dummyUser.targetCareer || 'AI/ML Engineer';
    const dailyPlan = await AIService.generateDailyPlanAI(dummyUser, target);
    return res.json({ dailyPlan });
  } catch (err) {
    console.error('Daily plan error:', err);
    return res.status(500).json({ error: 'Failed to generate daily plan.' });
  }
});

// ==========================================
// 7. PROJECTS & RESOURCES
// ==========================================

router.get('/projects', (req, res) => {
  const career = req.query.career as string;
  const difficulty = req.query.difficulty as string;
  const projects = db.getProjects(career, difficulty);
  return res.json({ projects });
});

router.get('/projects/recommended', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const targetCareer = req.user?.targetCareer || 'AI/ML Engineer';
  const projects = db.getProjects(targetCareer);
  return res.json({ projects: projects.length > 0 ? projects : db.getProjects().slice(0, 3) });
});

router.get('/resources', (req, res) => {
  const career = req.query.career as string;
  const type = req.query.type as string;
  const resources = db.getResources(career, type);
  return res.json({ resources });
});

// ==========================================
// 8. RESUME ANALYZER
// ==========================================

router.post('/resume/analyze', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { resumeText, fileName, targetCareer } = req.body;
    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide valid resume text or paste your resume content.' });
    }

    const career = targetCareer || req.user.targetCareer || 'Software Developer';
    const analysis = await AIService.analyzeResumeAI(resumeText, career);

    const saved = db.saveResumeAnalysis({
      userId: req.user.id,
      fileName: fileName || 'Uploaded_Resume.txt',
      targetCareer: career,
      score: analysis.score || 75,
      atsScore: analysis.atsScore || 80,
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      missingSkills: analysis.missingSkills || [],
      recommendedChanges: analysis.recommendedChanges || [],
      careerAlignment: analysis.careerAlignment || '',
      extractedSkills: analysis.extractedSkills || []
    });

    return res.json({ analysis: saved });
  } catch (err) {
    console.error('Resume analyze error:', err);
    return res.status(500).json({ error: 'Failed to analyze resume.' });
  }
});

router.get('/resume/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const history = db.getResumeAnalysesByUser(req.user.id);
  return res.json({ history });
});

// ==========================================
// 9. AI INTERVIEW PREPARATION
// ==========================================

router.post('/interview/start', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { career, difficulty, interviewType } = req.body;
    const selectedCareer = career || req.user.targetCareer || 'Software Developer';
    const selectedDiff = difficulty || 'Intermediate';
    const selectedType = interviewType || 'Technical';

    const questions = await AIService.generateInterviewQuestionsAI(
      selectedCareer,
      selectedDiff,
      selectedType
    );

    const session = db.createInterviewSession({
      userId: req.user.id,
      career: selectedCareer,
      difficulty: selectedDiff,
      interviewType: selectedType,
      currentQuestionIndex: 0,
      questions,
      answers: [],
      completed: false
    });

    return res.json({ session });
  } catch (err) {
    console.error('Interview start error:', err);
    return res.status(500).json({ error: 'Failed to start interview.' });
  }
});

router.post('/interview/answer', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { sessionId, answerText } = req.body;
    if (!sessionId || !answerText || !answerText.trim()) {
      return res.status(400).json({ error: 'Session ID and answer text are required.' });
    }

    const session = db.getInterviewSession(sessionId);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ error: 'Interview session not found.' });
    }

    const currentQ = session.questions[session.currentQuestionIndex];
    if (!currentQ) {
      return res.status(400).json({ error: 'No active question found.' });
    }

    // Evaluate answer with AI
    const evalResult = await AIService.evaluateInterviewAnswerAI(
      session.career,
      session.interviewType,
      currentQ.question,
      answerText.trim()
    );

    const answerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      userTranscript: answerText.trim(),
      score: evalResult.score || 7,
      strengths: evalResult.strengths || ['Good attempt'],
      weaknesses: evalResult.weaknesses || ['Could add more detail'],
      betterAnswer: evalResult.betterAnswer || currentQ.idealAnswer || '',
      followUpQuestion: evalResult.followUpQuestion
    };

    const nextIndex = session.currentQuestionIndex + 1;
    const isCompleted = nextIndex >= session.questions.length;

    let report = undefined;
    if (isCompleted) {
      const allAnswers = [...session.answers, answerRecord];
      const avgScore = allAnswers.reduce((sum, a) => sum + a.score, 0) / allAnswers.length;
      const overallPercent = Math.round(avgScore * 10);

      report = {
        technicalScore: Math.round(avgScore * 10),
        communicationScore: Math.min(100, Math.round(avgScore * 10 + 5)),
        problemSolvingScore: Math.max(50, Math.round(avgScore * 10 - 3)),
        overallScore: overallPercent,
        feedback: `Candidate demonstrated solid foundational grasp in ${session.career}. Emphasize practical metrics and trade-offs in future screening rounds.`,
        strengths: allAnswers.flatMap(a => a.strengths).slice(0, 4),
        areasForImprovement: allAnswers.flatMap(a => a.weaknesses).slice(0, 3)
      };
    }

    const updated = db.updateInterviewSession(session.id, {
      currentQuestionIndex: nextIndex,
      answers: [...session.answers, answerRecord],
      completed: isCompleted,
      report: report || session.report
    });

    return res.json({
      evaluation: answerRecord,
      session: updated
    });
  } catch (err) {
    console.error('Interview answer error:', err);
    return res.status(500).json({ error: 'Failed to evaluate interview answer.' });
  }
});

router.get('/interview/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const session = db.getInterviewSession(req.params.id);
  if (!session || session.userId !== req.user.id) {
    return res.status(404).json({ error: 'Interview session not found.' });
  }
  return res.json({ session });
});

// ==========================================
// 10. PLACEMENT READINESS SCORE
// ==========================================

router.get('/placement-readiness', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const dummyUser: User = req.user || {
      id: 'guest',
      name: 'Student',
      email: 'guest@careerai.dev',
      passwordHash: '',
      skills: ['Python', 'SQL', 'Git'],
      interests: ['AI', 'Data'],
      targetCareer: 'AI/ML Engineer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const readiness = CareerEngine.calculatePlacementReadiness(dummyUser);
    return res.json({ readiness });
  } catch (err) {
    console.error('Placement readiness error:', err);
    return res.status(500).json({ error: 'Failed to compute placement readiness.' });
  }
});

export default router;
