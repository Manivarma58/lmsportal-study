import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getInstructorsOverview,
  getStudentsOverview,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from '../controllers/userController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// User self-service profile routes (Any authenticated user)
router.get('/profile', authMiddleware, getProfile);
router.get('/me', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

// Administrative User Management Routes (Admin role only)
router.get('/', authMiddleware, roleMiddleware('admin'), getAllUsers);
router.get('/instructors', authMiddleware, roleMiddleware('admin'), getInstructorsOverview);
router.get('/students', authMiddleware, roleMiddleware('admin'), getStudentsOverview);
router.patch('/:id/role', authMiddleware, roleMiddleware('admin'), updateUserRole);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), toggleUserStatus);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteUser);

export default router;
