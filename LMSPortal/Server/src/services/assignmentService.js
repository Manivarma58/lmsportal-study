import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import { recordSkillEvidence } from './skillService.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Get assignments with filtering, search, and student submission status
 */
export const getAssignments = async (query = {}, userId = null, userRole = 'student') => {
  const {
    courseId,
    difficulty,
    status,
    search,
    page = 1,
    limit = 20,
    instructorId,
  } = query;

  const filter = { isPublished: true };

  // If instructor or admin is querying their own managed assignments
  if (instructorId) {
    filter.instructor = instructorId;
  }
  if (courseId && courseId !== 'all') {
    filter.course = courseId;
  }
  if (difficulty && difficulty !== 'all') {
    filter.difficulty = difficulty;
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

  const [assignments, total] = await Promise.all([
    Assignment.find(filter)
      .populate('course', 'title thumbnail slug category')
      .populate('instructor', 'name email avatar')
      .populate('skills', 'name slug category difficulty')
      .sort({ deadline: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Assignment.countDocuments(filter),
  ]);

  const assignmentIds = assignments.map((a) => a._id);

  // If user is a student, attach their latest submission details
  let studentSubmissionsMap = {};
  if (userId && userRole === 'student') {
    const submissions = await AssignmentSubmission.find({
      assignment: { $in: assignmentIds },
      user: userId,
    })
      .sort({ submittedAt: -1 })
      .lean();

    submissions.forEach((sub) => {
      const aId = sub.assignment.toString();
      if (!studentSubmissionsMap[aId]) {
        studentSubmissionsMap[aId] = sub;
      }
    });
  }

  // If instructor or admin, attach submission metrics
  let submissionMetricsMap = {};
  if (userRole === 'instructor' || userRole === 'admin') {
    const stats = await AssignmentSubmission.aggregate([
      { $match: { assignment: { $in: assignmentIds } } },
      {
        $group: {
          _id: '$assignment',
          totalSubmissions: { $sum: 1 },
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
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] },
          },
          avgScore: { $avg: '$score' },
        },
      },
    ]);

    stats.forEach((st) => {
      submissionMetricsMap[st._id.toString()] = st;
    });
  }

  const enrichedAssignments = assignments.map((assignment) => {
    const aId = assignment._id.toString();
    const submission = studentSubmissionsMap[aId] || null;
    const metrics = submissionMetricsMap[aId] || {
      totalSubmissions: 0,
      submittedCount: 0,
      underReviewCount: 0,
      needsRevisionCount: 0,
      passedCount: 0,
      failedCount: 0,
      avgScore: null,
    };

    let userStatus = 'Not Started';
    if (submission) {
      userStatus = submission.status;
    }

    return {
      ...assignment,
      userSubmission: submission,
      userStatus,
      metrics,
    };
  });

  // Filter by user submission status if requested
  let finalResults = enrichedAssignments;
  if (status && status !== 'all') {
    if (status === 'Pending' || status === 'pending') {
      finalResults = finalResults.filter((a) => a.userStatus === 'Not Started');
    } else {
      finalResults = finalResults.filter(
        (a) => a.userStatus.toLowerCase() === status.toLowerCase()
      );
    }
  }

  return {
    assignments: finalResults,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  };
};

/**
 * Get assignment details by ID or Slug
 */
