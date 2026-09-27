import mongoose from 'mongoose';

const courseSkillSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference is required'],
      index: true,
    },
    weight: {
      type: Number,
      default: 1.0,
      min: [0.1, 'Weight cannot be less than 0.1'],
      max: [10.0, 'Weight cannot exceed 10.0'],
    },
    isPrimary: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique compound index: a course cannot map to the same skill more than once
courseSkillSchema.index({ course: 1, skill: 1 }, { unique: true });
courseSkillSchema.index({ skill: 1, isPrimary: 1 });

export default mongoose.model('CourseSkill', courseSkillSchema);
