import asyncHandler from '../middleware/asyncHandler.js';
import challengeService from '../services/challengeService.js';

/**
 * @desc    Get all coding challenges (with public filters)
 * @route   GET /api/challenges
 * @access  Public / Optional Auth
 */
export const getChallenges = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id || req.user._id : null;
  const result = await challengeService.getChallenges(req.query, userId);
  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get single challenge details (strips hidden test cases for students)
 * @route   GET /api/challenges/:id
 * @access  Public / Optional Auth
 */
export const getChallenge = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id || req.user._id : null;
  const isInstructorOrAdmin = req.user && ['instructor', 'admin'].includes(req.user.role);
  const result = await challengeService.getChallengeDetails(req.params.id, userId, isInstructorOrAdmin);
  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Run code against sample test cases (non-evaluative test runner)
 * @route   POST /api/challenges/:id/run
 * @access  Private (Authenticated)
 */
export const runCode = asyncHandler(async (req, res) => {
  const { language, sourceCode, customInput } = req.body;
  const result = await challengeService.runChallengeCode({
    challengeId: req.params.id,
    language,
    sourceCode,
    customInput,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Submit challenge code for full evaluation & skill scoring
 * @route   POST /api/challenges/:id/submit
 * @access  Private (Authenticated)
 */
export const submitCode = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { language, sourceCode } = req.body;

  const result = await challengeService.submitChallengeCode({
    challengeId: req.params.id,
    userId,
    language,
    sourceCode,
  });

  res.status(200).json({
    success: true,
    message: result.status === 'Accepted' ? 'Challenge Solved! Skill proficiency updated.' : 'Evaluation completed.',
    ...result,
  });
});

/**
 * @desc    Get current user's submissions for a challenge
 * @route   GET /api/challenges/:id/submissions
 * @access  Private (Authenticated)
 */
export const getChallengeSubmissions = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const submissions = await challengeService.getChallengeSubmissions(req.params.id, userId);

  res.status(200).json({
    success: true,
    count: submissions.length,
    submissions,
  });
});

/**
 * @desc    Get all submissions by current user across challenges
 * @route   GET /api/challenges/submissions/my
 * @access  Private (Authenticated)
 */
export const getMySubmissions = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const submissions = await challengeService.getMySubmissions(userId);

  res.status(200).json({
    success: true,
    count: submissions.length,
    submissions,
  });
});

/**
 * @desc    Create a new coding challenge
 * @route   POST /api/challenges
 * @access  Private (Instructor/Admin)
 */
export const createChallenge = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const challenge = await challengeService.createChallenge(req.body, userId);

  res.status(201).json({
    success: true,
    message: 'Coding challenge created successfully.',
    challenge,
  });
});

export default {
  getChallenges,
  getChallenge,
  runCode,
  submitCode,
  getChallengeSubmissions,
  getMySubmissions,
  createChallenge,
};
