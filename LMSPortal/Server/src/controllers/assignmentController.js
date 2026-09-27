import asyncHandler from '../middleware/asyncHandler.js';
import * as assignmentService from '../services/assignmentService.js';

/**
 * @desc    Get assignments (with search, filtering, and student status)
 * @route   GET /api/assignments
 * @access  Private
 */
export const getAssignments = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id || req.user._id : null;
  const userRole = req.user ? req.user.role : 'student';

  const result = await assignmentService.getAssignments(req.query, userId, userRole);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get single assignment details
 * @route   GET /api/assignments/:id
 * @access  Private
 */
export const getAssignment = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id || req.user._id : null;
  const userRole = req.user ? req.user.role : 'student';

  const result = await assignmentService.getAssignmentById(req.params.id, userId, userRole);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Create a new practical assignment
 * @route   POST /api/assignments
 * @access  Private (Instructor, Admin)
 */
export const createAssignment = asyncHandler(async (req, res) => {
  const instructorId = req.user.id || req.user._id;

  const assignment = await assignmentService.createAssignment(req.body, instructorId);

  res.status(201).json({
    success: true,
    message: 'Practical assignment created successfully.',
    assignment,
  });
});

/**
 * @desc    Update practical assignment
 * @route   PUT /api/assignments/:id
 * @access  Private (Instructor, Admin)
 */
export const updateAssignment = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const userRole = req.user.role;

  const assignment = await assignmentService.updateAssignment(
    req.params.id,
    req.body,
    userId,
    userRole
  );

  res.status(200).json({
    success: true,
    message: 'Practical assignment updated successfully.',
    assignment,
  });
});

/**
 * @desc    Delete practical assignment
 * @route   DELETE /api/assignments/:id
 * @access  Private (Instructor, Admin)
 */
export const deleteAssignment = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const userRole = req.user.role;

  const result = await assignmentService.deleteAssignment(req.params.id, userId, userRole);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Submit practical assignment
 * @route   POST /api/assignments/:id/submit
 * @access  Private (Student)
 */
export const submitAssignment = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const submission = await assignmentService.submitAssignment(
    req.params.id,
    userId,
    req.body,
    req.io
  );

  res.status(201).json({
    success: true,
    message: 'Assignment submitted successfully for instructor evaluation.',
    submission,
  });
});

/**
 * @desc    Evaluate student submission (Instructor / Admin)
 * @route   POST /api/assignments/submissions/:submissionId/evaluate
 * @access  Private (Instructor, Admin)
 */
export const evaluateSubmission = asyncHandler(async (req, res) => {
  const evaluatorId = req.user.id || req.user._id;
  const userRole = req.user.role;

  const result = await assignmentService.evaluateSubmission(
    req.params.submissionId,
    evaluatorId,
    userRole,
    req.body,
    req.io
  );

  res.status(200).json({
    success: true,
    message: `Submission evaluated successfully: ${result.submission.status}.`,
    ...result,
  });
});

/**
 * @desc    Get submissions across all instructor's courses
 * @route   GET /api/assignments/instructor/submissions
 * @access  Private (Instructor, Admin)
 */
export const getInstructorSubmissions = asyncHandler(async (req, res) => {
  const instructorId = req.user.id || req.user._id;
  const userRole = req.user.role;

  const result = await assignmentService.getInstructorSubmissions(
    instructorId,
    userRole,
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get all submissions for a single assignment
 * @route   GET /api/assignments/:id/submissions
 * @access  Private (Instructor, Admin)
 */
export const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const instructorId = req.user.id || req.user._id;
  const userRole = req.user.role;

  const submissions = await assignmentService.getAssignmentSubmissions(
    req.params.id,
    instructorId,
    userRole
  );

  res.status(200).json({
    success: true,
    count: submissions.length,
    submissions,
  });
});

export default {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  evaluateSubmission,
  getInstructorSubmissions,
  getAssignmentSubmissions,
};
