import asyncHandler from '../middleware/asyncHandler.js';
import enrollmentService from '../services/enrollmentService.js';

/**
 * @desc    Enroll in a course
 * @route   POST /api/enrollments/:courseId
 * @access  Private/Student
 */
export const enrollCourse = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.enrollInCourse(
    req.user.id,
    req.params.courseId,
    req.user.name
  );

  res.status(201).json({
    success: true,
    message: 'Enrolled in course successfully!',
    enrollment,
  });
});

/**
 * @desc    Get all courses enrolled by the current student
 * @route   GET /api/enrollments/my-courses, GET /api/enrollments
 * @access  Private
 */
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getStudentEnrollments(req.user.id);
  res.status(200).json({
    success: true,
    count: enrollments.length,
    enrollments,
  });
});

/**
 * @desc    Check if current user is enrolled in a specific course
 * @route   GET /api/enrollments/check/:courseId
 * @access  Private
 */
export const checkEnrollment = asyncHandler(async (req, res) => {
  const result = await enrollmentService.checkEnrollment(req.user.id, req.params.courseId);
  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get all students enrolled in a specific course (Instructor or Admin)
 * @route   GET /api/enrollments/course/:courseId/students
 * @access  Private/Instructor or Admin
 */
export const getCourseStudents = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getCourseEnrolledStudents(
    req.params.courseId,
    req.user
  );
  res.status(200).json({
    success: true,
    count: enrollments.length,
    enrollments,
  });
});

export default {
  enrollCourse,
  getMyEnrollments,
  checkEnrollment,
  getCourseStudents,
};
