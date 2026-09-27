import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';
import Assignment from './models/Assignment.js';
import AssignmentSubmission from './models/AssignmentSubmission.js';
import Project from './models/Project.js';
import ProjectSubmission from './models/ProjectSubmission.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Skill from './models/Skill.js';
import LearnerSkillProgress from './models/LearnerSkillProgress.js';

export async function seedInstructorIntelligenceCohort() {
  try {
    const instructor = await User.findOne({ email: 'instructor@lms.com' });
    if (!instructor) {
      console.warn('[Seed Intelligence] Instructor instructor@lms.com not found. Skipping.');
      return;
    }

    const instructorCourses = await Course.find({ instructor: instructor._id });
    if (instructorCourses.length === 0) {
      console.warn('[Seed Intelligence] No courses found for instructor. Skipping.');
      return;
    }

    const k8sCourse = instructorCourses.find((c) => c.title.includes('Kubernetes')) || instructorCourses[0];
    const webCourse = instructorCourses.find((c) => c.title.includes('Next.js') || c.title.includes('Node')) || instructorCourses[1] || instructorCourses[0];
    const dataCourse = instructorCourses.find((c) => c.title.includes('Kafka') || c.title.includes('Data')) || instructorCourses[2] || instructorCourses[0];

    const studentDefinitions = [
      {
        name: 'Marcus Vance',
        email: 'marcus.student@lms.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        headline: 'Cloud Systems Enthusiast',
        role: 'student',
      },
      {
        name: 'Aria Chen',
        email: 'aria.student@lms.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        headline: 'Lead Cloud-Native Architect Scholar',
        role: 'student',
      },
      {
        name: 'Devon Price',
        email: 'devon.student@lms.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        headline: 'Backend Developer in Training',
        role: 'student',
      },
      {
        name: 'Siddharth Patel',
        email: 'siddharth.student@lms.com',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
        headline: 'Full-Stack Engineering Fellow',
        role: 'student',
      },
    ];

    const seededStudents = {};
    for (const def of studentDefinitions) {
      let u = await User.findOne({ email: def.email });
      if (!u) {
        u = await User.create({
          ...def,
          password: 'Password123!',
        });
      }
      seededStudents[def.email] = u;
    }

    const jordan = await User.findOne({ email: 'student@lms.com' });
    const elena = await User.findOne({ email: 'elena.student@lms.com' });
    if (jordan) seededStudents['student@lms.com'] = jordan;
    if (elena) seededStudents['elena.student@lms.com'] = elena;

    // 1. Enrollments Configuration
    const enrollmentConfigs = [
      // Marcus Vance: High course progress (88%), low practical (46%) -> Curriculum Illusion Divergence!
      {
        studentEmail: 'marcus.student@lms.com',
        courseId: k8sCourse._id,
        progress: 88,
        completed: false,
      },
      // Devon Price: 72% course progress, but struggles in assessments/practical tasks (52%) -> Needs Attention
      {
        studentEmail: 'devon.student@lms.com',
        courseId: webCourse._id,
        progress: 72,
        completed: false,
      },
      // Aria Chen: High Performer across all boards
      {
        studentEmail: 'aria.student@lms.com',
        courseId: k8sCourse._id,
        progress: 95,
        completed: true,
      },
      {
        studentEmail: 'aria.student@lms.com',
        courseId: webCourse._id,
        progress: 92,
        completed: true,
      },
      // Siddharth Patel: Early stage progress (38%), practical 68% -> Moderate Risk
      {
        studentEmail: 'siddharth.student@lms.com',
        courseId: webCourse._id,
        progress: 38,
        completed: false,
      },
    ];

    for (const cfg of enrollmentConfigs) {
      const studentDoc = seededStudents[cfg.studentEmail];
      if (!studentDoc) continue;

      let enr = await Enrollment.findOne({ student: studentDoc._id, course: cfg.courseId });
      if (!enr) {
        await Enrollment.create({
          student: studentDoc._id,
          course: cfg.courseId,
          completionPercentage: cfg.progress,
          completed: cfg.completed,
          enrolledAt: new Date(Date.now() - 14 * 24 * 3600 * 1000),
        });
      } else {
        enr.completionPercentage = cfg.progress;
        enr.completed = cfg.completed;
        await enr.save();
      }
    }

    // 2. Fetch Assignments & Quizzes
    const assignments = await Assignment.find({ courseId: { $in: [k8sCourse._id, webCourse._id, dataCourse._id] } });
    const quizzes = await Quiz.find({ course: { $in: [k8sCourse._id, webCourse._id, dataCourse._id] } });
    const projects = await Project.find({ courseId: { $in: [k8sCourse._id, webCourse._id, dataCourse._id] } });

    // Seed Assignment Submissions
    if (assignments.length > 0) {
      const a1 = assignments[0];
      const a2 = assignments[1] || assignments[0];

      // Marcus Vance: Submitted, score 45% -> FAILED practical assignment
      if (seededStudents['marcus.student@lms.com']) {
        await AssignmentSubmission.findOneAndUpdate(
          { assignment: a1._id, user: seededStudents['marcus.student@lms.com']._id },
          {
            assignment: a1._id,
            user: seededStudents['marcus.student@lms.com']._id,
            submissionType: 'github_repo',
            repositoryUrl: 'https://github.com/marcus/k8s-mesh-attempt',
            status: 'Failed',
            score: 45,
            feedback: 'Container orchestration manifests failed health probes; Istio ingress gateway misconfigured.',
            submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
            evaluatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
          },
          { upsert: true, new: true }
        );
      }

      // Devon Price: Submitted, score 54% -> Needs Revision / Low Practical
      if (seededStudents['devon.student@lms.com']) {
        await AssignmentSubmission.findOneAndUpdate(
          { assignment: a2._id, user: seededStudents['devon.student@lms.com']._id },
          {
            assignment: a2._id,
            user: seededStudents['devon.student@lms.com']._id,
            submissionType: 'combined',
            repositoryUrl: 'https://github.com/devon/backend-api',
            status: 'Needs Revision',
            score: 54,
            feedback: 'Missing rate-limiting middleware, SQL injection vulnerabilities detected in search route.',
            submittedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
            evaluatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          },
          { upsert: true, new: true }
        );
      }

      // Aria Chen: High Score 95% -> Passed
      if (seededStudents['aria.student@lms.com']) {
        await AssignmentSubmission.findOneAndUpdate(
          { assignment: a1._id, user: seededStudents['aria.student@lms.com']._id },
          {
            assignment: a1._id,
            user: seededStudents['aria.student@lms.com']._id,
            submissionType: 'combined',
            repositoryUrl: 'https://github.com/aria/k8s-service-mesh-prod',
            deploymentUrl: 'https://mesh-prod.aria-k8s.io',
            status: 'Passed',
            score: 95,
            feedback: 'Exemplary Helm chart modularity, Cilium network policies, and zero-downtime rolling canary rollout.',
            submittedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
            evaluatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
          },
          { upsert: true, new: true }
        );
      }
    }

    // Seed Quiz Attempts
    if (quizzes.length > 0) {
      const q1 = quizzes[0];
      const q2 = quizzes[1] || quizzes[0];

      // Marcus Vance: 48% on Quiz -> Failed
      if (seededStudents['marcus.student@lms.com']) {
        await QuizAttempt.findOneAndUpdate(
          { student: seededStudents['marcus.student@lms.com']._id, quiz: q1._id },
          {
            student: seededStudents['marcus.student@lms.com']._id,
            quiz: q1._id,
            course: q1.course,
            score: 12,
            totalPoints: 25,
            percentage: 48,
            passed: false,
            attemptedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
          },
          { upsert: true, new: true }
        );
      }

      // Devon Price: 2 Failed Quizzes
      if (seededStudents['devon.student@lms.com']) {
        await QuizAttempt.findOneAndUpdate(
          { student: seededStudents['devon.student@lms.com']._id, quiz: q1._id },
          {
            student: seededStudents['devon.student@lms.com']._id,
            quiz: q1._id,
            course: q1.course,
            score: 10,
            totalPoints: 25,
            percentage: 40,
            passed: false,
            attemptedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
          },
          { upsert: true, new: true }
        );
        await QuizAttempt.findOneAndUpdate(
          { student: seededStudents['devon.student@lms.com']._id, quiz: q2._id },
          {
            student: seededStudents['devon.student@lms.com']._id,
            quiz: q2._id,
            course: q2.course,
            score: 11,
            totalPoints: 25,
            percentage: 44,
            passed: false,
            attemptedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          },
          { upsert: true, new: true }
        );
      }

      // Aria Chen: 96% Passed
      if (seededStudents['aria.student@lms.com']) {
        await QuizAttempt.findOneAndUpdate(
          { student: seededStudents['aria.student@lms.com']._id, quiz: q1._id },
          {
            student: seededStudents['aria.student@lms.com']._id,
            quiz: q1._id,
            course: q1.course,
            score: 24,
            totalPoints: 25,
            percentage: 96,
            passed: true,
            attemptedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
          },
          { upsert: true, new: true }
        );
      }
    }

    // Seed Skill Progress Records
    const skills = await Skill.find();
    const k8sSkill = skills.find((s) => s.slug.includes('kubernetes')) || skills[0];
    const nodeSkill = skills.find((s) => s.slug === 'node-js') || skills[1];
    const sqlSkill = skills.find((s) => s.slug === 'sql') || skills[2];

    const studentSkillConfigs = [
      {
        studentEmail: 'marcus.student@lms.com',
        skillId: k8sSkill?._id,
        knowledge: 75,
        practical: 46,
        project: 40,
        overall: 48,
        level: 'Novice',
      },
      {
        studentEmail: 'devon.student@lms.com',
        skillId: nodeSkill?._id,
        knowledge: 65,
        practical: 52,
        project: 50,
        overall: 54,
        level: 'Developing',
      },
      {
        studentEmail: 'aria.student@lms.com',
        skillId: k8sSkill?._id,
        knowledge: 95,
        practical: 92,
        project: 94,
        overall: 94,
        level: 'Master',
      },
      {
        studentEmail: 'siddharth.student@lms.com',
        skillId: sqlSkill?._id,
        knowledge: 70,
        practical: 68,
        project: 65,
        overall: 67,
        level: 'Proficient',
      },
    ];

    for (const sc of studentSkillConfigs) {
      const studentDoc = seededStudents[sc.studentEmail];
      if (!studentDoc || !sc.skillId) continue;

      await LearnerSkillProgress.findOneAndUpdate(
        { user: studentDoc._id, skill: sc.skillId },
        {
          user: studentDoc._id,
          skill: sc.skillId,
          knowledgeScore: sc.knowledge,
          practicalScore: sc.practical,
          projectScore: sc.project,
          overallScore: sc.overall,
          proficiencyLevel: sc.level,
          confidenceLevel: 'High',
          lastCalculatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    console.log('[Seed Intelligence] Instructor Intelligence cohort initialized successfully.');
  } catch (err) {
    console.error('[Seed Intelligence] Error initializing intelligence cohort:', err);
  }
}
