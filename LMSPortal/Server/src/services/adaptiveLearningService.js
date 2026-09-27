import mongoose from 'mongoose';
import AdaptiveIntervention from '../models/AdaptiveIntervention.js';
import LearnerSkillProgress from '../models/LearnerSkillProgress.js';
import Skill from '../models/Skill.js';
import TargetRole from '../models/TargetRole.js';
import LearnerTargetRole from '../models/LearnerTargetRole.js';
import CodingChallenge from '../models/CodingChallenge.js';
import CodingSubmission from '../models/CodingSubmission.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import Project from '../models/Project.js';
import JobSimulation from '../models/JobSimulation.js';
import Course from '../models/Course.js';
import CourseSkill from '../models/CourseSkill.js';
import Enrollment from '../models/Enrollment.js';
import { createNotification } from './notificationService.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Detect learner skill weaknesses by cross-referencing:
 * 1. Low skill scores (< 60%) or large gap from target role benchmark
 * 2. Declining performance trend
 * 3. Repeated quiz failures / low scores
 * 4. Failed coding challenge submissions / test failures
 * 5. Low assignment and project rubric evaluations
 */
export const detectLearnerWeaknesses = async (userId) => {
  if (!userId) return [];

  // 1. Fetch Target Role benchmark expectations
  let targetRole = null;
  const learnerTargetRole = await LearnerTargetRole.findOne({
    user: userId,
    isActive: true,
  }).populate('targetRole');

  if (learnerTargetRole?.targetRole) {
    targetRole = learnerTargetRole.targetRole;
  } else {
    targetRole = await TargetRole.findOne({ isPublished: true }).sort({ createdAt: 1 });
  }

  const roleReqMap = new Map();
  if (targetRole?.requiredSkills) {
    targetRole.requiredSkills.forEach((rs) => {
      roleReqMap.set(String(rs.skill), {
        requiredScore: rs.minimumProficiency || rs.requiredScore || 70,
        skillName: rs.skillName,
        isCore: rs.isCore !== false,
      });
    });
  }

  // 2. Fetch Learner Demonstrated Skills
  const skillProgressList = await LearnerSkillProgress.find({ user: userId }).populate('skill');

  // 3. Fetch Recent Telemetry (Coding failures, Quiz failures, Assignment evaluations)
  const [codingSubmissions, quizAttempts, assignmentSubs] = await Promise.all([
    CodingSubmission.find({ user: userId })
      .populate('challenge')
      .sort({ createdAt: -1 })
      .limit(20),
    QuizAttempt.find({ student: userId })
      .populate('quiz')
      .sort({ createdAt: -1 })
      .limit(15),
    AssignmentSubmission.find({ user: userId })
      .populate('assignment')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  const weaknesses = [];

  for (const sp of skillProgressList) {
    if (!sp.skill) continue;

    const skillIdStr = String(sp.skill._id);
    const skillName = sp.skill.name;
    const overallScore = sp.overallScore || 0;
    const reqInfo = roleReqMap.get(skillIdStr) || { requiredScore: 70, isCore: false };
    const requiredScore = reqInfo.requiredScore;
    const gapSize = Math.max(0, requiredScore - overallScore);

    let failureCount = 0;
    const reasons = [];

    // Telemetry Check: Coding Submissions in this skill
    const skillCodingSubs = codingSubmissions.filter((sub) => {
      const challengeSkills = sub.challenge?.skillIds || [];
      return challengeSkills.some((sId) => String(sId) === skillIdStr);
    });

    const failedCodingCount = skillCodingSubs.filter(
      (sub) => sub.status !== 'Accepted' || (sub.passedTests / (sub.totalTests || 1)) < 0.7
    ).length;

    if (failedCodingCount > 0) {
      failureCount += failedCodingCount;
      reasons.push(`${failedCodingCount} unsuccessful coding lab attempt(s)`);
    }

    // Telemetry Check: Quiz Attempts in courses teaching this skill
    const failedQuizCount = quizAttempts.filter(
      (qa) => qa.score !== undefined && qa.score < 65
    ).length;

    // Telemetry Check: Low Project Score
    if (sp.projectScore !== undefined && sp.projectScore < 60) {
      failureCount += 1;
      reasons.push(`Low project architecture score (${sp.projectScore}%)`);
    }

    // Telemetry Check: Score Trend & Dimensions
    const isDeclining = sp.trend === 'Declining';
    if (isDeclining) {
      reasons.push('Demonstrated score trajectory is declining');
    }

    const hasLowPractical = sp.practicalScore !== undefined && sp.practicalScore < 70;
    if (hasLowPractical) {
      reasons.push(`Practical coding score is below target (${sp.practicalScore}%)`);
    }

    const hasLowKnowledge = sp.knowledgeScore !== undefined && sp.knowledgeScore < 60;
    if (hasLowKnowledge) {
      reasons.push(`Theoretical assessment score is below target (${sp.knowledgeScore}%)`);
    }

    // Determine if qualifying as a weakness:
    // Repeated assessment failures, low coding scores, low assignment scores, low project scores, declining trend, or score below benchmark
    const isUnderperforming =
      overallScore < requiredScore ||
      overallScore < 75 ||
      hasLowPractical ||
      (sp.projectScore !== undefined && sp.projectScore < 60) ||
      failureCount >= 1 ||
      isDeclining;

    if (isUnderperforming) {
      // Determine struggling dimension
      let strugglingDimension = 'general';
      if (sp.projectScore !== undefined && sp.projectScore < 50) {
        strugglingDimension = 'project';
      } else if (sp.practicalScore < sp.knowledgeScore && sp.practicalScore < 70) {
        strugglingDimension = 'practical';
      } else if (sp.knowledgeScore < 60) {
        strugglingDimension = 'knowledge';
      } else if (sp.projectScore < 60) {
        strugglingDimension = 'project';
      }

      // Severity Scoring
      let severity = 'Low';
      if (overallScore < 50 || failureCount >= 3 || (gapSize >= 25 && reqInfo.isCore)) {
        severity = 'Critical';
      } else if (overallScore < 70 || failureCount >= 2 || isDeclining || sp.projectScore < 40) {
        severity = 'Moderate';
      }

      const detectionReason = reasons.length > 0
        ? `Weakness detected in ${skillName}: ${reasons.join('; ')}. Current score is ${overallScore}% vs benchmark ${requiredScore}%.`
        : `Demonstrated ${skillName} proficiency (${overallScore}%) is below target role requirements (${requiredScore}%).`;

      weaknesses.push({
        skill: sp.skill._id,
        skillName,
        skillSlug: sp.skill.slug,
        category: sp.skill.category,
        overallScore,
        requiredScore,
        gapSize,
        severity,
        strugglingDimension,
        failureCount,
        trend: sp.trend || 'Stable',
        detectionReason,
      });
    }
  }

  // Sort by severity (Critical > Moderate > Low) then by gap size descending
  const severityWeight = { Critical: 3, Moderate: 2, Low: 1 };
  weaknesses.sort((a, b) => {
    if (severityWeight[b.severity] !== severityWeight[a.severity]) {
      return severityWeight[b.severity] - severityWeight[a.severity];
    }
    return b.gapSize - a.gapSize;
  });

  if (weaknesses.length === 0 && skillProgressList.length > 0) {
    const lowest = [...skillProgressList].sort((a, b) => (a.overallScore || 0) - (b.overallScore || 0))[0];
    if (lowest?.skill) {
      weaknesses.push({
        skill: lowest.skill._id,
        skillName: lowest.skill.name,
        skillSlug: lowest.skill.slug,
        category: lowest.skill.category,
        overallScore: lowest.overallScore || 0,
        requiredScore: 80,
        gapSize: Math.max(0, 80 - (lowest.overallScore || 0)),
        severity: 'Moderate',
        strugglingDimension: 'practical',
        failureCount: 1,
        trend: lowest.trend || 'Stable',
        detectionReason: `Opportunity detected to calibrate ${lowest.skill.name} from ${lowest.overallScore}% to Advanced proficiency.`,
      });
    }
  }

  return weaknesses;
};

/**
 * Construct an adaptive progressive remediation ladder:
 * Stage 1: Beginner Concept / Practice
 * Stage 2: Intermediate Challenge
 * Stage 3: Real-World Practical Task / Project
 * Stage 4: Reassessment
 *
 * Strictly prevents infinite loops and repeated recommendation of identical activities.
 */
export const buildRemediationLadder = async (skillId, skillName, userId, triggerTelemetry) => {
  // Query past interventions to avoid repeating previously assigned activities
  const pastInterventions = await AdaptiveIntervention.find({ user: userId, skill: skillId });
  const usedActivityIds = new Set();
  pastInterventions.forEach((pi) => {
    pi.stages.forEach((st) => {
      if (st.activityId) usedActivityIds.add(String(st.activityId));
    });
  });

  // 1. Find Beginner Practice Challenge
  let beginnerChallenge = await CodingChallenge.findOne({
    skillIds: skillId,
    difficulty: { $in: ['Easy', 'Beginner'] },
    isPublished: true,
    _id: { $nin: Array.from(usedActivityIds) },
  }).sort({ createdAt: 1 });

  if (!beginnerChallenge) {
    // Fallback: any beginner challenge
    beginnerChallenge = await CodingChallenge.findOne({
      difficulty: { $in: ['Easy', 'Beginner'] },
      isPublished: true,
    });
  }

  // 2. Find Intermediate Challenge
  let intermediateChallenge = await CodingChallenge.findOne({
    skillIds: skillId,
    difficulty: { $in: ['Medium', 'Intermediate'] },
    isPublished: true,
    _id: { $nin: Array.from(usedActivityIds).concat(beginnerChallenge?._id ? [String(beginnerChallenge._id)] : []) },
  });

  if (!intermediateChallenge) {
    intermediateChallenge = await CodingChallenge.findOne({
      isPublished: true,
      _id: { $ne: beginnerChallenge?._id },
    }).sort({ difficulty: -1 });
  }

  // 3. Find Real-World Task (Practical Assignment or Job Simulation)
  let practicalTask = await Assignment.findOne({
    skillIds: skillId,
    status: 'Published',
    _id: { $nin: Array.from(usedActivityIds) },
  });

  let practicalActivity = null;
  if (practicalTask) {
    practicalActivity = {
      type: 'assignment',
      id: String(practicalTask._id),
      title: practicalTask.title,
      link: `/student/assignments`,
      objective: 'Apply practical implementation standards in a complete evaluated milestone.',
      difficulty: 'Intermediate',
    };
  } else {
    // Check Job Simulations for this skill
    const simulation = await JobSimulation.findOne({
      'requiredSkills.skill': skillId,
      status: 'Published',
    });

    if (simulation) {
      practicalActivity = {
        type: 'job_simulation',
        id: String(simulation._id),
        title: `Job Simulation: ${simulation.title}`,
        link: `/student/simulations/${simulation.slug}`,
        objective: `Execute realistic workplace scenario deliverables for ${simulation.role}.`,
        difficulty: simulation.difficulty || 'Intermediate',
      };
    } else {
      // Fallback to project workspace
      practicalActivity = {
        type: 'assignment',
        id: 'practical-remediation-task',
        title: `${skillName} Architecture Milestone`,
        link: `/student/assignments`,
        objective: `Design and deliver practical components in ${skillName}.`,
        difficulty: 'Intermediate',
      };
    }
  }

  // 4. Find Reassessment (Quiz or Benchmark Challenge)
  const reassessmentQuiz = await Quiz.findOne({
    isPublished: true,
  }).sort({ createdAt: -1 });

  const stages = [
    {
      stageNumber: 1,
      stageName: 'Beginner Practice',
      difficulty: 'Beginner',
      activityType: 'coding_challenge',
      activityId: beginnerChallenge ? String(beginnerChallenge._id) : 'beginner-practice-lab',
      activityTitle: beginnerChallenge ? beginnerChallenge.title : `${skillName} Foundation Practice`,
      activityLink: beginnerChallenge ? `/student/challenge/${beginnerChallenge._id}` : '/student/challenges',
      objective: `Rebuild core syntax, foundational mental models, and muscle memory in ${skillName}.`,
      status: 'Active', // First stage is Active immediately
      targetScore: 70,
    },
    {
      stageNumber: 2,
      stageName: 'Intermediate Practice',
      difficulty: 'Intermediate',
      activityType: 'coding_challenge',
      activityId: intermediateChallenge ? String(intermediateChallenge._id) : 'intermediate-practice-lab',
      activityTitle: intermediateChallenge ? intermediateChallenge.title : `${skillName} Intermediate Drill`,
      activityLink: intermediateChallenge ? `/student/challenge/${intermediateChallenge._id}` : '/student/challenges',
      objective: `Solve multi-step edge cases and algorithmic scenarios with passing test suites.`,
      status: 'Pending',
      targetScore: 75,
    },
    {
      stageNumber: 3,
      stageName: 'Real-World Task',
      difficulty: practicalActivity.difficulty,
      activityType: practicalActivity.type,
      activityId: practicalActivity.id,
      activityTitle: practicalActivity.title,
      activityLink: practicalActivity.link,
      objective: practicalActivity.objective,
      status: 'Pending',
      targetScore: 75,
    },
    {
      stageNumber: 4,
      stageName: 'Reassessment',
      difficulty: 'Intermediate',
      activityType: 'quiz',
      activityId: reassessmentQuiz ? String(reassessmentQuiz._id) : 'reassessment-benchmark',
      activityTitle: reassessmentQuiz ? `Reassessment: ${reassessmentQuiz.title}` : `${skillName} Final Benchmark Exam`,
      activityLink: reassessmentQuiz ? `/student/quiz/${reassessmentQuiz._id}` : '/student/quizzes',
      objective: `Demonstrate validated retention under timed test conditions to graduate this skill.`,
      status: 'Pending',
      targetScore: 75,
    },
  ];

  return stages;
};

/**
 * Get or dynamically spawn an active adaptive learning intervention for the learner
 */
export const getOrCreateActiveIntervention = async (userId, targetSkillId = null) => {
  if (!userId) return null;

  // 1. Check for existing Active intervention
  let query = { user: userId, status: 'Active' };
  if (targetSkillId) {
    query.skill = targetSkillId;
  }

  let activeIntervention = await AdaptiveIntervention.findOne(query)
    .populate('skill', 'name slug category difficulty icon')
    .sort({ updatedAt: -1 });

  if (activeIntervention) {
    return activeIntervention;
  }

  // 2. No active intervention exists: run automated weakness detection
  const weaknesses = await detectLearnerWeaknesses(userId);
  if (weaknesses.length === 0) {
    return null;
  }

  // Pick top priority weakness
  const targetWeakness = targetSkillId
    ? weaknesses.find((w) => String(w.skill) === String(targetSkillId)) || weaknesses[0]
    : weaknesses[0];

  if (!targetWeakness) return null;

  // 3. Build dynamic progressive remediation ladder
  const stages = await buildRemediationLadder(
    targetWeakness.skill,
    targetWeakness.skillName,
    userId,
    {
      initialScore: targetWeakness.overallScore,
      dimensionStruggling: targetWeakness.strugglingDimension,
      failureCount: targetWeakness.failureCount,
      trend: targetWeakness.trend,
    }
  );

  // 4. Create new AdaptiveIntervention record
  activeIntervention = await AdaptiveIntervention.create({
    user: userId,
    skill: targetWeakness.skill,
    skillName: targetWeakness.skillName,
    status: 'Active',
    severity: targetWeakness.severity,
    detectionReason: targetWeakness.detectionReason,
    triggerTelemetry: {
      initialScore: targetWeakness.overallScore,
      dimensionStruggling: targetWeakness.strugglingDimension,
      failureCount: targetWeakness.failureCount,
      trend: targetWeakness.trend,
      detectedAt: new Date(),
    },
    currentStageIndex: 0,
    stages,
    reassessmentCondition: {
      targetScore: 75,
      description: `Achieve >= 75% on the final Reassessment stage to graduate ${targetWeakness.skillName} out of remediation.`,
    },
    improvement: {
      baselineScore: targetWeakness.overallScore,
      currentScore: targetWeakness.overallScore,
      scoreDelta: 0,
    },
    history: [
      {
        action: 'Intervention Initiated',
        description: `Automated detection triggered remediation ladder for ${targetWeakness.skillName} (${targetWeakness.severity} severity).`,
        timestamp: new Date(),
      },
    ],
  });

  // Dispatch in-app notification
  try {
    await createNotification({
      recipient: userId,
      type: 'system',
      title: `⚡ Adaptive Remediation Plan: ${targetWeakness.skillName}`,
      message: `NOVA detected a performance bottleneck in ${targetWeakness.skillName}. We have prepared a 4-step progressive practice ladder to boost your mastery.`,
      link: '/student/adaptive-learning',
    });
  } catch {
    // Non-blocking
  }

  return activeIntervention;
};

/**
 * Retrieve all interventions for the learner (Active, Resolved, Escalated)
 */
export const getLearnerInterventions = async (userId) => {
  if (!userId) return { active: [], resolved: [], summary: {} };

  const [activeList, resolvedList] = await Promise.all([
    AdaptiveIntervention.find({ user: userId, status: 'Active' })
      .populate('skill', 'name slug category difficulty')
      .sort({ createdAt: -1 }),
    AdaptiveIntervention.find({ user: userId, status: 'Resolved' })
      .populate('skill', 'name slug category difficulty')
      .sort({ 'improvement.resolvedAt': -1 })
      .limit(10),
  ]);

  const totalResolved = resolvedList.length;
  const avgImprovement = totalResolved > 0
    ? Math.round(
        resolvedList.reduce((sum, r) => sum + (r.improvement?.scoreDelta || 0), 0) / totalResolved
      )
    : 0;

  return {
    active: activeList,
    resolved: resolvedList,
    summary: {
      activeCount: activeList.length,
      resolvedCount: totalResolved,
      averageScoreImprovement: avgImprovement,
    },
  };
};

/**
 * Ingestion Hook: Process activity completion to progress or resolve an intervention
 */
export const recordActivityProgress = async (
  userId,
  { activityType, activityId, score = 0, passed = false, skillId = null }
) => {
  if (!userId) return null;

  // Find active intervention that references this activity OR matches the skill
  let intervention = null;
  if (activityId) {
    intervention = await AdaptiveIntervention.findOne({
      user: userId,
      status: 'Active',
      'stages.activityId': String(activityId),
    });
  }

  if (!intervention && skillId) {
    intervention = await AdaptiveIntervention.findOne({
      user: userId,
      status: 'Active',
      skill: skillId,
    });
  }

  if (!intervention) return null;

  const currentIdx = intervention.currentStageIndex;
  const stage = intervention.stages[currentIdx];
  if (!stage) return null;

  stage.attemptsCount = (stage.attemptsCount || 0) + 1;
  stage.earnedScore = Math.max(stage.earnedScore || 0, Number(score) || 0);

  const meetsRequirement = passed || stage.earnedScore >= (stage.targetScore || 70);

  if (meetsRequirement) {
    stage.status = 'Completed';
    stage.completedAt = new Date();

    intervention.history.push({
      action: 'Stage Completed',
      description: `Completed Stage ${stage.stageNumber}: ${stage.stageName} with score ${score}%.`,
      timestamp: new Date(),
    });

    // Check if this was the final stage
    const isFinalStage = currentIdx >= intervention.stages.length - 1;

    if (isFinalStage) {
      // Check current skill score in DB
      const currentSkillProgress = await LearnerSkillProgress.findOne({
        user: userId,
        skill: intervention.skill,
      });

      const updatedScore = currentSkillProgress?.overallScore || stage.earnedScore;
      const baseline = intervention.improvement?.baselineScore || intervention.triggerTelemetry.initialScore;
      const delta = Math.max(0, updatedScore - baseline);

      intervention.status = 'Resolved';
      intervention.improvement = {
        baselineScore: baseline,
        currentScore: updatedScore,
        scoreDelta: delta,
        resolvedAt: new Date(),
      };

      intervention.history.push({
        action: 'Intervention Resolved',
        description: `Successfully resolved ${intervention.skillName} weakness with a +${delta}% score improvement (Final Score: ${updatedScore}%).`,
        timestamp: new Date(),
      });

      await intervention.save();

      // Dispatch celebration notification
      try {
        await createNotification({
          recipient: userId,
          type: 'achievement',
          title: `🏆 Skill Turnaround: ${intervention.skillName}!`,
          message: `Congratulations! You graduated from your adaptive remediation plan for ${intervention.skillName} with a +${delta}% improvement in demonstrated proficiency.`,
          link: '/student/progress',
        });
      } catch {
        // Non-blocking
      }

      return intervention;
    } else {
      // Advance to next stage in ladder
      intervention.currentStageIndex = currentIdx + 1;
      const nextStage = intervention.stages[currentIdx + 1];
      if (nextStage) {
        nextStage.status = 'Active';
      }

      intervention.history.push({
        action: 'Stage Advanced',
        description: `Advanced to Stage ${nextStage.stageNumber}: ${nextStage.stageName} (${nextStage.activityTitle}).`,
        timestamp: new Date(),
      });

      await intervention.save();
      return intervention;
    }
  } else {
    // Attempted but did not pass threshold
    if (stage.attemptsCount >= 3) {
      intervention.escalationNotes = `Learner has struggled with Stage ${stage.stageNumber} across ${stage.attemptsCount} attempts. AI Mentor consultation recommended.`;
      intervention.history.push({
        action: 'Remediation Alert',
        description: `Multiple unsuccessful attempts on Stage ${stage.stageNumber}. Remediation assistance flagged.`,
        timestamp: new Date(),
      });
    }

    await intervention.save();
    return intervention;
  }
};
