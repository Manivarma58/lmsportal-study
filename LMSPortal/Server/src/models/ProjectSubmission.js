import mongoose from 'mongoose';

const projectMilestoneProgressSchema = new mongoose.Schema(
  {
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    milestoneTitle: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const projectCriterionGradeSchema = new mongoose.Schema(
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

const projectAttachmentSchema = new mongoose.Schema(
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
      default: 'pdf',
      trim: true,
    },
    size: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const projectSubmissionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student user reference is required'],
      index: true,
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
    documentationUrl: {
      type: String,
      default: '',
      trim: true,
    },
    attachments: {
      type: [projectAttachmentSchema],
      default: [],
    },
    milestoneProgress: {
      type: [projectMilestoneProgressSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['In Progress', 'Submitted', 'Under Review', 'Needs Revision', 'Passed', 'Failed'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'In Progress',
      index: true,
    },
    score: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    criteriaGrades: {
      type: [projectCriterionGradeSchema],
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

// Virtual aliases
projectSubmissionSchema.virtual('projectId').get(function () {
  return this.project;
});

projectSubmissionSchema.virtual('userId').get(function () {
  return this.user;
});

// Indexes
projectSubmissionSchema.index({ project: 1, user: 1 }, { unique: true });
projectSubmissionSchema.index({ project: 1, status: 1 });
projectSubmissionSchema.index({ user: 1, status: 1 });

export default mongoose.model('ProjectSubmission', projectSubmissionSchema);
