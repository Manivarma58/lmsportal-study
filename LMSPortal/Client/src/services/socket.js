import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
    if (isLocal) {
      const envUrl = import.meta.env.VITE_SOCKET_URL;
      if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        return envUrl;
      }
      return 'http://localhost:5000';
    }

    // When running on a deployed domain (Vercel, Render, etc.):
    // Never use a localhost URL even if baked in by .env
    const envUrl = import.meta.env.VITE_SOCKET_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    return 'https://lmsportal-study.onrender.com';
  }

  return (
    import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.PROD
      ? 'https://lmsportal-study.onrender.com'
      : 'http://localhost:5000')
  );
};

const SOCKET_URL = getSocketUrl();

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');

    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Authenticated connection established:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
      // Update token in case user logged in or refreshed token
      const freshToken = localStorage.getItem('token');
      if (freshToken && socket.auth) {
        socket.auth.token = freshToken;
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket.IO] Reconnected after attempt:', attemptNumber);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Disconnected by server (likely auth failure), attempt manual reconnect with fresh token
        const freshToken = localStorage.getItem('token');
        if (freshToken) {
          socket.auth.token = freshToken;
          socket.connect();
        }
      }
    });
  } else {
    // Ensure socket auth token matches current localStorage token
    const currentToken = localStorage.getItem('token');
    if (currentToken && socket.auth) {
      socket.auth.token = currentToken;
    }
  }

  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  const token = localStorage.getItem('token');
  if (token && s.auth) {
    s.auth.token = token;
  }

  if (!s.connected) {
    s.connect();
  }
  return s;
};

// Direct Messaging (Student ↔ Instructor)
export const sendDirectMessage = (arg1, arg2, arg3) => {
  const s = getSocket();
  const payload =
    typeof arg1 === 'string'
      ? { recipientId: arg1, text: arg2 }
      : (arg1 || {});
  const callback =
    typeof arg3 === 'function' ? arg3 : typeof arg2 === 'function' ? arg2 : null;

  if (s && s.connected) {
    s.emit('send_direct_message', payload, callback || undefined);
  } else {
    console.warn('[Socket.IO] Cannot send direct message: socket disconnected.');
    if (callback) callback({ error: 'Socket disconnected. Reconnecting...' });
  }
};

export const markReadDirect = (senderId) => {
  const s = getSocket();
  if (s && s.connected && senderId) {
    s.emit('mark_messages_read', { senderId });
  }
};

export const sendTypingDirect = (recipientId) => {
  const s = getSocket();
  if (s && s.connected && recipientId) {
    s.emit('typing_direct', { recipientId });
  }
};

export const sendStopTypingDirect = (recipientId) => {
  const s = getSocket();
  if (s && s.connected && recipientId) {
    s.emit('stop_typing_direct', { recipientId });
  }
};

// Course Discussion & General Rooms
export const joinRoom = (room) => {
  const s = getSocket();
  if (s && s.connected && room) {
    s.emit('join_room', room);
  }
};

export const leaveRoom = (room) => {
  const s = getSocket();
  if (s && s.connected && room) {
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
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket.IO] Socket destroyed.');
  }
};

export default {
  getSocket,
  connectSocket,
  sendDirectMessage,
  markReadDirect,
  sendTypingDirect,
  sendStopTypingDirect,
  joinRoom,
  leaveRoom,
  sendSocketMessage,
  disconnectSocket,
};
