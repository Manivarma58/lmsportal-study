import asyncHandler from '../middleware/asyncHandler.js';
import quizService from '../services/quizService.js';

/**
 * @desc    Create a new quiz
 * @route   POST /api/quizzes
 * @access  Private/Instructor or Admin
 */
export const createQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.createQuiz(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Quiz created successfully!',
    quiz,
  });
});

/**
 * @desc    Get a quiz by ID (student gets questions with masked answer key)
 * @route   GET /api/quizzes/:id
 * @access  Private
 */
export const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await quizService.getQuizById(req.params.id, req.user);
  res.status(200).json({
    success: true,
    quiz,
  });
});

/**
 * @desc    Update a quiz
 * @route   PUT /api/quizzes/:id
 * @access  Private/Instructor or Admin
 */
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.updateQuiz(req.params.id, req.body, req.user);
  res.status(200).json({
    success: true,
    message: 'Quiz updated successfully!',
    quiz,
  });
});

/**
 * @desc    Delete a quiz
 * @route   DELETE /api/quizzes/:id
 * @access  Private/Instructor or Admin
 */
export const deleteQuiz = asyncHandler(async (req, res) => {
  await quizService.deleteQuiz(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: 'Quiz deleted successfully.',
  });
});

/**
 * @desc    Get all quizzes for a course
 * @route   GET /api/quizzes/course/:courseId
 * @access  Private
 */
export const getCourseQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await quizService.getCourseQuizzes(req.params.courseId, req.user);
  res.status(200).json({
    success: true,
    count: quizzes.length,
    quizzes,
  });
});

/**
 * @desc    Submit quiz answers and compute score
 * @route   POST /api/quizzes/:id/submit
 * @access  Private/Student
 */
export const submitQuiz = asyncHandler(async (req, res) => {
  const result = await quizService.submitQuiz(req.params.id, req.user.id, req.body);
  res.status(200).json({
    success: true,
    message: result.passed
      ? 'Congratulations! You passed the quiz!'
      : 'Quiz submitted. Passing score not reached.',
    ...result,
  });
});

/**
 * @desc    Get current student's quiz submissions
 * @route   GET /api/quizzes/:id/my-submissions
 * @access  Private/Student
 */
export const getMyQuizSubmissions = asyncHandler(async (req, res) => {
  const submissions = await quizService.getStudentQuizSubmissions(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    submissions,
  });
});

export default {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getCourseQuizzes,
  submitQuiz,
  getMyQuizSubmissions,
};
