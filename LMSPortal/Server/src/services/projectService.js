import Project from '../models/Project.js';
import ProjectSubmission from '../models/ProjectSubmission.js';
import Notification from '../models/Notification.js';
import { recordSkillEvidence } from './skillService.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Get all projects with filtering, search, and student progress metrics
 */
export const getProjects = async (query = {}, userId = null, userRole = 'student') => {
  const {
    difficulty,
    courseId,
    status,
    search,
    page = 1,
    limit = 20,
    instructorId,
  } = query;

  const filter = { isPublished: true };

  if (instructorId) {
    filter.instructor = instructorId;
  }
  if (difficulty && difficulty !== 'all') {
    filter.difficulty = difficulty;
  }
  if (courseId && courseId !== 'all') {
    filter.course = courseId;
  }
  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('requiredSkills', 'name slug category difficulty')
      .populate('instructor', 'name email avatar')
      .populate('course', 'title thumbnail slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Project.countDocuments(filter),
  ]);

  const projectIds = projects.map((p) => p._id);

  // If student is logged in, attach their submission and milestone progress
  let studentSubmissionsMap = {};
  if (userId && userRole === 'student') {
    const subs = await ProjectSubmission.find({
      project: { $in: projectIds },
      user: userId,
    }).lean();

    subs.forEach((s) => {
      studentSubmissionsMap[s.project.toString()] = s;
    });
  }

  // If instructor or admin, attach aggregate metrics
  let metricsMap = {};
  if (userRole === 'instructor' || userRole === 'admin') {
    const stats = await ProjectSubmission.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$project',
          totalLearners: { $sum: 1 },
          submittedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Submitted'] }, 1, 0] },
          },
          underReviewCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Under Review'] }, 1, 0] },
          },
          needsRevisionCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Needs Revision'] }, 1, 0] },
          },
          passedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Passed'] }, 1, 0] },
          },
          avgScore: { $avg: '$score' },
        },
      },
    ]);

    stats.forEach((st) => {
      metricsMap[st._id.toString()] = st;
    });
  }

  const enrichedProjects = projects.map((project) => {
    const pId = project._id.toString();
    const submission = studentSubmissionsMap[pId] || null;
    const totalMilestones = project.milestones?.length || 0;

    let completedMilestones = 0;
    if (submission?.milestoneProgress?.length > 0) {
      completedMilestones = submission.milestoneProgress.filter((m) => m.completed).length;
    }

    const progressPercentage =
      totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const userStatus = submission ? submission.status : 'Not Started';

    return {
      ...project,
      userSubmission: submission,
      userStatus,
      progressPercentage,
      completedMilestones,
      totalMilestones,
      metrics: metricsMap[pId] || {
        totalLearners: 0,
        submittedCount: 0,
        underReviewCount: 0,
        needsRevisionCount: 0,
        passedCount: 0,
        avgScore: null,
      },
    };
  });

  // Filter by userStatus if requested
  let finalResults = enrichedProjects;
  if (status && status !== 'all') {
    if (status === 'Pending' || status === 'pending') {
      finalResults = finalResults.filter((p) => p.userStatus === 'Not Started');
    } else {
      finalResults = finalResults.filter(
        (p) => p.userStatus.toLowerCase() === status.toLowerCase()
      );
    }
  }

  return {
    projects: finalResults,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  };
};

/**
 * Get project details by ID or Slug, initializing student submission workspace if needed
 */
