import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../config/env.js';

/**
 * Socket.IO Authentication Middleware
 * Validates JWT token on connection handshake
 * Attaches authenticated user object to socket.user
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      socket.handshake.query?.token;

    if (token && typeof token === 'string' && token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    if (!token) {
      return next(new Error('Authentication error: No authorization token provided.'));
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('Authentication error: User no longer exists.'));
    }

    if (!user.isActive) {
      return next(new Error('Authentication error: Account is deactivated.'));
    }

    // Attach verified user and ID to socket session
    socket.user = user;
    socket.userId = user._id.toString();

    next();
  } catch (err) {
    return next(new Error(`Authentication error: ${err.message || 'Invalid token'}`));
  }
};

export default socketAuthMiddleware;
