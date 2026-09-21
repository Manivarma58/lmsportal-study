import express from 'express';
import {
  getConversations,
  getDirectMessages,
  getContacts,
  markAsRead,
  getMessagesByRoom,
  sendMessage,
  getChannels,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Require authentication for all chat routes
router.use(protect);

// 1-on-1 Direct Messaging (Student ↔ Instructor)
router.get('/conversations', getConversations);
router.get('/direct/:recipientId', getDirectMessages);
router.get('/contacts', getContacts);
router.put('/read/:senderId', markAsRead);

// Channels & Rooms
router.get('/channels', getChannels);
router.get('/room/:room', getMessagesByRoom);
router.post('/message', sendMessage);

export default router;
