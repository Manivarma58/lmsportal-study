import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export const registerUser = async ({ name, email, password, role }) => {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new ErrorResponse('Please provide a valid name.', 400);
  }
  if (name.trim().length < 2) {
    throw new ErrorResponse('Name must be at least 2 characters.', 400);
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    throw new ErrorResponse('Please provide a valid email address.', 400);
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new ErrorResponse('Password must be at least 6 characters.', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ErrorResponse('An account with this email address already exists.', 400);
  }

  const allowedRoles = ['student', 'instructor', 'admin'];
  const assignedRole = role ? role.toLowerCase().trim() : 'student';
  if (!allowedRoles.includes(assignedRole)) {
    throw new ErrorResponse(`Invalid role specified. Allowed roles: ${allowedRoles.join(', ')}`, 400);
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: assignedRole,
  });

  const token = user.getSignedJwtToken();

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      avatar: user.avatar,
      headline: user.headline,
      bio: user.bio,
      createdAt: user.createdAt,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new ErrorResponse('Please provide both email and password.', 400);
  }

  const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    throw new ErrorResponse('Invalid email or password.', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ErrorResponse('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new ErrorResponse('Your account has been deactivated. Please contact support.', 403);
  }

  const token = user.getSignedJwtToken();

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      avatar: user.avatar,
      headline: user.headline,
      bio: user.bio,
    },
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ErrorResponse('User not found.', 404);
  }
  return user;
};

export const forgotPassword = async (email) => {
  if (!email) {
    throw new ErrorResponse('Please provide an email address.', 400);
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ErrorResponse('No user registered with this email.', 404);
  }

  const resetToken = 'reset_' + Math.random().toString(36).substring(2, 15);
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  return { resetToken };
};

export const resetPassword = async (resetToken, newPassword) => {
  if (!resetToken || !newPassword) {
    throw new ErrorResponse('Please provide reset token and new password.', 400);
  }
  if (newPassword.length < 6) {
    throw new ErrorResponse('Password must be at least 6 characters.', 400);
  }

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ErrorResponse('Invalid or expired password reset token.', 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.getSignedJwtToken();
  return { token };
};

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
