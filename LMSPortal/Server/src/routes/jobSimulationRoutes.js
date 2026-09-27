import express from 'express';
import {
  listJobSimulations,
  getSimulation,
  startSimulation,
  updateTask,
  submitSimulationHandler,
  getLearnerSubmission,
  seedSimulationsHandler,
} from '../controllers/jobSimulationController.js';
import { protect, optionalProtect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Catalog and Details (works for authenticated or browsing learners)
router.get('/', optionalProtect, listJobSimulations);
router.post('/seed', protect, authorize('admin', 'instructor'), seedSimulationsHandler);
router.get('/:idOrSlug', optionalProtect, getSimulation);

// Interactive Workspace & Submissions (Protected)
router.post('/:id/start', protect, startSimulation);
router.put('/:id/tasks/:taskId', protect, updateTask);
router.post('/:id/submit', protect, submitSimulationHandler);
router.get('/:id/submission', protect, getLearnerSubmission);

export default router;
