import mongoose from 'mongoose';

const sectionsVisibilitySchema = new mongoose.Schema(
  {
    targetRole: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    projects: { type: Boolean, default: true },
    assignments: { type: Boolean, default: true },
    codingChallenges: { type: Boolean, default: true },
    jobSimulations: { type: Boolean, default: true },
    certificates: { type: Boolean, default: true },
    contactEmail: { type: Boolean, default: true },
    socialLinks: { type: Boolean, default: true },
  },
  { _id: false }
);

const learnerPortfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Portfolio vanity slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    customHeadline: {
      type: String,
      default: '',
      trim: true,
      maxlength: 140,
    },
    customBio: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1200,
    },
    sectionsVisibility: {
      type: sectionsVisibilitySchema,
      default: () => ({}),
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSharedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Helper method to generate default slug from name
learnerPortfolioSchema.statics.generateSlugFromName = function (name, userId) {
  const base = (name || 'scholar')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = userId ? userId.toString().slice(-4) : Math.floor(1000 + Math.random() * 9000);
  return `${base || 'scholar'}-${suffix}`;
};

const LearnerPortfolio = mongoose.model('LearnerPortfolio', learnerPortfolioSchema);
export default LearnerPortfolio;
