import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
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

  const numericPrice = isFree ? 0 : Number(price) || 0;

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

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { tags: { $in: [new RegExp(keyword, 'i')] } },
    ];
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  if (level && level !== 'All') {
    query.level = level;
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

  const courses = await Course.find(query)
    .populate('instructor', 'name email avatar profileImage headline')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  const total = await Course.countDocuments(query);

  return {
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    courses,
  };
};

export const getCourseById = async (courseId, requesterUser = null) => {
  const course = await Course.findById(courseId)
    .populate('instructor', 'name email avatar profileImage headline bio')
    .populate({ path: 'lessons', options: { sort: { order: 1 } } });

  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  // If unpublished, ensure only the instructor or admin can view
  if (!course.published) {
    const isOwnerOrAdmin =
      requesterUser &&
      (requesterUser.role === 'admin' ||
        requesterUser.id.toString() === course.instructor._id.toString());

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

  if (course.instructor.toString() !== requesterUser.id && requesterUser.role !== 'admin') {
    throw new ErrorResponse('Not authorized to modify this course.', 403);
  }

  if (updateData.title) {
    updateData.slug = updateData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  if (updateData.isPublished !== undefined && updateData.published === undefined) {
    updateData.published = updateData.isPublished;
  }

  const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
    new: true,
    runValidators: true,
  }).populate('instructor', 'name email avatar profileImage headline');

  return updatedCourse;
};

export const deleteCourse = async (courseId, requesterUser) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  if (course.instructor.toString() !== requesterUser.id && requesterUser.role !== 'admin') {
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

  if (course.instructor.toString() !== requesterUser.id && requesterUser.role !== 'admin') {
    throw new ErrorResponse('Not authorized to publish/unpublish this course.', 403);
  }

  course.published = !course.published;
  await course.save();

  return course;
};

export const getInstructorCourses = async (instructorId) => {
  const courses = await Course.find({ instructor: instructorId })
    .populate({ path: 'lessons', select: 'title duration order' })
    .sort({ createdAt: -1 });

  return courses;
};

export const getFeaturedCourses = async () => {
  const courses = await Course.find({ published: true, isFeatured: true })
    .populate('instructor', 'name email avatar profileImage headline')
    .sort({ rating: -1 })
    .limit(6);

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
