import Skill from '../models/Skill.js';
import CourseSkill from '../models/CourseSkill.js';
import LearnerSkillProgress from '../models/LearnerSkillProgress.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import { createNotification } from './notificationService.js';
import ErrorResponse from '../utils/errorResponse.js';
import {
  calculateSkillScore,
  calculateTrend,
} from './skillScoringEngine.js';
import { generateNextActionRecommendation } from './recommendationService.js';

/**
 * Get all skills for a learner with their proficiency metrics
 */
export const getLearnerSkills = async (userId) => {
  if (!userId) {
    throw new ErrorResponse('User ID is required to fetch skills.', 400);
  }

  const skillProgressList = await LearnerSkillProgress.find({ user: userId })
    .populate('skill')
    .sort({ overallScore: -1 });

  // Summary aggregation
  const totalSkills = skillProgressList.length;
  const verifiedEvidenceTotal = skillProgressList.reduce(
    (sum, sp) => sum + (sp.evidenceCount || 0),
    0
  );
  const averageScore =
    totalSkills > 0
      ? Math.round(
          skillProgressList.reduce((sum, sp) => sum + sp.overallScore, 0) /
            totalSkills
        )
      : 0;

  const proficiencyCounts = {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
    Expert: 0,
  };

  skillProgressList.forEach((sp) => {
    if (proficiencyCounts[sp.proficiencyLevel] !== undefined) {
      proficiencyCounts[sp.proficiencyLevel]++;
    }
  });

  return {
    skills: skillProgressList,
    stats: {
      totalSkills,
      averageScore,
      verifiedEvidenceTotal,
      proficiencyCounts,
    },
  };
};

/**
 * Get single skill details, courses teaching it, and learner's current progress
 */
export const getSkillDetails = async (skillIdOrSlug, userId = null) => {
  let skill = null;
  if (skillIdOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    skill = await Skill.findById(skillIdOrSlug);
  }
  if (!skill) {
    skill = await Skill.findOne({ slug: skillIdOrSlug.toLowerCase() });
  }

  if (!skill) {
    throw new ErrorResponse('Skill not found in catalog.', 404);
  }

  // Get courses that teach this skill
  const courseMappings = await CourseSkill.find({ skill: skill._id })
    .populate('course', 'title slug thumbnail category level instructor rating enrollmentCount')
    .sort({ isPrimary: -1, weight: -1 });

  let userProgress = null;
  if (userId) {
    userProgress = await LearnerSkillProgress.findOne({
      user: userId,
      skill: skill._id,
    });
  }

  return {
    skill,
    teachingCourses: courseMappings.map((cm) => ({
      course: cm.course,
      weight: cm.weight,
      isPrimary: cm.isPrimary,
    })),
    userProgress,
  };
};

/**
 * Record a demonstrated performance evidence item and immediately update skill scoring
 * 
 * Reusable ingestion API: Quizzes, coding sandboxes, practical labs, and assignments
 * can feed evidence into this method.
 */
