import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Certificate from '../models/Certificate.js';
import ErrorResponse from '../utils/errorResponse.js';

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ErrorResponse('User not found.', 404);
  }
  return user;
};

export const updateUserProfile = async (userId, updateData) => {
  const { name, headline, bio, phone, socialLinks, avatar, profileImage } = updateData;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name.trim();
  if (headline !== undefined) fieldsToUpdate.headline = headline;
  if (bio !== undefined) fieldsToUpdate.bio = bio;
  if (phone !== undefined) fieldsToUpdate.phone = phone;
  if (socialLinks) fieldsToUpdate.socialLinks = socialLinks;
  if (profileImage) fieldsToUpdate.profileImage = profileImage;
  else if (avatar) fieldsToUpdate.profileImage = avatar;

  const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    throw new ErrorResponse('User not found.', 404);
  }

  return user;
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new ErrorResponse('Please provide both current and new password.', 400);
  }
  if (newPassword.length < 6) {
    throw new ErrorResponse('New password must be at least 6 characters.', 400);
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ErrorResponse('User not found.', 404);
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ErrorResponse('Current password does not match.', 400);
  }

  user.password = newPassword;
  await user.save();

  const token = user.getSignedJwtToken();
  return { token };
};

export const getAllUsers = async ({ keyword, role, status, page = 1, limit = 20 }) => {
  const query = {};

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (role && role !== 'All') {
    query.role = role;
  }

  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'suspended' || status === 'inactive') {
    query.isActive = false;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(query);

  return {
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    users,
  };
};

export const getInstructorsOverview = async ({ keyword, status, page = 1, limit = 20 }) => {
  const query = { role: 'instructor' };

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'suspended' || status === 'inactive') {
    query.isActive = false;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  const instructors = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(query);

  const enriched = await Promise.all(
    instructors.map(async (inst) => {
      const courses = await Course.find({ instructor: inst._id }).select('_id title published isPublished price');
      const courseIds = courses.map((c) => c._id);
      const totalStudents = await Enrollment.distinct('student', { course: { $in: courseIds } });
      const totalEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds } });

      return {
        ...inst.toObject(),
        coursesCount: courses.length,
        publishedCoursesCount: courses.filter((c) => c.published || c.isPublished).length,
        studentsCount: totalStudents.length,
        enrollmentsCount: totalEnrollments,
      };
    })
  );

  return {
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    instructors: enriched,
  };
};

export const getStudentsOverview = async ({ keyword, status, page = 1, limit = 20 }) => {
  const query = { role: 'student' };

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'suspended' || status === 'inactive') {
    query.isActive = false;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  const students = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(query);

  const enriched = await Promise.all(
    students.map(async (stu) => {
      const enrollments = await Enrollment.find({ student: stu._id }).populate('course', 'title thumbnail');
      const completedCount = enrollments.filter(
        (e) => e.completed || e.isCompleted || e.completionPercentage === 100
      ).length;
      const certCount = await Certificate.countDocuments({ student: stu._id });

      const completionRate =
        enrollments.length > 0
          ? Math.round((completedCount / enrollments.length) * 100)
          : 0;

      return {
        ...stu.toObject(),
        enrolledCount: enrollments.length,
        completedCount,
        completionRate,
        certificatesCount: certCount,
        recentEnrollments: enrollments.slice(0, 3),
      };
    })
  );

  return {
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    students: enriched,
  };
};

export const updateUserRole = async (userId, role) => {
  const validRoles = ['admin', 'instructor', 'student'];
  if (!validRoles.includes(role)) {
    throw new ErrorResponse('Invalid role specified.', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse('User not found.', 404);
  }

  user.role = role;
  await user.save();

  return user;
};

export const toggleUserStatus = async (userId, requesterId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse('User not found.', 404);
  }

  if (user._id.toString() === requesterId.toString()) {
    throw new ErrorResponse('You cannot deactivate your own admin account.', 400);
  }

  user.isActive = !user.isActive;
  await user.save();

  return user;
};

export const deleteUser = async (userId, requesterId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse('User not found.', 404);
  }

  if (user._id.toString() === requesterId.toString()) {
    throw new ErrorResponse('You cannot delete your own admin account.', 400);
  }

  await Enrollment.deleteMany({ student: user._id });
  await user.deleteOne();

  return { success: true };
};

export default {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getAllUsers,
  getInstructorsOverview,
  getStudentsOverview,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
};
