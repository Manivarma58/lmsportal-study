import express from 'express';
import {
  getChallenges,
  getChallenge,
  runCode,
  submitCode,
  getChallengeSubmissions,
  getMySubmissions,
  createChallenge,
} from '../controllers/challengeController.js';
import {
  authMiddleware,
  roleMiddleware,
  optionalProtect,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public challenge listing & details
router.get('/', optionalProtect, getChallenges);
router.get('/submissions/my', authMiddleware, getMySubmissions);
router.get('/:id', optionalProtect, getChallenge);

// Execution & evaluation (Student / Authenticated)
router.post('/:id/run', authMiddleware, runCode);
router.post('/:id/submit', authMiddleware, submitCode);
router.get('/:id/submissions', authMiddleware, getChallengeSubmissions);

// Instructor / Admin management
router.post(
  '/',
  authMiddleware,
  roleMiddleware('instructor', 'admin'),
  createChallenge
);

export default router;