export const recordSkillEvidence = async ({
  userId,
  skillId,
  type,
  title,
  score,
  maxScore,
  weight = 1.0,
  referenceId = '',
  courseId = null,
  trigger = 'demonstrated_performance',
}) => {
  if (!userId || !skillId) {
    throw new ErrorResponse('User ID and Skill ID are required.', 400);
  }

  const skill = await Skill.findById(skillId);
  if (!skill) {
    throw new ErrorResponse('Target skill not found.', 404);
  }

  const earned = Number(score) || 0;
  const total = Number(maxScore) || 1;
  const percentage = Math.min(100, Math.max(0, Math.round((earned / total) * 100)));

  // Find or create LearnerSkillProgress
  let progress = await LearnerSkillProgress.findOne({
    user: userId,
    skill: skillId,
  });

  const previousScore = progress ? progress.overallScore : null;
  const previousLevel = progress ? progress.proficiencyLevel : null;

  if (!progress) {
    progress = new LearnerSkillProgress({
      user: userId,
      skill: skillId,
      evidence: [],
      history: [],
    });
  }

  // Add evidence item
  progress.evidence.push({
    type,
    title: title || `${type.replace('_', ' ').toUpperCase()} Assessment`,
    score: earned,
    maxScore: total,
    percentage,
    weight: Number(weight) || 1.0,
    referenceId: referenceId ? String(referenceId) : '',
    course: courseId || undefined,
    submittedAt: new Date(),
  });

  // Calculate new scores using the scoring engine
  const calculation = calculateSkillScore(progress.evidence);
  const trend = calculateTrend(calculation.overallScore, previousScore);

  progress.knowledgeScore = calculation.knowledgeScore;
  progress.practicalScore = calculation.practicalScore;
  progress.projectScore = calculation.projectScore;
  progress.assessmentScore = calculation.assessmentScore;
  progress.overallScore = calculation.overallScore;
  progress.proficiencyLevel = calculation.proficiencyLevel;
  progress.confidenceLevel = calculation.confidenceLevel;
  progress.evidenceCount = progress.evidence.length;
  progress.trend = trend;
  progress.lastEvaluatedAt = new Date();

  // Snapshot into evaluation history
  progress.history.push({
    overallScore: calculation.overallScore,
    knowledgeScore: calculation.knowledgeScore,
    practicalScore: calculation.practicalScore,
    projectScore: calculation.projectScore,
    assessmentScore: calculation.assessmentScore,
    proficiencyLevel: calculation.proficiencyLevel,
    confidenceLevel: calculation.confidenceLevel,
    evidenceCount: progress.evidence.length,
    calculatedAt: new Date(),
    trigger,
  });

  // Keep history bounded to most recent 50 snapshots
  if (progress.history.length > 50) {
    progress.history = progress.history.slice(-50);
  }

  await progress.save();

  // If learner achieved a higher proficiency tier, dispatch notification
  const levelOrder = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
  if (
    previousLevel &&
    levelOrder[calculation.proficiencyLevel] > levelOrder[previousLevel]
  ) {
    await createNotification({
      recipient: userId,
      title: `⚡ Skill Leveled Up: ${skill.name}!`,
      message: `You advanced to ${calculation.proficiencyLevel} proficiency in ${skill.name} (${calculation.overallScore}% demonstrated mastery).`,
      type: 'system',
      link: `/student/progress`,
    }).catch(() => null);
  }

  // Hook: Notify Adaptive Learning Engine of updated skill evidence
  try {
    const { recordActivityProgress } = await import('./adaptiveLearningService.js');
    await recordActivityProgress(userId, {
      activityType: type,
      activityId: referenceId,
      score: earned,
      passed: earned >= maxScore * 0.7,
      skillId,
    });
  } catch (adaptiveErr) {
    // Non-blocking
  }

  return progress;
};

/**
 * Recalculate skill score from all stored evidence
 */
export const recalculateSkillScore = async (userId, skillId) => {
  const progress = await LearnerSkillProgress.findOne({
    user: userId,
    skill: skillId,
  });

  if (!progress) {
    throw new ErrorResponse('Skill progress record not found for this user.', 404);
  }

  const previousScore = progress.overallScore;
  const calculation = calculateSkillScore(progress.evidence);
  const trend = calculateTrend(calculation.overallScore, previousScore);

  progress.knowledgeScore = calculation.knowledgeScore;
  progress.practicalScore = calculation.practicalScore;
  progress.projectScore = calculation.projectScore;
  progress.assessmentScore = calculation.assessmentScore;
  progress.overallScore = calculation.overallScore;
  progress.proficiencyLevel = calculation.proficiencyLevel;
  progress.confidenceLevel = calculation.confidenceLevel;
  progress.evidenceCount = progress.evidence.length;
  progress.trend = trend;
  progress.lastEvaluatedAt = new Date();

  progress.history.push({
    overallScore: calculation.overallScore,
    knowledgeScore: calculation.knowledgeScore,
    practicalScore: calculation.practicalScore,
    projectScore: calculation.projectScore,
    assessmentScore: calculation.assessmentScore,
    proficiencyLevel: calculation.proficiencyLevel,
    confidenceLevel: calculation.confidenceLevel,
    evidenceCount: progress.evidence.length,
    calculatedAt: new Date(),
    trigger: 'manual_recalculation',
  });

  await progress.save();
  return progress;
};

