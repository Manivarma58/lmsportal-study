import mongoose from 'mongoose';

export const questionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      index: true,
    },
    question: {
      type: String,
      required: [true, 'Please provide question text'],
      alias: 'questionText',
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Please provide answer options'],
      validate: [
        (val) => Array.isArray(val) && val.length >= 2,
        'Question must have at least 2 options',
      ],
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Please specify the correct answer index or value'],
      alias: 'correctAnswerIndex',
    },
    marks: {
      type: Number,
      default: 10,
      min: [1, 'Marks must be at least 1'],
      alias: 'points',
    },
    explanation: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;
