import asyncHandler from '../middleware/asyncHandler.js';
import notificationService from '../services/notificationService.js';

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user.id, req.query.limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/notifications/:id/read, PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationAsRead(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: 'Notification marked as read.',
    notification,
  });
});

/**
 * @desc    Mark all user notifications as read
 * @route   PATCH /api/notifications/read-all, PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllNotificationsAsRead(req.user.id);
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read.',
  });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Notification deleted.',
  });
});

/**
 * @desc    Broadcast platform announcement/notification to users (Admin only)
 * @route   POST /api/notifications/broadcast
 * @access  Private/Admin
 */
export const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, type, link, targetRole } = req.body;
  const result = await notificationService.broadcastNotification({
    title,
    message,
    type,
    link,
    targetRole,
    adminId: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: `Broadcast successfully dispatched to ${result.recipientsCount} recipient(s).`,
    ...result,
  });
});

/**
 * @desc    Get broadcast announcements history (Admin only)
 * @route   GET /api/notifications/broadcasts
 * @access  Private/Admin
 */
export const getBroadcastHistory = asyncHandler(async (req, res) => {
  const broadcasts = await notificationService.getBroadcastHistory(req.query.limit);
  res.status(200).json({
    success: true,
    count: broadcasts.length,
    broadcasts,
  });
});

export default {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification,
  getBroadcastHistory,
};
