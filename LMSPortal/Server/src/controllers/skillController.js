import asyncHandler from '../middleware/asyncHandler.js';
import skillService from '../services/skillService.js';

/**
 * @desc    Get current learner's demonstrated skills progress
 * @route   GET /api/skills/my-skills
 * @access  Private (Student/Authenticated)
 */
export const getMySkills = asyncHandler(async (req, res) => {
  const result = await skillService.getLearnerSkills(req.user.id || req.user._id);
  res.status(200).json({
    success: true,
    skills: result.skills,
    stats: result.stats,
  });
});

/**
 * @desc    Get single skill details, enrolled courses teaching it, and user progress
 * @route   GET /api/skills/:id
 * @access  Public / Optional Auth
 */
export const getSkillDetails = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id || req.user._id : null;
  const result = await skillService.getSkillDetails(req.params.id, userId);
  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Record demonstrated evidence and re-score skill in real-time
 * @route   POST /api/skills/evidence
 * @access  Private
 */
export const recordEvidence = asyncHandler(async (req, res) => {
  const { skillId, type, title, score, maxScore, weight, referenceId, courseId, studentId } = req.body;
  const isInstructorOrAdmin = req.user && ['instructor', 'admin'].includes(req.user.role);
  const targetUserId = (isInstructorOrAdmin && (studentId || req.body.userId)) ? (studentId || req.body.userId) : (req.user.id || req.user._id);

  const progress = await skillService.recordSkillEvidence({
    userId: targetUserId,
    skillId,
    type,
    title,
    score,
    maxScore,
    weight,
    referenceId,
    courseId,
    trigger: 'manual_submission',
  });

  res.status(201).json({
    success: true,
    message: 'Skill evidence recorded and performance re-evaluated successfully.',
    progress,
  });
});

/**
 * @desc    Recalculate skill score from all stored evidence
 * @route   POST /api/skills/:id/recalculate
 * @access  Private
 */
export const recalculateScore = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const progress = await skillService.recalculateSkillScore(userId, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Skill score recalculated successfully.',
    progress,
  });
});

/**
 * @desc    Get score history and assessment timeline for a skill
 * @route   GET /api/skills/:id/history
 * @access  Private
 */
export const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const result = await skillService.getSkillHistory(req.params.id, userId);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get all available skills in global taxonomy
 * @route   GET /api/skills
 * @access  Public
 */
export const getAllSkills = asyncHandler(async (req, res) => {
  const skills = await skillService.getAllSkills(req.query);
  res.status(200).json({
    success: true,
    count: skills.length,
    skills,
  });
});

/**
 * @desc    Create a new skill in taxonomy
 * @route   POST /api/skills
 * @access  Private/Instructor or Admin
 */
export const createSkill = asyncHandler(async (req, res) => {
  const skill = await skillService.createSkill(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Skill created successfully in global taxonomy.',
    skill,
  });
});

/**
 * @desc    Associate skills with a course
 * @route   POST /api/skills/course/:courseId
 * @access  Private/Instructor or Admin
 */
export const mapCourseSkills = asyncHandler(async (req, res) => {
  const mappings = await skillService.mapCourseSkills(
    req.params.courseId,
    req.body.skills || req.body.skillMappings || [],
    req.user
  );

  res.status(200).json({
    success: true,
    message: 'Course skills mapped successfully.',
    mappings,
  });
});

/**
 * @desc    Get skills taught by a course
 * @route   GET /api/skills/course/:courseId
 * @access  Public
 */
export const getCourseSkills = asyncHandler(async (req, res) => {
  const mappings = await skillService.getCourseSkills(req.params.courseId);
  res.status(200).json({
    success: true,
    count: mappings.length,
    mappings,
  });
});

/**
 * @desc    Get comprehensive student dashboard skill summary, analytics, weak areas, and next action
 * @route   GET /api/skills/dashboard-summary
 * @access  Private (Student/Authenticated)
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const summary = await skillService.getLearnerDashboardSummary(userId);
  res.status(200).json({
    success: true,
    ...summary,
  });
});

/**
 * @desc    Get deterministic next recommended action based strictly on actual learner performance data
 * @route   GET /api/skills/next-action
 * @access  Private (Student/Authenticated)
 */
export const getNextAction = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const nextAction = await skillService.getLearnerNextAction(userId);
  res.status(200).json({
    success: true,
    nextAction,
  });
});

export default {
  getMySkills,
  getSkillDetails,
  recordEvidence,
  recalculateScore,
  getHistory,
  getAllSkills,
  createSkill,
  mapCourseSkills,
  getCourseSkills,
  getDashboardSummary,
  getNextAction,
};
