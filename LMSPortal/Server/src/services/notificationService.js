import Notification from '../models/Notification.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

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
    throw new ErrorResponse('Notification not found.', 404);
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
    throw new ErrorResponse('Notification not found.', 404);
  }

  return { success: true };
};

export const createNotification = async ({ recipient, title, message, type = 'system', link = '' }) => {
  const notification = await Notification.create({
    recipient,
    title,
    message,
    type,
    link,
    read: false,
  });

  return notification;
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

  await Notification.insertMany(notificationsToInsert);

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
  broadcastNotification,
  getBroadcastHistory,
};
