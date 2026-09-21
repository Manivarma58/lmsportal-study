import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { createNotification } from './notificationService.js';
import ErrorResponse from '../utils/errorResponse.js';

export const createCourse = async (courseData, instructorId) => {
  const {
    title,
    description,
    shortDescription,
    category,
    level,
    price,
    isFree,
    thumbnail,
    requirements,
    willLearn,
    tags,
    published,
    isPublished,
  } = courseData;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new ErrorResponse('Please provide a course title.', 400);
  }
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    throw new ErrorResponse('Please provide a course description.', 400);
  }

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const numericPrice = isFree ? 0 : Math.max(0, Number(price) || 0);

  const course = await Course.create({
    title: title.trim(),
    slug,
    description: description.trim(),
    shortDescription: shortDescription || '',
    category: category || 'Web Development',
    level: level || 'Beginner',
    instructor: instructorId,
    price: numericPrice,
    isFree: Boolean(isFree || numericPrice === 0),
    thumbnail: thumbnail || undefined,
    requirements: Array.isArray(requirements) ? requirements : [],
    willLearn: Array.isArray(willLearn) ? willLearn : [],
    tags: Array.isArray(tags) ? tags : [],
    published: Boolean(published !== undefined ? published : isPublished),
  });

  if (course.published) {
    try {
      const students = await User.find({ role: 'student', isActive: true }).select('_id').limit(50);
      for (const s of students) {
        await createNotification({
          recipient: s._id,
          title: `🚀 New Course: ${course.title}`,
          message: `A new course "${course.title}" in ${course.category} is now available.`,
          type: 'new_course',
          link: `/course/${course._id}`,
        });
      }
    } catch (err) {
      console.error('[CourseService] Failed to dispatch new course notifications:', err);
    }
  }

  return course;
};

export const getAllCourses = async ({
  keyword,
  category,
  level,
  price,
  sort,
  page = 1,
  limit = 12,
  includeUnpublished = false,
  status = null,
}) => {
  const query = {};

  if (status === 'published') {
    query.$or = [{ published: true }, { isPublished: true }];
  } else if (status === 'draft' || status === 'unpublished') {
    query.published = { $ne: true };
    query.isPublished = { $ne: true };
  } else if (!includeUnpublished) {
    query.$or = [{ published: true }, { isPublished: true }];
  }

  if (typeof keyword === 'string' && keyword.trim()) {
    const cleanKw = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: { $regex: cleanKw, $options: 'i' } },
      { description: { $regex: cleanKw, $options: 'i' } },
      { tags: { $in: [new RegExp(cleanKw, 'i')] } },
    ];
  }

  if (typeof category === 'string' && category.trim() && category !== 'All') {
    query.category = category.trim();
  }

  if (typeof level === 'string' && level.trim() && level !== 'All') {
    query.level = level.trim();
  }

  if (price === 'free') {
    query.isFree = true;
  } else if (price === 'paid') {
    query.isFree = false;
    query.price = { $gt: 0 };
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'rating') sortOption = { rating: -1 };
  else if (sort === 'popular') sortOption = { enrollmentCount: -1 };
  else if (sort === 'price-low') sortOption = { price: 1 };
  else if (sort === 'price-high') sortOption = { price: -1 };
  else if (sort === 'oldest') sortOption = { createdAt: 1 };

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 12);
  const skip = (pageNum - 1) * limitNum;

  // Run list query with field projection and count in parallel
  const [courses, total] = await Promise.all([
    Course.find(query)
      .select(
        'title slug shortDescription category level price isFree thumbnail rating numReviews enrollmentCount published isPublished instructor createdAt tags'
      )
      .populate('instructor', 'name email avatar profileImage headline')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Course.countDocuments(query),
  ]);

  return {
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    courses,
  };
};

export const getCourseById = async (courseId, requesterUser = null) => {
  const course = await Course.findById(courseId)
    .populate('instructor', 'name avatar profileImage headline bio')
    .populate({ path: 'lessons', options: { sort: { order: 1 } } });

  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  // If unpublished, ensure only the instructor or admin can view
  if (!course.published) {
    const instructorId = (course.instructor?._id || course.instructor)?.toString();
    const isOwnerOrAdmin =
      requesterUser &&
      (requesterUser.role === 'admin' ||
        (instructorId && requesterUser.id.toString() === instructorId));

    if (!isOwnerOrAdmin) {
      throw new ErrorResponse('This course is not published.', 403);
    }
  }

  return course;
};