export const getProjectById = async (idOrSlug, userId = null, userRole = 'student') => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const project = await Project.findOne(query)
    .populate('requiredSkills', 'name slug category difficulty')
    .populate('instructor', 'name email avatar')
    .populate('course', 'title thumbnail slug')
    .lean();

  if (!project) {
    throw new ErrorResponse('Project not found.', 404);
  }

  let submission = null;
  if (userId) {
    submission = await ProjectSubmission.findOne({
      project: project._id,
      user: userId,
    }).lean();

    // If student has no submission yet, initialize a milestone progress scaffold
    if (!submission && userRole === 'student') {
      const scaffoldProgress = (project.milestones || []).map((m) => ({
        milestoneId: m._id,
        milestoneTitle: m.title,
        completed: false,
        notes: '',
      }));

      const newSub = new ProjectSubmission({
        project: project._id,
        user: userId,
        status: 'In Progress',
        milestoneProgress: scaffoldProgress,
      });

      await newSub.save();
      submission = newSub.toObject();
    }
  }

  // Calculate completed milestones
  const totalMilestones = project.milestones?.length || 0;
  let completedMilestones = 0;
  if (submission?.milestoneProgress?.length > 0) {
    completedMilestones = submission.milestoneProgress.filter((m) => m.completed).length;
  }
  const progressPercentage =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return {
    project,
    submission,
    completedMilestones,
    totalMilestones,
    progressPercentage,
  };
};

/**
 * Create a new real-world project
 */
export const createProject = async (data, instructorId) => {
  const {
    title,
    description,
    objectives = [],
    difficulty = 'Intermediate',
    estimatedDuration = '2 weeks',
    requiredSkills = [],
    requirements = [],
    milestones = [],
    evaluationCriteria,
    courseId,
    course,
    isPublished = true,
  } = data;

  const targetCourseId = courseId || course || null;

  // Set default evaluation rubric if not provided
  let formattedCriteria = evaluationCriteria;
  if (!formattedCriteria || !Array.isArray(formattedCriteria) || formattedCriteria.length === 0) {
    formattedCriteria = [
      { name: 'Functionality', description: 'Core business logic and production resilience', maxPoints: 30, weight: 1.0 },
      { name: 'API Design', description: 'RESTful/GraphQL architecture, contracts, and error structures', maxPoints: 20, weight: 1.0 },
      { name: 'Database', description: 'Data modeling, query efficiency, indexes, and migrations', maxPoints: 15, weight: 1.0 },
      { name: 'Code Quality', description: 'Design patterns, modular architecture, and linting standards', maxPoints: 15, weight: 1.0 },
      { name: 'Testing', description: 'Unit, integration, and end-to-end test suite coverage', maxPoints: 10, weight: 1.0 },
      { name: 'Documentation', description: 'Architecture runbook, API specs, and setup instructions', maxPoints: 10, weight: 1.0 },
    ];
  }

  const project = new Project({
    title,
    description,
    objectives,
    difficulty,
    estimatedDuration,
    requiredSkills,
    requirements,
    milestones,
    evaluationCriteria: formattedCriteria,
    instructor: instructorId,
    course: targetCourseId,
    isPublished: isPublished !== false,
  });

  await project.save();

  return Project.findById(project._id)
    .populate('requiredSkills', 'name slug category')
    .populate('instructor', 'name email avatar')
    .populate('course', 'title slug');
};

/**
 * Update an existing project
 */
export const updateProject = async (id, updateData, userId, userRole = 'instructor') => {
  const project = await Project.findById(id);
  if (!project) {
    throw new ErrorResponse('Project not found.', 404);
  }

  if (project.instructor.toString() !== userId.toString() && userRole !== 'admin') {
    throw new ErrorResponse('Unauthorized to update this project.', 403);
  }

  const allowedFields = [
    'title',
    'description',
    'objectives',
    'difficulty',
    'estimatedDuration',
    'requiredSkills',
    'requirements',
    'milestones',
    'evaluationCriteria',
    'course',
    'isPublished',
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      project[field] = updateData[field];
    }
  });

  await project.save();

  return Project.findById(project._id)
    .populate('requiredSkills', 'name slug category')
    .populate('instructor', 'name email avatar')
    .populate('course', 'title slug');
};

/**
 * Delete a project
 */
