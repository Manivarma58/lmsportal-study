import mongoose from 'mongoose';

const interventionStageSchema = new mongoose.Schema(
  {
    stageNumber: { type: Number, required: true },
    stageName: {
      type: String,
      enum: [
        'Concept Review',
        'Beginner Practice',
        'Intermediate Practice',
        'Real-World Task',
        'Reassessment',
      ],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    activityType: {
      type: String,
      enum: ['coding_challenge', 'lesson', 'quiz', 'assignment', 'job_simulation'],
      required: true,
    },
    activityId: { type: String, required: true },
    activityTitle: { type: String, required: true },
    activityLink: { type: String, required: true },
    objective: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Completed', 'Skipped'],
      default: 'Pending',
    },
    targetScore: { type: Number, default: 75 },
    earnedScore: { type: Number, default: 0 },
    attemptsCount: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { _id: true }
);

const adaptiveInterventionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
      index: true,
    },
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved', 'Escalated', 'Abandoned'],
      default: 'Active',
      index: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Moderate', 'Critical'],
      default: 'Moderate',
    },
    detectionReason: {
      type: String,
      required: true,
    },
    triggerTelemetry: {
      initialScore: { type: Number, required: true },
      dimensionStruggling: {
        type: String,
        enum: ['knowledge', 'practical', 'project', 'assessment', 'general'],
        default: 'practical',
      },
      failureCount: { type: Number, default: 1 },
      trend: { type: String, default: 'Declining' },
      detectedAt: { type: Date, default: Date.now },
    },
    currentStageIndex: {
      type: Number,
      default: 0,
    },
    stages: [interventionStageSchema],
    reassessmentCondition: {
      targetScore: { type: Number, default: 75 },
      description: {
        type: String,
        default: 'Score >= 75% on the reassessment milestone to graduate this skill intervention.',
      },
    },
    improvement: {
      baselineScore: { type: Number, default: 0 },
      currentScore: { type: Number, default: 0 },
      scoreDelta: { type: Number, default: 0 },
      resolvedAt: { type: Date },
    },
    escalationNotes: {
      type: String,
      default: '',
    },
    history: [
      {
        action: { type: String, required: true },
        description: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

adaptiveInterventionSchema.index({ user: 1, skill: 1, status: 1 });

const AdaptiveIntervention =
  mongoose.models.AdaptiveIntervention ||
  mongoose.model('AdaptiveIntervention', adaptiveInterventionSchema);

export default AdaptiveIntervention;
