import mongoose from 'mongoose';
import TargetRole from '../models/TargetRole.js';
import LearnerTargetRole from '../models/LearnerTargetRole.js';
import Skill from '../models/Skill.js';
import CourseSkill from '../models/CourseSkill.js';
import LearnerSkillProgress from '../models/LearnerSkillProgress.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import QuizAttempt from '../models/QuizAttempt.js';
import CodingChallenge from '../models/CodingChallenge.js';
import CodingSubmission from '../models/CodingSubmission.js';
import Project from '../models/Project.js';
import ProjectSubmission from '../models/ProjectSubmission.js';
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Get all available target roles with optional filtering
 */
export const getAllTargetRoles = async (filterOptions = {}) => {
  const query = {};

  if (filterOptions.category && filterOptions.category !== 'all') {
    query.category = filterOptions.category;
  }

  if (filterOptions.search) {
    query.$or = [
      { name: { $regex: filterOptions.search, $options: 'i' } },
      { description: { $regex: filterOptions.search, $options: 'i' } },
      { category: { $regex: filterOptions.search, $options: 'i' } },
    ];
  }

  if (filterOptions.publishedOnly !== false) {
    query.isPublished = true;
  }

  const roles = await TargetRole.find(query)
    .populate({
      path: 'requiredSkills.skill',
      select: 'name slug category difficulty icon',
    })
    .sort({ name: 1 });

  return roles;
};

/**
 * Get a single target role by its ID or slug
 */
export const getTargetRoleByIdOrSlug = async (identifier) => {
  if (!identifier) {
    throw new ErrorResponse('Target role identifier is required', 400);
  }

  const idStr = String(identifier).trim();
  let role = null;

  if (mongoose.Types.ObjectId.isValid(idStr)) {
    role = await TargetRole.findById(idStr).populate({
      path: 'requiredSkills.skill',
      select: 'name slug category difficulty icon',
    });
  }

  if (!role) {
    role = await TargetRole.findOne({ slug: idStr }).populate({
      path: 'requiredSkills.skill',
      select: 'name slug category difficulty icon',
    });
  }

  if (!role) {
    throw new ErrorResponse('Target role not found', 404);
  }

  return role;
};

/**
 * Create a new target role (Admin / Instructor extensible)
 */
export const createTargetRole = async (roleData, creatorId = null) => {
  if (!roleData.name || !roleData.description) {
    throw new ErrorResponse('Role name and description are required', 400);
  }

  if (!roleData.requiredSkills || !Array.isArray(roleData.requiredSkills) || roleData.requiredSkills.length === 0) {
    throw new ErrorResponse('Target role must specify at least one required skill', 400);
  }

  // Check if role name already exists
  const existing = await TargetRole.findOne({
    name: { $regex: `^${roleData.name.trim()}$`, $options: 'i' },
  });
  if (existing) {
    throw new ErrorResponse(`Target role "${roleData.name}" already exists`, 409);
  }

  const role = await TargetRole.create({
    ...roleData,
    createdBy: creatorId,
  });

  return await TargetRole.findById(role._id).populate({
    path: 'requiredSkills.skill',
    select: 'name slug category difficulty icon',
  });
};

/**
 * Update an existing target role
 */
