import asyncHandler from '../middleware/asyncHandler.js';
import courseService from '../services/courseService.js';

/**
 * @desc    Get all courses with search, filters, sorting, and pagination
 * @route   GET /api/courses
 * @access  Public
 */
export const getAllCourses = asyncHandler(async (req, res) => {
  const { keyword, category, level, price, sort, page, limit, status } = req.query;
  const isAdmin = req.user?.role === 'admin';
  const result = await courseService.getAllCourses({
    keyword,
    category,
    level,
    price,
    sort,
    page,
    limit,
    status,
    includeUnpublished: isAdmin || req.query.includeUnpublished === 'true',
  });

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get single course by ID with instructor & lessons
 * @route   GET /api/courses/:id
 * @access  Public (unpublished requires instructor or admin)
 */
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id, req.user);
  res.status(200).json({
    success: true,
    course,
  });
});

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Instructor or Admin
 */
export const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user.id);
  res.status(201).json({
    success: true,
    message: 'Course created successfully!',
    course,
  });
});

/**
 * @desc    Update course details
 * @route   PUT /api/courses/:id
 * @access  Private/Instructor or Admin
 */
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body, req.user);
  res.status(200).json({
    success: true,
    message: 'Course updated successfully!',
    course,
  });
});

/**
 * @desc    Delete a course
 * @route   DELETE /api/courses/:id
 * @access  Private/Instructor or Admin
 */
export const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: 'Course deleted successfully.',
  });
});

/**
 * @desc    Toggle course published status
 * @route   PATCH /api/courses/:id/publish, PUT /api/courses/:id/publish
 * @access  Private/Instructor or Admin
 */
export const togglePublishCourse = asyncHandler(async (req, res) => {
  const course = await courseService.togglePublishCourse(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: `Course is now ${course.published ? 'published' : 'draft'}.`,
    isPublished: course.published,
    course,
  });
});

/**
 * @desc    Get courses created by current instructor
 * @route   GET /api/courses/instructor/my-courses
 * @access  Private/Instructor or Admin
 */
export const getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getInstructorCourses(req.user.id);
  res.status(200).json({
    success: true,
    count: courses.length,
    courses,
  });
});

/**
 * @desc    Get featured published courses
 * @route   GET /api/courses/featured
 * @access  Public
 */
export const getFeaturedCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getFeaturedCourses();
  res.status(200).json({
    success: true,
    count: courses.length,
    courses,
  });
});

/**
 * @desc    Get distinct list of published course categories
 * @route   GET /api/courses/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await courseService.getCategories();
  res.status(200).json({
    success: true,
    categories,
  });
});

export default {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  getInstructorCourses,
  getFeaturedCourses,
  getCategories,
};
