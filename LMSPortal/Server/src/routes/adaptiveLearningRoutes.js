import express from 'express';
import {
  getActiveInterventionHandler,
  getInterventionsListHandler,
  scanWeaknessesHandler,
  advanceStageHandler,
} from '../controllers/adaptiveLearningController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveInterventionHandler);
router.get('/all', getInterventionsListHandler);
router.get('/summary', getInterventionsListHandler);
router.post('/scan', scanWeaknessesHandler);
router.post('/interventions/:id/advance', advanceStageHandler);

export default router;
