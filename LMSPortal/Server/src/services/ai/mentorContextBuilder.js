import User from '../../models/User.js';
import Course from '../../models/Course.js';
import Enrollment from '../../models/Enrollment.js';
import Lesson from '../../models/Lesson.js';
import QuizAttempt from '../../models/QuizAttempt.js';
import CodingSubmission from '../../models/CodingSubmission.js';
import AssignmentSubmission from '../../models/AssignmentSubmission.js';
import ProjectSubmission from '../../models/ProjectSubmission.js';
import LearnerSkillProgress from '../../models/LearnerSkillProgress.js';
import TargetRole from '../../models/TargetRole.js';
import LearnerTargetRole from '../../models/LearnerTargetRole.js';
import RecommendationHistory from '../../models/RecommendationHistory.js';
import { analyzeSkillGap } from '../targetRoleService.js';
import { generateNextActionRecommendation } from '../recommendationService.js';

/**
 * Gathers and sanitizes real learner context from the database for the AI Mentor.
 * No hallucinations, no arbitrary numbers, and zero exposure of sensitive data.
 */
export const buildLearnerMentorContext = async (userId) => {
  if (!userId) return null;

  // 1. User Profile (Sanitized)
  const user = await User.findById(userId).select('name email role');
  if (!user) return null;

  // 2. Target Role & Skill Gap Analysis
  let gapAnalysis = null;
  try {
    gapAnalysis = await analyzeSkillGap(userId);
  } catch (err) {
    console.warn('[MentorContext] Gap analysis notice:', err.message);
  }

  // 3. Demonstrated Skill Scores
  const learnerSkills = await LearnerSkillProgress.find({ user: userId })
    .populate('skill', 'name slug category difficulty')
    .sort({ overallScore: -1 });

  const skillsSummary = learnerSkills.map((sp) => ({
    skillName: sp.skill?.name || 'Unknown',
    slug: sp.skill?.slug,
    category: sp.skill?.category,
    overallScore: Math.round(sp.overallScore || 0),
    scoresByDimension: {
      knowledge: Math.round(sp.knowledgeScore || 0),
      practical: Math.round(sp.practicalScore || 0),
      project: Math.round(sp.projectScore || 0),
      assessment: Math.round(sp.assessmentScore || 0),
    },
    proficiencyLevel: sp.proficiencyLevel,
    confidenceLevel: sp.confidenceLevel,
    evidenceCount: sp.evidenceCount || 0,
    trend: sp.trend,
  }));

  // Identify weak skills (score < 70% or large gap in target role)
  const weakSkills = skillsSummary
    .filter((s) => s.overallScore < 70 || s.scoresByDimension.practical < 65)
    .sort((a, b) => a.overallScore - b.overallScore);

  // 4. Enrollments & Course Progress
  const enrollments = await Enrollment.find({ student: userId })
    .populate('course', 'title slug category level totalLessons')
    .sort({ enrolledAt: -1 });

  const activeCourses = enrollments.map((e) => ({
    id: e.course?._id,
    title: e.course?.title,
    category: e.course?.category,
    completionPercentage: e.completionPercentage ?? e.progressPercentage ?? 0,
    completed: e.completed || false,
    completedLessonsCount: (e.completedLessons || []).length,
    totalLessons: e.course?.totalLessons || 0,
  }));

  // 5. Recent Assessment Results & Failed Questions
  const recentQuizAttempts = await QuizAttempt.find({ student: userId })
    .populate('quiz', 'title totalMarks passingMarks')
    .populate('answers.question', 'title questionText explanation')
    .sort({ createdAt: -1 })
    .limit(5);

  const assessmentResults = recentQuizAttempts.map((qa) => {
    const failedQuestions = (qa.answers || [])
      .filter((ans) => !ans.isCorrect)
      .slice(0, 3)
      .map((ans) => ({
        question: ans.question?.questionText || ans.question?.title || `Question #${(ans.questionIndex ?? 0) + 1}`,
        selectedOption: ans.selectedOption,
        explanation: ans.question?.explanation || '',
      }));

    return {
      quizTitle: qa.quiz?.title || 'Academic Assessment',
      score: qa.score,
      percentage: qa.percentage ?? Math.round((qa.score / (qa.quiz?.totalMarks || 100)) * 100),
      passed: qa.passed,
      attemptedAt: qa.createdAt,
      failedQuestionsCount: failedQuestions.length,
      sampleFailedQuestions: failedQuestions,
    };
  });

  // 6. Recent Coding Lab Submissions
  const recentCodingSubmissions = await CodingSubmission.find({ user: userId })
    .populate('challenge', 'title difficulty category')
    .sort({ createdAt: -1 })
    .limit(5);

  const codingHistory = recentCodingSubmissions.map((sub) => {
    // Find failed test case error if any
    const failedTest = (sub.testResults || []).find((tr) => !tr.passed);

    return {
      challengeTitle: sub.challenge?.title || 'Coding Lab',
      difficulty: sub.challenge?.difficulty,
      language: sub.language,
      status: sub.status,
      score: sub.score,
      passedTests: sub.passedTests,
      totalTests: sub.totalTests,
      submittedAt: sub.submittedAt || sub.createdAt,
      errorSnippet: failedTest
        ? failedTest.error || `Expected: "${failedTest.expectedOutput}", Received: "${failedTest.actualOutput}"`
        : null,
    };
  });

  // 7. Recent Practical Assignment Results
  const recentAssignmentSubmissions = await AssignmentSubmission.find({ user: userId })
    .populate('assignment', 'title difficulty')
    .sort({ submittedAt: -1 })
    .limit(3);

  const assignmentHistory = recentAssignmentSubmissions.map((as) => ({
    assignmentTitle: as.assignment?.title,
    status: as.status,
    score: as.score,
    feedback: as.feedback,
    criteriaGrades: as.criteriaGrades || [],
  }));

  // 8. Recent Capstone Project Results
  const recentProjectSubmissions = await ProjectSubmission.find({ user: userId })
    .populate('project', 'title difficulty')
    .sort({ submittedAt: -1 })
    .limit(3);

  const projectHistory = recentProjectSubmissions.map((ps) => ({
    projectTitle: ps.project?.title,
    status: ps.status,
    score: ps.score,
    feedback: ps.feedback,
    criteriaGrades: ps.criteriaGrades || [],
  }));

  // 9. Current Active Recommendation
  let activeRecommendation = null;
  try {
    const recResult = await generateNextActionRecommendation(userId);
    activeRecommendation = recResult?.recommendation || null;
  } catch (err) {
    console.warn('[MentorContext] Recommendation notice:', err.message);
  }

  // 10. Active Adaptive Learning Remediation Ladder
  let activeAdaptiveIntervention = null;
  try {
    const { getOrCreateActiveIntervention } = await import('../adaptiveLearningService.js');
    const intervention = await getOrCreateActiveIntervention(userId);
    if (intervention && intervention.status === 'Active') {
      const stageIdx = intervention.currentStageIndex || 0;
      const stage = intervention.stages[stageIdx];
      activeAdaptiveIntervention = {
        id: String(intervention._id),
        skillName: intervention.skillName,
        severity: intervention.severity,
        detectionReason: intervention.detectionReason,
        currentStage: {
          number: stage?.stageNumber || 1,
          name: stage?.stageName || 'Remediation',
          activityTitle: stage?.activityTitle,
          activityType: stage?.activityType,
          link: stage?.activityLink,
          objective: stage?.objective,
          difficulty: stage?.difficulty,
        },
        totalStages: intervention.stages.length,
        baselineScore: intervention.triggerTelemetry?.initialScore,
        reassessmentCondition: intervention.reassessmentCondition?.description,
      };
    }
  } catch (err) {
    // Non-blocking
  }

  // Assemble Complete Factual Learner Context
  return {
    learner: {
      name: user.name,
      role: user.role,
    },
    targetRole: gapAnalysis?.targetRole
      ? {
          name: gapAnalysis.targetRole.name,
          category: gapAnalysis.targetRole.category,
          roleReadinessScore: gapAnalysis.summary?.roleReadinessScore || 0,
          readinessTier: gapAnalysis.summary?.readinessTier || 'Developing',
          strongSkills: (gapAnalysis.strongSkills || []).map((s) => s.skillName),
          developingSkills: (gapAnalysis.developingSkills || []).map((s) => s.skillName),
          skillGaps: (gapAnalysis.skillGaps || []).map((s) => ({
            name: s.skillName,
            currentScore: s.currentScore,
            requiredScore: s.requiredScore,
            gapSize: s.gapSize,
            importance: s.importance,
          })),
        }
      : null,
    demonstratedSkills: skillsSummary,
    weakSkills,
    activeCourses,
    assessmentResults,
    codingHistory,
    assignmentHistory,
    projectHistory,
    activeRecommendation,
    activeAdaptiveIntervention,
  };
};