export const getAssignmentById = async (idOrSlug, userId = null, userRole = 'student') => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const assignment = await Assignment.findOne(query)
    .populate('course', 'title thumbnail slug category price')
    .populate('instructor', 'name email avatar')
    .populate('skills', 'name slug category difficulty')
    .lean();

  if (!assignment) {
    throw new ErrorResponse('Practical assignment not found.', 404);
  }

  let userSubmission = null;
  let allUserSubmissions = [];

  if (userId) {
    allUserSubmissions = await AssignmentSubmission.find({
      assignment: assignment._id,
      user: userId,
    })
      .sort({ submittedAt: -1 })
      .lean();

    userSubmission = allUserSubmissions[0] || null;
  }

  // If instructor or admin, fetch submission statistics
  let stats = null;
  if (userRole === 'instructor' || userRole === 'admin') {
    const aggregateStats = await AssignmentSubmission.aggregate([
      { $match: { assignment: assignment._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          submitted: { $sum: { $cond: [{ $eq: ['$status', 'Submitted'] }, 1, 0] } },
          underReview: { $sum: { $cond: [{ $eq: ['$status', 'Under Review'] }, 1, 0] } },
          needsRevision: { $sum: { $cond: [{ $eq: ['$status', 'Needs Revision'] }, 1, 0] } },
          passed: { $sum: { $cond: [{ $eq: ['$status', 'Passed'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] } },
          avgScore: { $avg: '$score' },
        },
      },
    ]);
    stats = aggregateStats[0] || {
      total: 0,
      submitted: 0,
      underReview: 0,
      needsRevision: 0,
      passed: 0,
      failed: 0,
      avgScore: null,
    };
  }

  return {
    assignment,
    userSubmission,
    submissionHistory: allUserSubmissions,
    stats,
  };
};

/**
 * Create a new practical assignment
 */
export const createAssignment = async (data, instructorId) => {
  const {
    title,
    description,
    instructions,
    difficulty = 'Medium',
    estimatedTime = '3 hours',
    skills = [],
    courseId,
    course,
    deadline,
    evaluationCriteria,
    maxScore = 100,
    isPublished = true,
  } = data;

  const targetCourseId = courseId || course;
  if (!targetCourseId) {
    throw new ErrorResponse('Please associate this assignment with a course.', 400);
  }

  const courseDoc = await Course.findById(targetCourseId);
  if (!courseDoc) {
    throw new ErrorResponse('Associated course does not exist.', 404);
  }

  // Format evaluation criteria with defaults if not provided
  let formattedCriteria = evaluationCriteria;
  if (!formattedCriteria || !Array.isArray(formattedCriteria) || formattedCriteria.length === 0) {
    formattedCriteria = [
      { name: 'Functionality', description: 'Core requirements and edge case handling', maxPoints: 30, weight: 1.0 },
      { name: 'Code Quality', description: 'Clean architecture, readability, and design patterns', maxPoints: 20, weight: 1.0 },
      { name: 'API Design', description: 'RESTful conventions, status codes, and input validation', maxPoints: 20, weight: 1.0 },
      { name: 'Database', description: 'Schema normalization, indices, and query efficiency', maxPoints: 15, weight: 1.0 },
      { name: 'Testing', description: 'Automated test suite coverage and mock strategies', maxPoints: 15, weight: 1.0 },
    ];
  }

  const assignment = new Assignment({
    title,
    description,
    instructions,
    difficulty,
    estimatedTime,
    skills,
    course: targetCourseId,
    instructor: instructorId,
    deadline: deadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days
    evaluationCriteria: formattedCriteria,
    maxScore: Number(maxScore) || 100,
    isPublished: isPublished !== false,
  });

  await assignment.save();

  return Assignment.findById(assignment._id)
    .populate('course', 'title slug')
    .populate('instructor', 'name email avatar')
    .populate('skills', 'name slug category');
};

/**
 * Update an existing assignment
 */
export const updateAssignment = async (id, updateData, userId, userRole = 'instructor') => {
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    throw new ErrorResponse('Practical assignment not found.', 404);
  }

  // Only the creator or admin can update
  if (assignment.instructor.toString() !== userId.toString() && userRole !== 'admin') {
    throw new ErrorResponse('You are not authorized to update this assignment.', 403);
  }

  const allowedFields = [
    'title',
    'description',
    'instructions',
    'difficulty',
    'estimatedTime',
    'skills',
    'deadline',
    'evaluationCriteria',
    'maxScore',
    'isPublished',
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      assignment[field] = updateData[field];
    }
  });

  await assignment.save();

  return Assignment.findById(assignment._id)
    .populate('course', 'title slug')
    .populate('instructor', 'name email avatar')
    .populate('skills', 'name slug category');
};

/**
 * Delete an assignment
 */
export const deleteAssignment = async (id, userId, userRole = 'instructor') => {
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    throw new ErrorResponse('Practical assignment not found.', 404);
  }

  if (assignment.instructor.toString() !== userId.toString() && userRole !== 'admin') {
    throw new ErrorResponse('You are not authorized to delete this assignment.', 403);
  }

  // Delete all submissions associated with this assignment
  await AssignmentSubmission.deleteMany({ assignment: assignment._id });
  await Assignment.findByIdAndDelete(assignment._id);

  return { message: 'Practical assignment and all associated submissions deleted successfully.' };
};

/**
 * Submit practical assignment
 * IMPORTANT: Sets status to 'Submitted'. Does NOT automatically mark completed!
 */
