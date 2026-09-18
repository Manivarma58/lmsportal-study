import express from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification,
  getBroadcastHistory,
} from '../controllers/notificationController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// User notification routes
router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead);
router.put('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Admin-only broadcast notification routes
router.post('/broadcast', roleMiddleware('admin'), broadcastNotification);
router.get('/broadcasts', roleMiddleware('admin'), getBroadcastHistory);

export default router;

