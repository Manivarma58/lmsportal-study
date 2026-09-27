import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateMilestoneProgress,
  submitProject,
  evaluateProject,
  getInstructorProjectSubmissions,
} from '../controllers/projectController.js';
import {
  authMiddleware,
  roleMiddleware,
  optionalProtect,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Catalog & Project Discovery
router.get('/', optionalProtect, getProjects);
router.get(
  '/instructor/submissions',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  getInstructorProjectSubmissions
);
router.get('/:id', optionalProtect, getProject);

// Learner Work Area, Milestones & Submission
router.patch('/:id/milestones', authMiddleware, updateMilestoneProgress);
router.post('/:id/submit', authMiddleware, submitProject);

// Faculty / Admin Evaluation
router.post(
  '/submissions/:submissionId/evaluate',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  evaluateProject
);

// Faculty / Admin Project Management
router.post(
  '/',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  createProject
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  updateProject
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  deleteProject
);

export default router;
