import { db } from '../db/store.ts';
import bcrypt from 'bcryptjs';
import { CareerEngine } from '../services/careerEngine.ts';
import { generateToken } from '../middleware/auth.ts';

async function runTests() {
  console.log('--- RUNNING CAREERAI UNIT & INTEGRATION TESTS ---');

  // Test 1: User Lookup & Password Hashing
  console.log('Test 1: Testing Demo User & Password Verification...');
  const demoUser = db.findUserByEmail('demo@careerai.dev');
  if (!demoUser) throw new Error('Demo user not found!');
  const isMatch = bcrypt.compareSync('password123', demoUser.passwordHash);
  if (!isMatch) throw new Error('Demo password bcrypt comparison failed!');
  console.log('✓ Demo user authentication passed');

  // Test 2: JWT Generation
  console.log('Test 2: Testing JWT Generation...');
  const token = generateToken(demoUser);
  if (!token || typeof token !== 'string') throw new Error('JWT token generation failed!');
  console.log('✓ JWT token generation passed');

  // Test 3: Explainable Career Matching Algorithm
  console.log('Test 3: Testing CareerEngine Match Calculation...');
  const matches = CareerEngine.calculateCareerMatches(demoUser);
  if (!matches || matches.length === 0) throw new Error('No career matches generated!');
  const topMatch = matches[0];
  if (typeof topMatch.matchScore !== 'number' || topMatch.matchScore < 40 || topMatch.matchScore > 100) {
    throw new Error('Invalid match score bounds: ' + topMatch.matchScore);
  }
  if (!topMatch.reasons || topMatch.reasons.length === 0) {
    throw new Error('Explainable reasons missing from top match!');
  }
  console.log(`✓ Career matching passed. Top match: ${topMatch.careerName} (${topMatch.matchScore}%)`);

  // Test 4: Skill Gap Analysis
  console.log('Test 4: Testing Skill Gap Matrix...');
  const gapReport = CareerEngine.analyzeSkillGaps(demoUser, 'ai-ml-engineer');
  if (!gapReport || gapReport.skills.length === 0) throw new Error('Skill gap calculation failed!');
  if (gapReport.strongCount === 0) throw new Error('Expected demo user to have strong skills!');
  console.log(`✓ Skill gap analysis passed: ${gapReport.strongCount} strong, ${gapReport.missingCount} missing`);

  // Test 5: Placement Readiness Score
  console.log('Test 5: Testing Placement Readiness Score...');
  const readiness = CareerEngine.calculatePlacementReadiness(demoUser);
  if (typeof readiness.overallScore !== 'number') throw new Error('Readiness calculation failed!');
  console.log(`✓ Placement readiness passed: ${readiness.overallScore}% (${readiness.indicator})`);

  // Test 6: Seed Integrity
  console.log('Test 6: Testing Seed Data counts...');
  const careers = db.getCareers();
  const projects = db.getProjects();
  const resources = db.getResources();
  if (careers.length < 10) throw new Error(`Insufficient careers: ${careers.length}`);
  if (projects.length < 10) throw new Error(`Insufficient projects: ${projects.length}`);
  if (resources.length < 10) throw new Error(`Insufficient resources: ${resources.length}`);
  console.log(`✓ Seed data verified: ${careers.length} careers, ${projects.length} projects, ${resources.length} resources`);

  console.log('\n--- ALL BACKEND CORE TESTS PASSED! ---');
}

runTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
