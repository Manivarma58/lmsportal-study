import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'Resource file URL is required'],
    },
    fileType: {
      type: String,
      default: 'pdf',
      trim: true,
    },
    fileSize: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please associate this lesson with a course'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a lesson title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    resources: {
      type: [resourceSchema],
      default: [],
    },
    duration: {
      type: Number,
      default: 10,
      min: [0, 'Duration cannot be negative'],
    },
    order: {
      type: Number,
      required: [true, 'Please provide lesson ordering number'],
      default: 1,
      min: [1, 'Order must be at least 1'],
    },
    section: {
      type: String,
      default: 'General',
      trim: true,
    },
    videoType: {
      type: String,
      enum: ['youtube', 'vimeo', 'mp4', 'custom'],
      default: 'youtube',
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to guarantee fast, sorted curriculum retrieval by course
lessonSchema.index({ course: 1, order: 1 });

export default mongoose.model('Lesson', lessonSchema);
