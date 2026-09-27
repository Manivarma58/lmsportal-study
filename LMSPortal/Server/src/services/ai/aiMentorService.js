import mongoose from 'mongoose';
import AIMentorConversation from '../../models/AIMentorConversation.js';
import { buildLearnerMentorContext } from './mentorContextBuilder.js';
import { executeAIMentorQuery } from './aiProvider.js';
import ErrorResponse from '../../utils/errorResponse.js';

/**
 * Send a message to NOVA AI Mentor and receive a context-aware response
 */
export const sendMessageToMentor = async (userId, messageText, conversationId = null) => {
  if (!userId) {
    throw new ErrorResponse('User ID is required to consult AI Mentor', 400);
  }

  const queryText = (messageText || '').trim();
  if (!queryText) {
    throw new ErrorResponse('Message text cannot be empty', 400);
  }

  // 1. Fetch or create conversation session
  let conversation = null;
  const convIdStr = conversationId ? String(conversationId).trim() : null;
  if (convIdStr && mongoose.Types.ObjectId.isValid(convIdStr)) {
    conversation = await AIMentorConversation.findOne({
      _id: convIdStr,
      user: userId,
    });
  }

  if (!conversation) {
    // Generate an automatic session title from the first 5 words
    const titleWords = queryText.split(' ').slice(0, 6).join(' ');
    const title = titleWords.length > 3 ? `${titleWords}...` : 'Mentorship Session';

    conversation = await AIMentorConversation.create({
      user: userId,
      title,
      messages: [],
    });
  }

  // 2. Build Factual Learner Context directly from Database
  const learnerContext = await buildLearnerMentorContext(userId);

  // 3. Append User Message
  conversation.messages.push({
    role: 'user',
    content: queryText,
    timestamp: new Date(),
  });

  // 4. Generate AI Mentor Response
  const aiResult = await executeAIMentorQuery({
    userQuery: queryText,
    learnerContext,
    conversationHistory: conversation.messages,
  });

  // 5. Build Context Snapshot for persistence
  const contextSnapshot = {
    targetRole: learnerContext?.targetRole?.name || '',
    weakSkills: (learnerContext?.weakSkills || []).map((s) => s.skillName),
    latestAssessmentScore: learnerContext?.assessmentResults?.[0]?.percentage || null,
    activeCourse: learnerContext?.activeCourses?.[0]?.title || '',
  };

  // 6. Append Assistant Message with Recommendations
  const assistantMessage = {
    role: 'assistant',
    content: aiResult.content,
    timestamp: new Date(),
    contextSnapshot,
    structuredRecommendations: aiResult.structuredRecommendations || [],
  };

  conversation.messages.push(assistantMessage);
  await conversation.save();

  return {
    conversationId: conversation._id,
    title: conversation.title,
    message: assistantMessage,
    learnerContextSnapshot: contextSnapshot,
  };
};

/**
 * Get the sanitized learner context snapshot for frontend inspection
 */
export const getLearnerContextSnapshot = async (userId) => {
  if (!userId) {
    throw new ErrorResponse('User ID is required', 400);
  }
  return await buildLearnerMentorContext(userId);
};

/**
 * Get all conversations for a student
 */
export const getLearnerConversations = async (userId, limit = 10) => {
  if (!userId) {
    throw new ErrorResponse('User ID is required', 400);
  }

  const conversations = await AIMentorConversation.find({ user: userId, isActive: true })
    .select('title topic messages createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(limit);

  return conversations.map((c) => ({
    id: c._id,
    title: c.title,
    topic: c.topic,
    messageCount: c.messages.length,
    lastMessage: c.messages[c.messages.length - 1]?.content?.slice(0, 100) || '',
    updatedAt: c.updatedAt,
  }));
};

/**
 * Get single conversation with full message trajectory
 */
export const getConversationById = async (userId, conversationId) => {
  if (!userId || !conversationId) {
    throw new ErrorResponse('User ID and Conversation ID are required', 400);
  }

  const conversation = await AIMentorConversation.findOne({
    _id: conversationId,
    user: userId,
  });

  if (!conversation) {
    throw new ErrorResponse('Mentorship conversation not found', 404);
  }

  return conversation;
};

/**
 * Delete / Clear conversation
 */
export const deleteConversation = async (userId, conversationId) => {
  if (!userId || !conversationId) {
    throw new ErrorResponse('User ID and Conversation ID are required', 400);
  }

  const result = await AIMentorConversation.findOneAndDelete({
    _id: conversationId,
    user: userId,
  });

  if (!result) {
    throw new ErrorResponse('Conversation not found', 404);
  }

  return { message: 'Conversation deleted successfully' };
};
