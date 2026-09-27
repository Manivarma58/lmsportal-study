import mongoose from 'mongoose';
import RecommendationHistory from '../models/RecommendationHistory.js';
import LearnerSkillProgress from '../models/LearnerSkillProgress.js';
import Skill from '../models/Skill.js';
import TargetRole from '../models/TargetRole.js';
import LearnerTargetRole from '../models/LearnerTargetRole.js';
import CodingChallenge from '../models/CodingChallenge.js';
import CodingSubmission from '../models/CodingSubmission.js';
import Project from '../models/Project.js';
import ProjectSubmission from '../models/ProjectSubmission.js';
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import Course from '../models/Course.js';
import CourseSkill from '../models/CourseSkill.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { getOrCreateActiveIntervention } from './adaptiveLearningService.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * RULE-BASED DETERMINISTIC NOVA RECOMMENDATION ENGINE
 *
 * Deterministically evaluates:
 * - Learner's demonstrated skill scores & dimensions (knowledge, practical, project, assessment)
 * - Target role requirements, critical skills, and gap sizes
 * - Failed assessments, quizzes, and coding attempts needing remediation
 * - Incomplete course progress and next syllabus lessons
 * - Historical recommendations to prevent duplicates and spam
 *
 * Strictly avoids:
 * - Already completed challenges, passed quizzes, and completed curricula
 * - Irrelevant courses
 * - Duplicate recently recommended tasks
 */
