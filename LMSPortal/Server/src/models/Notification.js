import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message content is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: [
          'course_enrollment',
          'enrollment',
          'new_course',
          'new_lesson',
          'course_update',
          'quiz_result',
          'quiz_graded',
          'course_completion',
          'certificate_generation',
          'certificate',
          'instructor_announcement',
          'announcement',
          'system',
          'chat_message',
        ],
        message: '{VALUE} is not a recognized notification type',
      },
      default: 'system',
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      alias: 'isRead',
      index: true,
    },
    link: {
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

// Compound index for instant notification feed and unread-badge counts
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
