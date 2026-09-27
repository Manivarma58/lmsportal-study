import express from 'express';
import {
  getTargetRoles,
  getTargetRole,
  createTargetRole,
  updateTargetRole,
  deleteTargetRole,
  getLearnerTargetRole,
  setLearnerTargetRole,
  analyzeSkillGap,
} from '../controllers/targetRoleController.js';
import {
  authMiddleware,
  roleMiddleware,
  optionalProtect,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Optional Protected - Target Roles Catalog
router.get('/', optionalProtect, getTargetRoles);

// Learner Target Role Selection & Skill Gap Analysis
router.get('/analyzer', authMiddleware, analyzeSkillGap);
router.get('/learner/current', authMiddleware, getLearnerTargetRole);
router.post('/learner/select', authMiddleware, setLearnerTargetRole);

// Single Target Role by ID or Slug
router.get('/:idOrSlug', optionalProtect, getTargetRole);

// Faculty & Admin Extensibility - Dynamic Role Management
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'instructor'),
  createTargetRole
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'instructor'),
  updateTargetRole
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  deleteTargetRole
);

export default router;