export const deleteProject = async (id, userId, userRole = 'instructor') => {
  const project = await Project.findById(id);
  if (!project) {
    throw new ErrorResponse('Project not found.', 404);
  }

  if (project.instructor.toString() !== userId.toString() && userRole !== 'admin') {
    throw new ErrorResponse('Unauthorized to delete this project.', 403);
  }

  await ProjectSubmission.deleteMany({ project: project._id });
  await Project.findByIdAndDelete(project._id);

  return { message: 'Project and associated student submissions deleted successfully.' };
};

/**
 * Update milestone completion status for a learner
 */
export const updateMilestoneProgress = async (projectId, userId, milestoneData) => {
  let { milestoneId, milestoneIndex, completed, notes = '' } = milestoneData;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ErrorResponse('Project not found.', 404);
  }

  if (!milestoneId && typeof milestoneIndex === 'number' && project.milestones && project.milestones[milestoneIndex]) {
    milestoneId = project.milestones[milestoneIndex]._id;
  }

  if (!milestoneId) {
    throw new ErrorResponse('Milestone ID or valid milestone index is required.', 400);
  }

  let submission = await ProjectSubmission.findOne({
    project: project._id,
    user: userId,
  });

  if (!submission) {
    submission = new ProjectSubmission({
      project: project._id,
      user: userId,
      status: 'In Progress',
      milestoneProgress: [],
    });
  }

  // Find milestone in submission progress
  const mIndex = submission.milestoneProgress.findIndex(
    (m) => m.milestoneId.toString() === milestoneId.toString()
  );

  const targetMilestoneDef = project.milestones.find(
    (m) => m._id.toString() === milestoneId.toString()
  );
  const milestoneTitle = targetMilestoneDef ? targetMilestoneDef.title : 'Milestone';

  if (mIndex >= 0) {
    submission.milestoneProgress[mIndex].completed = Boolean(completed);
    submission.milestoneProgress[mIndex].completedAt = completed ? new Date() : null;
    if (notes) submission.milestoneProgress[mIndex].notes = notes;
  } else {
    submission.milestoneProgress.push({
      milestoneId,
      milestoneTitle,
      completed: Boolean(completed),
      completedAt: completed ? new Date() : null,
      notes,
    });
  }

  // Update status if currently not submitted or passed
  if (['Draft', 'Not Started'].includes(submission.status)) {
    submission.status = 'In Progress';
  }

  await submission.save();

  const totalMilestones = project.milestones.length;
  const completedMilestones = submission.milestoneProgress.filter((m) => m.completed).length;
  const progressPercentage =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return {
    submission,
    completedMilestones,
    totalMilestones,
    progressPercentage,
  };
};

/**
 * Submit practical project deliverables
 * IMPORTANT: A learner must provide actual work. Status is set to 'Submitted'.
 * Does not mark project completed simply by clicking!
 */
export const submitProject = async (projectId, userId, payload, io = null) => {
  const {
    repositoryUrl = '',
    deploymentUrl = '',
    documentationUrl = '',
    attachments = [],
  } = payload;

  const project = await Project.findById(projectId)
    .populate('instructor', 'name email')
    .populate('course', 'title');

  if (!project) {
    throw new ErrorResponse('Target project not found.', 404);
  }

  // Validate actual work is supplied
  if (!repositoryUrl.trim() && !deploymentUrl.trim() && !documentationUrl.trim() && attachments.length === 0) {
    throw new ErrorResponse(
      'Please provide your project repository URL, live deployment URL, or documentation URL.',
      400
    );
  }

  let submission = await ProjectSubmission.findOne({
    project: project._id,
    user: userId,
  });

  if (!submission) {
    submission = new ProjectSubmission({
      project: project._id,
      user: userId,
    });
  }

  submission.repositoryUrl = repositoryUrl.trim();
  submission.deploymentUrl = deploymentUrl.trim();
  submission.documentationUrl = documentationUrl.trim();
  submission.attachments = attachments;
  submission.status = 'Submitted'; // Crucial: Not automatically completed!
  submission.submittedAt = new Date();
  submission.score = null;
  submission.criteriaGrades = [];
  submission.feedback = '';
  submission.evaluatedBy = null;
  submission.evaluatedAt = null;

  await submission.save();

  // Notify instructor
  try {
    const instructorId = project.instructor._id || project.instructor;
    const notification = new Notification({
      recipient: instructorId,
      title: 'Capstone Project Submitted',
      message: `A learner has submitted capstone project "${project.title}" for rubric evaluation.`,
      type: 'project_submitted',
      link: '/instructor/assignments',
    });
    await notification.save();

    if (io) {
      io.to(instructorId.toString()).emit('new_notification', {
        title: notification.title,
        message: notification.message,
        type: notification.type,
      });
    }
  } catch (notifyErr) {
    console.warn('[Project Service] Instructor notification dispatch warning:', notifyErr.message);
  }

  return submission;
};

