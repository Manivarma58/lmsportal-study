import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import Notification from '../models/Notification.js';
import ErrorResponse from '../utils/errorResponse.js';

export const enrollInCourse = async (studentId, courseId, studentName = 'Student') => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  if (!course.published) {
    throw new ErrorResponse('Cannot enroll in an unpublished course.', 400);
  }

  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (existingEnrollment) {
    throw new ErrorResponse('You are already enrolled in this course.', 400);
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    enrolledAt: new Date(),
    completed: false,
    completionPercentage: 0,
  });

  // Ensure Progress record is synchronized
  await Progress.findOneAndUpdate(
    { student: studentId, course: courseId },
    { student: studentId, course: courseId, percentage: 0, completedLessons: [] },
    { upsert: true, new: true }
  );

  course.enrollmentCount = (course.enrollmentCount || 0) + 1;
  await course.save();

  // Create notifications
  await Notification.create({
    recipient: studentId,
    title: 'Course Enrollment Successful',
    message: `You have successfully enrolled in "${course.title}". Start learning today!`,
    type: 'enrollment',
    link: `/student/course/${courseId}/learn`,
  });

  if (course.instructor) {
    await Notification.create({
      recipient: course.instructor,
      title: 'New Student Enrolled',
      message: `${studentName} enrolled in your course "${course.title}".`,
      type: 'enrollment',
      link: `/instructor/dashboard`,
    });
  }

  return enrollment;
};

export const getStudentEnrollments = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId })
    .populate({
      path: 'course',
      populate: { path: 'instructor', select: 'name avatar profileImage headline' },
    })
    .populate('certificate')
    .sort({ updatedAt: -1 });

  return enrollments;
};

export const checkEnrollment = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  }).populate('certificate');

  return {
    isEnrolled: Boolean(enrollment),
    enrollment: enrollment || null,
  };
};

export const getCourseEnrolledStudents = async (courseId, requesterUser) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ErrorResponse('Course not found.', 404);
  }

  if (course.instructor.toString() !== requesterUser.id && requesterUser.role !== 'admin') {
    throw new ErrorResponse('Not authorized to view student enrollments for this course.', 403);
  }

  const enrollments = await Enrollment.find({ course: courseId })
    .populate('student', 'name email avatar profileImage createdAt')
    .sort({ createdAt: -1 });

  return enrollments;
};

export default {
  enrollInCourse,
  getStudentEnrollments,
  checkEnrollment,
  getCourseEnrolledStudents,
};