export const submitAssignment = async (assignmentId, userId, submissionPayload, io = null) => {
  const {
    submissionType = 'combined',
    content = '',
    repositoryUrl = '',
    deploymentUrl = '',
    attachments = [],
  } = submissionPayload;

  const assignment = await Assignment.findById(assignmentId)
    .populate('instructor', 'name email')
    .populate('course', 'title');

  if (!assignment) {
    throw new ErrorResponse('Target assignment not found.', 404);
  }

  if (!assignment.isPublished) {
    throw new ErrorResponse('This assignment is not currently open for submission.', 400);
  }

  // Validate at least one deliverable is provided
  if (!repositoryUrl.trim() && !deploymentUrl.trim() && !content.trim() && attachments.length === 0) {
    throw new ErrorResponse(
      'Please provide a repository URL, deployment URL, architecture explanation, or file attachment.',
      400
    );
  }

  // Check if an existing submission exists for this student
  let submission = await AssignmentSubmission.findOne({
    assignment: assignment._id,
    user: userId,
  });

  if (submission) {
    // Update existing submission with new work & reset status to 'Submitted'
    submission.submissionType = submissionType;
    submission.content = content.trim();
    submission.repositoryUrl = repositoryUrl.trim();
    submission.deploymentUrl = deploymentUrl.trim();
    submission.attachments = attachments;
    submission.status = 'Submitted'; // Reset to Submitted for faculty review
    submission.submittedAt = new Date();
    // Clear previous evaluation state on re-submission
    submission.score = null;
    submission.criteriaGrades = [];
    submission.feedback = '';
    submission.evaluatedBy = null;
    submission.evaluatedAt = null;

    await submission.save();
  } else {
    // Create new submission
    submission = new AssignmentSubmission({
      assignment: assignment._id,
      user: userId,
      submissionType,
      content: content.trim(),
      repositoryUrl: repositoryUrl.trim(),
      deploymentUrl: deploymentUrl.trim(),
      attachments,
      status: 'Submitted', // Required: Not automatically marked completed
      submittedAt: new Date(),
    });

    await submission.save();
  }

  // Notify instructor about new practical submission
  try {
    const instructorId = assignment.instructor._id || assignment.instructor;
    const notification = new Notification({
      recipient: instructorId,
      title: 'Practical Assignment Submitted',
      message: `A learner has submitted "${assignment.title}" for review.`,
      type: 'assignment_submitted',
      link: `/instructor/assignments`,
      data: {
        assignmentId: assignment._id,
        submissionId: submission._id,
        studentId: userId,
      },
    });
    await notification.save();

    if (io) {
      io.to(assignment.instructor._id.toString()).emit('new_notification', {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
      });
    }
  } catch (notifyErr) {
    console.warn('[Assignment Service] Instructor notification dispatch warning:', notifyErr.message);
  }

  return submission;
};

/**
 * Evaluate assignment submission by instructor/admin
 * Computes rubric-weighted score, updates status, and updates learner skill evidence.
 */
