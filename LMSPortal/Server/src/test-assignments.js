import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import User from './models/User.js';
import Course from './models/Course.js';
import Skill from './models/Skill.js';
import Assignment from './models/Assignment.js';
import AssignmentSubmission from './models/AssignmentSubmission.js';
import LearnerSkillProgress from './models/LearnerSkillProgress.js';
import * as assignmentService from './services/assignmentService.js';
import { seedAssignments } from './seed-assignments.js';

dotenv.config();

const runTests = async () => {
  console.log('--- STARTING PRACTICAL ASSIGNMENT SYSTEM TESTS ---');
  let passedCount = 0;
  let totalCount = 0;

  const assert = (condition, message) => {
    totalCount++;
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  };

  try {
    await connectDB();

    // Ensure assignments are seeded
    await seedAssignments();

    // 1. Find or create instructor and student
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = await User.findOne({ role: 'admin' });
    }
    assert(Boolean(instructor), 'Instructor or admin user found for tests');

    let student = await User.findOne({ role: 'student' });
    if (!student) {
      student = await User.create({
        name: 'Test Student Practitioner',
        email: `student_test_${Date.now()}@novalms.test`,
        password: 'Password123!',
        role: 'student',
      });
    }
    assert(Boolean(student), 'Student user found or created for tests');

    const course = await Course.findOne();
    assert(Boolean(course), 'Target course found for assignment tests');

    const skill = await Skill.findOne({ slug: 'nodejs' }) || (await Skill.findOne());
    assert(Boolean(skill), 'Skill found for evaluation tests');

    // 2. Test getAssignments listing
    console.log('\n--- Test 2: Assignment Listing & Filtering ---');
    const listing = await assignmentService.getAssignments({}, student._id, 'student');
    assert(Array.isArray(listing.assignments), 'Returned assignments array');
    assert(listing.assignments.length >= 4, `Found ${listing.assignments.length} assignments in catalog`);
    assert(listing.assignments[0].evaluationCriteria.length > 0, 'Assignment has evaluation criteria populated');

    // 3. Test Assignment Creation with custom criteria and weights
    console.log('\n--- Test 3: Assignment Creation with Rubric ---');
    const customCriteria = [
      { name: 'Architecture & REST Verbs', description: 'Clean controller-service split', maxPoints: 40, weight: 1.5 },
      { name: 'Unit & E2E Testing', description: 'Comprehensive mock coverage', maxPoints: 30, weight: 1.0 },
      { name: 'Documentation & OpenAPI', description: 'Clear API schema spec', maxPoints: 30, weight: 0.5 },
    ];

    const createdAssignment = await assignmentService.createAssignment(
      {
        title: `Test Assignment ${Date.now()}`,
        description: 'Test assignment description for automated verification',
        instructions: 'Test instructions: build a secure microservice pipeline.',
        difficulty: 'Hard',
        estimatedTime: '5 hours',
        skills: [skill._id],
        courseId: course._id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        evaluationCriteria: customCriteria,
        maxScore: 100,
      },
      instructor._id
    );

    assert(Boolean(createdAssignment._id), 'Assignment created successfully');
    assert(createdAssignment.evaluationCriteria.length === 3, 'Rubric criteria saved with 3 items');
    assert(createdAssignment.difficulty === 'Hard', 'Difficulty saved correctly');

    // 4. Test Student Submission
    console.log('\n--- Test 4: Student Submission (No auto-pass) ---');
    const submissionPayload = {
      submissionType: 'combined',
      repositoryUrl: 'https://github.com/nova-practitioner/secure-auth-api',
      deploymentUrl: 'https://auth-api-staging.onrender.com',
      content: 'Implemented JWT token verification with Redis token blacklist and rate limiting.',
      attachments: [{ name: 'architecture_diagram.png', url: 'https://example.com/arch.png', fileType: 'png' }],
    };

    const submission = await assignmentService.submitAssignment(
      createdAssignment._id,
      student._id,
      submissionPayload
    );

    assert(Boolean(submission._id), 'Submission created successfully');
    assert(submission.status === 'Submitted', `Submission status is strictly "Submitted" (got "${submission.status}")`);
    assert(submission.score === null, 'Submission score is initially null (no fake or autocompleted scores)');
    assert(submission.repositoryUrl.includes('github.com'), 'Repository URL stored properly');

    // Verify assignment listing shows 'Submitted' status for this student
    const studentListAfterSub = await assignmentService.getAssignments(
      {},
      student._id,
      'student'
    );
    const foundTarget = studentListAfterSub.assignments.find(
      (a) => a._id.toString() === createdAssignment._id.toString()
    );
    assert(foundTarget && foundTarget.userStatus === 'Submitted', 'Student assignments listing reflects "Submitted" status');

    // 5. Test Needs Revision flow
    console.log('\n--- Test 5: Instructor Review - "Needs Revision" ---');
    const revisionEval = await assignmentService.evaluateSubmission(
      submission._id,
      instructor._id,
      'instructor',
      {
        status: 'Needs Revision',
        feedback: 'Good architecture, but please add rate limiting middleware on the login route and resubmit.',
        criteriaGrades: [
          { criterionName: 'Architecture & REST Verbs', pointsEarned: 30, maxPoints: 40, comment: 'Missing rate limiter' },
          { criterionName: 'Unit & E2E Testing', pointsEarned: 25, maxPoints: 30, comment: 'Edge cases missed' },
          { criterionName: 'Documentation & OpenAPI', pointsEarned: 28, maxPoints: 30, comment: 'Good schema' },
        ],
      }
    );

    assert(revisionEval.submission.status === 'Needs Revision', 'Status updated to "Needs Revision"');
    assert(revisionEval.submission.feedback.includes('rate limiting'), 'Feedback saved correctly');

    // 6. Test Passing Evaluation with Weighted Score Calculation
    console.log('\n--- Test 6: Final Evaluation with Weighted Rubric Scoring ---');
    // Rubric:
    // Architecture (40 pts * 1.5 wt) = 60 wt max. Earned 38 * 1.5 = 57
    // Testing (30 pts * 1.0 wt) = 30 wt max. Earned 27 * 1.0 = 27
    // Documentation (30 pts * 0.5 wt) = 15 wt max. Earned 30 * 0.5 = 15
    // Total earned = 57 + 27 + 15 = 99
    // Total max = 60 + 30 + 15 = 105
    // Percentage = (99 / 105) * 100 = 94.28% -> Math.round = 94%

    const passingEval = await assignmentService.evaluateSubmission(
      submission._id,
      instructor._id,
      'instructor',
      {
        status: 'Passed',
        feedback: 'Outstanding revision. Rate limiting is solid, all test suites passing with >90% coverage.',
        criteriaGrades: [
          { criterionName: 'Architecture & REST Verbs', pointsEarned: 38, maxPoints: 40, comment: 'Excellent clean architecture' },
          { criterionName: 'Unit & E2E Testing', pointsEarned: 27, maxPoints: 30, comment: 'Great integration coverage' },
          { criterionName: 'Documentation & OpenAPI', pointsEarned: 30, maxPoints: 30, comment: 'Flawless swagger docs' },
        ],
      }
    );

    assert(passingEval.submission.status === 'Passed', 'Status updated to "Passed"');
    assert(passingEval.submission.score === 94, `Weighted score calculated accurately: expected 94%, got ${passingEval.submission.score}%`);
    assert(passingEval.updatedSkills.length > 0, 'Updated learner skills returned from evaluation');

    // 7. Verify Learner Skill Progress has assignment evidence
    console.log('\n--- Test 7: Verified Skill Evidence Ingestion ---');
    const learnerSkill = await LearnerSkillProgress.findOne({
      user: student._id,
      skill: skill._id,
    });
    assert(Boolean(learnerSkill), 'LearnerSkillProgress record found for evaluated student');
    assert(learnerSkill.evidenceCount > 0, `Learner has ${learnerSkill.evidenceCount} evidence items`);

    const hasAssignmentEvidence = learnerSkill.evidence.some(
      (e) => e.type === 'assignment' && e.title.includes(createdAssignment.title)
    );
    assert(hasAssignmentEvidence, 'Learner skill evidence includes the evaluated practical assignment');
    assert(learnerSkill.assessmentScore > 0, `Learner assessment dimension score recalculated: ${learnerSkill.assessmentScore}`);

    // 8. Test Instructor Submissions Aggregation
    console.log('\n--- Test 8: Instructor Submissions Query ---');
    const instructorSubmissions = await assignmentService.getInstructorSubmissions(
      instructor._id,
      'instructor',
      {}
    );
    assert(instructorSubmissions.submissions.length > 0, 'Instructor submissions list contains entries');
    assert(instructorSubmissions.counts.Passed >= 1, `Counts breakdown includes Passed submissions (${instructorSubmissions.counts.Passed})`);

    // Clean up test assignment
    await assignmentService.deleteAssignment(createdAssignment._id, instructor._id, 'instructor');
    console.log('  ✓ Cleaned up temporary test assignment');

    console.log(`\n========================================`);
    console.log(`ALL TESTS PASSED: ${passedCount}/${totalCount} assertions verified!`);
    console.log(`========================================\n`);
  } catch (error) {
    console.error('\nTest execution failed with error:', error);
    process.exit(1);
  } finally {
    await closeDB();
  }
};

runTests();
