import {
  getOrCreateActiveIntervention,
  getLearnerInterventions,
  detectLearnerWeaknesses,
  recordActivityProgress,
} from '../services/adaptiveLearningService.js';
import AdaptiveIntervention from '../models/AdaptiveIntervention.js';
import ErrorResponse from '../utils/errorResponse.js';

export const getActiveInterventionHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { skillId } = req.query;

    const intervention = await getOrCreateActiveIntervention(userId, skillId || null);

    res.status(200).json({
      success: true,
      intervention,
    });
  } catch (err) {
    next(err);
  }
};

export const getInterventionsListHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const data = await getLearnerInterventions(userId);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
};

export const scanWeaknessesHandler = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const weaknesses = await detectLearnerWeaknesses(userId);

    res.status(200).json({
      success: true,
      count: weaknesses.length,
      weaknesses,
    });
  } catch (err) {
    next(err);
  }
};

export const advanceStageHandler = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const intervention = await AdaptiveIntervention.findOne({
      _id: id,
      user: userId,
    });

    if (!intervention) {
      throw new ErrorResponse('Intervention record not found.', 404);
    }

    const currentIdx = intervention.currentStageIndex;
    const stage = intervention.stages[currentIdx];

    if (!stage) {
      throw new ErrorResponse('No active stage found to advance.', 400);
    }

    // Security Verification: Verify authentic student completion in database
    let earnedScore = 0;
    let isPassed = false;
    const isInstructorOrAdmin = req.user && ['instructor', 'admin'].includes(req.user.role);

    if (isInstructorOrAdmin && req.body.forcePass) {
      earnedScore = Number(req.body.score) || 85;
      isPassed = true;
    } else {
      // Dynamic verification by activity type
      if (stage.activityType === 'coding_challenge') {
        const CodingSubmission = (await import('../models/CodingSubmission.js')).default;
        const sub = await CodingSubmission.findOne({
          user: userId,
          challenge: stage.activityId,
        }).sort({ score: -1, submittedAt: -1 });

        if (sub && (sub.status === 'Accepted' || sub.score >= (stage.targetScore || 70))) {
          earnedScore = sub.score;
          isPassed = true;
        }
      } else if (stage.activityType === 'quiz') {
        const QuizAttempt = (await import('../models/QuizAttempt.js')).default;
        const attempt = await QuizAttempt.findOne({
          student: userId,
          quiz: stage.activityId,
        }).sort({ percentage: -1, attemptedAt: -1 });

        if (attempt && (attempt.passed || attempt.percentage >= (stage.targetScore || 70))) {
          earnedScore = attempt.percentage;
          isPassed = true;
        }
      } else if (stage.activityType === 'assignment') {
        const AssignmentSubmission = (await import('../models/AssignmentSubmission.js')).default;
        const asub = await AssignmentSubmission.findOne({
          user: userId,
          assignment: stage.activityId,
          status: 'Passed',
        });
        if (asub) {
          earnedScore = asub.score || 85;
          isPassed = true;
        }
      } else {
        // Fallback if not an evaluation-backed model
        earnedScore = Number(req.body.score) || 80;
        isPassed = true;
      }

      if (!isPassed) {
        throw new ErrorResponse(
          `You have not completed the required activity "${stage.activityTitle}". Please complete and pass the task to advance.`,
          400
        );
      }
    }

    const updated = await recordActivityProgress(userId, {
      activityType: stage?.activityType || 'coding_challenge',
      activityId: stage?.activityId,
      score: earnedScore,
      passed: isPassed,
      skillId: intervention.skill,
    });

    res.status(200).json({
      success: true,
      message: 'Intervention progress updated.',
      intervention: updated,
    });
  } catch (err) {
    next(err);
  }
};
