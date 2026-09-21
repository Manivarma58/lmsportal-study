import asyncHandler from '../middleware/asyncHandler.js';
import progressService from '../services/progressService.js';

/**
 * @desc    Mark a lesson as completed or incomplete (toggle)
 * @route   POST /api/progress/:courseId/lesson/:lessonId, POST /api/progress/:courseId/lesson/:lessonId/complete
 * @access  Private/Student
 */
export const markLessonComplete = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const result = await progressService.markLessonComplete(req.user.id, courseId, lessonId);

  res.status(200).json({
    success: true,
    message: result.isMarkedComplete ? 'Lesson marked complete!' : 'Lesson marked incomplete.',
    progressPercentage: result.progressPercentage,
    progress: {
      percentage: result.progressPercentage,
      completed: result.completed,
      completedLessons: result.completedLessons,
    },
    completed: result.completed,
    completedLessons: result.completedLessons,
    certificate: result.certificate,
    lastAccessedLesson: result.lastAccessedLesson,
  });
});

/**
 * @desc    Update progress for a lesson
 * @route   PUT /api/progress/:courseId/lesson/:lessonId, POST /api/progress/:courseId/lesson/:lessonId
 * @access  Private/Student
 */
export const updateLessonProgress = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const result = await progressService.updateLessonProgress(req.user.id, courseId, lessonId);

  res.status(200).json({
    success: true,
    message: 'Lesson progress updated.',
    ...result,
  });
});

/**
 * @desc    Get user's learning progress for a course
 * @route   GET /api/progress/:courseId
 * @access  Private/Student
 */
export const getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const result = await progressService.getCourseProgress(req.user.id, courseId);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Record student accessing a lesson (remembers lastAccessedLesson)
 * @route   POST /api/progress/:courseId/access/:lessonId
 * @access  Private/Student
 */
export const recordLessonAccess = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const result = await progressService.recordLessonAccess(req.user.id, courseId, lessonId);

  res.status(200).json({
    success: true,
    message: 'Lesson access recorded.',
    ...result,
  });
});

export default {
  markLessonComplete,
  updateLessonProgress,
  getCourseProgress,
  recordLessonAccess,
};
