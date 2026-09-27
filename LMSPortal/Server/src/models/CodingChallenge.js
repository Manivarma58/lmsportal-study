import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: [true, 'Test case input is required'],
      default: '',
    },
    expectedOutput: {
      type: String,
      required: [true, 'Test case expected output is required'],
      default: '',
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
    weight: {
      type: Number,
      default: 1.0,
      min: 0.1,
    },
  },
  { _id: true }
);

const codingChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
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
      required: [true, 'Challenge description and problem statement are required'],
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
    category: {
      type: String,
      default: 'Algorithms & Data Structures',
      trim: true,
      index: true,
    },
    supportedLanguages: {
      type: [String],
      default: ['javascript', 'python'],
    },
    starterCode: {
      type: Map,
      of: String,
      default: {
        javascript: 'function solution(input) {\n  // Write your code here\n  return input;\n}',
        python: 'def solution(input):\n    # Write your code here\n    return input\n',
      },
    },
    testCases: {
      type: [testCaseSchema],
      required: true,
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        'Challenge must have at least one test case',
      ],
    },
    timeLimit: {
      type: Number,
      default: 5000, // milliseconds
      min: 500,
      max: 15000,
    },
    memoryLimit: {
      type: Number,
      default: 128, // megabytes
      min: 32,
      max: 512,
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    hints: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Slug auto-generation middleware
codingChallengeSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Indexes for high-performance challenge queries
codingChallengeSchema.index({ difficulty: 1, category: 1, isPublished: 1 });
codingChallengeSchema.index({ skills: 1 });
codingChallengeSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('CodingChallenge', codingChallengeSchema);
