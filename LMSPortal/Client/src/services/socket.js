import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const connectSocket = (userId) => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.on('connect', () => {
      console.log('[Socket.IO] Connected with id:', s.id);
      if (userId) {
        s.emit('register_user', userId);
      }
    });
  } else if (userId) {
    s.emit('register_user', userId);
  }
  return s;
};

export const joinRoom = (room) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('join_room', room);
  }
};

export const leaveRoom = (room) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('leave_room', room);
  }
};

export const sendSocketMessage = (msgData) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('send_message', msgData);
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log('[Socket.IO] Disconnected');
  }
};
