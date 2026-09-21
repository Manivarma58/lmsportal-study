import mongoose from 'mongoose';

const completedLessonItemSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: false,
      alias: 'isCompleted',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Completion percentage cannot be less than 0'],
      max: [100, 'Completion percentage cannot exceed 100'],
      alias: 'progressPercentage',
    },
    completedLessons: {
      type: [completedLessonItemSchema],
      default: [],
    },
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    completedAt: {
      type: Date,
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique compound index: a student can only enroll once in any specific course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Query optimization indexes for dashboard queries and analytics aggregations
enrollmentSchema.index({ student: 1, completed: 1 });
enrollmentSchema.index({ student: 1, createdAt: -1 });
enrollmentSchema.index({ course: 1, completed: 1 });
enrollmentSchema.index({ course: 1, createdAt: -1 });

export default mongoose.model('Enrollment', enrollmentSchema);
