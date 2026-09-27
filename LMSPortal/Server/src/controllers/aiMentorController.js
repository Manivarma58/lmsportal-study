import asyncHandler from '../middleware/asyncHandler.js';
import * as aiMentorService from '../services/ai/aiMentorService.js';

/**
 * @desc    Send query to AI Mentor with learner context
 * @route   POST /api/mentor/chat
 * @access  Private (Learner)
 */
export const sendMentorMessage = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { message, conversationId } = req.body;

  const result = await aiMentorService.sendMessageToMentor(userId, message, conversationId);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get sanitized learner context snapshot
 * @route   GET /api/mentor/context
 * @access  Private (Learner)
 */
export const getMentorContext = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const context = await aiMentorService.getLearnerContextSnapshot(userId);

  res.status(200).json({
    success: true,
    context,
  });
});

/**
 * @desc    Get all conversations for authenticated learner
 * @route   GET /api/mentor/conversations
 * @access  Private (Learner)
 */
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const limit = parseInt(req.query.limit, 10) || 10;

  const conversations = await aiMentorService.getLearnerConversations(userId, limit);

  res.status(200).json({
    success: true,
    count: conversations.length,
    conversations,
  });
});

/**
 * @desc    Get single conversation messages
 * @route   GET /api/mentor/conversations/:id
 * @access  Private (Learner)
 */
export const getConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const conversation = await aiMentorService.getConversationById(userId, req.params.id);

  res.status(200).json({
    success: true,
    conversation,
  });
});

/**
 * @desc    Delete conversation
 * @route   DELETE /api/mentor/conversations/:id
 * @access  Private (Learner)
 */
export const deleteConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const result = await aiMentorService.deleteConversation(userId, req.params.id);

  res.status(200).json({
    success: true,
    ...result,
  });
});
