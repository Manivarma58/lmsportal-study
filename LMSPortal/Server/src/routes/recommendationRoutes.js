import express from 'express';
import {
  getMyRecommendation,
  getRecommendationHistory,
  dismissRecommendation,
  completeRecommendation,
} from '../controllers/recommendationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authenticated Learner Recommendation Endpoints
router.get('/me', authMiddleware, getMyRecommendation);
router.get('/history', authMiddleware, getRecommendationHistory);
router.post('/:id/dismiss', authMiddleware, dismissRecommendation);
router.post('/:id/complete', authMiddleware, completeRecommendation);

export default router;
