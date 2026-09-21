import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { createNotification } from './notificationService.js';
import ErrorResponse from '../utils/errorResponse.js';

export const createLesson = async (lessonData, requesterUser) => {
  const {
    courseId,
    course,
    title,
    section,
    order,
    duration,
    videoUrl,
    videoType,
    description,
    resources,
    isFreePreview,
  } = lessonData;

  const targetCourseId = courseId || course;
  if (!targetCourseId) {
    throw new ErrorResponse('Please specify the course for this lesson.', 400);
  }
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new ErrorResponse('Please provide a lesson title.', 400);
  }

  const courseDoc = await Course.findById(targetCourseId);
  if (!courseDoc) {
    throw new ErrorResponse('Course not found.', 404);
  }

  const courseDocInstructorId = (courseDoc.instructor?._id || courseDoc.instructor)?.toString();
  if (courseDocInstructorId !== requesterUser.id && requesterUser.role !== 'admin') {
    throw new ErrorResponse('Not authorized to add lessons to this course.', 403);
  }

  const lessonCount = await Lesson.countDocuments({ course: targetCourseId });

  const lesson = await Lesson.create({
    course: targetCourseId,
    title: title.trim(),
    section: section || 'General',
    order: order !== undefined ? Number(order) : lessonCount + 1,
    duration: duration !== undefined ? Number(duration) : 10,
    videoUrl: videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoType: videoType || 'youtube',
    description: description || '',
    resources: Array.isArray(resources) ? resources : [],
    isFreePreview: Boolean(isFreePreview),
  });

  // Notify enrolled students of new lesson
  try {
    const enrollments = await Enrollment.find({ course: targetCourseId }).select('student');
    for (const enr of enrollments) {
      await createNotification({
        recipient: enr.student,
        title: 'New Lesson Available',
        message: `A new lesson "${title.trim()}" has been added to "${courseDoc.title}".`,
        type: 'new_lesson',
        link: `/student/course/${targetCourseId}/learn`,
      });
    }
  } catch (notifErr) {
    console.error('[LessonService] Failed to notify enrolled students:', notifErr);
  }

  return lesson;
};

export const getLessonsByCourse = async (courseId, requesterUser = null) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  const lessons = await Lesson.find({ course: courseId })
    .populate('quiz', 'title passingScore')
    .sort({ order: 1 });

  let hasFullAccess = false;
  if (requesterUser) {
    const instructorId = (course.instructor?._id || course.instructor)?.toString();
    if (requesterUser.role === 'admin' || instructorId === requesterUser.id) {
      hasFullAccess = true;
    } else {
      const enrollment = await Enrollment.findOne({
        student: requesterUser.id,
        course: courseId,
      });
      if (enrollment) hasFullAccess = true;
    }
  }

  const sanitizedLessons = lessons.map((l) => {
    const lessonObj = l.toObject();
    if (!hasFullAccess && !lessonObj.isFreePreview) {
      lessonObj.videoUrl = '';
      lessonObj.resources = [];
    }
    return lessonObj;
  });

  return {
    hasFullAccess,
    count: sanitizedLessons.length,
    lessons: sanitizedLessons,
  };
};

export const getLessonById = async (lessonId, requesterUser = null) => {
  const lesson = await Lesson.findById(lessonId).populate('quiz');
  if (!lesson) {
    throw new ErrorResponse('Lesson not found.', 404);
  }

  const course = await Course.findById(lesson.course);
  let hasFullAccess = Boolean(lesson.isFreePreview);

  if (requesterUser && course) {
    const instructorId = (course.instructor?._id || course.instructor)?.toString();
    if (requesterUser.role === 'admin' || instructorId === requesterUser.id) {
      hasFullAccess = true;
    } else {
      const enrollment = await Enrollment.findOne({
        student: requesterUser.id,
        course: lesson.course,
      });
      if (enrollment) hasFullAccess = true;
    }
  }

  if (!hasFullAccess) {
    throw new ErrorResponse('You must enroll in this course to access this lesson content.', 403);
  }

  return lesson;
};

export const updateLesson = async (lessonId, updateData, requesterUser) => {
  let lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new ErrorResponse('Lesson not found.', 404);
  }

  const course = await Course.findById(lesson.course);
  const instructorId = (course?.instructor?._id || course?.instructor)?.toString();
  if (!course || (instructorId !== requesterUser.id && requesterUser.role !== 'admin')) {
    throw new ErrorResponse('Not authorized to modify this lesson.', 403);
  }

  lesson = await Lesson.findByIdAndUpdate(lessonId, updateData, {
    new: true,
    runValidators: true,
  });

  return lesson;
};

export const deleteLesson = async (lessonId, requesterUser) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new ErrorResponse('Lesson not found.', 404);
  }

  const course = await Course.findById(lesson.course);
  const instructorId = (course?.instructor?._id || course?.instructor)?.toString();
  if (!course || (instructorId !== requesterUser.id && requesterUser.role !== 'admin')) {
    throw new ErrorResponse('Not authorized to delete this lesson.', 403);
  }

  await lesson.deleteOne();
  return { success: true };
};

export const reorderLessons = async (courseId, lessonOrders, requesterUser) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  const instructorId = (course.instructor?._id || course.instructor)?.toString();
  if (instructorId !== requesterUser.id && requesterUser.role !== 'admin') {
    throw new ErrorResponse('Not authorized to reorder lessons for this course.', 403);
  }

  if (!Array.isArray(lessonOrders) || lessonOrders.length === 0) {
    throw new ErrorResponse('Please provide an array of lesson orders.', 400);
  }

  const updatePromises = lessonOrders.map(({ lessonId, order }) =>
    Lesson.findOneAndUpdate(
      { _id: lessonId, course: courseId },
      { order: Number(order) },
      { new: true }
    )
  );

  await Promise.all(updatePromises);

  const updatedLessons = await Lesson.find({ course: courseId }).sort({ order: 1 });
  return updatedLessons;
};

export default {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
  reorderLessons,
};
