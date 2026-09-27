import mongoose from 'mongoose';

const criterionGradeSchema = new mongoose.Schema(
  {
    criterionName: {
      type: String,
      required: true,
      trim: true,
    },
    pointsEarned: {
      type: Number,
      required: true,
      min: 0,
    },
    maxPoints: {
      type: Number,
      required: true,
      min: 1,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const attachmentItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: 'zip',
      trim: true,
    },
    size: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student user reference is required'],
      index: true,
    },
    submissionType: {
      type: String,
      enum: ['github_repo', 'deployment_url', 'file_upload', 'combined'],
      default: 'combined',
    },
    content: {
      type: String,
      default: '',
      trim: true,
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
    attachments: {
      type: [attachmentItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['Submitted', 'Under Review', 'Needs Revision', 'Passed', 'Failed'],
        message: '{VALUE} is not a valid submission status',
      },
      default: 'Submitted',
      index: true,
    },
    score: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    criteriaGrades: {
      type: [criterionGradeSchema],
      default: [],
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    evaluatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for fast lookups
assignmentSubmissionSchema.index({ assignment: 1, user: 1, submittedAt: -1 });
assignmentSubmissionSchema.index({ assignment: 1, status: 1 });
assignmentSubmissionSchema.index({ user: 1, status: 1 });

export default mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
