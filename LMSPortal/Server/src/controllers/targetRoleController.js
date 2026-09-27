import asyncHandler from '../middleware/asyncHandler.js';
import * as targetRoleService from '../services/targetRoleService.js';

/**
 * @desc    Get all target roles
 * @route   GET /api/target-roles
 * @access  Public / Authenticated
 */
export const getTargetRoles = asyncHandler(async (req, res) => {
  const isPrivileged = req.user && ['admin', 'instructor'].includes(req.user.role);
  const filterOptions = {
    category: req.query.category,
    search: req.query.search,
    publishedOnly: !isPrivileged,
  };

  const roles = await targetRoleService.getAllTargetRoles(filterOptions);

  res.status(200).json({
    success: true,
    count: roles.length,
    roles,
  });
});

/**
 * @desc    Get single target role details by ID or slug
 * @route   GET /api/target-roles/:idOrSlug
 * @access  Public / Authenticated
 */
export const getTargetRole = asyncHandler(async (req, res) => {
  const role = await targetRoleService.getTargetRoleByIdOrSlug(req.params.idOrSlug);

  res.status(200).json({
    success: true,
    role,
  });
});

/**
 * @desc    Create new target role
 * @route   POST /api/target-roles
 * @access  Private (Admin, Instructor)
 */
export const createTargetRole = asyncHandler(async (req, res) => {
  const creatorId = req.user ? req.user.id || req.user._id : null;
  const role = await targetRoleService.createTargetRole(req.body, creatorId);

  res.status(201).json({
    success: true,
    message: 'Target role created successfully',
    role,
  });
});

/**
 * @desc    Update target role
 * @route   PUT /api/target-roles/:id
 * @access  Private (Admin, Instructor)
 */
export const updateTargetRole = asyncHandler(async (req, res) => {
  const updatedRole = await targetRoleService.updateTargetRole(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Target role updated successfully',
    role: updatedRole,
  });
});

/**
 * @desc    Delete target role
 * @route   DELETE /api/target-roles/:id
 * @access  Private (Admin)
 */
export const deleteTargetRole = asyncHandler(async (req, res) => {
  const result = await targetRoleService.deleteTargetRole(req.params.id);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get authenticated learner's active target role
 * @route   GET /api/target-roles/learner/current
 * @access  Private (Learner)
 */
export const getLearnerTargetRole = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const activeRole = await targetRoleService.getLearnerActiveTargetRole(userId);

  res.status(200).json({
    success: true,
    learnerTargetRole: activeRole,
  });
});

/**
 * @desc    Set or update authenticated learner's target role
 * @route   POST /api/target-roles/learner/select
 * @access  Private (Learner)
 */
export const setLearnerTargetRole = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const learnerTargetRole = await targetRoleService.setLearnerTargetRole(userId, req.body);

  res.status(200).json({
    success: true,
    message: 'Target role updated successfully',
    learnerTargetRole,
  });
});

/**
 * @desc    Analyze learner skill gap against target role requirements
 * @route   GET /api/target-roles/analyzer
 * @access  Private (Learner)
 */
export const analyzeSkillGap = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const targetRoleId = req.query.roleId || null;

  const analysis = await targetRoleService.analyzeSkillGap(userId, targetRoleId);

  res.status(200).json({
    success: true,
    ...analysis,
  });
});
