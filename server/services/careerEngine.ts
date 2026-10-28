import { SEED_CAREERS, CareerSeed } from '../config/seedData.ts';
import { User, db } from '../db/store.ts';

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

export class CareerEngine {
  /**
   * Deterministic, explainable career matching based on skill set, interests, and preferences
   */
  static calculateCareerMatches(user: User): CareerMatchResult[] {
    const userSkills = (user.skills || []).map(s => s.trim().toLowerCase());
    const userInterests = (user.interests || []).map(i => i.trim().toLowerCase());
    const userPref = (user.careerPreferences?.preferredCareer || user.targetCareer || '').toLowerCase();

    const results: CareerMatchResult[] = SEED_CAREERS.map(career => {
      const required = career.requiredSkills.map(s => s.toLowerCase());
      const optional = career.optionalSkills.map(s => s.toLowerCase());
      const interests = career.preferredInterests.map(i => i.toLowerCase());

      // 1. Skill Overlap (60% weight: 45% required, 15% optional)
      const matchedRequired = career.requiredSkills.filter(s => userSkills.includes(s.toLowerCase()));
      const missingRequired = career.requiredSkills.filter(s => !userSkills.includes(s.toLowerCase()));
      const matchedOptional = career.optionalSkills.filter(s => userSkills.includes(s.toLowerCase()));

      const requiredRatio = required.length > 0 ? matchedRequired.length / required.length : 0;
      const optionalRatio = optional.length > 0 ? matchedOptional.length / optional.length : 0;
      const skillScore = (requiredRatio * 0.45) + (optionalRatio * 0.15);

      // 2. Interest Overlap (25% weight)
      const matchedInterests = career.preferredInterests.filter(i => userInterests.includes(i.toLowerCase()));
      const interestRatio = interests.length > 0 ? matchedInterests.length / interests.length : 0.5;
      const interestScore = interestRatio * 0.25;

      // 3. Explicit Preference & Education Compatibility (15% weight)
      let preferenceBonus = 0.05;
      if (userPref && (career.careerName.toLowerCase().includes(userPref) || userPref.includes(career.careerName.toLowerCase()))) {
        preferenceBonus = 0.15;
      } else if (user.branch && (user.branch.toLowerCase().includes('computer') || user.branch.toLowerCase().includes('information'))) {
        preferenceBonus = 0.10;
      }

      const rawPercentage = Math.round((skillScore + interestScore + preferenceBonus) * 100);
      // Clamp between 35% and 96% for realistic student score
      const finalScore = Math.max(38, Math.min(96, rawPercentage));

      // Build explainable reasons
      const reasons: string[] = [];
      if (matchedRequired.length > 0) {
        reasons.push(`You already possess key skills: ${matchedRequired.slice(0, 3).join(', ')}.`);
      }
      if (matchedInterests.length > 0) {
        reasons.push(`Aligns directly with your interest in ${matchedInterests.join(' and ')}.`);
      }
      if (user.branch) {
        reasons.push(`Your background in ${user.degree || 'Degree'} ${user.branch} provides strong engineering context.`);
      }
      if (reasons.length === 0) {
        reasons.push('A versatile modern path with massive hiring demand for graduates.');
      }

      // Next step
      const topMissing = missingRequired[0] || career.optionalSkills[0] || 'Build a capstone project';
      const recommendedNextStep = `Focus on mastering ${topMissing} through guided projects.`;

      return {
        careerId: career.id,
        careerName: career.careerName,
        tagline: career.tagline,
        matchScore: finalScore,
        difficulty: career.difficulty,
        estPreparationMonths: career.estPreparationMonths,
        avgSalaryRange: career.avgSalaryRange,
        marketDemand: career.marketDemand,
        reasons,
        strengths: matchedRequired.concat(matchedOptional),
        missingSkills: missingRequired,
        developingSkills: matchedOptional,
        recommendedNextStep,
        roles: career.roles
      };
    });

    // Sort descending by match score
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Detailed Skill Gap Matrix
   */
  static analyzeSkillGaps(user: User, careerId: string): SkillGapReport {
    const career = SEED_CAREERS.find(c => c.id === careerId) || SEED_CAREERS[0];
    const userSkills = (user.skills || []).map(s => s.trim().toLowerCase());

    const items: SkillGapItem[] = [];
    let strongCount = 0;
    let developingCount = 0;
    let missingCount = 0;

    career.requiredSkills.forEach((skill, idx) => {
      const hasSkill = userSkills.includes(skill.toLowerCase());
      if (hasSkill) {
        strongCount++;
        items.push({
          skill,
          status: 'strong',
          importance: 'Essential',
          whyItMatters: `Core pillar of ${career.careerName} daily engineering workflows.`,
          prerequisites: ['Foundational logic'],
          estimatedHoursToLearn: 0,
          recommendedOrder: idx + 1
        });
      } else {
        missingCount++;
        items.push({
          skill,
          status: 'missing',
          importance: 'Essential',
          whyItMatters: `High frequency placement interview prerequisite for ${career.careerName}.`,
          prerequisites: ['Basic programming', 'Git version control'],
          estimatedHoursToLearn: 25,
          recommendedOrder: idx + 1
        });
      }
    });

    career.optionalSkills.forEach((skill, idx) => {
      const hasSkill = userSkills.includes(skill.toLowerCase());
      if (hasSkill) {
        developingCount++;
        items.push({
          skill,
          status: 'developing',
          importance: 'Recommended',
          whyItMatters: `Provides noticeable edge over competing candidates during technical screens.`,
          prerequisites: ['Core language fundamentals'],
          estimatedHoursToLearn: 10,
          recommendedOrder: career.requiredSkills.length + idx + 1
        });
      } else {
        missingCount++;
        items.push({
          skill,
          status: 'missing',
          importance: 'Recommended',
          whyItMatters: `Industry standard tool highly desired by tech recruiters.`,
          prerequisites: ['Basic CLI', 'Core concepts'],
          estimatedHoursToLearn: 20,
          recommendedOrder: career.requiredSkills.length + idx + 1
        });
      }
    });

    const matchObj = this.calculateCareerMatches(user).find(m => m.careerId === career.id);
    const score = matchObj ? matchObj.matchScore : 75;

    return {
      careerName: career.careerName,
      matchScore: score,
      strongCount,
      developingCount,
      missingCount,
      skills: items,
      overview: `You currently possess ${strongCount} strong and ${developingCount} developing skills required for ${career.careerName}. Bridging the remaining ${missingCount} gaps will position you in the top 15% of applicant pools.`,
      primaryAction: items.find(i => i.status === 'missing')?.skill
        ? `Start learning ${items.find(i => i.status === 'missing')!.skill} this week.`
        : 'Solidify your portfolio with a production-grade deployment.'
    };
  }

  /**
   * Placement Readiness Score
   */
  static calculatePlacementReadiness(user: User): PlacementReadinessReport {
    const targetCareerId = user.targetCareer
      ? SEED_CAREERS.find(c => c.careerName.toLowerCase() === user.targetCareer?.toLowerCase() || c.id === user.targetCareer)?.id || 'ai-ml-engineer'
      : 'ai-ml-engineer';

    const skillGapReport = this.analyzeSkillGaps(user, targetCareerId);
    const totalSkills = skillGapReport.strongCount + skillGapReport.developingCount + skillGapReport.missingCount;
    const skillsScore = totalSkills > 0
      ? Math.round(((skillGapReport.strongCount * 1.0 + skillGapReport.developingCount * 0.6) / totalSkills) * 100)
      : 50;

    // Roadmap progress
    const roadmap = db.getRoadmapByUserId(user.id);
    let roadmapScore = 40;
    if (roadmap && roadmap.totalTasks > 0) {
      roadmapScore = Math.round((roadmap.completedTasks / roadmap.totalTasks) * 100);
      roadmapScore = Math.max(25, roadmapScore);
    }

    // Resume score
    const resume = db.getLatestResumeAnalysis(user.id);
    const resumeScore = resume ? resume.score : 65;

    // Interview performance
    const interviewSessions = db.getInterviewSessionsByUser(user.id);
    let interviewScore = 60;
    if (interviewSessions.length > 0) {
      const avg = interviewSessions.reduce((acc, s) => acc + (s.report?.overallScore || 70), 0) / interviewSessions.length;
      interviewScore = Math.round(avg);
    }

    // Projects (derived from skills or completed roadmap)
    const projectsScore = Math.min(95, Math.round(skillsScore * 0.6 + roadmapScore * 0.4));

    // Weighted Overall Score
    // Skills (25%) + Projects (25%) + Resume (20%) + Interview (15%) + Roadmap (15%)
    const overallScore = Math.round(
      skillsScore * 0.25 +
      projectsScore * 0.25 +
      resumeScore * 0.20 +
      interviewScore * 0.15 +
      roadmapScore * 0.15
    );

    let indicator: 'Early Stage' | 'Promising' | 'Placement Ready' | 'Job Ready' = 'Early Stage';
    if (overallScore >= 85) indicator = 'Job Ready';
    else if (overallScore >= 72) indicator = 'Placement Ready';
    else if (overallScore >= 55) indicator = 'Promising';

    const keyWins: string[] = [];
    if (skillsScore >= 70) keyWins.push('Solid core technical skill foundation demonstrated.');
    if (resumeScore >= 75) keyWins.push('Resume is cleanly formatted with ATS compatibility.');
    if (roadmapScore >= 50) keyWins.push('Consistent milestone completion on learning roadmap.');
    if (interviewScore >= 70) keyWins.push('Sound technical and communication interview responses.');
    if (keyWins.length === 0) keyWins.push('Profile initialized and target career selected.');

    const immediatePriorities: string[] = [];
    if (skillGapReport.missingCount > 3) immediatePriorities.push(`Bridge ${skillGapReport.missingCount} critical skill gaps.`);
    if (resumeScore < 75) immediatePriorities.push('Upload and refine your resume with action verbs and metrics.');
    if (interviewSessions.length === 0) immediatePriorities.push('Complete at least one mock technical interview.');
    if (roadmapScore < 60) immediatePriorities.push('Check off current week roadmap deliverables.');

    return {
      overallScore,
      indicator,
      breakdown: {
        skillsScore,
        projectsScore,
        resumeScore,
        interviewScore,
        roadmapScore
      },
      keyWins,
      immediatePriorities,
      summary: `Your placement readiness is at ${overallScore}%. Based on your progress, you are currently in the "${indicator}" band for ${user.targetCareer || 'your chosen field'}.`
    };
  }
}