/**
 * Get historical evaluations timeline for a specific skill
 */
export const getSkillHistory = async (skillId, userId) => {
  const progress = await LearnerSkillProgress.findOne({
    user: userId,
    skill: skillId,
  }).populate('skill', 'name category difficulty');

  if (!progress) {
    return {
      skillId,
      history: [],
      evidence: [],
    };
  }

  return {
    skill: progress.skill,
    history: progress.history,
    evidence: progress.evidence,
    currentScore: progress.overallScore,
    proficiencyLevel: progress.proficiencyLevel,
    trend: progress.trend,
  };
};

/**
 * Catalog: Get all available skills with search and category filtering
 */
export const getAllSkills = async (query = {}) => {
  const { category, difficulty, search } = query;
  const filter = {};

  if (category && category !== 'All') {
    filter.category = category;
  }
  if (difficulty && difficulty !== 'All') {
    filter.difficulty = difficulty;
  }
  if (search && search.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { tags: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const skills = await Skill.find(filter).sort({ name: 1 });
  return skills;
};

/**
 * Create a new skill in the global taxonomy (Instructor or Admin)
 */
export const createSkill = async (skillData, requesterUser) => {
  const { name, description, category, difficulty, icon, tags } = skillData;

  if (!name || !name.trim()) {
    throw new ErrorResponse('Please provide a skill name.', 400);
  }

  const existing = await Skill.findOne({ name: name.trim() });
  if (existing) {
    throw new ErrorResponse('A skill with this name already exists.', 400);
  }

  const skill = await Skill.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    category: category || 'General Technology',
    difficulty: difficulty || 'Intermediate',
    icon: icon || 'code',
    tags: Array.isArray(tags) ? tags : [],
  });

  return skill;
};

/**
 * Map skills to a course
 */
export const mapCourseSkills = async (courseId, skillMappings = [], requesterUser) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  const instructorId = (course.instructor?._id || course.instructor)?.toString();
  if (requesterUser.role !== 'admin' && instructorId !== requesterUser.id) {
    throw new ErrorResponse('Not authorized to modify this course skills mapping.', 403);
  }

  // Clear existing mappings
  await CourseSkill.deleteMany({ course: courseId });

  // Insert new mappings
  const toInsert = skillMappings.map((m) => ({
    course: courseId,
    skill: m.skillId || m.skill,
    weight: Number(m.weight) || 1.0,
    isPrimary: m.isPrimary !== undefined ? Boolean(m.isPrimary) : true,
  }));

  const created = await CourseSkill.insertMany(toInsert);
  return created;
};

/**
 * Get skills associated with a specific course
 */
export const getCourseSkills = async (courseId) => {
  const mappings = await CourseSkill.find({ course: courseId })
    .populate('skill')
    .sort({ isPrimary: -1, weight: -1 });

  return mappings;
};

/**
 * Generate a deterministic next action recommendation based strictly on actual learner performance data
 */
