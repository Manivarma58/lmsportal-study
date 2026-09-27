import express from 'express';
import {
  getMyPortfolio,
  getPublicPortfolioHandler,
  updateSettingsHandler,
} from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Private portfolio for authenticated learner
router.get('/me', protect, getMyPortfolio);
router.put('/settings', protect, updateSettingsHandler);

// Public portfolio for recruiters / external sharing (unauthenticated)
router.get('/public/:slug', getPublicPortfolioHandler);

export default router;
