import mongoose from 'mongoose';

const skillEvidenceItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: [
          'quiz',
          'coding_challenge',
          'assignment',
          'project',
          'practical_assessment',
          'job_simulation',
        ],
        message: '{VALUE} is not a recognized evidence type',
      },
      required: [true, 'Evidence type is required'],
    },
    title: {
      type: String,
      required: [true, 'Evidence title/description is required'],
      trim: true,
    },
    score: {
      type: Number,
      required: [true, 'Earned score is required'],
      min: 0,
    },
    maxScore: {
      type: Number,
      required: [true, 'Maximum achievable score is required'],
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    weight: {
      type: Number,
      default: 1.0,
      min: 0.1,
    },
    referenceId: {
      type: String,
      default: '',
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const skillHistorySnapshotSchema = new mongoose.Schema(
  {
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    knowledgeScore: { type: Number, default: 0 },
    practicalScore: { type: Number, default: 0 },
    projectScore: { type: Number, default: 0 },
    assessmentScore: { type: Number, default: 0 },
    proficiencyLevel: { type: String, required: true },
    confidenceLevel: { type: String, required: true },
    evidenceCount: { type: Number, required: true },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
    trigger: {
      type: String,
      default: 'assessment_submission',
      trim: true,
    },
  },
  { _id: false }
);

const learnerSkillProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      alias: 'userId',
      index: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference is required'],
      alias: 'skillId',
      index: true,
    },
    knowledgeScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    practicalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    projectScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    assessmentScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner',
      index: true,
    },
    confidenceLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    trend: {
      type: String,
      enum: ['improving', 'steady', 'declining', 'new'],
      default: 'new',
    },
    evidenceCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    evidence: {
      type: [skillEvidenceItemSchema],
      default: [],
    },
    history: {
      type: [skillHistorySnapshotSchema],
      default: [],
    },
    lastEvaluatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique compound index: a learner has exactly one progress record per skill
learnerSkillProgressSchema.index({ user: 1, skill: 1 }, { unique: true });

// Query optimization indexes for dashboard skill grids and analytics
learnerSkillProgressSchema.index({ user: 1, overallScore: -1 });
learnerSkillProgressSchema.index({ skill: 1, overallScore: -1 });
learnerSkillProgressSchema.index({ user: 1, proficiencyLevel: 1 });

const LearnerSkillProgress = mongoose.model(
  'LearnerSkillProgress',
  learnerSkillProgressSchema
);

export const UserSkill = LearnerSkillProgress;
export default LearnerSkillProgress;
