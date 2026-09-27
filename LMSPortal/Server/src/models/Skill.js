import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      unique: true,
      maxlength: [80, 'Skill name cannot exceed 80 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      trim: true,
      default: 'General Technology',
      index: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        message: '{VALUE} is not a valid skill difficulty',
      },
      default: 'Intermediate',
      index: true,
    },
    icon: {
      type: String,
      default: 'code',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Slug auto-generation pre-save hook
skillSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Search & filter indexes
skillSchema.index({ name: 'text', description: 'text', tags: 'text' });
skillSchema.index({ category: 1, difficulty: 1 });

export default mongoose.model('Skill', skillSchema);
