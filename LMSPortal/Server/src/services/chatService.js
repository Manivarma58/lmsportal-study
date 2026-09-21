import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { isUserOnline } from '../socket/socketHandler.js';

/**
 * Get aggregated conversations list for a user
 */
export const getConversations = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Find all 1-on-1 messages involving this user
  const messages = await Message.find({
    $or: [{ sender: userObjectId }, { receiver: userObjectId }],
    receiver: { $exists: true, $ne: null },
  })
    .sort({ timestamp: -1, createdAt: -1 })
    .populate('sender', 'name avatar role headline')
    .populate('receiver', 'name avatar role headline');

  const conversationMap = new Map();

  for (const msg of messages) {
    if (!msg.sender || !msg.receiver) continue;

    const isSender = msg.sender._id.toString() === userId.toString();
    const partner = isSender ? msg.receiver : msg.sender;
    const partnerId = partner._id.toString();

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        partner: {
          _id: partner._id,
          name: partner.name,
          avatar: partner.avatar,
          role: partner.role,
          headline: partner.headline || '',
          isOnline: isUserOnline(partner._id),
        },
        lastMessage: {
          id: msg._id,
          text: msg.message || msg.text || '',
          timestamp: msg.timestamp || msg.createdAt,
          senderId: msg.sender._id,
          read: msg.read,
        },
        unreadCount: 0,
      });
    }

    // Count unread messages sent by partner to current user
    if (!isSender && !msg.read) {
      const conv = conversationMap.get(partnerId);
      conv.unreadCount += 1;
    }
  }

  // Convert to array sorted by last message timestamp
  const conversations = Array.from(conversationMap.values()).sort(
    (a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
  );

  return conversations;
};

/**
 * Get direct messages between two users and auto-mark unread as read
 */
export const getDirectMessages = async (userId, recipientId, limit = 100) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

  const messages = await Message.find({
    $or: [
      { sender: userObjectId, receiver: recipientObjectId },
      { sender: recipientObjectId, receiver: userObjectId },
    ],
  })
    .sort({ timestamp: 1, createdAt: 1 })
    .limit(Number(limit))
    .populate('sender', 'name avatar role headline')
    .populate('receiver', 'name avatar role headline');

  // Mark all incoming unread messages as read
  await Message.updateMany(
    {
      sender: recipientObjectId,
      receiver: userObjectId,
      read: false,
    },
    {
      $set: { read: true },
      $addToSet: { readBy: userObjectId },
    }
  );

  return messages;
};

/**
 * Get contacts relevant to the user (Student ↔ Instructor discovery)
 */
export const getContacts = async (user) => {
  const userId = user._id || user.id;
  const contactsMap = new Map();

  if (user.role === 'student') {
    // 1. Find instructors of courses student is enrolled in
    const enrollments = await Enrollment.find({ student: userId }).select('course');
    const courseIds = enrollments.map((e) => e.course);

    if (courseIds.length > 0) {
      const courses = await Course.find({ _id: { $in: courseIds } })
        .populate('instructor', 'name avatar role headline email')
        .select('title instructor');

      for (const c of courses) {
        if (c.instructor && c.instructor._id) {
          const instId = c.instructor._id.toString();
          if (!contactsMap.has(instId)) {
            contactsMap.set(instId, {
              _id: c.instructor._id,
              name: c.instructor.name,
              avatar: c.instructor.avatar,
              role: c.instructor.role,
              headline: c.instructor.headline || `Instructor for ${c.title}`,
              isOnline: isUserOnline(c.instructor._id),
            });
          }
        }
      }
    }

    // Fallback: If no enrolled instructors or few, fetch platform instructors
    if (contactsMap.size < 5) {
      const allInstructors = await User.find({
        role: 'instructor',
        isActive: true,
        _id: { $ne: userId },
      })
        .select('name avatar role headline email')
        .limit(10);

      for (const inst of allInstructors) {
        const instId = inst._id.toString();
        if (!contactsMap.has(instId)) {
          contactsMap.set(instId, {
            _id: inst._id,
            name: inst.name,
            avatar: inst.avatar,
            role: inst.role,
            headline: inst.headline || 'Course Instructor',
            isOnline: isUserOnline(inst._id),
          });
        }
      }
    }
  } else if (user.role === 'instructor') {
    // 2. Instructors: Find students enrolled in their courses
    const courses = await Course.find({ instructor: userId }).select('_id title');
    const courseIds = courses.map((c) => c._id);

    if (courseIds.length > 0) {
      const enrollments = await Enrollment.find({ course: { $in: courseIds } })
        .populate('student', 'name avatar role headline email')
        .populate('course', 'title');

      for (const enr of enrollments) {
        if (enr.student && enr.student._id) {
          const stdId = enr.student._id.toString();
          if (!contactsMap.has(stdId)) {
            contactsMap.set(stdId, {
              _id: enr.student._id,
              name: enr.student.name,
              avatar: enr.student.avatar,
              role: enr.student.role,
              headline: enr.student.headline || `Enrolled in ${enr.course?.title || 'course'}`,
              isOnline: isUserOnline(enr.student._id),
            });
          }
        }
      }
    }

    // Also include platform instructors for peer faculty communication
    const peers = await User.find({
      role: 'instructor',
      isActive: true,
      _id: { $ne: userId },
    })
      .select('name avatar role headline')
      .limit(5);

    for (const peer of peers) {
      const peerId = peer._id.toString();
      if (!contactsMap.has(peerId)) {
        contactsMap.set(peerId, {
          _id: peer._id,
          name: peer.name,
          avatar: peer.avatar,
          role: peer.role,
          headline: peer.headline || 'Faculty Peer',
          isOnline: isUserOnline(peer._id),
        });
      }
    }
  } else {
    // Admin: access to all instructors and students
    const users = await User.find({
      _id: { $ne: userId },
      isActive: true,
    })
      .select('name avatar role headline')
      .limit(30);

    for (const u of users) {
      contactsMap.set(u._id.toString(), {
        _id: u._id,
        name: u.name,
        avatar: u.avatar,
        role: u.role,
        headline: u.headline || '',
        isOnline: isUserOnline(u._id),
      });
    }
  }

  return Array.from(contactsMap.values());
};

/**
 * Mark messages from a specific sender as read
 */
export const markDirectMessagesAsRead = async (userId, senderId) => {
  const result = await Message.updateMany(
    {
      sender: new mongoose.Types.ObjectId(senderId),
      receiver: new mongoose.Types.ObjectId(userId),
      read: false,
    },
    {
      $set: { read: true },
      $addToSet: { readBy: new mongoose.Types.ObjectId(userId) },
    }
  );

  return result;
};

export default {
  getConversations,
  getDirectMessages,
  getContacts,
  markDirectMessagesAsRead,
};
