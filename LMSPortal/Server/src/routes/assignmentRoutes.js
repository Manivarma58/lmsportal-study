import express from 'express';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  evaluateSubmission,
  getInstructorSubmissions,
  getAssignmentSubmissions,
} from '../controllers/assignmentController.js';
import {
  authMiddleware,
  roleMiddleware,
  optionalProtect,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Authenticated discovery
router.get('/', optionalProtect, getAssignments);
router.get(
  '/instructor/submissions',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  getInstructorSubmissions
);
router.get('/:id', optionalProtect, getAssignment);

// Student submission
router.post('/:id/submit', authMiddleware, submitAssignment);

// Instructor evaluation
router.post(
  '/submissions/:submissionId/evaluate',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  evaluateSubmission
);

// Instructor / Admin management
router.post(
  '/',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  createAssignment
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  updateAssignment
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  deleteAssignment
);

router.get(
  '/:id/submissions',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  getAssignmentSubmissions
);

export default router;
