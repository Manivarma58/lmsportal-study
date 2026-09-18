import express from 'express';
import {
  enrollCourse,
  getMyEnrollments,
  checkEnrollment,
  getCourseStudents,
} from '../controllers/enrollmentController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/:courseId', enrollCourse);
router.get('/my-courses', getMyEnrollments);
router.get('/', getMyEnrollments);
router.get('/check/:courseId', checkEnrollment);

router.get(
  '/course/:courseId/students',
  roleMiddleware('instructor', 'admin'),
  getCourseStudents
);

export default router;
