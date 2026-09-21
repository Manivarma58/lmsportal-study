import asyncHandler from '../middleware/asyncHandler.js';
import quizService from '../services/quizService.js';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

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
  const quizDoc = await Quiz.findById(req.params.id);
  if (!quizDoc) {
    return res.status(404).json({ success: false, message: 'Quiz not found.' });
  }

  // If requester is a student, verify they are enrolled in the course or course is free
  if (req.user && req.user.role === 'student') {
    const course = await Course.findById(quizDoc.course);
    if (course && !course.isFree && (course.price || 0) > 0) {
      const isEnrolled = await Enrollment.exists({
        student: req.user.id || req.user._id,
        course: quizDoc.course,
      });
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: 'You must enroll in this course to access its quizzes.',
        });
      }
    }
  }

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
  const quizDoc = await Quiz.findById(req.params.id);
  if (!quizDoc) {
    return res.status(404).json({ success: false, message: 'Quiz not found.' });
  }

  // Verify student enrollment for paid course quizzes
  if (req.user && req.user.role === 'student') {
    const course = await Course.findById(quizDoc.course);
    if (course && !course.isFree && (course.price || 0) > 0) {
      const isEnrolled = await Enrollment.exists({
        student: req.user.id || req.user._id,
        course: quizDoc.course,
      });
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: 'You must enroll in this course to submit quiz attempts.',
        });
      }
    }
  }

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

/**
 * @desc    Add a question to quiz
 * @route   POST /api/quizzes/:id/questions
 * @access  Private/Instructor or Admin
 */
export const addQuestion = asyncHandler(async (req, res) => {
  const result = await quizService.addQuestionToQuiz(req.params.id, req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Question added successfully!',
    ...result,
  });
});

/**
 * @desc    Update a question in quiz
 * @route   PUT /api/quizzes/:id/questions/:questionId
 * @access  Private/Instructor or Admin
 */
export const updateQuestion = asyncHandler(async (req, res) => {
  const result = await quizService.updateQuestionInQuiz(
    req.params.id,
    req.params.questionId,
    req.body,
    req.user
  );
  res.status(200).json({
    success: true,
    message: 'Question updated successfully!',
    ...result,
  });
});

/**
 * @desc    Delete a question from quiz
 * @route   DELETE /api/quizzes/:id/questions/:questionId
 * @access  Private/Instructor or Admin
 */
export const deleteQuestion = asyncHandler(async (req, res) => {
  const result = await quizService.deleteQuestionFromQuiz(
    req.params.id,
    req.params.questionId,
    req.user
  );
  res.status(200).json(result);
});

export default {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getCourseQuizzes,
  submitQuiz,
  getMyQuizSubmissions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
};