/**
 * Evaluate project submission by instructor/admin
 * Calculates weighted score, updates status, and sends evidence to the Skill Engine.
 */
export const evaluateProject = async (
  submissionId,
  evaluatorId,
  userRole,
  evaluationData,
  io = null
) => {
  const {
    criteriaGrades = [],
    status = 'Passed',
    feedback = '',
  } = evaluationData;

  const validStatuses = ['Submitted', 'Under Review', 'Needs Revision', 'Passed', 'Failed'];
  if (!validStatuses.includes(status)) {
    throw new ErrorResponse(
      `Invalid verdict status: ${status}. Must be one of: ${validStatuses.join(', ')}`,
      400
    );
  }

  const submission = await ProjectSubmission.findById(submissionId)
    .populate('project')
    .populate('user', 'name email');

  if (!submission) {
    throw new ErrorResponse('Project submission record not found.', 404);
  }

  const project = submission.project;
  if (!project) {
    throw new ErrorResponse('Associated project reference missing.', 404);
  }

  if (project.instructor.toString() !== evaluatorId.toString() && userRole !== 'admin') {
    throw new ErrorResponse('You are not authorized to evaluate this project.', 403);
  }

  // Calculate weighted project score from evaluation criteria
  let calculatedScore = null;
  if (Array.isArray(criteriaGrades) && criteriaGrades.length > 0) {
    const criteriaWeightMap = new Map();
    (project.evaluationCriteria || []).forEach((c) => {
      criteriaWeightMap.set(c.name.toLowerCase().trim(), c.weight || 1.0);
    });

    let totalWeightedEarned = 0;
    let totalWeightedMax = 0;

    criteriaGrades.forEach((cg) => {
      const weight = criteriaWeightMap.get((cg.criterionName || '').toLowerCase().trim()) || 1.0;
      const earned = Number(cg.pointsEarned) || 0;
      const maxPts = Number(cg.maxPoints) || 1;

      totalWeightedEarned += earned * weight;
      totalWeightedMax += maxPts * weight;
    });

    if (totalWeightedMax > 0) {
      calculatedScore = Math.min(
        100,
        Math.max(0, Math.round((totalWeightedEarned / totalWeightedMax) * 100))
      );
    }
  } else if (evaluationData.score !== undefined && evaluationData.score !== null) {
    calculatedScore = Math.min(100, Math.max(0, Math.round(Number(evaluationData.score))));
  }

  submission.status = status;
  submission.score = calculatedScore;
  submission.criteriaGrades = criteriaGrades;
  submission.feedback = feedback.trim();
  submission.evaluatedBy = evaluatorId;
  submission.evaluatedAt = new Date();

  await submission.save();

  // Send evidence to Skill Engine!
  // In skillScoringEngine.js: type: 'project' feeds into learner's 'projectScore' dimension!
  const updatedSkills = [];
  if (
    (status === 'Passed' || (calculatedScore !== null && calculatedScore >= 60)) &&
    project.requiredSkills?.length > 0
  ) {
    for (const skillId of project.requiredSkills) {
      try {
        const result = await recordSkillEvidence({
          userId: submission.user._id || submission.user,
          skillId,
          type: 'project', // Feeds into 'project' scoring dimension
          title: `Project: ${project.title}`,
          score: calculatedScore !== null ? calculatedScore : 88,
          maxScore: 100,
          weight: 1.5, // Capstone practical projects carry strong performance weight
          referenceId: project._id.toString(),
          courseId: project.course,
          trigger: 'project_evaluation_passed',
        });
        updatedSkills.push({
          skillId,
          overallScore: result.overallScore,
          proficiencyLevel: result.proficiencyLevel,
          projectScore: result.projectScore,
        });
      } catch (skillErr) {
        console.warn(
          `[Project Service] Skill evidence ingestion warning for skill ${skillId}:`,
          skillErr.message
        );
      }
    }
  }

  // Send notification to learner
  try {
    const studentId = submission.user._id || submission.user;
    const scoreText = calculatedScore !== null ? ` (Score: ${calculatedScore}%)` : '';
    const notifMessage =
      status === 'Needs Revision'
        ? `Your practical project "${project.title}" requires revisions. Please review instructor feedback.`
        : `Your practical project "${project.title}" evaluation complete: ${status}${scoreText}.`;

    const notification = new Notification({
      recipient: studentId,
      title: `Project Evaluated: ${status}`,
      message: notifMessage,
      type: 'project_evaluated',
      link: `/student/projects/${project._id}`,
    });
    await notification.save();

    if (io) {
      io.to(studentId.toString()).emit('new_notification', {
        title: notification.title,
        message: notification.message,
        type: notification.type,
      });
      io.to(studentId.toString()).emit('project_evaluated', {
        projectId: project._id,
        status,
        score: calculatedScore,
        feedback: submission.feedback,
        updatedSkills,
      });
    }
  } catch (notifyErr) {
    console.warn('[Project Service] Student notification dispatch warning:', notifyErr.message);
  }

  return {
    submission,
    updatedSkills,
  };
};

