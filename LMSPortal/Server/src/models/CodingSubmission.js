import mongoose from 'mongoose';

const testResultItemSchema = new mongoose.Schema(
  {
    testCaseIndex: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    actualOutput: {
      type: String,
      default: '',
    },
    expectedOutput: {
      type: String,
      default: '',
    },
    executionTime: {
      type: Number,
      default: 0, // ms
    },
    error: {
      type: String,
      default: '',
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const codingSubmissionSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingChallenge',
      required: [true, 'Challenge reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'typescript'],
      default: 'javascript',
      required: [true, 'Programming language is required'],
    },
    sourceCode: {
      type: String,
      required: [true, 'Source code is required'],
    },
    status: {
      type: String,
      enum: [
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Runtime Error',
        'Compilation Error',
        'Pending',
      ],
      default: 'Pending',
      index: true,
    },
    passedTests: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTests: {
      type: Number,
      default: 0,
      min: 0,
    },
    executionTime: {
      type: Number,
      default: 0, // ms
    },
    memoryUsed: {
      type: Number,
      default: 0, // MB
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    testResults: {
      type: [testResultItemSchema],
      default: [],
    },
    submittedAt: {
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

// Compound indexes for user performance query & leaderboard
codingSubmissionSchema.index({ user: 1, challenge: 1, submittedAt: -1 });
codingSubmissionSchema.index({ challenge: 1, status: 1, score: -1 });

export default mongoose.model('CodingSubmission', codingSubmissionSchema);