export const evaluateSubmission = async (
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
      `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`,
      400
    );
  }

  const submission = await AssignmentSubmission.findById(submissionId)
    .populate('assignment')
    .populate('user', 'name email');

  if (!submission) {
    throw new ErrorResponse('Assignment submission not found.', 404);
  }

  const assignment = submission.assignment;
  if (!assignment) {
    throw new ErrorResponse('Associated assignment reference missing.', 404);
  }

  // Authorization: Instructor of the course or Admin
  if (assignment.instructor.toString() !== evaluatorId.toString() && userRole !== 'admin') {
    throw new ErrorResponse('You are not authorized to evaluate this submission.', 403);
  }

  // Calculate weighted score from rubric criteria
  let calculatedScore = null;
  if (Array.isArray(criteriaGrades) && criteriaGrades.length > 0) {
    const rubricMap = new Map();
    (assignment.evaluationCriteria || []).forEach((c) => {
      rubricMap.set(c.name.toLowerCase().trim(), c.weight || 1.0);
    });

    let totalWeightedEarned = 0;
    let totalWeightedMax = 0;

    criteriaGrades.forEach((cg) => {
      const weight = rubricMap.get((cg.criterionName || '').toLowerCase().trim()) || 1.0;
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

  // Update submission details
  submission.status = status;
  submission.score = calculatedScore;
  submission.criteriaGrades = criteriaGrades;
  submission.feedback = feedback.trim();
  submission.evaluatedBy = evaluatorId;
  submission.evaluatedAt = new Date();

  await submission.save();

  // If status is 'Passed' or score is passing (>= 60), update learner skill evidence and recalculate skills!
  const updatedSkills = [];
  if ((status === 'Passed' || (calculatedScore !== null && calculatedScore >= 60)) && assignment.skills?.length > 0) {
    for (const skillId of assignment.skills) {
      try {
        const result = await recordSkillEvidence({
          userId: submission.user._id || submission.user,
          skillId,
          type: 'assignment',
          title: `Assignment: ${assignment.title}`,
          score: calculatedScore !== null ? calculatedScore : 85,
          maxScore: 100,
          weight: 1.25, // Practical assignments carry strong evaluation weight
          referenceId: assignment._id.toString(),
          courseId: assignment.course,
          trigger: 'practical_assignment_evaluated',
        });
        updatedSkills.push({
          skillId,
          overallScore: result.overallScore,
          proficiencyLevel: result.proficiencyLevel,
        });
      } catch (skillErr) {
        console.warn(
          `[Assignment Service] Skill evidence ingestion warning for skill ${skillId}:`,
          skillErr.message
        );
      }
    }
  }

  // Dispatch real-time notification to the learner with their score & status
  try {
    const studentId = submission.user._id || submission.user;
    const scoreText = calculatedScore !== null ? ` (Score: ${calculatedScore}%)` : '';
    const notifMessage =
      status === 'Needs Revision'
        ? `Your practical assignment "${assignment.title}" requires revisions. Please review instructor feedback.`
        : `Your practical assignment "${assignment.title}" has been evaluated: ${status}${scoreText}.`;

    const notification = new Notification({
      recipient: studentId,
      title: `Assignment Evaluated: ${status}`,
      message: notifMessage,
      type: 'assignment_evaluated',
      link: `/student/assignments`,
      data: {
        assignmentId: assignment._id,
        submissionId: submission._id,
        status,
        score: calculatedScore,
      },
    });
    await notification.save();

    if (io) {
      io.to(studentId.toString()).emit('new_notification', {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
      });
      io.to(studentId.toString()).emit('assignment_evaluated', {
        assignmentId: assignment._id,
        status,
        score: calculatedScore,
        feedback: submission.feedback,
        updatedSkills,
      });
    }
  } catch (notifyErr) {
    console.warn('[Assignment Service] Student notification dispatch warning:', notifyErr.message);
  }

  return {
    submission,
    updatedSkills,
  };
};

/**
 * Get all submissions for an instructor across all their assignments
 */
export const getInstructorSubmissions = async (instructorId, userRole = 'instructor', query = {}) => {
  const { status, assignmentId, courseId, page = 1, limit = 30 } = query;

  // Find assignments belonging to this instructor
  const assignmentFilter = {};
  if (userRole !== 'admin') {
    assignmentFilter.instructor = instructorId;
  }
  if (courseId && courseId !== 'all') {
    assignmentFilter.course = courseId;
  }

  const instructorAssignments = await Assignment.find(assignmentFilter).select('_id title course').lean();
  const assignmentIds = instructorAssignments.map((a) => a._id);

  const submissionFilter = { assignment: { $in: assignmentIds } };
  if (assignmentId && assignmentId !== 'all') {
    submissionFilter.assignment = assignmentId;
  }
  if (status && status !== 'all') {
    submissionFilter.status = status;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 30;
  const skip = (pageNum - 1) * limitNum;

  const [submissions, total, statusBreakdown] = await Promise.all([
    AssignmentSubmission.find(submissionFilter)
      .populate('user', 'name email avatar')
      .populate({
        path: 'assignment',
        select: 'title difficulty estimatedTime deadline evaluationCriteria course skills',
        populate: [
          { path: 'course', select: 'title' },
          { path: 'skills', select: 'name' },
        ],
      })
      .populate('evaluatedBy', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    AssignmentSubmission.countDocuments(submissionFilter),
    AssignmentSubmission.aggregate([
      { $match: { assignment: { $in: assignmentIds } } },
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
    assignments: instructorAssignments,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  };
};

/**
 * Get submissions for a specific assignment
 */
export const getAssignmentSubmissions = async (assignmentId, instructorId, userRole = 'instructor') => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new ErrorResponse('Assignment not found.', 404);
  }

  if (assignment.instructor.toString() !== instructorId.toString() && userRole !== 'admin') {
    throw new ErrorResponse('Unauthorized to view submissions for this assignment.', 403);
  }

  const submissions = await AssignmentSubmission.find({ assignment: assignment._id })
    .populate('user', 'name email avatar')
    .populate('evaluatedBy', 'name email')
    .sort({ submittedAt: -1 })
    .lean();

  return submissions;
};