export const generateNextActionRecommendation = async (userId, options = {}) => {
  if (!userId) {
    throw new ErrorResponse('User ID is required to generate recommendations.', 400);
  }

  // 1. Fetch Target Role Context
  let targetRole = null;
  const learnerTargetRole = await LearnerTargetRole.findOne({
    user: userId,
    isActive: true,
  }).populate({
    path: 'targetRole',
    populate: {
      path: 'requiredSkills.skill',
      select: 'name slug category difficulty icon',
    },
  });

  if (learnerTargetRole && learnerTargetRole.targetRole) {
    targetRole = learnerTargetRole.targetRole;
  } else {
    // Fallback to first published target role (e.g. Full Stack Developer)
    targetRole = await TargetRole.findOne({ isPublished: true })
      .populate({
        path: 'requiredSkills.skill',
        select: 'name slug category difficulty icon',
      })
      .sort({ createdAt: 1 });
  }

  // 2. Fetch Learner Demonstrated Skills
  const userSkillRecords = await LearnerSkillProgress.find({ user: userId }).populate('skill');
  const userSkillMap = new Map();
  userSkillRecords.forEach((rec) => {
    if (rec.skill) {
      userSkillMap.set(rec.skill._id.toString(), rec);
      if (rec.skill.slug) userSkillMap.set(rec.skill.slug.toLowerCase(), rec);
      if (rec.skill.name) userSkillMap.set(rec.skill.name.toLowerCase().trim(), rec);
    }
  });

  // 3. Fetch Historical Performance & Submissions (To Avoid Completed Content & Find Remediation Tasks)
  const [
    codingSubmissions,
    quizAttempts,
    assignmentSubmissions,
    projectSubmissions,
    enrollments,
    recentRecommendations,
  ] = await Promise.all([
    CodingSubmission.find({ user: userId }).populate('challenge').sort({ createdAt: -1 }),
    QuizAttempt.find({ student: userId }).populate('quiz').sort({ createdAt: -1 }),
    AssignmentSubmission.find({ user: userId }).populate('assignment').sort({ createdAt: -1 }),
    ProjectSubmission.find({ user: userId }).populate('project').sort({ createdAt: -1 }),
    Enrollment.find({ student: userId }).populate('course').sort({ enrolledAt: -1 }),
    RecommendationHistory.find({
      user: userId,
      recommendedAt: { $gte: new Date(Date.now() - 48 * 3600 * 1000) },
    }).select('resourceId resourceType status recommendedAt'),
  ]);

  // Set of recently recommended resource IDs to prevent duplicate tasks
  const recentlyRecommendedIds = new Set();
  const dismissedResourceIds = new Set();
  recentRecommendations.forEach((r) => {
    if (r.status === 'dismissed') {
      dismissedResourceIds.add(r.resourceId.toString());
    } else if (r.status === 'active' || r.status === 'completed') {
      recentlyRecommendedIds.add(r.resourceId.toString());
    }
  });

  // Completed items sets
  const passedChallengeIds = new Set();
  const failedChallengeMap = new Map(); // challengeId -> latest attempt
  codingSubmissions.forEach((sub) => {
    if (!sub.challenge) return;
    const cid = sub.challenge._id.toString();
    if (sub.status === 'Accepted' || sub.score >= 80) {
      passedChallengeIds.add(cid);
      failedChallengeMap.delete(cid);
    } else if (!passedChallengeIds.has(cid)) {
      if (!failedChallengeMap.has(cid)) failedChallengeMap.set(cid, sub);
    }
  });

  const passedQuizIds = new Set();
  const failedQuizMap = new Map(); // quizId -> attempt
  quizAttempts.forEach((qa) => {
    if (!qa.quiz) return;
    const qid = qa.quiz._id.toString();
    if (qa.score >= 60 || qa.passed) {
      passedQuizIds.add(qid);
      failedQuizMap.delete(qid);
    } else if (!passedQuizIds.has(qid)) {
      if (!failedQuizMap.has(qid)) failedQuizMap.set(qid, qa);
    }
  });

  const completedProjectIds = new Set();
  projectSubmissions.forEach((ps) => {
    if (!ps.project) return;
    const pid = ps.project._id.toString();
    if ((ps.status === 'evaluated' || ps.status === 'graded') && ps.score >= 70) {
      completedProjectIds.add(pid);
    }
  });

  const completedCourseIds = new Set();
  const inProgressEnrollments = [];
  enrollments.forEach((e) => {
    if (!e.course) return;
    const cid = e.course._id.toString();
    if (e.completed || (e.completionPercentage ?? 0) >= 100) {
      completedCourseIds.add(cid);
    } else {
      inProgressEnrollments.push(e);
    }
  });

  // 4. Construct Target Role Skill Matrix & Deficits
  const targetSkillRequirements = [];
  if (targetRole && Array.isArray(targetRole.requiredSkills)) {
    targetRole.requiredSkills.forEach((req) => {
      if (!req.skill) return;
      const skillIdStr = req.skill._id.toString();
      const progress =
        userSkillMap.get(skillIdStr) ||
        userSkillMap.get(req.skill.slug?.toLowerCase()) ||
        userSkillMap.get(req.skill.name?.toLowerCase().trim());

      const currentScore = progress ? Math.round(progress.overallScore || 0) : 0;
      const practicalScore = progress ? Math.round(progress.practicalScore || 0) : 0;
      const knowledgeScore = progress ? Math.round(progress.knowledgeScore || 0) : 0;
      const projectScore = progress ? Math.round(progress.projectScore || 0) : 0;
      const assessmentScore = progress ? Math.round(progress.assessmentScore || 0) : 0;
      const evidenceCount = progress ? progress.evidenceCount || 0 : 0;
      const requiredScore = req.requiredScore || 70;
      const gapSize = Math.max(0, requiredScore - currentScore);

      targetSkillRequirements.push({
        skill: req.skill,
        skillId: req.skill._id,
        skillName: req.skill.name,
        importance: req.importance || 'Important',
        requiredScore,
        currentScore,
        gapSize,
        practicalScore,
        knowledgeScore,
        projectScore,
        assessmentScore,
        evidenceCount,
      });
    });
  }

  // Sort requirements: Critical first, then biggest gap size
  targetSkillRequirements.sort((a, b) => {
    const impOrder = { Critical: 3, Important: 2, Optional: 1 };
    const diff = (impOrder[b.importance] || 2) - (impOrder[a.importance] || 2);
    if (diff !== 0) return diff;
    return b.gapSize - a.gapSize;
  });

  // Candidate Actions Accumulator
  const candidateActions = [];

  // =========================================================================
  // RULE 0: ACTIVE ADAPTIVE REMEDIATION INTERVENTION (CRITICAL PRIORITY)
  // When an adaptive learning intervention has been activated for a weak skill.
  // =========================================================================
  try {
    const activeIntervention = await getOrCreateActiveIntervention(userId);
    if (activeIntervention && activeIntervention.status === 'Active') {
      const stageIdx = activeIntervention.currentStageIndex || 0;
      const activeStage = activeIntervention.stages[stageIdx] || activeIntervention.stages[0];

      if (activeStage && !dismissedResourceIds.has(String(activeStage.activityId))) {
        candidateActions.push({
          title: `Adaptive Remediation: ${activeStage.activityTitle}`,
          reason: `Targeted intervention to resolve performance bottleneck in ${activeIntervention.skillName}. Stage ${activeStage.stageNumber} of 4: ${activeStage.stageName}.`,
          priority: activeIntervention.severity === 'Critical' ? 'Critical' : 'High',
          estimatedDuration: '25 minutes',
          estimatedMinutes: 25,
          relatedSkill: activeIntervention.skill,
          skillName: activeIntervention.skillName,
          resourceType: activeStage.activityType,
          resourceId: String(activeStage.activityId),
          resourceModel: activeStage.activityType === 'coding_challenge' ? 'CodingChallenge' : 'Quiz',
          resourceTitle: activeStage.activityTitle,
          actionUrl: activeStage.activityLink,
          buttonText: `Start ${activeStage.stageName}`,
          explanation: {
            ruleTriggered: 'ADAPTIVE_REMEDIATION_PLAN',
            targetRoleName: targetRole?.name || 'Target Role',
            currentScore: activeIntervention.triggerTelemetry?.initialScore || 0,
            targetScore: activeStage.targetScore || 75,
            gapSize: Math.max(0, (activeStage.targetScore || 75) - (activeIntervention.triggerTelemetry?.initialScore || 0)),
            dimension: activeIntervention.triggerTelemetry?.dimensionStruggling || 'practical',
            dimensionScore: activeIntervention.triggerTelemetry?.initialScore || 0,
            historicalTrigger: activeIntervention.detectionReason,
          },
          scoreWeight: 100, // Absolute top priority
        });
      }
    }
  } catch (adaptiveErr) {
    console.error('[RecEngine Adaptive Hook Notice]:', adaptiveErr.message);
  }

  // =========================================================================
  // RULE 1: RETAKE FAILED CODING ASSESSMENT OR QUIZ (CRITICAL PRIORITY)
  // When learner attempted a challenge or quiz and scored < 60% on a target skill.
  // =========================================================================
  for (const [failedChId, sub] of failedChallengeMap.entries()) {
    if (dismissedResourceIds.has(failedChId)) continue;
    const challenge = sub.challenge;
    if (!challenge) continue;

    // Check if challenge relates to target role skills
    const matchingReq = targetSkillRequirements.find(
      (req) => challenge.skills && challenge.skills.some((s) => s.toString() === req.skillId.toString())
    );

    const relatedSkillName = matchingReq ? matchingReq.skillName : 'Practical Programming';
    const relatedSkillId = matchingReq ? matchingReq.skillId : null;
    const previousScore = sub.score || 0;

    candidateActions.push({
      title: `Retry Coding Lab: ${challenge.title}`,
      reason: `Your previous submission on "${challenge.title}" scored ${previousScore}%. Retrying this challenge will calibrate your ${relatedSkillName} practical proficiency.`,
      priority: matchingReq?.importance === 'Critical' ? 'Critical' : 'High',
      estimatedDuration: `${Math.round((challenge.timeLimit || 5000) / 1000 * 5) || 30} minutes`,
      estimatedMinutes: 30,
      relatedSkill: relatedSkillId,
      skillName: relatedSkillName,
      resourceType: 'coding_challenge',
      resourceId: challenge._id.toString(),
      resourceModel: 'CodingChallenge',
      resourceTitle: challenge.title,
      actionUrl: `/student/challenge/${challenge._id}`,
      buttonText: 'Retry Challenge',
      explanation: {
        ruleTriggered: 'FAILED_ASSESSMENT_REMEDIATION',
        targetRoleName: targetRole?.name || 'General Engineering',
        currentScore: previousScore,
        targetScore: 80,
        gapSize: 80 - previousScore,
        dimension: 'practical',
        dimensionScore: previousScore,
        historicalTrigger: `Last submission scored ${previousScore}% (${sub.passedTests || 0}/${sub.totalTests || 1} tests passed)`,
      },
      scoreWeight: 95, // Priority score
    });
  }

  // =========================================================================
  // RULE 2: TARGET ROLE PRACTICAL DEFICIT (HIGH PRIORITY)
  // Target role requires practical score, but demonstrated score is below benchmark.
  // =========================================================================
  for (const req of targetSkillRequirements) {
    if (req.gapSize > 0 || req.practicalScore < req.requiredScore) {
      // Find uncompleted published coding challenge teaching this skill
      const challenges = await CodingChallenge.find({
        skills: req.skillId,
        isPublished: true,
        _id: { $nin: [...passedChallengeIds, ...dismissedResourceIds] },
      }).limit(3);

      for (const ch of challenges) {
        const chId = ch._id.toString();
        const durationMin = ch.difficulty === 'Hard' ? 45 : ch.difficulty === 'Medium' ? 35 : 20;

        candidateActions.push({
          title: `Complete ${ch.title}`,
          reason: `Your ${req.skillName} practical score is ${req.practicalScore}%, below the target of ${req.requiredScore}%.`,
          priority: req.importance === 'Critical' ? 'Critical' : 'High',
          estimatedDuration: `${durationMin} minutes`,
          estimatedMinutes: durationMin,
          relatedSkill: req.skillId,
          skillName: req.skillName,
          resourceType: 'coding_challenge',
          resourceId: chId,
          resourceModel: 'CodingChallenge',
          resourceTitle: ch.title,
          actionUrl: `/student/challenge/${chId}`,
          buttonText: 'Start Challenge',
          explanation: {
            ruleTriggered: 'TARGET_ROLE_PRACTICAL_DEFICIT',
            targetRoleName: targetRole?.name || 'Target Role',
            currentScore: req.practicalScore,
            targetScore: req.requiredScore,
            gapSize: Math.max(0, req.requiredScore - req.practicalScore),
            dimension: 'practical',
            dimensionScore: req.practicalScore,
            evidenceCount: req.evidenceCount,
            historicalTrigger: `${req.importance} requirement for ${targetRole?.name || 'Target Role'}.`,
          },
          scoreWeight: req.importance === 'Critical' ? 90 : 80,
        });
        break; // Take highest matching challenge for this skill
      }
    }
  }

  // =========================================================================
  // RULE 3: TARGET ROLE CAPSTONE PROJECT ARCHITECTURE DEFICIT (HIGH PRIORITY)
  // Target role skill requires verified project architecture, but projectScore < 60%.
  // =========================================================================
  for (const req of targetSkillRequirements) {
    if (req.projectScore < 60 || req.gapSize > 15) {
      const projects = await Project.find({
        requiredSkills: req.skillId,
        isPublished: true,
        _id: { $nin: [...completedProjectIds, ...dismissedResourceIds] },
      }).limit(2);

      for (const pr of projects) {
        const prId = pr._id.toString();
        candidateActions.push({
          title: `Implement Project: ${pr.title}`,
          reason: `Your demonstrated ${req.skillName} project score is ${req.projectScore}% (target: ${req.requiredScore}%). Real-world implementation is required.`,
          priority: req.importance === 'Critical' ? 'High' : 'Medium',
          estimatedDuration: pr.estimatedDuration || '2 hours',
          estimatedMinutes: 90,
          relatedSkill: req.skillId,
          skillName: req.skillName,
          resourceType: 'project',
          resourceId: prId,
          resourceModel: 'Project',
          resourceTitle: pr.title,
          actionUrl: `/student/projects/${prId}`,
          buttonText: 'Open Project Workspace',
          explanation: {
            ruleTriggered: 'TARGET_ROLE_PROJECT_ARCHITECTURE_DEFICIT',
            targetRoleName: targetRole?.name || 'Target Role',
            currentScore: req.projectScore,
            targetScore: req.requiredScore,
            gapSize: Math.max(0, req.requiredScore - req.projectScore),
            dimension: 'project',
            dimensionScore: req.projectScore,
            evidenceCount: req.evidenceCount,
            historicalTrigger: `Capstone milestone needed to verify production architecture standards.`,
          },
          scoreWeight: req.importance === 'Critical' ? 85 : 75,
        });
        break;
      }
    }
  }

  // =========================================================================
  // RULE 4: ACTIVE SYLLABUS CONTINUATION (MEDIUM PRIORITY)
  // Advance next uncompleted lesson in enrolled curriculum.
  // =========================================================================
  for (const enrollment of inProgressEnrollments) {
    const course = enrollment.course;
    if (!course || dismissedResourceIds.has(course._id.toString())) continue;

    const progressPct = enrollment.completionPercentage ?? enrollment.progressPercentage ?? 0;
    const completedLessonIds = new Set(
      (enrollment.completedLessons || []).map((l) =>
        l.lesson ? l.lesson.toString() : l.toString()
      )
    );

    // Find next lesson
    const nextLesson = await Lesson.findOne({
      course: course._id,
      _id: { $nin: Array.from(completedLessonIds) },
    }).sort({ order: 1 });

    if (nextLesson) {
      candidateActions.push({
        title: `Continue Course: ${nextLesson.title}`,
        reason: `You are currently ${progressPct}% through "${course.title}". Complete "${nextLesson.title}" to advance your core syllabus.`,
        priority: 'Medium',
        estimatedDuration: `${nextLesson.duration || 20} minutes`,
        estimatedMinutes: nextLesson.duration || 20,
        relatedSkill: null,
        skillName: course.category || 'Core Curriculum',
        resourceType: 'course_lesson',
        resourceId: nextLesson._id.toString(),
        resourceModel: 'Lesson',
        resourceTitle: nextLesson.title,
        actionUrl: `/student/course/${course._id}/learn?lesson=${nextLesson._id}`,
        buttonText: 'Resume Lesson',
        explanation: {
          ruleTriggered: 'ACTIVE_SYLLABUS_CONTINUATION',
          targetRoleName: course.title,
          currentScore: progressPct,
          targetScore: 100,
          gapSize: 100 - progressPct,
          dimension: 'knowledge',
          dimensionScore: progressPct,
          historicalTrigger: `Active curriculum at ${progressPct}% completion with ${completedLessonIds.size} lessons completed.`,
        },
        scoreWeight: 70,
      });
      break; // One active course continuation is sufficient
    }
  }

  // =========================================================================
  // RULE 5: FALLBACK BENCHMARK COURSE OR CHALLENGE CALIBRATION (STANDARD)
  // Ensure the learner always has an actionable path even if fully caught up.
  // =========================================================================
  if (candidateActions.length === 0) {
    const fallbackChallenge = await CodingChallenge.findOne({
      isPublished: true,
      _id: { $nin: Array.from(passedChallengeIds) },
    });

    if (fallbackChallenge) {
      candidateActions.push({
        title: `Explore Challenge: ${fallbackChallenge.title}`,
        reason: `Establish new practical evidence by testing your algorithmic problem solving on "${fallbackChallenge.title}".`,
        priority: 'Medium',
        estimatedDuration: '30 minutes',
        estimatedMinutes: 30,
        relatedSkill: fallbackChallenge.skills?.[0] || null,
        skillName: fallbackChallenge.category || 'General Algorithms',
        resourceType: 'coding_challenge',
        resourceId: fallbackChallenge._id.toString(),
        resourceModel: 'CodingChallenge',
        resourceTitle: fallbackChallenge.title,
        actionUrl: `/student/challenge/${fallbackChallenge._id}`,
        buttonText: 'Start Challenge',
        explanation: {
          ruleTriggered: 'BENCHMARK_SKILL_CALIBRATION',
          targetRoleName: targetRole?.name || 'General Curriculum',
          currentScore: 0,
          targetScore: 75,
          gapSize: 75,
          dimension: 'practical',
          dimensionScore: 0,
          historicalTrigger: 'Calibrate overall technical coding proficiency score.',
        },
        scoreWeight: 50,
      });
    }
  }

  // Sort candidate actions by rule priority score weight descending
  candidateActions.sort((a, b) => b.scoreWeight - a.scoreWeight);

  if (candidateActions.length === 0) {
    return {
      recommendation: null,
      queuedActions: [],
      message: 'All recommended curriculum tasks and target role requirements are currently satisfied.',
    };
  }

  // Primary recommendation is highest weighted candidate action
  const topAction = candidateActions[0];
  const queuedActions = candidateActions.slice(1, 4);

  // 5. Store / Update in RecommendationHistory
  // Check if current active recommendation matches the top action
  const existingActive = await RecommendationHistory.findOne({
    user: userId,
    status: 'active',
  });

  let savedRecommendation = null;

  if (
    existingActive &&
    existingActive.resourceId === topAction.resourceId &&
    existingActive.resourceType === topAction.resourceType
  ) {
    existingActive.title = topAction.title;
    existingActive.reason = topAction.reason;
    existingActive.priority = topAction.priority;
    existingActive.explanation = topAction.explanation;
    await existingActive.save();
    savedRecommendation = existingActive;
  } else {
    // Supersede previously active recommendation
    if (existingActive) {
      existingActive.status = 'superseded';
      await existingActive.save();
    }

    // Save new active recommendation
    savedRecommendation = await RecommendationHistory.create({
      user: userId,
      title: topAction.title,
      reason: topAction.reason,
      explanation: topAction.explanation,
      priority: topAction.priority,
      estimatedDuration: topAction.estimatedDuration,
      estimatedMinutes: topAction.estimatedMinutes,
      relatedSkill: topAction.relatedSkill,
      skillName: topAction.skillName,
      resourceType: topAction.resourceType,
      resourceId: topAction.resourceId,
      resourceModel: topAction.resourceModel,
      resourceTitle: topAction.resourceTitle,
      actionUrl: topAction.actionUrl,
      buttonText: topAction.buttonText,
      status: 'active',
      recommendedAt: new Date(),
    });
  }

  return {
    recommendation: {
      id: savedRecommendation._id,
      title: savedRecommendation.title,
      reason: savedRecommendation.reason,
      priority: savedRecommendation.priority,
      estimatedDuration: savedRecommendation.estimatedDuration,
      estimatedMinutes: savedRecommendation.estimatedMinutes,
      relatedSkill: {
        id: savedRecommendation.relatedSkill,
        name: savedRecommendation.skillName,
      },
      relatedResource: {
        type: savedRecommendation.resourceType,
        id: savedRecommendation.resourceId,
        title: savedRecommendation.resourceTitle,
        model: savedRecommendation.resourceModel,
        actionUrl: savedRecommendation.actionUrl,
        buttonText: savedRecommendation.buttonText,
      },
      explanation: savedRecommendation.explanation,
      status: savedRecommendation.status,
      recommendedAt: savedRecommendation.recommendedAt,
    },
    queuedActions: queuedActions.map((qa) => ({
      title: qa.title,
      reason: qa.reason,
      priority: qa.priority,
      estimatedDuration: qa.estimatedDuration,
      skillName: qa.skillName,
      actionUrl: qa.actionUrl,
      buttonText: qa.buttonText,
      resourceType: qa.resourceType,
    })),
  };
};