export const updateCourse = async (courseId, updateData, requesterUser) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  const instructorId = (course.instructor?._id || course.instructor)?.toString();
  if (instructorId !== requesterUser.id && requesterUser.role !== 'admin') {
    throw new ErrorResponse('Not authorized to modify this course.', 403);
  }

  // Security: Whitelist allowed fields to prevent IDOR ownership changes or metric tampering
  const safeUpdate = {};
  if (updateData.title !== undefined) {
    safeUpdate.title = updateData.title.trim();
    safeUpdate.slug = updateData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  if (updateData.description !== undefined) safeUpdate.description = updateData.description.trim();
  if (updateData.shortDescription !== undefined) safeUpdate.shortDescription = updateData.shortDescription;
  if (updateData.category !== undefined) safeUpdate.category = updateData.category;
  if (updateData.level !== undefined) safeUpdate.level = updateData.level;
  if (updateData.price !== undefined) safeUpdate.price = Math.max(0, Number(updateData.price) || 0);
  if (updateData.isFree !== undefined) safeUpdate.isFree = Boolean(updateData.isFree);
  if (updateData.thumbnail !== undefined) safeUpdate.thumbnail = updateData.thumbnail;
  if (updateData.requirements !== undefined) safeUpdate.requirements = updateData.requirements;
  if (updateData.willLearn !== undefined) safeUpdate.willLearn = updateData.willLearn;
  if (updateData.tags !== undefined) safeUpdate.tags = updateData.tags;
  if (updateData.published !== undefined) safeUpdate.published = Boolean(updateData.published);
  else if (updateData.isPublished !== undefined) safeUpdate.published = Boolean(updateData.isPublished);

  // Admin can reassign instructor if explicitly requested, but regular instructors cannot change course.instructor
  if (requesterUser.role === 'admin' && updateData.instructor) {
    safeUpdate.instructor = updateData.instructor;
  }

  const updatedCourse = await Course.findByIdAndUpdate(courseId, safeUpdate, {
    new: true,
    runValidators: true,
  }).populate('instructor', 'name avatar profileImage headline');

  return updatedCourse;
};

export const deleteCourse = async (courseId, requesterUser) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  const instructorId = (course.instructor?._id || course.instructor)?.toString();
  if (instructorId !== requesterUser.id && requesterUser.role !== 'admin') {
    throw new ErrorResponse('Not authorized to delete this course.', 403);
  }

  // Clean up associated resources
  await Lesson.deleteMany({ course: courseId });
  await Enrollment.deleteMany({ course: courseId });
  await course.deleteOne();

  return { success: true };
};

export const togglePublishCourse = async (courseId, requesterUser) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  const instructorId = (course.instructor?._id || course.instructor)?.toString();
  if (instructorId !== requesterUser.id && requesterUser.role !== 'admin') {
    throw new ErrorResponse('Not authorized to publish/unpublish this course.', 403);
  }

  course.published = !course.published;
  await course.save();

  return course;
};

export const getInstructorCourses = async (instructorId) => {
  const courses = await Course.find({ instructor: instructorId })
    .populate({ path: 'lessons', select: 'title duration order' })
    .sort({ createdAt: -1 })
    .lean();

  return courses;
};

export const getFeaturedCourses = async () => {
  const courses = await Course.find({ published: true, isFeatured: true })
    .select(
      'title slug shortDescription category level price isFree thumbnail rating numReviews enrollmentCount published isPublished instructor createdAt tags'
    )
    .populate('instructor', 'name email avatar profileImage headline')
    .sort({ rating: -1 })
    .limit(6)
    .lean();

  return courses;
};

export const getCategories = async () => {
  const categories = await Course.distinct('category', { published: true });
  return categories;
};

export default {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  getInstructorCourses,
  getFeaturedCourses,
  getCategories,
};
