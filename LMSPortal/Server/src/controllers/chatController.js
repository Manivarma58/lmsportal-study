import chatService from '../services/chatService.js';
import Message from '../models/Message.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

/**
 * @desc    Get user's 1-on-1 direct conversations list with unread counts
 * @route   GET /api/chat/conversations
 * @access  Private
 */
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getConversations(req.user._id || req.user.id);
    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get direct message history between current user and partner
 * @route   GET /api/chat/direct/:recipientId
 * @access  Private
 */
export const getDirectMessages = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const { limit = 100 } = req.query;

    const messages = await chatService.getDirectMessages(
      req.user._id || req.user.id,
      recipientId,
      limit
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get contacts list for initiating new conversations (Student ↔ Instructor)
 * @route   GET /api/chat/contacts
 * @access  Private
 */
export const getContacts = async (req, res, next) => {
  try {
    const contacts = await chatService.getContacts(req.user);
    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark incoming messages from sender as read
 * @route   PUT /api/chat/read/:senderId
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { senderId } = req.params;
    await chatService.markDirectMessagesAsRead(req.user._id || req.user.id, senderId);
    res.status(200).json({
      success: true,
      message: 'Messages marked as read.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get public room / course channel messages
 * @route   GET /api/chat/room/:room
 * @access  Private
 */
export const getMessagesByRoom = async (req, res, next) => {
  try {
    const { room } = req.params;
    const { limit = 50 } = req.query;

    // Security Hardening: Prevent IDOR leak of direct 1-on-1 private messages via room endpoint
    if (room.startsWith('direct_')) {
      const parts = room.replace('direct_', '').split('_');
      const userId = (req.user._id || req.user.id).toString();
      if (!parts.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view messages from this private conversation.',
        });
      }
    }

    // Security Hardening: Check authorization for course-specific channels
    if (room.startsWith('course_')) {
      const courseId = room.replace('course_', '');
      const course = await Course.findById(courseId);
      if (course) {
        const isOwnerOrAdmin =
          req.user.role === 'admin' ||
          (course.instructor && course.instructor.toString() === (req.user._id || req.user.id).toString());

        if (!isOwnerOrAdmin) {
          const isEnrolled = await Enrollment.exists({
            student: req.user._id || req.user.id,
            course: courseId,
          });
          if (!isEnrolled) {
            return res.status(403).json({
              success: false,
              message: 'You must enroll in this course to access its chat room.',
            });
          }
        }
      }
    }

    const messages = await Message.find({ room })
      .populate('sender', 'name avatar role headline')
      .sort({ createdAt: 1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Send a message via REST API fallback
 * @route   POST /api/chat/message
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { room, text, courseId, recipientId, attachments } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    const messageData = {
      sender: req.user._id || req.user.id,
      room: room || (recipientId ? `direct_${[req.user.id, recipientId].sort().join('_')}` : 'general'),
      course: courseId || undefined,
      receiver: recipientId || undefined,
      message: text.trim(),
      attachments: attachments || [],
      read: false,
      readBy: [req.user._id || req.user.id],
      timestamp: new Date(),
    };

    const message = await Message.create(messageData);
    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar role headline')
      .populate('receiver', 'name avatar role headline');

    res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get course channels and general room list
 * @route   GET /api/chat/channels
 * @access  Private
 */
export const getChannels = async (req, res, next) => {
  try {
    const channels = [
      {
        id: 'general',
        title: '🌐 General Discussion',
        description: 'Community-wide channel for all LMS members',
        type: 'general',
      },
    ];

    const courses = await Course.find({ published: true }).select('title thumbnail');
    courses.forEach((c) => {
      channels.push({
        id: `course_${c._id}`,
        courseId: c._id,
        title: `📚 ${c.title}`,
        description: 'Course study group and Q&A',
        type: 'course',
      });
    });

    res.status(200).json({
      success: true,
      channels,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getConversations,
  getDirectMessages,
  getContacts,
  markAsRead,
  getMessagesByRoom,
  sendMessage,
  getChannels,
};
