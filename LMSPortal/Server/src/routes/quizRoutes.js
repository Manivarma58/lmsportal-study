import express from 'express';
import {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getCourseQuizzes,
  submitQuiz,
  getMyQuizSubmissions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/quizController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Quiz Management (Instructor or Admin)
router.post('/', roleMiddleware('instructor', 'admin'), createQuiz);
router.put('/:id', roleMiddleware('instructor', 'admin'), updateQuiz);
router.delete('/:id', roleMiddleware('instructor', 'admin'), deleteQuiz);

// Question Management inside Quiz (Instructor or Admin)
router.post('/:id/questions', roleMiddleware('instructor', 'admin'), addQuestion);
router.put('/:id/questions/:questionId', roleMiddleware('instructor', 'admin'), updateQuestion);
router.delete('/:id/questions/:questionId', roleMiddleware('instructor', 'admin'), deleteQuestion);

// Quiz Retrieval & Submissions
router.get('/course/:courseId', getCourseQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/submit', submitQuiz);
router.get('/:id/my-submissions', getMyQuizSubmissions);

export default router;
