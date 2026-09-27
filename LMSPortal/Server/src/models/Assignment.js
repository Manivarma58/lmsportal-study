import mongoose from 'mongoose';

const evaluationCriterionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Criterion name is required'],
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

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an assignment title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
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
      required: [true, 'Please provide an assignment overview description'],
      trim: true,
    },
    instructions: {
      type: String,
      required: [true, 'Please provide detailed step-by-step instructions'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['Easy', 'Medium', 'Hard', 'Expert'],
        message: '{VALUE} is not a valid difficulty level',
      },
      default: 'Medium',
      index: true,
    },
    estimatedTime: {
      type: String,
      default: '3 hours',
      trim: true,
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please associate this assignment with a course'],
      index: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor reference is required'],
      index: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Please specify an assignment submission deadline'],
    },
    evaluationCriteria: {
      type: [evaluationCriterionSchema],
      default: [
        { name: 'Functionality', description: 'Core requirements and edge case handling', maxPoints: 30, weight: 1.0 },
        { name: 'Code Quality', description: 'Clean architecture, readability, and design patterns', maxPoints: 20, weight: 1.0 },
        { name: 'API Design', description: 'RESTful conventions, status codes, and input validation', maxPoints: 20, weight: 1.0 },
        { name: 'Database', description: 'Schema normalization, indices, and query efficiency', maxPoints: 15, weight: 1.0 },
        { name: 'Testing', description: 'Automated test suite coverage and mock strategies', maxPoints: 15, weight: 1.0 },
      ],
    },
    maxScore: {
      type: Number,
      default: 100,
      min: 1,
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

// Auto-generate slug before saving if not explicitly set
assignmentSchema.pre('save', function (next) {
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

// Compound indexes
assignmentSchema.index({ course: 1, isPublished: 1, deadline: 1 });
assignmentSchema.index({ instructor: 1, createdAt: -1 });

export default mongoose.model('Assignment', assignmentSchema);
