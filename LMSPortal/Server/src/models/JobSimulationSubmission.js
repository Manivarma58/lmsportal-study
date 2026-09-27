import mongoose from 'mongoose';

const taskSubmissionItemSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true },
    taskNumber: { type: Number, required: true },
    deliverableType: {
      type: String,
      enum: ['code', 'sql', 'dataset', 'text', 'file', 'report', 'json'],
      default: 'code',
    },
    content: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
    },
    completedAt: { type: Date },
    taskScore: { type: Number, default: 0 },
    taskFeedback: { type: String, default: '' },
  },
  { _id: true }
);

const criterionScoreSchema = new mongoose.Schema(
  {
    criterion: { type: String, required: true },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1 },
    weight: { type: Number, default: 1 },
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

const jobSimulationSubmissionSchema = new mongoose.Schema(
  {
    simulation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobSimulation',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['In Progress', 'Submitted', 'Evaluating', 'Evaluated'],
      default: 'In Progress',
    },
    currentTaskIndex: {
      type: Number,
      default: 0,
    },
    taskProgress: [taskSubmissionItemSchema],
    finalExecutiveSummary: {
      type: String,
      default: '',
    },
    repositoryUrl: {
      type: String,
      default: '',
      trim: true,
    },
    deploymentUrl: {
      type: String,
      default: '',
      trim: true,
    },
    evaluation: {
      criteriaScores: [criterionScoreSchema],
      overallScore: { type: Number, default: 0, min: 0, max: 100 },
      passed: { type: Boolean, default: false },
      generalFeedback: { type: String, default: '' },
      strengths: [{ type: String }],
      areasForImprovement: [{ type: String }],
      evaluatedAt: { type: Date },
      evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      isAutomatedRubric: { type: Boolean, default: true },
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    evaluatedAt: {
      type: Date,
    },
    timeSpentMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

jobSimulationSubmissionSchema.index({ simulation: 1, user: 1 });
jobSimulationSubmissionSchema.index({ user: 1, status: 1 });

const JobSimulationSubmission =
  mongoose.models.JobSimulationSubmission ||
  mongoose.model('JobSimulationSubmission', jobSimulationSubmissionSchema);

export default JobSimulationSubmission;
