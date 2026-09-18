import asyncHandler from '../middleware/asyncHandler.js';
import userService from '../services/userService.js';

/**
 * @desc    Get user profile (current user)
 * @route   GET /api/users/profile, GET /api/users/me
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully!',
    user,
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await userService.changeUserPassword(req.user.id, currentPassword, newPassword);
  res.status(200).json({
    success: true,
    message: 'Password changed successfully!',
    token: result.token,
  });
});

/**
 * @desc    Get all users with search, role filtering, pagination (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { keyword, role, status, page, limit } = req.query;
  const result = await userService.getAllUsers({ keyword, role, status, page, limit });
  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get instructors list with courses and students count (Admin only)
 * @route   GET /api/users/instructors
 * @access  Private/Admin
 */
export const getInstructorsOverview = asyncHandler(async (req, res) => {
  const { keyword, status, page, limit } = req.query;
  const result = await userService.getInstructorsOverview({ keyword, status, page, limit });
  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get students list with enrollments and completion statistics (Admin only)
 * @route   GET /api/users/students
 * @access  Private/Admin
 */
export const getStudentsOverview = asyncHandler(async (req, res) => {
  const { keyword, status, page, limit } = req.query;
  const result = await userService.getStudentsOverview({ keyword, status, page, limit });
  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role);
  res.status(200).json({
    success: true,
    message: `User role updated to ${user.role}.`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @desc    Toggle user active/suspended status (Admin only)
 * @route   PATCH /api/users/:id/status
 * @access  Private/Admin
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    message: `User account is now ${user.isActive ? 'active' : 'suspended'}.`,
    isActive: user.isActive,
  });
});

/**
 * @desc    Delete user account (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    message: 'User deleted successfully.',
  });
});

export default {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getInstructorsOverview,
  getStudentsOverview,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
};
