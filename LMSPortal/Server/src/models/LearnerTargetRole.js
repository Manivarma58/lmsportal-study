import mongoose from 'mongoose';

const learnerTargetRoleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      alias: 'userId',
      index: true,
    },
    targetRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TargetRole',
      required: [true, 'Target role reference is required'],
      alias: 'roleId',
      index: true,
    },
    targetDate: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default 90 days out
    },
    targetPace: {
      type: String,
      enum: ['relaxed', 'standard', 'intensive'],
      default: 'standard',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index ensuring a user can have only one record per target role
learnerTargetRoleSchema.index({ user: 1, targetRole: 1 }, { unique: true });
learnerTargetRoleSchema.index({ user: 1, isActive: 1 });

export default mongoose.model('LearnerTargetRole', learnerTargetRoleSchema);
