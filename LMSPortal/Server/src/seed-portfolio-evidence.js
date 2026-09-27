import mongoose from 'mongoose';
import User from './models/User.js';
import Skill from './models/Skill.js';
import LearnerSkillProgress from './models/LearnerSkillProgress.js';
import Project from './models/Project.js';
import ProjectSubmission from './models/ProjectSubmission.js';
import Assignment from './models/Assignment.js';
import AssignmentSubmission from './models/AssignmentSubmission.js';
import CodingChallenge from './models/CodingChallenge.js';
import CodingSubmission from './models/CodingSubmission.js';
import JobSimulation from './models/JobSimulation.js';
import JobSimulationSubmission from './models/JobSimulationSubmission.js';
import Certificate from './models/Certificate.js';
import Course from './models/Course.js';

export async function seedPortfolioEvidenceForStudent() {
  try {
    const student = await User.findOne({ email: 'student@lms.com' });
    if (!student) return;

    // 1. Ensure Skills with Prompt Evidence (e.g. React 86% Advanced, Evidence: 12 coding challenges, 3 assignments, 2 projects)
    const skills = await Skill.find();
    const reactSkill = skills.find((s) => s.slug === 'react' || s.name.toLowerCase().includes('react'));
    const jsSkill = skills.find((s) => s.slug === 'javascript' || s.name.toLowerCase().includes('javascript'));
    const nodeSkill = skills.find((s) => s.slug === 'node-js' || s.name.toLowerCase().includes('node'));
    const sqlSkill = skills.find((s) => s.slug === 'sql' || s.name.toLowerCase().includes('sql'));

    if (reactSkill) {
      await LearnerSkillProgress.findOneAndUpdate(
        { user: student._id, skill: reactSkill._id },
        {
          user: student._id,
          skill: reactSkill._id,
          overallScore: 86,
          knowledgeScore: 88,
          practicalScore: 85,
          projectScore: 84,
          proficiencyLevel: 'Advanced',
          confidenceLevel: 'High',
          lastCalculatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    if (nodeSkill) {
      await LearnerSkillProgress.findOneAndUpdate(
        { user: student._id, skill: nodeSkill._id },
        {
          user: student._id,
          skill: nodeSkill._id,
          overallScore: 78,
          knowledgeScore: 82,
          practicalScore: 76,
          projectScore: 75,
          proficiencyLevel: 'Proficient',
          confidenceLevel: 'High',
          lastCalculatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    // 2. Verified Project Submissions
    const projects = await Project.find();
    if (projects.length > 0) {
      const p1 = projects[0];
      const p2 = projects[1] || projects[0];

      await ProjectSubmission.findOneAndUpdate(
        { user: student._id, project: p1._id },
        {
          user: student._id,
          project: p1._id,
          status: 'Evaluated',
          score: 92,
          repositoryUrl: 'https://github.com/jordanlee/cloud-native-k8s-platform',
          deploymentUrl: 'https://platform.jordanlee-dev.io',
          documentationUrl: 'https://docs.jordanlee-dev.io/architecture',
          feedback: 'Outstanding microservice isolation, zero-trust mTLS service mesh, and sub-10ms ingress routing latency.',
          milestoneProgress: [
            { milestoneId: new mongoose.Types.ObjectId(), milestoneTitle: 'Architecture Blueprint', completed: true, completedAt: new Date() },
            { milestoneId: new mongoose.Types.ObjectId(), milestoneTitle: 'Cluster Deployment & Helm', completed: true, completedAt: new Date() },
            { milestoneId: new mongoose.Types.ObjectId(), milestoneTitle: 'Telemetry & Observability', completed: true, completedAt: new Date() },
          ],
          rubricGrades: [
            { criterionName: 'Functionality', pointsEarned: 24, maxPoints: 25, comment: 'All health checks passing' },
            { criterionName: 'Code Quality', pointsEarned: 23, maxPoints: 25, comment: 'Clean modular structure' },
            { criterionName: 'Testing', pointsEarned: 22, maxPoints: 25, comment: '94% unit & integration test coverage' },
            { criterionName: 'Documentation', pointsEarned: 23, maxPoints: 25, comment: 'Comprehensive OpenAPI & runbooks' },
          ],
          submittedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
          evaluatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        },
        { upsert: true, new: true }
      );

      if (p2 && p2._id.toString() !== p1._id.toString()) {
        await ProjectSubmission.findOneAndUpdate(
          { user: student._id, project: p2._id },
          {
            user: student._id,
            project: p2._id,
            status: 'Evaluated',
            score: 88,
            repositoryUrl: 'https://github.com/jordanlee/enterprise-ecommerce-api',
            deploymentUrl: 'https://api-stage.jordanlee-dev.io',
            feedback: 'Solid concurrency handling under k6 load tests with idempotent payment webhook processors.',
            milestoneProgress: [
              { milestoneId: new mongoose.Types.ObjectId(), milestoneTitle: 'Database Schema & Migrations', completed: true, completedAt: new Date() },
              { milestoneId: new mongoose.Types.ObjectId(), milestoneTitle: 'Authentication & RBAC', completed: true, completedAt: new Date() },
            ],
            submittedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
            evaluatedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000),
          },
          { upsert: true, new: true }
        );
      }
    }

    // 3. Verified Practical Assignments
    const assignments = await Assignment.find();
    if (assignments.length > 0) {
      const a1 = assignments[0];
      const a2 = assignments[1] || assignments[0];

      await AssignmentSubmission.findOneAndUpdate(
        { user: student._id, assignment: a1._id },
        {
          user: student._id,
          assignment: a1._id,
          submissionType: 'combined',
          repositoryUrl: 'https://github.com/jordanlee/jwt-auth-service',
          deploymentUrl: 'https://auth.jordanlee-dev.io',
          status: 'Passed',
          score: 94,
          feedback: 'Excellent implementation of rotating refresh tokens, cryptographically secure password salting, and Redis blacklist.',
          criteriaGrades: [
            { criterionName: 'API Design', pointsEarned: 19, maxPoints: 20 },
            { criterionName: 'Security', pointsEarned: 20, maxPoints: 20 },
            { criterionName: 'Testing', pointsEarned: 18, maxPoints: 20 },
          ],
          submittedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
          evaluatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        },
        { upsert: true, new: true }
      );

      if (a2 && a2._id.toString() !== a1._id.toString()) {
        await AssignmentSubmission.findOneAndUpdate(
          { user: student._id, assignment: a2._id },
          {
            user: student._id,
            assignment: a2._id,
            submissionType: 'github_repo',
            repositoryUrl: 'https://github.com/jordanlee/sql-query-optimizer',
            status: 'Passed',
            score: 87,
            feedback: 'Optimized complex multi-table joins and window functions with covering indexes, dropping execution plan cost by 82%.',
            submittedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000),
            evaluatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
          },
          { upsert: true, new: true }
        );
      }
    }

    // 4. Verified Coding Challenges
    const challenges = await CodingChallenge.find();
    for (const c of challenges.slice(0, 3)) {
      await CodingSubmission.findOneAndUpdate(
        { user: student._id, challenge: c._id },
        {
          user: student._id,
          challenge: c._id,
          language: 'javascript',
          sourceCode: '// Production verified solution passing all test cases',
          passed: true,
          score: 100,
          passedTestCases: 8,
          totalTestCases: 8,
          submittedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        },
        { upsert: true, new: true }
      );
    }

    // 5. Verified Job Simulation
    const simulations = await JobSimulation.find();
    if (simulations.length > 0) {
      const sim = simulations[0];
      await JobSimulationSubmission.findOneAndUpdate(
        { user: student._id, simulation: sim._id },
        {
          user: student._id,
          simulation: sim._id,
          status: 'Evaluated',
          overallScore: 91,
          finalExecutiveSummary: 'Demonstrated superior professional problem solving, comprehensive data hygiene, and crisp executive technical reporting.',
          feedback: {
            executiveSummary: 'Demonstrated superior professional problem solving, comprehensive data hygiene, and crisp executive technical reporting.',
            strengths: ['Clean architectural thinking', 'Defensive validation', 'Analytical clarity'],
            improvementAreas: ['Add automated regression test hooks'],
          },
          taskProgress: [
            { taskId: 'task-1', taskNumber: 1, deliverableType: 'code', status: 'Completed', taskScore: 95, taskFeedback: 'Clean ETL pipelines' },
            { taskId: 'task-2', taskNumber: 2, deliverableType: 'report', status: 'Completed', taskScore: 90, taskFeedback: 'Accurate business insights' },
          ],
          submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          evaluatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        },
        { upsert: true, new: true }
      );
    }

    console.log('[Seed Portfolio] Authentic verified portfolio evidence seeded for student@lms.com.');
  } catch (err) {
    console.warn('[Seed Portfolio] Seed notice:', err.message);
  }
}
