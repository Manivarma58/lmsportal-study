import ChatMessage from '../models/ChatMessage.js';

export const initSocket = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    socket.on('register_user', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        io.emit('online_users_count', onlineUsers.size);
      }
    });

    socket.on('join_room', (room) => {
      socket.join(room);
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
    });

    socket.on('send_message', async (data) => {
      try {
        const { senderId, room, text, courseId, attachments } = data;
        if (!text || !senderId) return;

        const message = await ChatMessage.create({
          sender: senderId,
          room: room || 'general',
          course: courseId || undefined,
          text,
          attachments: attachments || [],
          readBy: [senderId],
        });

        const populated = await ChatMessage.findById(message._id).populate(
          'sender',
          'name avatar role'
        );

        io.to(room || 'general').emit('new_message', populated);
      } catch (err) {
        console.error('[Socket.IO] Error saving chat message:', err);
      }
    });

    socket.on('typing', ({ room, userName }) => {
      socket.to(room).emit('user_typing', { userName, room });
    });

    socket.on('stop_typing', ({ room }) => {
      socket.to(room).emit('user_stop_typing', { room });
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online_users_count', onlineUsers.size);
      }
    });
  });
};
