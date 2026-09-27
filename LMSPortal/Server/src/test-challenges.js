import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();
import { connectDB, closeDB } from './config/db.js';
import CodingChallenge from './models/CodingChallenge.js';
import CodingSubmission from './models/CodingSubmission.js';
import LearnerSkillProgress from './models/LearnerSkillProgress.js';
import User from './models/User.js';
import {
  getChallenges,
  getChallengeDetails,
  runChallengeCode,
  submitChallengeCode,
  getChallengeSubmissions,
} from './services/challengeService.js';

dotenv.config();

let passed = 0;
let failed = 0;

const assert = (cond, msg) => {
  if (cond) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
};

const assertEqual = (act, exp, msg) => {
  if (act === exp) {
    console.log(`  ✓ PASS: ${msg} (${act})`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg} (Expected ${exp}, got ${act})`);
    failed++;
  }
};

async function runChallengeTests() {
  console.log('========================================================');
  console.log('       NOVA LMS — CODING LAB & CHALLENGE TEST SUITE     ');
  console.log('========================================================\n');

  try {
    await connectDB();
    const { seedChallenges } = await import('./seed-challenges.js');
    await seedChallenges();

    let student = await User.findOne({ email: 'student@lms.com' });
    if (!student) {
      student = await User.create({
        name: 'Jordan Lee (Student)',
        email: 'student@lms.com',
        password: 'password123',
        role: 'student',
      });
    }
    const studentId = student._id;

    // Test 1: Listing challenges
    console.log('--- 1. Testing Challenge Listing ---');
    const listResult = await getChallenges({}, studentId);
    assert(listResult.challenges.length > 0, 'Found published challenges');
    assert(listResult.challenges[0].testCases === undefined, 'Full testCases stripped from listing view');
    assert(listResult.challenges[0].totalTestCases > 0, 'Total test case count provided');
    assert(listResult.challenges[0].sampleTestCases > 0, 'Sample test case count provided');

    // Test 2: Privacy Check: Never leak hidden test cases to students
    console.log('\n--- 2. Testing Hidden Test Case Protection ---');
    const authLab = await CodingChallenge.findOne({ slug: 'node-js-authentication-lab' });
    assert(Boolean(authLab), 'Node.js Authentication Lab exists');

    const studentDetails = await getChallengeDetails(authLab._id.toString(), studentId, false);
    const hasHiddenCasesInStudentView = studentDetails.challenge.testCases.some((tc) => tc.isHidden);
    assertEqual(hasHiddenCasesInStudentView, false, 'Student detail view contains ZERO hidden test cases');
    assert(studentDetails.challenge.stats.hiddenTestCases > 0, 'Stats accurately reflect hidden test case count without leaking them');

    // Test 3: Sample Run (Run Code button)
    console.log('\n--- 3. Testing Run Code (Sample Cases) ---');
    const validJsSolution = authLab.starterCode.get('javascript');
    const runResult = await runChallengeCode({
      challengeId: authLab._id,
      language: 'javascript',
      sourceCode: validJsSolution,
    });
    assertEqual(runResult.status, 'Accepted', 'Run Code accepted on visible sample test cases');
    assertEqual(runResult.passedTests, studentDetails.challenge.stats.sampleTestCases, 'All sample test cases passed');

    // Test 4: Submit Solution (All Test Cases + Masking)
    console.log('\n--- 4. Testing Submit Solution & Skill Integration ---');
    const submitResult = await submitChallengeCode({
      challengeId: authLab._id,
      userId: studentId,
      language: 'javascript',
      sourceCode: validJsSolution,
    });

    assertEqual(submitResult.status, 'Accepted', 'Submission status is Accepted');
    assertEqual(submitResult.score, 100, 'Earned 100% score');
    assertEqual(submitResult.passedTests, authLab.testCases.length, 'Passed all test cases including hidden ones');

    // Check hidden test cases are masked in returned results
    const hiddenResultItems = submitResult.testResults.filter((tr) => tr.isHidden);
    assert(hiddenResultItems.length > 0, 'Hidden test case results are present');
    assertEqual(hiddenResultItems[0].expectedOutput, '[Hidden Test Case]', 'Hidden test case expected output is masked');
    assertEqual(hiddenResultItems[0].actualOutput, '[Hidden Test Case]', 'Hidden test case actual output is masked');

    // Test 5: Verify Skill Evidence Ingestion
    console.log('\n--- 5. Testing Automated Skill Ingestion ---');
    assert(submitResult.skillUpdates.length > 0, 'Skill updates were generated for mapped skills');
    
    const nodeProgress = await LearnerSkillProgress.findOne({
      user: studentId,
      skill: authLab.skills[0],
    });
    assert(Boolean(nodeProgress), 'LearnerSkillProgress updated for target skill');
    assert(nodeProgress.practicalScore > 0, 'Practical score was updated by coding challenge submission');

    // Test 6: Submission History Retrieval
    console.log('\n--- 6. Testing Submission History ---');
    const history = await getChallengeSubmissions(authLab._id, studentId);
    assert(history.length > 0, 'Submission history returned records');
    assertEqual(history[0].status, 'Accepted', 'Latest submission is Accepted');

    await closeDB();
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n========================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runChallengeTests();
