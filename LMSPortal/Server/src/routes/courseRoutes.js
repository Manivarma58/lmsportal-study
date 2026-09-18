import express from 'express';
import {
  getAllCourses,
  getFeaturedCourses,
  getCategories,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  getInstructorCourses,
} from '../controllers/courseController.js';
import { authMiddleware, roleMiddleware, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public course browsing routes
router.get('/', optionalProtect, getAllCourses);
router.get('/featured', getFeaturedCourses);
router.get('/categories', getCategories);

// Instructor-specific course routes
router.get(
  '/instructor/my-courses',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  getInstructorCourses
);

// Course by ID
router.get('/:id', optionalProtect, getCourseById);

// Instructor / Admin course management routes
router.post(
  '/',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  createCourse
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  updateCourse
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  deleteCourse
);

router.patch(
  '/:id/publish',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  togglePublishCourse
);

router.put(
  '/:id/publish',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  togglePublishCourse
);

export default router;
