import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware
 * Validates JWT token from the Authorization header (Bearer <token>)
 * Attaches authenticated user to req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2) {
      token = parts[1].trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'lms_super_secret_jwt_key_2026_xyz!@#';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.',
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * Enforces access control strictly on the backend based on user roles
 * Usage: roleMiddleware('admin') or roleMiddleware('instructor', 'admin')
 */
export const authorize = (...roles) => {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in first.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * If a valid token is provided, attaches user to req.user.
 * If token is missing or invalid, proceeds without failing.
 */
export const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2) {
      token = parts[1].trim();
    }
  }

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'lms_super_secret_jwt_key_2026_xyz!@#';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (err) {
      // Ignore token verification errors for optional protect
    }
  }

  next();
};

// Explicit exports aliasing required names
export const authMiddleware = protect;
export const roleMiddleware = authorize;

export default {
  protect,
  authorize,
  authMiddleware,
  roleMiddleware,
  optionalProtect,
};