/**
 * Get learner's recommendation history log
 */
export const getLearnerRecommendationHistory = async (userId, limit = 15) => {
  if (!userId) {
    throw new ErrorResponse('User ID is required', 400);
  }

  const history = await RecommendationHistory.find({ user: userId })
    .sort({ recommendedAt: -1 })
    .limit(limit);

  return history;
};

/**
 * Dismiss a recommendation
 */
export const dismissRecommendation = async (userId, recommendationId) => {
  if (!userId || !recommendationId) {
    throw new ErrorResponse('User ID and Recommendation ID are required', 400);
  }

  const rec = await RecommendationHistory.findOne({
    _id: recommendationId,
    user: userId,
  });

  if (!rec) {
    throw new ErrorResponse('Recommendation record not found', 404);
  }

  rec.status = 'dismissed';
  rec.dismissedAt = new Date();
  await rec.save();

  // Generate next best recommendation immediately
  return await generateNextActionRecommendation(userId);
};

/**
 * Mark a recommendation as completed
 */
export const completeRecommendation = async (userId, recommendationId) => {
  if (!userId || !recommendationId) {
    throw new ErrorResponse('User ID and Recommendation ID are required', 400);
  }

  const rec = await RecommendationHistory.findOne({
    _id: recommendationId,
    user: userId,
  });

  if (!rec) {
    throw new ErrorResponse('Recommendation record not found', 404);
  }

  rec.status = 'completed';
  rec.completedAt = new Date();
  await rec.save();

  // Generate next best action
  return await generateNextActionRecommendation(userId);
};
