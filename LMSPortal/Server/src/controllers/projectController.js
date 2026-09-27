import asyncHandler from '../middleware/asyncHandler.js';
import * as projectService from '../services/projectService.js';

/**
 * @desc    Get all projects with filtering and student progress
 * @route   GET /api/projects
 * @access  Public / Optional Auth
 */
export const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id || req.user._id : null;
  const userRole = req.user ? req.user.role : 'student';

  const result = await projectService.getProjects(req.query, userId, userRole);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get single project details and student workspace
 * @route   GET /api/projects/:id
 * @access  Public / Optional Auth
 */
export const getProject = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id || req.user._id : null;
  const userRole = req.user ? req.user.role : 'student';

  const result = await projectService.getProjectById(req.params.id, userId, userRole);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Create a new real-world project
 * @route   POST /api/projects
 * @access  Private (Instructor, Admin)
 */
export const createProject = asyncHandler(async (req, res) => {
  const instructorId = req.user.id || req.user._id;

  const project = await projectService.createProject(req.body, instructorId);

  res.status(201).json({
    success: true,
    message: 'Practical project created successfully.',
    project,
  });
});

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (Instructor, Admin)
 */
export const updateProject = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const userRole = req.user.role;

  const project = await projectService.updateProject(
    req.params.id,
    req.body,
    userId,
    userRole
  );

  res.status(200).json({
    success: true,
    message: 'Project updated successfully.',
    project,
  });
});

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Instructor, Admin)
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const userRole = req.user.role;

  const result = await projectService.deleteProject(req.params.id, userId, userRole);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Update milestone progress (Learner checking off milestone deliverables)
 * @route   PATCH /api/projects/:id/milestones
 * @access  Private (Student)
 */
export const updateMilestoneProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const result = await projectService.updateMilestoneProgress(
    req.params.id,
    userId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Milestone progress updated.',
    ...result,
  });
});

/**
 * @desc    Submit practical project deliverables (Repo, Deployment, Docs)
 * @route   POST /api/projects/:id/submit
 * @access  Private (Student)
 */
export const submitProject = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const submission = await projectService.submitProject(
    req.params.id,
    userId,
    req.body,
    req.io
  );

  res.status(201).json({
    success: true,
    message: 'Project deliverables submitted successfully for evaluation.',
    submission,
  });
});

/**
 * @desc    Evaluate student project with rubric criteria and send evidence to Skill Engine
 * @route   POST /api/projects/submissions/:submissionId/evaluate
 * @access  Private (Instructor, Admin)
 */
export const evaluateProject = asyncHandler(async (req, res) => {
  const evaluatorId = req.user.id || req.user._id;
  const userRole = req.user.role;

  const result = await projectService.evaluateProject(
    req.params.submissionId,
    evaluatorId,
    userRole,
    req.body,
    req.io
  );

  res.status(200).json({
    success: true,
    message: `Project evaluated successfully: ${result.submission.status}.`,
    ...result,
  });
});

/**
 * @desc    Get instructor's project submissions
 * @route   GET /api/projects/instructor/submissions
 * @access  Private (Instructor, Admin)
 */
export const getInstructorProjectSubmissions = asyncHandler(async (req, res) => {
  const instructorId = req.user.id || req.user._id;
  const userRole = req.user.role;

  const result = await projectService.getInstructorProjectSubmissions(
    instructorId,
    userRole,
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

export default {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateMilestoneProgress,
  submitProject,
  evaluateProject,
  getInstructorProjectSubmissions,
};
