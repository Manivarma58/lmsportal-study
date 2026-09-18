import express from 'express';
import {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getCourseQuizzes,
  submitQuiz,
  getMyQuizSubmissions,
} from '../controllers/quizController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Quiz Management (Instructor or Admin)
router.post('/', roleMiddleware('instructor', 'admin'), createQuiz);
router.put('/:id', roleMiddleware('instructor', 'admin'), updateQuiz);
router.delete('/:id', roleMiddleware('instructor', 'admin'), deleteQuiz);

// Quiz Retrieval & Submissions
router.get('/course/:courseId', getCourseQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/submit', submitQuiz);
router.get('/:id/my-submissions', getMyQuizSubmissions);

export default router;
