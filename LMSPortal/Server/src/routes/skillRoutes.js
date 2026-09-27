import express from 'express';
import {
  getMySkills,
  getSkillDetails,
  recordEvidence,
  recalculateScore,
  getHistory,
  getAllSkills,
  createSkill,
  mapCourseSkills,
  getCourseSkills,
  getDashboardSummary,
  getNextAction,
} from '../controllers/skillController.js';
import {
  authMiddleware,
  roleMiddleware,
  optionalProtect,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / optional auth catalog routes
router.get('/', getAllSkills);
router.get('/course/:courseId', getCourseSkills);

// Learner personal skills routes
router.get('/dashboard-summary', authMiddleware, getDashboardSummary);
router.get('/next-action', authMiddleware, getNextAction);
router.get('/my-skills', authMiddleware, getMySkills);
router.post('/:id/recalculate', authMiddleware, recalculateScore);
router.get('/:id/history', authMiddleware, getHistory);

// Single skill details (optional auth to populate learner's specific progress)
router.get('/:id', optionalProtect, getSkillDetails);

// Instructor / Admin management routes
router.post('/evidence', authMiddleware, roleMiddleware('instructor', 'admin'), recordEvidence);
router.post('/', authMiddleware, roleMiddleware('instructor', 'admin'), createSkill);
router.post(
  '/course/:courseId',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  mapCourseSkills
);

export default router;
