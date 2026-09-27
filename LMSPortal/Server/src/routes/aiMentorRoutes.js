import express from 'express';
import {
  sendMentorMessage,
  getMentorContext,
  getConversations,
  getConversation,
  deleteConversation,
} from '../controllers/aiMentorController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { aiMentorLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// AI Mentor Chat (Rate-limited & Authenticated)
router.post('/chat', authMiddleware, aiMentorLimiter, sendMentorMessage);

// Factual Learner Context Snapshot
router.get('/context', authMiddleware, getMentorContext);

// Conversation Sessions History
router.get('/conversations', authMiddleware, getConversations);
router.get('/conversations/:id', authMiddleware, getConversation);
router.delete('/conversations/:id', authMiddleware, deleteConversation);

export default router;
