import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide course description'],
    },
    shortDescription: {
      type: String,
      default: '',
      maxlength: [250, 'Short description cannot exceed 250 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      default: 'Web Development',
      trim: true,
      index: true,
    },
    level: {
      type: String,
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        message: '{VALUE} is not a valid course level',
      },
      default: 'Beginner',
      index: true,
    },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an instructor reference'],
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
      alias: 'isPublished',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    willLearn: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for lessons (Normalized 1-to-many relationship for high scalability)
courseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  justOne: false,
});

// Text index for search functionality across title, description, and tags
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Compound indexes for optimal catalog filtering, sorting, and instructor queries
courseSchema.index({ category: 1, published: 1 });
courseSchema.index({ instructor: 1, published: 1 });
courseSchema.index({ published: 1, createdAt: -1 });
courseSchema.index({ published: 1, rating: -1 });
courseSchema.index({ published: 1, enrollmentCount: -1 });
courseSchema.index({ published: 1, price: 1 });
courseSchema.index({ published: 1, price: -1 });
courseSchema.index({ published: 1, isFeatured: 1 });

export default mongoose.model('Course', courseSchema);
