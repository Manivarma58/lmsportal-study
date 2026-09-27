import mongoose from 'mongoose';

const recommendationExplanationSchema = new mongoose.Schema(
  {
    ruleTriggered: {
      type: String,
      required: true,
      trim: true,
    },
    targetRoleName: {
      type: String,
      default: '',
    },
    currentScore: {
      type: Number,
      default: 0,
    },
    targetScore: {
      type: Number,
      default: 0,
    },
    gapSize: {
      type: Number,
      default: 0,
    },
    dimension: {
      type: String,
      default: 'overall',
    },
    dimensionScore: {
      type: Number,
      default: 0,
    },
    evidenceCount: {
      type: Number,
      default: 0,
    },
    historicalTrigger: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const recommendationHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      alias: 'userId',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Recommendation title is required'],
      trim: true,
    },
    reason: {
      type: String,
      required: [true, 'Explainable recommendation reason is required'],
      trim: true,
    },
    explanation: {
      type: recommendationExplanationSchema,
      default: () => ({}),
    },
    priority: {
      type: String,
      enum: {
        values: ['Critical', 'High', 'Medium', 'Low'],
        message: '{VALUE} is not a valid priority tier',
      },
      default: 'High',
      index: true,
    },
    estimatedDuration: {
      type: String,
      default: '35 minutes',
      trim: true,
    },
    estimatedMinutes: {
      type: Number,
      default: 35,
      min: 5,
    },
    relatedSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      index: true,
    },
    skillName: {
      type: String,
      default: '',
      trim: true,
    },
    resourceType: {
      type: String,
      enum: [
        'coding_challenge',
        'project',
        'quiz',
        'course_lesson',
        'assignment',
        'course',
      ],
      required: [true, 'Resource type is required'],
    },
    resourceId: {
      type: String,
      required: [true, 'Resource reference ID is required'],
      index: true,
    },
    resourceModel: {
      type: String,
      enum: ['CodingChallenge', 'Project', 'Quiz', 'Lesson', 'Assignment', 'Course'],
      default: 'CodingChallenge',
    },
    resourceTitle: {
      type: String,
      default: '',
      trim: true,
    },
    actionUrl: {
      type: String,
      required: [true, 'Action URL is required'],
      trim: true,
    },
    buttonText: {
      type: String,
      default: 'Start Challenge',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'in_progress', 'completed', 'dismissed', 'superseded'],
      default: 'active',
      index: true,
    },
    recommendedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
    },
    dismissedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for fast history retrieval, deduplication, and active lookup
recommendationHistorySchema.index({ user: 1, status: 1 });
recommendationHistorySchema.index({ user: 1, resourceId: 1, resourceType: 1 });
recommendationHistorySchema.index({ user: 1, recommendedAt: -1 });

export default mongoose.model('RecommendationHistory', recommendationHistorySchema);
