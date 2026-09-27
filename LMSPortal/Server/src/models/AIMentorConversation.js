import mongoose from 'mongoose';

const structuredRecommendationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['concept_review', 'practice', 'practical_task', 'reassessment'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    link: {
      type: String,
      default: '',
      trim: true,
    },
    resourceType: {
      type: String,
      default: '',
    },
    resourceId: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const messageItemSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    contextSnapshot: {
      targetRole: { type: String, default: '' },
      weakSkills: { type: [String], default: [] },
      latestAssessmentScore: { type: Number, default: null },
      activeCourse: { type: String, default: '' },
    },
    structuredRecommendations: {
      type: [structuredRecommendationSchema],
      default: [],
    },
  },
  { _id: true }
);

const aiMentorConversationSchema = new mongoose.Schema(
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
      default: 'Mentorship Session',
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    messages: {
      type: [messageItemSchema],
      default: [],
    },
    topic: {
      type: String,
      default: 'General Learning Guidance',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

aiMentorConversationSchema.index({ user: 1, updatedAt: -1 });

export default mongoose.model('AIMentorConversation', aiMentorConversationSchema);
