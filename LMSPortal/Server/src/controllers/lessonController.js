import asyncHandler from '../middleware/asyncHandler.js';
import lessonService from '../services/lessonService.js';

/**
 * @desc    Get all lessons for a specific course
 * @route   GET /api/lessons/course/:courseId
 * @access  Public (full video/resource access requires enrollment or instructor/admin)
 */
export const getLessonsByCourse = asyncHandler(async (req, res) => {
  const result = await lessonService.getLessonsByCourse(req.params.courseId, req.user);
  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get a single lesson by ID
 * @route   GET /api/lessons/:id
 * @access  Private (or free preview)
 */
export const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await lessonService.getLessonById(req.params.id, req.user);
  res.status(200).json({
    success: true,
    lesson,
  });
});

/**
 * @desc    Create a new lesson within a course
 * @route   POST /api/lessons
 * @access  Private/Instructor or Admin
 */
export const createLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.createLesson(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Lesson added successfully!',
    lesson,
  });
});

/**
 * @desc    Update lesson details
 * @route   PUT /api/lessons/:id
 * @access  Private/Instructor or Admin
 */
export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.updateLesson(req.params.id, req.body, req.user);
  res.status(200).json({
    success: true,
    message: 'Lesson updated successfully!',
    lesson,
  });
});

/**
 * @desc    Delete a lesson
 * @route   DELETE /api/lessons/:id
 * @access  Private/Instructor or Admin
 */
export const deleteLesson = asyncHandler(async (req, res) => {
  await lessonService.deleteLesson(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: 'Lesson deleted successfully.',
  });
});

/**
 * @desc    Reorder lessons in a course
 * @route   PUT /api/lessons/course/:courseId/reorder
 * @access  Private/Instructor or Admin
 */
export const reorderLessons = asyncHandler(async (req, res) => {
  const lessons = await lessonService.reorderLessons(
    req.params.courseId,
    req.body.lessonOrders,
    req.user
  );
  res.status(200).json({
    success: true,
    message: 'Lessons reordered successfully!',
    lessons,
  });
});

export default {
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
};