export const generateNextAction = async (userId, learnerSkills = [], weakAreas = []) => {
  // 1. Fetch user's active enrollments
  const enrollments = await Enrollment.find({ student: userId })
    .populate('course')
    .sort({ completionPercentage: -1 });

  const activeEnrollments = enrollments.filter(
    (e) => e.course && !e.completed && (e.completionPercentage ?? e.progressPercentage ?? 0) < 100
  );

  // PRIORITY 1: Weak area remediation (demonstrated score < 70% or lowest dimension below target)
  if (weakAreas && weakAreas.length > 0) {
    const weakSkill = weakAreas[0];
    const skillName = weakSkill.skillName || 'Engineering Competency';
    const dim = weakSkill.weakestDimension || 'practical';
    const dimLabel = dim === 'practical' ? 'practical performance' : dim === 'knowledge' ? 'theoretical comprehension' : 'performance';

    // Find course teaching this skill
    const courseMapping = await CourseSkill.findOne({ skill: weakSkill.skillId })
      .populate('course')
      .sort({ isPrimary: -1, weight: -1 });

    const relatedCourse = courseMapping?.course;
    const isEnrolled = activeEnrollments.find(
      (e) => relatedCourse && e.course._id.toString() === relatedCourse._id.toString()
    );

    if (isEnrolled && relatedCourse) {
      const lessons = await Lesson.find({ course: relatedCourse._id }).sort({ order: 1 });
      const completedIds = new Set((isEnrolled.completedLessons || []).map((cl) => (cl.lesson?._id || cl.lesson).toString()));
      const nextLesson = lessons.find((l) => !completedIds.has(l._id.toString())) || lessons[0];

      return {
        title: `Complete ${skillName} ${dim === 'practical' ? 'Authentication Lab' : 'Evaluation'}`,
        reason: `Your recent ${dimLabel} in ${skillName} is below your target.`,
        estimatedTime: '35 minutes',
        buttonText: 'Start Challenge',
        link: `/student/course/${relatedCourse._id}/learn`,
        badge: 'TARGETED RECOVERY',
        priority: 'high',
        skillName,
        dimension: dim,
        score: weakSkill.dimensionScore || weakSkill.overallScore,
        courseTitle: relatedCourse.title,
        lessonTitle: nextLesson ? nextLesson.title : null,
      };
    } else if (relatedCourse) {
      return {
        title: `Complete ${skillName} Practical Evaluation`,
        reason: `Your recent ${dimLabel} in ${skillName} is below your target.`,
        estimatedTime: '35 minutes',
        buttonText: 'Start Challenge',
        link: `/student/course/${relatedCourse._id}/learn`,
        badge: 'TARGETED RECOVERY',
        priority: 'high',
        skillName,
        dimension: dim,
        score: weakSkill.dimensionScore || weakSkill.overallScore,
        courseTitle: relatedCourse.title,
      };
    } else {
      return {
        title: `Complete ${skillName} Assessment`,
        reason: `Your recent ${dimLabel} in ${skillName} is below your target.`,
        estimatedTime: '30 minutes',
        buttonText: 'Start Challenge',
        link: `/student/progress`,
        badge: 'TARGETED RECOVERY',
        priority: 'high',
        skillName,
        dimension: dim,
        score: weakSkill.dimensionScore || weakSkill.overallScore,
      };
    }
  }

  // PRIORITY 2: Active curriculum progression
  if (activeEnrollments.length > 0) {
    const active = activeEnrollments[0];
    const course = active.course;
    const progress = active.completionPercentage ?? active.progressPercentage ?? 0;

    const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });
    const completedIds = new Set((active.completedLessons || []).map((cl) => (cl.lesson?._id || cl.lesson).toString()));
    const nextLesson = lessons.find((l) => !completedIds.has(l._id.toString())) || lessons[0];

    const lessonTitle = nextLesson ? nextLesson.title : 'Next Curriculum Module';
    const estTime = nextLesson?.duration ? `${nextLesson.duration} minutes` : '25 minutes';

    return {
      title: `Resume ${lessonTitle}`,
      reason: `You have completed ${progress}% of "${course.title}". Continue this module to advance your engineering competencies.`,
      estimatedTime: estTime,
      buttonText: 'Continue Learning',
      link: `/student/course/${course._id}/learn`,
      badge: 'CURRICULUM PACE',
      priority: 'medium',
      courseTitle: course.title,
      progress,
    };
  }

  // PRIORITY 3: Fallback onboarding
  const featured = await Course.findOne({ isPublished: true }).sort({ rating: -1, enrollmentCount: -1 });
  return {
    title: featured ? `Enroll in ${featured.title}` : 'Explore Course Catalog',
    reason: 'Enroll in your first practical curriculum to start recording verified skills across coding, quizzes, and projects.',
    estimatedTime: '30 minutes',
    buttonText: 'Start Challenge',
    link: featured ? `/course/${featured._id}` : '/courses',
    badge: 'GET STARTED',
    priority: 'normal',
    courseTitle: featured?.title || 'Foundational Engineering',
  };
};