export const updateTargetRole = async (roleId, updateData) => {
  const role = await TargetRole.findById(roleId);
  if (!role) {
    throw new ErrorResponse('Target role not found', 404);
  }

  if (updateData.name && updateData.name.trim().toLowerCase() !== role.name.toLowerCase()) {
    const existing = await TargetRole.findOne({
      _id: { $ne: roleId },
      name: { $regex: `^${updateData.name.trim()}$`, $options: 'i' },
    });
    if (existing) {
      throw new ErrorResponse(`Target role "${updateData.name}" already exists`, 409);
    }
  }

  const updatedRole = await TargetRole.findByIdAndUpdate(
    roleId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate({
    path: 'requiredSkills.skill',
    select: 'name slug category difficulty icon',
  });

  return updatedRole;
};

/**
 * Delete a target role
 */
export const deleteTargetRole = async (roleId) => {
  const role = await TargetRole.findById(roleId);
  if (!role) {
    throw new ErrorResponse('Target role not found', 404);
  }

  await TargetRole.findByIdAndDelete(roleId);
  await LearnerTargetRole.deleteMany({ targetRole: roleId });

  return { message: `Target role "${role.name}" removed successfully` };
};

/**
 * Get a learner's active target role
 */
export const getLearnerActiveTargetRole = async (userId) => {
  if (!userId) {
    throw new ErrorResponse('User ID is required', 400);
  }

  let learnerRole = await LearnerTargetRole.findOne({ user: userId, isActive: true })
    .populate({
      path: 'targetRole',
      populate: {
        path: 'requiredSkills.skill',
        select: 'name slug category difficulty icon',
      },
    });

  return learnerRole;
};

/**
 * Set or update a learner's target role
 */
export const setLearnerTargetRole = async (userId, targetRoleData) => {
  if (!userId) {
    throw new ErrorResponse('User ID is required', 400);
  }

  const { targetRoleId, targetDate, targetPace, notes } = targetRoleData;
  if (!targetRoleId) {
    throw new ErrorResponse('targetRoleId is required', 400);
  }

  const targetRole = await TargetRole.findById(targetRoleId);
  if (!targetRole) {
    throw new ErrorResponse('Target role not found', 404);
  }

  // Deactivate any previously active roles for this learner
  await LearnerTargetRole.updateMany(
    { user: userId, isActive: true },
    { $set: { isActive: false } }
  );

  // Upsert the new target role selection
  const learnerTargetRole = await LearnerTargetRole.findOneAndUpdate(
    { user: userId, targetRole: targetRoleId },
    {
      $set: {
        isActive: true,
        targetDate: targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        targetPace: targetPace || 'standard',
        notes: notes || '',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate({
    path: 'targetRole',
    populate: {
      path: 'requiredSkills.skill',
      select: 'name slug category difficulty icon',
    },
  });

  return learnerTargetRole;
};

/**
 * NOVA SKILL GAP ANALYZER ENGINE
 * 
 * Compares demonstrated skills with target role requirements and produces
 * non-arbitrary targeted recommendations based on learner history.
 */
export const analyzeSkillGap = async (userId, specificRoleId = null) => {
  if (!userId) {
    throw new ErrorResponse('User ID is required for skill gap analysis', 400);
  }

  // 1. Resolve Target Role
  let targetRole = null;
  let learnerGoal = null;

  if (specificRoleId) {
    targetRole = await getTargetRoleByIdOrSlug(specificRoleId);
    learnerGoal = await LearnerTargetRole.findOne({ user: userId, targetRole: targetRole._id });
  } else {
    learnerGoal = await LearnerTargetRole.findOne({ user: userId, isActive: true }).populate({
      path: 'targetRole',
      populate: {
        path: 'requiredSkills.skill',
        select: 'name slug category difficulty icon',
      },
    });

    if (learnerGoal && learnerGoal.targetRole) {
      targetRole = learnerGoal.targetRole;
    } else {
      // Pick first published target role (e.g. Full Stack Developer) as default
      targetRole = await TargetRole.findOne({ isPublished: true })
        .populate({
          path: 'requiredSkills.skill',
          select: 'name slug category difficulty icon',
        })
        .sort({ createdAt: 1 });
    }
  }

  if (!targetRole) {
    throw new ErrorResponse('No target roles configured in the system', 404);
  }

  // 2. Fetch Learner Demonstrated Skills
  const userSkillRecords = await LearnerSkillProgress.find({ user: userId }).populate('skill');
  const userSkillMap = new Map();

  userSkillRecords.forEach((rec) => {
    if (rec.skill) {
      userSkillMap.set(rec.skill._id.toString(), rec);
      if (rec.skill.slug) userSkillMap.set(rec.skill.slug.toLowerCase(), rec);
      if (rec.skill.name) userSkillMap.set(rec.skill.name.toLowerCase().trim(), rec);
    }
  });

  // 3. Fetch Learner History for Contextual Non-Arbitrary Recommendations
  const [
    userEnrollments,
    userQuizAttempts,
    userCodingSubmissions,
    userAssignmentSubmissions,
    userProjectSubmissions,
  ] = await Promise.all([
    Enrollment.find({ student: userId }).populate('course'),
    QuizAttempt.find({ student: userId }).populate('quiz'),
    CodingSubmission.find({ user: userId }).populate('challenge'),
    AssignmentSubmission.find({ user: userId }).populate('assignment'),
    ProjectSubmission.find({ user: userId }).populate('project'),
  ]);

  // Index learner's history for rapid cross-referencing
  const completedCourseIds = new Set();
  const activeCourseMap = new Map(); // courseId -> completionPercentage
  userEnrollments.forEach((e) => {
    if (!e.course) return;
    const cid = e.course._id ? e.course._id.toString() : e.course.toString();
    if (e.completed || e.completionPercentage >= 100) {
      completedCourseIds.add(cid);
    } else {
      activeCourseMap.set(cid, e.completionPercentage || 0);
    }
  });

  const failedQuizIds = new Set();
  userQuizAttempts.forEach((qa) => {
    if (qa.quiz && qa.score !== undefined && qa.score < 60) {
      failedQuizIds.add(qa.quiz._id ? qa.quiz._id.toString() : qa.quiz.toString());
    }
  });

  const passedChallengeIds = new Set();
  const failedChallengeMap = new Map(); // challengeId -> latestScore
  userCodingSubmissions.forEach((sub) => {
    if (!sub.challenge) return;
    const chId = sub.challenge._id ? sub.challenge._id.toString() : sub.challenge.toString();
    if (sub.status === 'Accepted' || sub.score >= 80) {
      passedChallengeIds.add(chId);
      failedChallengeMap.delete(chId);
    } else if (!passedChallengeIds.has(chId)) {
      failedChallengeMap.set(chId, sub.score || 0);
    }
  });

  const completedProjectIds = new Set();
  userProjectSubmissions.forEach((ps) => {
    if (ps.project && (ps.status === 'evaluated' || ps.status === 'graded') && ps.score >= 70) {
      const pid = ps.project._id ? ps.project._id.toString() : ps.project.toString();
      completedProjectIds.add(pid);
    }
  });

  // 4. Compare Target Role Skills with Learner Demonstrated Skills
  const roleSkillMatrix = [];
  const strongSkills = [];
  const developingSkills = [];
  const skillGaps = [];

  let totalWeightedTarget = 0;
  let totalWeightedEarned = 0;

  for (const req of targetRole.requiredSkills) {
    if (!req.skill) continue;

    const skillIdStr = req.skill._id.toString();
    const skillName = req.skill.name;
    const skillSlug = req.skill.slug;
    const requiredScore = req.requiredScore || 70;
    const importance = req.importance || 'Important';
    const importanceWeight = importance === 'Critical' ? 1.5 : importance === 'Optional' ? 0.6 : 1.0;

    // Retrieve learner's demonstrated skill progress
    const progress =
      userSkillMap.get(skillIdStr) ||
      userSkillMap.get(skillSlug?.toLowerCase()) ||
      userSkillMap.get(skillName?.toLowerCase().trim());

    const currentScore = progress ? Math.round(progress.overallScore || 0) : 0;
    const knowledgeScore = progress ? Math.round(progress.knowledgeScore || 0) : 0;
    const practicalScore = progress ? Math.round(progress.practicalScore || 0) : 0;
    const projectScore = progress ? Math.round(progress.projectScore || 0) : 0;
    const assessmentScore = progress ? Math.round(progress.assessmentScore || 0) : 0;
    const confidenceLevel = progress ? progress.confidenceLevel : 'Low';
    const evidenceCount = progress ? progress.evidenceCount || 0 : 0;
    const proficiencyLevel = progress ? progress.proficiencyLevel : 'Unassessed';

    const gapSize = Math.max(0, requiredScore - currentScore);
    const matchPercentage = Math.min(100, Math.round((currentScore / requiredScore) * 100));

    // Weighted calculations for role readiness score
    totalWeightedTarget += requiredScore * importanceWeight;
    totalWeightedEarned += Math.min(currentScore, requiredScore) * importanceWeight;

    // Classification
    let status = 'gap';
    if (currentScore >= requiredScore) {
      status = 'strong';
    } else if (gapSize <= 20 && currentScore >= requiredScore * 0.65 && evidenceCount > 0) {
      status = 'developing';
    } else {
      status = 'gap';
    }

    const matrixItem = {
      skillId: req.skill._id,
      skillName,
      slug: skillSlug,
      category: req.skill.category || 'General',
      icon: req.skill.icon || 'code',
      difficulty: req.skill.difficulty || 'Intermediate',
      importance,
      requiredScore,
      currentScore,
      gapSize,
      matchPercentage,
      status,
      proficiencyLevel,
      confidenceLevel,
      evidenceCount,
      scoresByDimension: {
        knowledge: knowledgeScore,
        practical: practicalScore,
        project: projectScore,
        assessment: assessmentScore,
      },
    };

    roleSkillMatrix.push(matrixItem);

    if (status === 'strong') {
      strongSkills.push(matrixItem);
    } else if (status === 'developing') {
      developingSkills.push(matrixItem);
    } else {
      skillGaps.push(matrixItem);
    }
  }

  // Calculate Overall Role Readiness Percentage
  const roleReadinessScore =
    totalWeightedTarget > 0 ? Math.round((totalWeightedEarned / totalWeightedTarget) * 100) : 0;

  // 5. Generate Non-Arbitrary Targeted Recommendations for Gaps and Developing Skills
  // Sort priority: Critical gaps first, then largest gap sizes
  const priorityItems = [...skillGaps, ...developingSkills].sort((a, b) => {
    const impOrder = { Critical: 3, Important: 2, Optional: 1 };
    const impDiff = (impOrder[b.importance] || 2) - (impOrder[a.importance] || 2);
    if (impDiff !== 0) return impDiff;
    return b.gapSize - a.gapSize;
  });

  const recommendedActions = [];

  for (const item of priorityItems) {
    const { skillId, skillName, currentScore, requiredScore, gapSize, scoresByDimension } = item;

    // Diagnosis based on learner history & dimensional scores
    let diagnosis = '';
    if (item.evidenceCount === 0) {
      diagnosis = `No verified assessments or practical projects recorded for ${skillName}. Initial calibration needed.`;
    } else if (scoresByDimension.practical < 50) {
      diagnosis = `Demonstrated practical coding performance is low (${scoresByDimension.practical}%). Hands-on coding challenge recommended.`;
    } else if (scoresByDimension.project < 50) {
      diagnosis = `Lacks end-to-end project architecture evidence (${scoresByDimension.project}%). Production-grade project recommended.`;
    } else if (scoresByDimension.knowledge < 60) {
      diagnosis = `Knowledge evaluation and concept comprehension score is ${scoresByDimension.knowledge}%. Core course study recommended.`;
    } else {
      diagnosis = `Demonstrated proficiency is at ${currentScore}%, which is ${gapSize} points below the required benchmark (${requiredScore}%).`;
    }

    // A. Query Recommended Course / Learning Resources
    let recommendedLearningResources = [];
    const courseSkillMappings = await CourseSkill.find({ skill: skillId }).populate({
      path: 'course',
      select: 'title slug description thumbnail category level totalDuration totalLessons isPublished',
    });

    for (const mapping of courseSkillMappings) {
      if (mapping.course && mapping.course.isPublished !== false) {
        const c = mapping.course;
        const cid = c._id.toString();
        const isCompleted = completedCourseIds.has(cid);
        const activeProgress = activeCourseMap.get(cid);

        let actionLabel = 'Enroll Now';
        if (isCompleted) {
          actionLabel = 'Review Modules';
        } else if (activeProgress !== undefined) {
          actionLabel = `Continue Course (${activeProgress}%)`;
        }

        recommendedLearningResources.push({
          id: c._id,
          title: c.title,
          slug: c.slug,
          description: c.description ? c.description.slice(0, 140) + '...' : '',
          thumbnail: c.thumbnail,
          category: c.category,
          level: c.level,
          totalDuration: c.totalDuration,
          totalLessons: c.totalLessons,
          status: isCompleted ? 'completed' : activeProgress !== undefined ? 'in_progress' : 'available',
          actionLabel,
        });

        if (recommendedLearningResources.length >= 2) break;
      }
    }

    // Fallback search if no direct CourseSkill found
    if (recommendedLearningResources.length === 0) {
      const fallbackCourses = await Course.find({
        $or: [
          { title: { $regex: skillName, $options: 'i' } },
          { description: { $regex: skillName, $options: 'i' } },
          { category: { $regex: item.category, $options: 'i' } },
        ],
        isPublished: true,
      })
        .select('title slug description thumbnail category level totalDuration totalLessons')
        .limit(2);

      recommendedLearningResources = fallbackCourses.map((c) => ({
        id: c._id,
        title: c.title,
        slug: c.slug,
        description: c.description ? c.description.slice(0, 140) + '...' : '',
        thumbnail: c.thumbnail,
        category: c.category,
        level: c.level,
        totalDuration: c.totalDuration,
        totalLessons: c.totalLessons,
        status: activeCourseMap.has(c._id.toString()) ? 'in_progress' : 'available',
        actionLabel: activeCourseMap.has(c._id.toString()) ? 'Resume Course' : 'Enroll Now',
      }));
    }

    // B. Query Recommended Practical Coding Challenge
    let recommendedPracticalChallenge = null;
    const candidateChallenges = await CodingChallenge.find({
      skills: skillId,
      isPublished: true,
    }).select('title slug difficulty category points timeLimit description');

    if (candidateChallenges.length > 0) {
      // Prioritize: 1. Previously failed attempt, 2. Uncompleted challenge matching difficulty
      let chosenChallenge = null;
      let challengeNote = '';

      for (const ch of candidateChallenges) {
        const chId = ch._id.toString();
        if (failedChallengeMap.has(chId)) {
          chosenChallenge = ch;
          challengeNote = `Retry: Previous submission achieved ${failedChallengeMap.get(chId)}%`;
          break;
        }
      }

      if (!chosenChallenge) {
        for (const ch of candidateChallenges) {
          const chId = ch._id.toString();
          if (!passedChallengeIds.has(chId)) {
            chosenChallenge = ch;
            challengeNote = 'Recommended to establish hands-on algorithmic evidence';
            break;
          }
        }
      }

      if (!chosenChallenge) {
        chosenChallenge = candidateChallenges[0];
        challengeNote = 'Completed benchmark challenge - consider reviewing advanced solutions';
      }

      recommendedPracticalChallenge = {
        id: chosenChallenge._id,
        title: chosenChallenge.title,
        slug: chosenChallenge.slug,
        difficulty: chosenChallenge.difficulty,
        category: chosenChallenge.category,
        timeLimit: chosenChallenge.timeLimit,
        note: challengeNote,
      };
    } else {
      // General fallback challenge
      const fallbackCh = await CodingChallenge.findOne({ isPublished: true }).select(
        'title slug difficulty category timeLimit'
      );
      if (fallbackCh) {
        recommendedPracticalChallenge = {
          id: fallbackCh._id,
          title: fallbackCh.title,
          slug: fallbackCh.slug,
          difficulty: fallbackCh.difficulty,
          category: fallbackCh.category,
          timeLimit: fallbackCh.timeLimit,
          note: `General algorithmic challenge to boost overall practical coding score`,
        };
      }
    }

    // C. Query Recommended Capstone Project
    let recommendedProject = null;
    const candidateProjects = await Project.find({
      requiredSkills: skillId,
      isPublished: true,
    }).select('title slug difficulty estimatedDuration objectives requirements');

    if (candidateProjects.length > 0) {
      // Pick one not yet completed
      let chosenProj = candidateProjects.find(
        (p) => !completedProjectIds.has(p._id.toString())
      );
      if (!chosenProj) chosenProj = candidateProjects[0];

      recommendedProject = {
        id: chosenProj._id,
        title: chosenProj.title,
        slug: chosenProj.slug,
        difficulty: chosenProj.difficulty,
        estimatedDuration: chosenProj.estimatedDuration,
        primaryObjective: chosenProj.objectives?.[0] || 'Build end-to-end production architecture',
      };
    } else {
      // Fallback project
      const fallbackProj = await Project.findOne({ isPublished: true }).select(
        'title slug difficulty estimatedDuration objectives'
      );
      if (fallbackProj) {
        recommendedProject = {
          id: fallbackProj._id,
          title: fallbackProj.title,
          slug: fallbackProj.slug,
          difficulty: fallbackProj.difficulty,
          estimatedDuration: fallbackProj.estimatedDuration,
          primaryObjective: fallbackProj.objectives?.[0] || 'Capstone software system implementation',
        };
      }
    }

    recommendedActions.push({
      skillId,
      skillName,
      importance: item.importance,
      currentScore,
      requiredScore,
      gapSize,
      matchPercentage: item.matchPercentage,
      status: item.status,
      diagnosis,
      recommendedLearningResources,
      recommendedPracticalChallenge,
      recommendedProject,
    });
  }

  return {
    targetRole: {
      id: targetRole._id,
      name: targetRole.name,
      slug: targetRole.slug,
      description: targetRole.description,
      category: targetRole.category,
      icon: targetRole.icon,
      color: targetRole.color,
      careerOutlook: targetRole.careerOutlook,
      skillLevels: targetRole.skillLevels,
      requiredSkillsCount: targetRole.requiredSkills.length,
    },
    learnerTargetRole: learnerGoal
      ? {
          id: learnerGoal._id,
          targetDate: learnerGoal.targetDate,
          targetPace: learnerGoal.targetPace,
          notes: learnerGoal.notes,
          isActive: learnerGoal.isActive,
          daysRemaining: Math.max(
            0,
            Math.ceil((new Date(learnerGoal.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
          ),
        }
      : null,
    summary: {
      roleReadinessScore,
      totalSkillsRequired: targetRole.requiredSkills.length,
      strongCount: strongSkills.length,
      developingCount: developingSkills.length,
      gapCount: skillGaps.length,
      readinessTier:
        roleReadinessScore >= 85
          ? 'Job Ready'
          : roleReadinessScore >= 65
          ? 'Near Job Ready'
          : roleReadinessScore >= 40
          ? 'Developing Competence'
          : 'Early Preparation',
    },
    roleSkillMatrix,
    strongSkills,
    developingSkills,
    skillGaps,
    recommendedActions,
  };
};
