import Message from '../models/Message.js';
import { socketAuthMiddleware } from './socketAuthMiddleware.js';

// Global map of online users: userId -> Set of active socket IDs
const onlineUsers = new Map();
let ioInstance = null;

/**
 * Check if a specific user is currently online
 */
export const isUserOnline = (userId) => {
  if (!userId) return false;
  const sockets = onlineUsers.get(userId.toString());
  return !!(sockets && sockets.size > 0);
};

/**
 * Get all currently online user IDs
 */
export const getOnlineUserIds = () => {
  return Array.from(onlineUsers.keys());
};

/**
 * Get the active Socket.IO server instance
 */
export const getIO = () => ioInstance;

/**
 * Emit real-time notification to a specific user
 */
export const emitRealtimeNotification = (recipientId, notification) => {
  if (ioInstance && recipientId) {
    const idStr = recipientId.toString();
    ioInstance.to(`user_${idStr}`).emit('new_notification', notification);
    ioInstance.to(`user_${idStr}`).emit('notification', notification);
  }
};

/**
 * Initialize Socket.IO with authentication and event listeners
 */
export const initSocket = (io) => {
  ioInstance = io;
  // Apply JWT authentication middleware to all incoming socket handshakes
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const user = socket.user;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    // 1. Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      // Broadcast user is now online
      io.emit('user_status', {
        userId,
        status: 'online',
        user: { id: user._id, name: user.name, role: user.role },
      });
    }
    onlineUsers.get(userId).add(socket.id);

    // 2. Join user's personal communication room for private events
    socket.join(`user_${userId}`);

    // Send current list of online users to the newly connected socket
    socket.emit('online_users', Array.from(onlineUsers.keys()));

    // 3. Direct 1-on-1 Messaging (Student ↔ Instructor)
    socket.on('send_direct_message', async (...args) => {
      let data = {};
      let ack = null;

      // Handle both ( { recipientId, text, attachments }, callback ) and ( recipientId, text, callback )
      if (typeof args[0] === 'object' && args[0] !== null) {
        data = args[0];
        if (typeof args[1] === 'function') ack = args[1];
      } else if (typeof args[0] === 'string') {
        data.recipientId = args[0];
        if (typeof args[1] === 'string') {
          data.text = args[1];
          if (typeof args[2] === 'function') ack = args[2];
        } else if (typeof args[1] === 'function') {
          ack = args[1];
        }
      }

      const safeAck = (payload) => {
        if (typeof ack === 'function') {
          try {
            ack(payload);
          } catch (e) {
            console.error('[Socket.IO] Error calling ack callback:', e);
          }
        }
      };

      try {
        const { recipientId, text, attachments } = data;

        if (!recipientId || !text || String(text).trim().length === 0) {
          safeAck({ error: 'Recipient and message text are required.' });
          return;
        }

        // Enforce anti-impersonation: sender is derived strictly from verified socket.userId
        const senderId = socket.userId;
        const directRoomKey = [senderId, recipientId].sort().join('_');

        const message = await Message.create({
          sender: senderId,
          receiver: recipientId,
          room: `direct_${directRoomKey}`,
          message: String(text).trim(),
          attachments: attachments || [],
          read: false,
          readBy: [senderId],
          timestamp: new Date(),
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'name avatar role headline')
          .populate('receiver', 'name avatar role headline');

        // Deliver in real-time to both sender and recipient personal rooms
        io.to(`user_${senderId}`).emit('direct_message', populated);
        io.to(`user_${recipientId}`).emit('direct_message', populated);

        // Notify recipient of new unread message
        io.to(`user_${recipientId}`).emit('message_notification', {
          from: {
            id: user._id,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
          },
          message: populated,
        });

        safeAck({ success: true, message: populated });
      } catch (err) {
        console.error('[Socket.IO] Error delivering direct message:', err);
        safeAck({ error: 'Failed to deliver direct message.' });
      }
    });

    // 4. Read Receipts: Mark messages as read
    socket.on('mark_messages_read', async ({ senderId }) => {
      try {
        if (!senderId) return;

        await Message.updateMany(
          {
            sender: senderId,
            receiver: socket.userId,
            read: false,
          },
          {
            $set: { read: true },
            $addToSet: { readBy: socket.userId },
          }
        );

        // Notify original sender that their messages have been read
        io.to(`user_${senderId}`).emit('messages_read', {
          readerId: socket.userId,
        });
      } catch (err) {
        console.error('[Socket.IO] Error marking messages as read:', err);
      }
    });

    // 5. Direct Typing Indicators
    socket.on('typing_direct', ({ recipientId }) => {
      if (recipientId) {
        io.to(`user_${recipientId}`).emit('typing_status', {
          senderId: socket.userId,
          senderName: user.name,
          isTyping: true,
        });
      }
    });

    socket.on('stop_typing_direct', ({ recipientId }) => {
      if (recipientId) {
        io.to(`user_${recipientId}`).emit('typing_status', {
          senderId: socket.userId,
          isTyping: false,
        });
      }
    });

    // 6. Channel / Room-based messaging (Existing Course & General Channels)
    socket.on('join_room', (room, callback) => {
      if (!room || typeof room !== 'string') return;

      // Anti-eavesdropping: only participants can join direct_* rooms
      if (room.startsWith('direct_')) {
        const parts = room.replace('direct_', '').split('_');
        if (!parts.includes(socket.userId)) {
          if (typeof callback === 'function') {
            callback({ error: 'Unauthorized to join this private room.' });
          }
          return;
        }
      }

      socket.join(room);
      if (typeof callback === 'function') {
        callback({ success: true, room });
      }
    });

    socket.on('leave_room', (room) => {
      if (room) socket.leave(room);
    });

    socket.on('send_message', async (data) => {
      try {
        const { room, text, courseId, attachments } = data;
        if (!text || text.trim() === '') return;

        // Anti-impersonation: sender is derived from authenticated socket session
        const message = await Message.create({
          sender: socket.userId,
          room: room || 'general',
          course: courseId || undefined,
          message: text.trim(),
          attachments: attachments || [],
          readBy: [socket.userId],
          timestamp: new Date(),
        });

        const populated = await Message.findById(message._id).populate(
          'sender',
          'name avatar role'
        );

        io.to(room || 'general').emit('new_message', populated);
      } catch (err) {
        console.error('[Socket.IO] Error saving room chat message:', err);
      }
    });

    socket.on('typing', ({ room }) => {
      if (room) {
        socket.to(room).emit('user_typing', { userName: user.name, room });
      }
    });

    socket.on('stop_typing', ({ room }) => {
      if (room) {
        socket.to(room).emit('user_stop_typing', { room });
      }
    });

    // 7. Disconnection & Presence cleanup
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Broadcast user is now offline
          io.emit('user_status', {
            userId,
            status: 'offline',
            lastSeen: new Date(),
          });
        }
      }
    });
  });
};

export default {
  initSocket,
  isUserOnline,
  getOnlineUserIds,
  getIO,
  emitRealtimeNotification,
};