/**
 * Get comprehensive student dashboard skill summary, analytics, weak areas, and deterministic next action
 */
export const getLearnerDashboardSummary = async (userId) => {
  if (!userId) {
    throw new ErrorResponse('User ID is required.', 400);
  }

  // 1. Fetch all learner skills with populated skill data
  const learnerSkills = await LearnerSkillProgress.find({ user: userId })
    .populate('skill')
    .sort({ overallScore: -1 });

  // 2. Summary stats
  const totalSkills = learnerSkills.length;
  const verifiedEvidenceTotal = learnerSkills.reduce(
    (sum, sp) => sum + (sp.evidenceCount || 0),
    0
  );
  const averageScore =
    totalSkills > 0
      ? Math.round(
          learnerSkills.reduce((sum, sp) => sum + sp.overallScore, 0) / totalSkills
        )
      : 0;

  const proficiencyCounts = {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
    Expert: 0,
  };
  learnerSkills.forEach((sp) => {
    if (proficiencyCounts[sp.proficiencyLevel] !== undefined) {
      proficiencyCounts[sp.proficiencyLevel]++;
    }
  });

  // 3. Dimensional Averages
  const dimensionalAverages = {
    knowledge:
      totalSkills > 0
        ? Math.round(
            learnerSkills.reduce((s, p) => s + (p.knowledgeScore || 0), 0) /
              totalSkills
          )
        : 0,
    practical:
      totalSkills > 0
        ? Math.round(
            learnerSkills.reduce((s, p) => s + (p.practicalScore || 0), 0) /
              totalSkills
          )
        : 0,
    project:
      totalSkills > 0
        ? Math.round(
            learnerSkills.reduce((s, p) => s + (p.projectScore || 0), 0) /
              totalSkills
          )
        : 0,
    assessment:
      totalSkills > 0
        ? Math.round(
            learnerSkills.reduce((s, p) => s + (p.assessmentScore || 0), 0) /
              totalSkills
          )
        : 0,
  };

  // Overall level mapping
  let overallLevel = 'Beginner';
  if (averageScore >= 90) overallLevel = 'Expert';
  else if (averageScore >= 75) overallLevel = 'Advanced';
  else if (averageScore >= 50) overallLevel = 'Intermediate';

  // 4. Identify Weak Areas (< 70% overall or specific dimension < 60%)
  const weakAreas = [];
  learnerSkills.forEach((sp) => {
    if (!sp.skill) return;
    const dimensions = [
      { name: 'practical', label: 'Practical Labs', val: sp.practicalScore },
      { name: 'knowledge', label: 'Theoretical Knowledge', val: sp.knowledgeScore },
      { name: 'project', label: 'Hands-on Projects', val: sp.projectScore },
      { name: 'assessment', label: 'Evaluations', val: sp.assessmentScore },
    ].sort((a, b) => a.val - b.val);

    // Prioritize dimensions that have evaluated performance evidence
    const evaluatedDims = dimensions.filter((d) => d.val > 0);
    const lowest = evaluatedDims.length > 0 ? evaluatedDims[0] : dimensions[0];

    if (sp.overallScore < 70 || (lowest.val > 0 && lowest.val < 65)) {
      weakAreas.push({
        skillId: sp.skill._id,
        skillName: sp.skill.name,
        category: sp.skill.category,
        overallScore: sp.overallScore,
        proficiencyLevel: sp.proficiencyLevel,
        weakestDimension: lowest.name,
        dimensionLabel: lowest.label,
        dimensionScore: lowest.val,
        reason: `Your recent ${lowest.name} performance in ${sp.skill.name} (${lowest.val}%) is below your target.`,
        suggestion: `Engage with targeted ${lowest.label} to advance toward ${sp.proficiencyLevel === 'Beginner' ? 'Intermediate' : 'Advanced'} proficiency.`,
      });
    }
  });

  weakAreas.sort((a, b) => a.overallScore - b.overallScore);

  // 5. Extract Recent Assessments and Projects from evidence subdocuments
  const allEvidence = [];
  learnerSkills.forEach((sp) => {
    if (Array.isArray(sp.evidence)) {
      sp.evidence.forEach((ev) => {
        allEvidence.push({
          _id: ev._id,
          skillId: sp.skill?._id,
          skillName: sp.skill?.name || 'Engineering Competency',
          type: ev.type,
          title: ev.title,
          score: ev.score,
          maxScore: ev.maxScore,
          percentage: ev.percentage,
          weight: ev.weight,
          submittedAt: ev.submittedAt,
        });
      });
    }
  });

  allEvidence.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const recentAssessments = allEvidence
    .filter((e) => ['quiz', 'practical_assessment', 'assignment'].includes(e.type))
    .slice(0, 6);

  const recentProjects = allEvidence
    .filter((e) => ['project', 'coding_challenge'].includes(e.type))
    .slice(0, 6);

  // 6. Generate Deterministic Next Action from Actual Learner Data & Target Role
  let nextAction = null;
  try {
    const recResult = await generateNextActionRecommendation(userId);
    if (recResult?.recommendation) {
      const rec = recResult.recommendation;
      nextAction = {
        id: rec.id,
        title: rec.title,
        reason: rec.reason,
        estimatedTime: rec.estimatedDuration,
        estimatedDuration: rec.estimatedDuration,
        buttonText: rec.relatedResource?.buttonText || 'Start Challenge',
        link: rec.relatedResource?.actionUrl || '/student/challenges',
        actionUrl: rec.relatedResource?.actionUrl || '/student/challenges',
        badge: `${(rec.priority || 'HIGH').toUpperCase()} PRIORITY`,
        priority: (rec.priority || 'High').toLowerCase(),
        skillName: rec.relatedSkill?.name || 'Technical Competency',
        explanation: rec.explanation,
        relatedResource: rec.relatedResource,
        queuedActions: recResult.queuedActions || [],
      };
    }
  } catch (recErr) {
    console.warn('[SkillService] Fallback to standard nextAction generator:', recErr.message);
  }

  if (!nextAction) {
    nextAction = await generateNextAction(userId, learnerSkills, weakAreas);
  }

  return {
    skills: learnerSkills,
    topSkills: learnerSkills.slice(0, 5),
    weakAreas: weakAreas.slice(0, 4),
    recentAssessments,
    recentProjects,
    stats: {
      totalSkills,
      averageScore,
      overallLevel,
      verifiedEvidenceTotal,
      proficiencyCounts,
      dimensionalAverages,
    },
    nextAction,
  };
};

export const getLearnerNextAction = async (userId) => {
  const summary = await getLearnerDashboardSummary(userId);
  return summary.nextAction;
};

export default {
  getLearnerSkills,
  getSkillDetails,
  recordSkillEvidence,
  recalculateSkillScore,
  getSkillHistory,
  getAllSkills,
  createSkill,
  mapCourseSkills,
  getCourseSkills,
  generateNextAction,
  getLearnerDashboardSummary,
  getLearnerNextAction,
};
