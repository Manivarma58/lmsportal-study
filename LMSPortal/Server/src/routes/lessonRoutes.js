import express from 'express';
import {
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from '../controllers/lessonController.js';
import { authMiddleware, optionalProtect, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/course/:courseId', optionalProtect, getLessonsByCourse);
router.get('/:id', optionalProtect, getLessonById);

router.post('/', authMiddleware, roleMiddleware('instructor', 'admin'), createLesson);
router.put('/course/:courseId/reorder', authMiddleware, roleMiddleware('instructor', 'admin'), reorderLessons);
router.put('/:id', authMiddleware, roleMiddleware('instructor', 'admin'), updateLesson);
router.delete('/:id', authMiddleware, roleMiddleware('instructor', 'admin'), deleteLesson);

export default router;
