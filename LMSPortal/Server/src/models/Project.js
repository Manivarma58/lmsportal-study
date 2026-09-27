import mongoose from 'mongoose';

const projectMilestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Milestone description is required'],
      trim: true,
    },
    deliverables: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  { _id: true }
);

const projectEvaluationCriterionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Evaluation criterion name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    maxPoints: {
      type: Number,
      required: true,
      default: 20,
      min: 1,
    },
    weight: {
      type: Number,
      default: 1.0,
      min: 0.1,
    },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a project overview description'],
      trim: true,
    },
    objectives: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        message: '{VALUE} is not a valid difficulty tier',
      },
      default: 'Intermediate',
      index: true,
    },
    estimatedDuration: {
      type: String,
      default: '2 weeks',
      trim: true,
    },
    requiredSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    requirements: {
      type: [String],
      default: [],
    },
    milestones: {
      type: [projectMilestoneSchema],
      default: [],
    },
    evaluationCriteria: {
      type: [projectEvaluationCriterionSchema],
      default: [
        { name: 'Functionality', description: 'Core business logic and production resilience', maxPoints: 30, weight: 1.0 },
        { name: 'API Design', description: 'RESTful/GraphQL architecture, contracts, and error structures', maxPoints: 20, weight: 1.0 },
        { name: 'Database', description: 'Data modeling, query efficiency, indexes, and migrations', maxPoints: 15, weight: 1.0 },
        { name: 'Code Quality', description: 'Design patterns, modular architecture, and linting standards', maxPoints: 15, weight: 1.0 },
        { name: 'Testing', description: 'Unit, integration, and end-to-end test suite coverage', maxPoints: 10, weight: 1.0 },
        { name: 'Documentation', description: 'Architecture runbook, API specs, and setup instructions', maxPoints: 10, weight: 1.0 },
      ],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor reference is required'],
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },
    isPublished: {
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

// Virtual aliases for compatibility
projectSchema.virtual('instructorId').get(function () {
  return this.instructor;
});

projectSchema.virtual('courseId').get(function () {
  return this.course;
});

// Auto-generate slug before saving if not supplied
projectSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

projectSchema.index({ instructor: 1, createdAt: -1 });
projectSchema.index({ difficulty: 1, isPublished: 1 });

export default mongoose.model('Project', projectSchema);
