import mongoose from 'mongoose';
import { questionSchema } from './Question.js';

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please associate this quiz with a course'],
      index: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a quiz title'],
      trim: true,
      maxlength: [120, 'Quiz title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    passingScore: {
      type: Number,
      default: 70,
      min: [0, 'Passing score cannot be negative'],
      max: [100, 'Passing score cannot exceed 100'],
    },
    timeLimitMinutes: {
      type: Number,
      default: 15,
      min: [1, 'Time limit must be at least 1 minute'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for finding quizzes by course and lesson
quizSchema.index({ course: 1, lesson: 1 });

export default mongoose.model('Quiz', quizSchema);
