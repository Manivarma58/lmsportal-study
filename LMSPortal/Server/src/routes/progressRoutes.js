import express from 'express';
import {
  markLessonComplete,
  updateLessonProgress,
  getCourseProgress,
  recordLessonAccess,
} from '../controllers/progressController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/:courseId/access/:lessonId', recordLessonAccess);
router.post('/:courseId/lesson/:lessonId', markLessonComplete);
router.post('/:courseId/lesson/:lessonId/complete', markLessonComplete);
router.put('/:courseId/lesson/:lessonId', updateLessonProgress);
router.get('/:courseId', getCourseProgress);

export default router;
