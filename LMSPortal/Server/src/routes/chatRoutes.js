import express from 'express';
import {
  getMessagesByRoom,
  sendMessage,
  getChannels,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/channels', protect, getChannels);
router.get('/room/:room', protect, getMessagesByRoom);
router.post('/message', protect, sendMessage);

export default router;
