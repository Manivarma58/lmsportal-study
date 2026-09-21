import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import ErrorResponse from '../utils/errorResponse.js';
import { emitRealtimeNotification } from '../socket/socketHandler.js';

export const getUserNotifications = async (userId, limit = 30) => {
  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(Number(limit) || 30);

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    read: false,
  });

  return {
    unreadCount,
    count: notifications.length,
    notifications,
  };
};

export const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ErrorResponse('Notification not found or unauthorized.', 404);
  }

  notification.read = true;
  await notification.save();

  return notification;
};

export const markAllNotificationsAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true } }
  );

  return { success: true };
};

export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ErrorResponse('Notification not found or unauthorized.', 404);
  }

  return { success: true };
};

export const createNotification = async ({
  recipient,
  title,
  message,
  type = 'system',
  link = '',
}) => {
  const notification = await Notification.create({
    recipient,
    title,
    message,
    type,
    link,
    read: false,
  });

  // Deliver immediately in real-time via Socket.IO
  emitRealtimeNotification(recipient, notification);

  return notification;
};

export const createCourseAnnouncement = async ({
  courseId,
  title,
  message,
  instructorUser,
}) => {
  if (!courseId || !title || !message) {
    throw new ErrorResponse('Please provide courseId, title, and message for announcement.', 400);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  // Backend authorization check: must be course instructor or admin
  if (course.instructor.toString() !== instructorUser.id && instructorUser.role !== 'admin') {
    throw new ErrorResponse('Not authorized to post announcements for this course.', 403);
  }

  // Find all enrolled students in this course
  const enrollments = await Enrollment.find({ course: courseId }).select('student');
  if (enrollments.length === 0) {
    return {
      success: true,
      recipientsCount: 0,
      message: 'No students currently enrolled in this course.',
    };
  }

  const notificationsToInsert = enrollments.map((e) => ({
    recipient: e.student,
    title: `📢 Announcement: ${title.trim()}`,
    message: message.trim(),
    type: 'instructor_announcement',
    link: `/student/course/${courseId}/learn`,
    read: false,
  }));

  const inserted = await Notification.insertMany(notificationsToInsert);

  // Deliver in real-time to each enrolled student via Socket.IO
  for (const notif of inserted) {
    emitRealtimeNotification(notif.recipient, notif);
  }

  return {
    success: true,
    recipientsCount: inserted.length,
    courseTitle: course.title,
    title: title.trim(),
    message: message.trim(),
  };
};

export const broadcastNotification = async ({
  title,
  message,
  type = 'announcement',
  link = '',
  targetRole = 'all',
}) => {
  if (!title || !message) {
    throw new ErrorResponse('Please provide both title and message for broadcast.', 400);
  }

  const query = { isActive: { $ne: false } };
  if (targetRole && targetRole !== 'all') {
    query.role = targetRole;
  }

  const users = await User.find(query).select('_id');
  if (users.length === 0) {
    return { success: true, recipientsCount: 0, message: 'No users matching target audience.' };
  }

  const notificationsToInsert = users.map((u) => ({
    recipient: u._id,
    title,
    message,
    type: type || 'announcement',
    link: link || '',
    read: false,
  }));

  const inserted = await Notification.insertMany(notificationsToInsert);

  // Real-time Socket.IO delivery
  for (const notif of inserted) {
    emitRealtimeNotification(notif.recipient, notif);
  }

  return {
    success: true,
    recipientsCount: users.length,
    targetRole,
    title,
    message,
    sentAt: new Date(),
  };
};

export const getBroadcastHistory = async (limit = 20) => {
  const broadcasts = await Notification.aggregate([
    {
      $group: {
        _id: { title: '$title', message: '$message', type: '$type' },
        sentAt: { $max: '$createdAt' },
        recipientsCount: { $sum: 1 },
      },
    },
    { $sort: { sentAt: -1 } },
    { $limit: Number(limit) || 20 },
    {
      $project: {
        _id: 0,
        title: '$_id.title',
        message: '$_id.message',
        type: '$_id.type',
        sentAt: 1,
        recipientsCount: 1,
      },
    },
  ]);

  return broadcasts;
};

export default {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  createCourseAnnouncement,
  broadcastNotification,
  getBroadcastHistory,
};
