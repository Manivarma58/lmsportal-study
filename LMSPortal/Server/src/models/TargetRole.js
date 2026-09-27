import mongoose from 'mongoose';

const roleSkillRequirementSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference is required'],
    },
    requiredScore: {
      type: Number,
      required: [true, 'Required skill score is required (0-100)'],
      min: [1, 'Required score must be at least 1'],
      max: [100, 'Required score cannot exceed 100'],
      default: 70,
    },
    importance: {
      type: String,
      enum: {
        values: ['Critical', 'Important', 'Optional'],
        message: '{VALUE} is not a valid importance tier',
      },
      default: 'Important',
    },
    minProficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    benchmarkNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const targetRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Role name cannot exceed 100 characters'],
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
      required: [true, 'Role description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Role category is required'],
      trim: true,
      default: 'Software Engineering',
      index: true,
    },
    icon: {
      type: String,
      default: 'briefcase',
      trim: true,
    },
    color: {
      type: String,
      default: '#06b6d4', // cyan-500
      trim: true,
    },
    requiredSkills: {
      type: [roleSkillRequirementSchema],
      required: true,
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        'A target role must require at least one skill',
      ],
    },
    careerOutlook: {
      averageSalary: {
        type: String,
        default: '$115,000 - $165,000',
        trim: true,
      },
      demandLevel: {
        type: String,
        enum: ['High', 'Very High', 'Exponential', 'Moderate'],
        default: 'Very High',
      },
      marketGrowth: {
        type: String,
        default: '+22% YoY growth',
        trim: true,
      },
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: skillLevels map for prompt compatibility (e.g. { "JavaScript": 80, "React": 75 })
targetRoleSchema.virtual('skillLevels').get(function () {
  if (!this.requiredSkills || !Array.isArray(this.requiredSkills)) return {};
  const map = {};
  this.requiredSkills.forEach((req) => {
    if (req.skill && (req.skill.name || req.skill.slug)) {
      const key = req.skill.name || req.skill.slug;
      map[key] = req.requiredScore;
    }
  });
  return map;
});

// Auto-generate slug
targetRoleSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Text and category search indexes
targetRoleSchema.index({ name: 'text', description: 'text', category: 'text' });
targetRoleSchema.index({ category: 1, isPublished: 1 });

export default mongoose.model('TargetRole', targetRoleSchema);
