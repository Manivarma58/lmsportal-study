import {
  getJobSimulations,
  getJobSimulationDetails,
  startOrResumeJobSimulation,
  saveTaskProgress,
  submitJobSimulation,
  seedJobSimulations,
} from '../services/jobSimulationService.js';
import JobSimulationSubmission from '../models/JobSimulationSubmission.js';
import ErrorResponse from '../utils/errorResponse.js';

export const listJobSimulations = async (req, res, next) => {
  try {
    const { type, difficulty, role, search } = req.query;
    const userId = req.user ? req.user._id : null;

    const simulations = await getJobSimulations({
      type,
      difficulty,
      role,
      search,
      userId,
    });

    res.status(200).json({
      success: true,
      count: simulations.length,
      simulations,
    });
  } catch (err) {
    next(err);
  }
};

export const getSimulation = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const userId = req.user ? req.user._id : null;

    const data = await getJobSimulationDetails(idOrSlug, userId);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
};

export const startSimulation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const submission = await startOrResumeJobSimulation(id, userId);

    res.status(200).json({
      success: true,
      message: 'Job simulation started / resumed.',
      submission,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id, taskId } = req.params;
    const { content, notes, status, currentTaskIndex } = req.body;
    const userId = req.user._id;

    const submission = await saveTaskProgress(
      id,
      taskId,
      { content, notes, status, currentTaskIndex },
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Task progress saved.',
      submission,
    });
  } catch (err) {
    next(err);
  }
};

export const submitSimulationHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { executiveSummary, repositoryUrl, deploymentUrl } = req.body;
    const userId = req.user._id;

    const result = await submitJobSimulation(
      id,
      { executiveSummary, repositoryUrl, deploymentUrl },
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Job simulation evaluated successfully and skill scores updated!',
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getLearnerSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const submission = await JobSimulationSubmission.findOne({
      simulation: id,
      user: userId,
    }).populate('simulation');

    if (!submission) {
      return res.status(200).json({
        success: true,
        submission: null,
      });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (err) {
    next(err);
  }
};

export const seedSimulationsHandler = async (req, res, next) => {
  try {
    const adminId = req.user ? req.user._id : null;
    const result = await seedJobSimulations(adminId);

    res.status(200).json({
      success: true,
      message: 'Job simulations seeded successfully.',
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
