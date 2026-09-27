import asyncHandler from '../middleware/asyncHandler.js';
import * as recommendationService from '../services/recommendationService.js';

/**
 * @desc    Get next recommended action for authenticated learner
 * @route   GET /recommendations/me or GET /api/recommendations/me
 * @access  Private (Learner)
 */
export const getMyRecommendation = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const result = await recommendationService.generateNextActionRecommendation(userId);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get recommendation history log for authenticated learner
 * @route   GET /api/recommendations/history
 * @access  Private (Learner)
 */
export const getRecommendationHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const limit = parseInt(req.query.limit, 10) || 15;

  const history = await recommendationService.getLearnerRecommendationHistory(userId, limit);

  res.status(200).json({
    success: true,
    count: history.length,
    history,
  });
});

/**
 * @desc    Dismiss recommendation and fetch next action
 * @route   POST /api/recommendations/:id/dismiss
 * @access  Private (Learner)
 */
export const dismissRecommendation = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const recommendationId = req.params.id;

  const result = await recommendationService.dismissRecommendation(userId, recommendationId);

  res.status(200).json({
    success: true,
    message: 'Recommendation dismissed. Next priority action generated.',
    ...result,
  });
});

/**
 * @desc    Mark recommendation as completed
 * @route   POST /api/recommendations/:id/complete
 * @access  Private (Learner)
 */
export const completeRecommendation = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const recommendationId = req.params.id;

  const result = await recommendationService.completeRecommendation(userId, recommendationId);

  res.status(200).json({
    success: true,
    message: 'Recommendation marked as completed.',
    ...result,
  });
});
