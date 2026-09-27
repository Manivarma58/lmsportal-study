import express from 'express';
import {
  getAdminStats,
  getInstructorStats,
  getInstructorLearningIntelligenceHandler,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin'), getAdminStats);
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorStats);
router.get(
  '/instructor/intelligence',
  protect,
  authorize('instructor', 'admin'),
  getInstructorLearningIntelligenceHandler
);

export default router;