/**
 * Get submissions across projects for an instructor
 */
export const getInstructorProjectSubmissions = async (
  instructorId,
  userRole = 'instructor',
  query = {}
) => {
  const { status, projectId, courseId, page = 1, limit = 30 } = query;

  const projectFilter = {};
  if (userRole !== 'admin') {
    projectFilter.instructor = instructorId;
  }
  if (courseId && courseId !== 'all') {
    projectFilter.course = courseId;
  }

  const instructorProjects = await Project.find(projectFilter).select('_id title course').lean();
  const projectIds = instructorProjects.map((p) => p._id);

  const subFilter = { project: { $in: projectIds } };
  if (projectId && projectId !== 'all') {
    subFilter.project = projectId;
  }
  if (status && status !== 'all') {
    subFilter.status = status;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 30;
  const skip = (pageNum - 1) * limitNum;

  const [submissions, total, statusBreakdown] = await Promise.all([
    ProjectSubmission.find(subFilter)
      .populate('user', 'name email avatar')
      .populate({
        path: 'project',
        select: 'title difficulty estimatedDuration milestones evaluationCriteria course requiredSkills',
        populate: [
          { path: 'course', select: 'title' },
          { path: 'requiredSkills', select: 'name' },
        ],
      })
      .populate('evaluatedBy', 'name email')
      .sort({ submittedAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    ProjectSubmission.countDocuments(subFilter),
    ProjectSubmission.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const counts = {
    total: 0,
    'In Progress': 0,
    Submitted: 0,
    'Under Review': 0,
    'Needs Revision': 0,
    Passed: 0,
    Failed: 0,
  };

  statusBreakdown.forEach((item) => {
    if (counts[item._id] !== undefined) {
      counts[item._id] = item.count;
    }
    counts.total += item.count;
  });

  return {
    submissions,
    counts,
    projects: instructorProjects,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  };
};

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateMilestoneProgress,
  submitProject,
  evaluateProject,
  getInstructorProjectSubmissions,
};
