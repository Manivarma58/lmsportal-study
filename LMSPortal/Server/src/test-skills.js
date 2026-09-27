import {
  calculateSkillScore,
  calculateProficiencyLevel,
  calculateConfidenceLevel,
  calculateTrend,
  SKILL_CONFIG,
} from './services/skillScoringEngine.js';
import { connectDB, closeDB } from './config/db.js';
import Skill from './models/Skill.js';
import LearnerSkillProgress from './models/LearnerSkillProgress.js';
import User from './models/User.js';
import { recordSkillEvidence, getLearnerSkills, recalculateSkillScore } from './services/skillService.js';

let passedTests = 0;
let failedTests = 0;

const assert = (condition, description) => {
  if (condition) {
    console.log(`  ✓ PASS: ${description}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${description}`);
    failedTests++;
  }
};

const assertEqual = (actual, expected, description) => {
  if (actual === expected) {
    console.log(`  ✓ PASS: ${description} (Value: ${actual})`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${description} (Expected ${expected}, got ${actual})`);
    failedTests++;
  }
};

const runPureScoringEngineTests = () => {
  console.log('\n--- 1. PURE SCORING ENGINE UNIT TESTS ---');

  // Test 1: Empty evidence list
  const emptyResult = calculateSkillScore([]);
  assertEqual(emptyResult.overallScore, 0, 'Empty evidence yields 0 overall score');
  assertEqual(emptyResult.proficiencyLevel, 'Beginner', 'Empty evidence is Beginner level');
  assertEqual(emptyResult.confidenceLevel, 'Low', 'Empty evidence has Low confidence');

  // Test 2: Single evidence (quiz only) -> Proportional reweighting
  const singleEvidence = [
    { type: 'quiz', score: 85, maxScore: 100, weight: 1.0 },
  ];
  const singleResult = calculateSkillScore(singleEvidence);
  assertEqual(singleResult.knowledgeScore, 85, 'Knowledge score computed correctly');
  assertEqual(singleResult.overallScore, 85, 'Overall score equals 85% with 100% proportional weight on single dimension');
  assertEqual(singleResult.proficiencyLevel, 'Advanced', '85% correctly maps to Advanced proficiency');
  assertEqual(singleResult.confidenceLevel, 'Low', '1 evidence item has Low confidence');

  // Test 3: Two dimensions (Knowledge + Practical) with dynamic reweighting
  // Knowledge: 90% (base weight 0.25)
  // Practical: 70% (base weight 0.30)
  // Total weight = 0.55. Proportional: (90*0.25 + 70*0.30)/0.55 = 43.5 / 0.55 = 79.09 -> 79%
  const twoDimensions = [
    { type: 'quiz', score: 90, maxScore: 100 },
    { type: 'coding_challenge', score: 70, maxScore: 100 },
  ];
  const twoDimResult = calculateSkillScore(twoDimensions);
  assertEqual(twoDimResult.knowledgeScore, 90, 'Knowledge dimension score is 90%');
  assertEqual(twoDimResult.practicalScore, 70, 'Practical dimension score is 70%');
  assertEqual(twoDimResult.overallScore, 79, 'Proportional reweighted composite score is 79%');
  assertEqual(twoDimResult.proficiencyLevel, 'Advanced', '79% is Advanced level');

  // Test 4: All 4 dimensions demonstrated performance
  // Knowledge: Quiz 1 (80%), Quiz 2 (90%) -> avg 85% (weight 0.25 -> 21.25)
  // Practical: Lab 1 (90%), Lab 2 (100%) -> avg 95% (weight 0.30 -> 28.50)
  // Project: Capstone (92%) -> 92% (weight 0.25 -> 23.00)
  // Assessment: Final Exam (88%) -> 88% (weight 0.20 -> 17.60)
  // Sum = 21.25 + 28.50 + 23.00 + 17.60 = 90.35 -> 90%
  const allFourDimensions = [
    { type: 'quiz', score: 80, maxScore: 100 },
    { type: 'quiz', score: 90, maxScore: 100 },
    { type: 'coding_challenge', score: 90, maxScore: 100 },
    { type: 'coding_challenge', score: 100, maxScore: 100 },
    { type: 'project', score: 92, maxScore: 100 },
    { type: 'practical_assessment', score: 88, maxScore: 100 },
  ];
  const allResult = calculateSkillScore(allFourDimensions);
  assertEqual(allResult.knowledgeScore, 85, 'Multi-item knowledge score average is 85%');
  assertEqual(allResult.practicalScore, 95, 'Multi-item practical score average is 95%');
  assertEqual(allResult.projectScore, 92, 'Project score is 92%');
  assertEqual(allResult.assessmentScore, 88, 'Assessment score is 88%');
  assertEqual(allResult.overallScore, 90, 'All 4 dimensions weighted composite is 90%');
  assertEqual(allResult.proficiencyLevel, 'Expert', '90% achieves Expert level');
  assertEqual(allResult.confidenceLevel, 'Medium', '6 items is Medium confidence');

  // Test 5: Configurable proficiency thresholds
  assertEqual(calculateProficiencyLevel(45), 'Beginner', '45% is Beginner');
  assertEqual(calculateProficiencyLevel(50), 'Intermediate', '50% is Intermediate boundary');
  assertEqual(calculateProficiencyLevel(74), 'Intermediate', '74% is Intermediate boundary');
  assertEqual(calculateProficiencyLevel(75), 'Advanced', '75% is Advanced boundary');
  assertEqual(calculateProficiencyLevel(89), 'Advanced', '89% is Advanced boundary');
  assertEqual(calculateProficiencyLevel(90), 'Expert', '90% is Expert boundary');
  assertEqual(calculateProficiencyLevel(100), 'Expert', '100% is Expert');

  // Test 6: Confidence scaling
  assertEqual(calculateConfidenceLevel(2), 'Low', '<3 items is Low confidence');
  assertEqual(calculateConfidenceLevel(3), 'Medium', '3 items reaches Medium confidence');
  assertEqual(calculateConfidenceLevel(6), 'Medium', '6 items is Medium confidence');
  assertEqual(calculateConfidenceLevel(7), 'High', '7 items reaches High confidence');

  // Test 7: Trend calculation
  assertEqual(calculateTrend(85, 78), 'improving', '+7 delta is improving');
  assertEqual(calculateTrend(75, 82), 'declining', '-7 delta is declining');
  assertEqual(calculateTrend(85, 84), 'steady', '+1 delta within threshold is steady');
  assertEqual(calculateTrend(85, null), 'new', 'Null previous is new');
};

const runDatabaseAndServiceIntegrationTests = async () => {
  console.log('\n--- 2. DATABASE & SERVICE INTEGRATION TESTS ---');

  try {
    await connectDB();

    // Setup demo user
    let user = await User.findOne({ email: 'skill-tester@nova-lms.edu' });
    if (!user) {
      user = await User.create({
        name: 'Skill Test Learner',
        email: 'skill-tester@nova-lms.edu',
        password: 'Password123!',
        role: 'student',
      });
    }

    // Setup demo skill
    let skill = await Skill.findOne({ slug: 'distributed-state-machines' });
    if (!skill) {
      skill = await Skill.create({
        name: 'Distributed State Machines',
        slug: 'distributed-state-machines',
        description: 'Paxos, Raft consensus, and vector clocks.',
        category: 'Systems & Architecture',
        difficulty: 'Advanced',
      });
    }

    // Clear prior test progress
    await LearnerSkillProgress.deleteMany({ user: user._id, skill: skill._id });

    // Step A: Record first evidence (Quiz)
    const p1 = await recordSkillEvidence({
      userId: user._id,
      skillId: skill._id,
      type: 'quiz',
      title: 'Consensus Quorum Quiz',
      score: 80,
      maxScore: 100,
      referenceId: 'quiz-01',
    });

    assertEqual(p1.overallScore, 80, 'Database progress saved with overall score 80');
    assertEqual(p1.proficiencyLevel, 'Advanced', 'Proficiency level stored as Advanced');
    assertEqual(p1.evidenceCount, 1, 'Evidence count is 1');
    assertEqual(p1.trend, 'new', 'First evaluation trend is new');
    assertEqual(p1.history.length, 1, 'History snapshot recorded');

    // Step B: Record second evidence (Coding Challenge)
    const p2 = await recordSkillEvidence({
      userId: user._id,
      skillId: skill._id,
      type: 'coding_challenge',
      title: 'Raft Leader Election Simulator',
      score: 95,
      maxScore: 100,
      referenceId: 'lab-01',
    });

    // Knowledge 80 (wt 0.25) + Practical 95 (wt 0.30) -> (20 + 28.5)/0.55 = 48.5/0.55 = 88.18 -> 88%
    assertEqual(p2.overallScore, 88, 'Database updated score to 88%');
    assertEqual(p2.evidenceCount, 2, 'Evidence count updated to 2');
    assertEqual(p2.trend, 'improving', 'Trend correctly updated to improving (88 from 80)');
    assertEqual(p2.history.length, 2, 'History array has 2 snapshots');

    // Step C: Test getLearnerSkills
    const learnerSkills = await getLearnerSkills(user._id);
    assert(learnerSkills.skills.length > 0, 'Learner skills returned by service');
    assertEqual(learnerSkills.stats.totalSkills, 1, 'Summary stats correctly computed');

    // Step D: Test recalculateSkillScore
    const recalc = await recalculateSkillScore(user._id, skill._id);
    assertEqual(recalc.overallScore, 88, 'Recalculation matches evidence records');

    // Step E: Test getLearnerDashboardSummary and Next Action recommendation
    const { getLearnerDashboardSummary } = await import('./services/skillService.js');
    const summary = await getLearnerDashboardSummary(user._id);
    assert(summary.topSkills !== undefined, 'Dashboard summary returns topSkills');
    assert(summary.stats !== undefined, 'Dashboard summary returns stats');
    assert(summary.nextAction !== undefined, 'Dashboard summary returns nextAction');
    assert(Boolean(summary.nextAction.title), 'Next action has descriptive title');
    assert(Boolean(summary.nextAction.reason), 'Next action has evidence-backed reason');
    assert(Boolean(summary.nextAction.buttonText), 'Next action has CTA button text');
    assert(Boolean(summary.nextAction.estimatedTime), 'Next action has estimated duration');

    // Step F: Test targeted weak area remediation
    // Add low practical score evidence (40%) to trigger weak area remediation
    await recordSkillEvidence({
      userId: user._id,
      skillId: skill._id,
      type: 'coding_challenge',
      title: 'Low Score Practical Challenge',
      score: 40,
      maxScore: 100,
      weight: 1.5,
    });

    const weakSummary = await getLearnerDashboardSummary(user._id);
    assert(weakSummary.weakAreas.length > 0, 'Weak area detected based on low practical performance');
    assert(weakSummary.nextAction.badge === 'TARGETED RECOVERY', 'Next action targets recovery for weak area');
    assert(weakSummary.nextAction.reason.includes('below your target'), 'Reason explicitly mentions performance below target');

    // Clean up test records
    await LearnerSkillProgress.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });
    await Skill.deleteOne({ _id: skill._id });

    await closeDB();
  } catch (err) {
    console.error('Integration test failed with error:', err);
    failedTests++;
  }
};

const runAllTests = async () => {
  console.log('========================================================');
  console.log('       NOVA LMS — SKILL SCORING ENGINE TEST SUITE       ');
  console.log('========================================================');

  runPureScoringEngineTests();
  await runDatabaseAndServiceIntegrationTests();

  console.log('\n========================================================');
  console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('========================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runAllTests();
