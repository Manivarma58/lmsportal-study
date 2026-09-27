import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import User from './models/User.js';
import Course from './models/Course.js';
import Skill from './models/Skill.js';
import Project from './models/Project.js';
import ProjectSubmission from './models/ProjectSubmission.js';
import LearnerSkillProgress from './models/LearnerSkillProgress.js';
import * as projectService from './services/projectService.js';
import { seedProjects } from './seed-projects.js';

dotenv.config();

const runTests = async () => {
  console.log('--- STARTING PROJECT-BASED LEARNING SYSTEM TESTS ---');
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

    // 1. Seed projects
    await seedProjects();

    const instructor = await User.findOne({ role: { $in: ['instructor', 'admin'] } });
    assert(Boolean(instructor), 'Instructor user found for project tests');

    let student = await User.findOne({ role: 'student' });
    if (!student) {
      student = await User.create({
        name: 'Project Practitioner',
        email: `project_student_${Date.now()}@novalms.test`,
        password: 'Password123!',
        role: 'student',
      });
    }
    assert(Boolean(student), 'Student user found or created for tests');

    const skill = await Skill.findOne({ slug: 'nodejs' }) || (await Skill.findOne());
    assert(Boolean(skill), 'Skill found for project testing');

    // 2. Test getProjects listing
    console.log('\n--- Test 2: Project Listing & Discovery ---');
    const listing = await projectService.getProjects({}, student._id, 'student');
    assert(Array.isArray(listing.projects), 'Returned projects array');
    assert(listing.projects.length >= 3, `Found ${listing.projects.length} real-world projects in catalog`);
    const sampleProject = listing.projects[0];
    assert(sampleProject.milestones?.length > 0, 'Project has milestones defined');
    assert(sampleProject.evaluationCriteria?.length > 0, 'Project has evaluation rubric criteria defined');

    // 3. Test Learner Project Workspace & Milestones Scaffold
    console.log('\n--- Test 3: Learner Project Workspace & Milestone Tracking ---');
    const workspace = await projectService.getProjectById(sampleProject._id, student._id, 'student');
    assert(Boolean(workspace.submission), 'Student workspace initialized with ProjectSubmission scaffold');
    assert(workspace.submission.status === 'In Progress', `Initial workspace status is "In Progress" (got "${workspace.submission.status}")`);
    assert(workspace.submission.milestoneProgress.length === sampleProject.milestones.length, 'All milestones scaffolded in learner submission');

    // Update milestone progress (check off milestone 1)
    const firstMilestone = sampleProject.milestones[0];
    const updatedMilestone = await projectService.updateMilestoneProgress(
      sampleProject._id,
      student._id,
      {
        milestoneId: firstMilestone._id,
        completed: true,
        notes: 'Domain models and Mongoose schemas fully drafted with index specifications.',
      }
    );

    assert(updatedMilestone.completedMilestones >= 1, `Milestone completed count: ${updatedMilestone.completedMilestones}`);
    assert(updatedMilestone.progressPercentage > 0, `Project progress percentage calculated: ${updatedMilestone.progressPercentage}%`);

    // 4. Test Student Deliverables Submission (Actual work required)
    console.log('\n--- Test 4: Project Deliverables Submission ---');
    const deliverablePayload = {
      repositoryUrl: 'https://github.com/nova-learner/microservice-capstone-platform',
      deploymentUrl: 'https://microservices-platform.onrender.com',
      documentationUrl: 'https://github.com/nova-learner/microservice-capstone-platform/wiki',
      attachments: [{ name: 'architecture_diagram.pdf', url: 'https://example.com/arch.pdf', fileType: 'pdf' }],
    };

    const submission = await projectService.submitProject(
      sampleProject._id,
      student._id,
      deliverablePayload
    );

    assert(submission.status === 'Submitted', `Submission status is strictly "Submitted" (got "${submission.status}")`);
    assert(submission.score === null, 'Project is not auto-completed with fake scores upon submit');
    assert(submission.repositoryUrl.includes('github.com'), 'Repository URL stored');
    assert(submission.deploymentUrl.includes('onrender.com'), 'Live deployment URL stored');

    // 5. Test Instructor Project Review - "Needs Revision"
    console.log('\n--- Test 5: Instructor Review - "Needs Revision" ---');
    const revisionResult = await projectService.evaluateProject(
      submission._id,
      instructor._id,
      'instructor',
      {
        status: 'Needs Revision',
        feedback: 'Excellent foundation, but please add an integration test for token expiry and Docker Compose setup.',
        criteriaGrades: [
          { criterionName: 'Functionality', pointsEarned: 26, maxPoints: 30, comment: 'Token expiry test missing' },
          { criterionName: 'API Design', pointsEarned: 18, maxPoints: 20, comment: 'Clean REST' },
          { criterionName: 'Database', pointsEarned: 14, maxPoints: 15, comment: 'Good indexes' },
          { criterionName: 'Code Quality', pointsEarned: 14, maxPoints: 15, comment: 'Modular structure' },
          { criterionName: 'Testing', pointsEarned: 6, maxPoints: 10, comment: 'Needs edge cases' },
          { criterionName: 'Documentation', pointsEarned: 9, maxPoints: 10, comment: 'Swagger spec is solid' },
        ],
      }
    );

    assert(revisionResult.submission.status === 'Needs Revision', 'Project status updated to "Needs Revision"');
    assert(revisionResult.submission.feedback.includes('token expiry'), 'Feedback saved correctly');

    // 6. Test Passing Evaluation with Weighted Score & Skill Evidence Ingestion
    console.log('\n--- Test 6: Final Rubric Evaluation & Skill Engine Ingestion ---');
    // Functionality (30 pts, wt 1.0) -> Earned 29
    // API Design (20 pts, wt 1.0) -> Earned 19
    // Database (15 pts, wt 1.0) -> Earned 14
    // Code Quality (15 pts, wt 1.0) -> Earned 15
    // Testing (10 pts, wt 1.0) -> Earned 9
    // Documentation (10 pts, wt 1.0) -> Earned 10
    // Total Earned = 29 + 19 + 14 + 15 + 9 + 10 = 96
    // Total Max = 30 + 20 + 15 + 15 + 10 + 10 = 100
    // Percentage = 96%

    // Ensure sample project has skillId
    await Project.findByIdAndUpdate(sampleProject._id, { requiredSkills: [skill._id] });

    const passingResult = await projectService.evaluateProject(
      submission._id,
      instructor._id,
      'instructor',
      {
        status: 'Passed',
        feedback: 'Superb revision! Multi-stage Dockerfile is clean, all edge-case tests pass, and OpenAPI documentation is production-ready.',
        criteriaGrades: [
          { criterionName: 'Functionality', pointsEarned: 29, maxPoints: 30, comment: 'Flawless business logic' },
          { criterionName: 'API Design', pointsEarned: 19, maxPoints: 20, comment: 'Consistent RFC-7807 errors' },
          { criterionName: 'Database', pointsEarned: 14, maxPoints: 15, comment: 'ACID transactions confirmed' },
          { criterionName: 'Code Quality', pointsEarned: 15, maxPoints: 15, comment: 'Exemplary clean architecture' },
          { criterionName: 'Testing', pointsEarned: 9, maxPoints: 10, comment: 'High coverage achieved' },
          { criterionName: 'Documentation', pointsEarned: 10, maxPoints: 10, comment: 'Complete runbook' },
        ],
      }
    );

    assert(passingResult.submission.status === 'Passed', 'Project status updated to "Passed"');
    assert(passingResult.submission.score === 96, `Weighted score calculated accurately: expected 96%, got ${passingResult.submission.score}%`);
    assert(passingResult.updatedSkills.length > 0, 'Skill Engine updated and returned updated learner skills');

    // 7. Verify Skill Progress Project Dimension
    console.log('\n--- Test 7: Verify Skill Engine "projectScore" Dimension ---');
    const learnerSkill = await LearnerSkillProgress.findOne({
      user: student._id,
      skill: skill._id,
    });

    assert(Boolean(learnerSkill), 'LearnerSkillProgress record found for student');
    assert(learnerSkill.projectScore > 0, `Learner project dimension score updated: ${learnerSkill.projectScore}%`);
    const hasProjectEvidence = learnerSkill.evidence.some(
      (e) => e.type === 'project' && e.title.includes(sampleProject.title)
    );
    assert(hasProjectEvidence, 'Skill evidence array contains verified project evidence item');

    // 8. Test Instructor Submissions Aggregation
    console.log('\n--- Test 8: Instructor Submissions Hub ---');
    const instructorSubs = await projectService.getInstructorProjectSubmissions(
      instructor._id,
      'instructor',
      {}
    );
    assert(instructorSubs.submissions.length > 0, 'Instructor submissions list contains project submissions');
    assert(instructorSubs.counts.Passed >= 1, `Counts breakdown includes Passed projects (${instructorSubs.counts.Passed})`);

    console.log(`\n========================================`);
    console.log(`ALL TESTS PASSED: ${passedCount}/${totalCount} assertions verified!`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('\nTest execution failed with error:', err);
    process.exit(1);
  } finally {
    await closeDB();
  }
};

runTests();
