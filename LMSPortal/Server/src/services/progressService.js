import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Certificate from '../models/Certificate.js';
import Notification from '../models/Notification.js';
import ErrorResponse from '../utils/errorResponse.js';

export const markLessonComplete = async (studentId, courseId, lessonId) => {
  let enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (!enrollment) {
    throw new ErrorResponse('Enrollment record not found for this course.', 404);
  }

  const totalLessons = await Lesson.countDocuments({ course: courseId });
  if (totalLessons === 0) {
    throw new ErrorResponse('This course has no lessons yet.', 400);
  }

  const existingIndex = enrollment.completedLessons.findIndex(
    (item) => item.lesson.toString() === lessonId.toString()
  );

  let isMarkedComplete = true;
  if (existingIndex > -1) {
    enrollment.completedLessons.splice(existingIndex, 1);
    isMarkedComplete = false;
  } else {
    enrollment.completedLessons.push({
      lesson: lessonId,
      completedAt: new Date(),
    });
  }

  enrollment.lastAccessedLesson = lessonId;

  const completedCount = enrollment.completedLessons.length;
  const progressPercentage = Math.min(
    100,
    Math.round((completedCount / totalLessons) * 100)
  );
  enrollment.completionPercentage = progressPercentage;

  let newCertificate = null;

  // Auto-generate certificate upon 100% completion if not already awarded
  if (progressPercentage === 100 && !enrollment.completed) {
    enrollment.completed = true;
    enrollment.completedAt = new Date();

    const course = await Course.findById(courseId).populate('instructor', 'name');
    const certCode = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    // Check if certificate already exists
    let existingCert = await Certificate.findOne({ student: studentId, course: courseId });
    if (!existingCert) {
      newCertificate = await Certificate.create({
        student: studentId,
        course: courseId,
        certificateId: certCode,
        grade: 'Distinction - 100% Course Completion',
        instructorName: course?.instructor?.name || 'Certified Instructor',
      });
      enrollment.certificate = newCertificate._id;

      await Notification.create({
        recipient: studentId,
        title: '🎓 Course Completed & Certificate Issued!',
        message: `Congratulations! You have completed all lessons in "${course?.title}". Your certificate is now ready to view.`,
        type: 'certificate',
        link: `/student/certificates/${newCertificate._id}`,
      });
    } else {
      enrollment.certificate = existingCert._id;
    }
  }

  await enrollment.save();

  // Sync Progress model
  await Progress.findOneAndUpdate(
    { student: studentId, course: courseId },
    {
      student: studentId,
      course: courseId,
      percentage: progressPercentage,
      completedLessons: enrollment.completedLessons.map((c) => c.lesson),
      lastAccessedLesson: lessonId,
    },
    { upsert: true }
  );

  return {
    isMarkedComplete,
    progressPercentage: enrollment.completionPercentage,
    completed: enrollment.completed,
    completedLessons: enrollment.completedLessons,
    lastAccessedLesson: enrollment.lastAccessedLesson,
    certificate: newCertificate,
  };
};

export const updateLessonProgress = async (studentId, courseId, lessonId) => {
  return markLessonComplete(studentId, courseId, lessonId);
};

export const getCourseProgress = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  }).populate('certificate');

  if (!enrollment) {
    return {
      isEnrolled: false,
      progressPercentage: 0,
      completedLessonIds: [],
    };
  }

  const completedLessonIds = enrollment.completedLessons.map((item) =>
    item.lesson.toString()
  );

  return {
    isEnrolled: true,
    progressPercentage: enrollment.completionPercentage,
    completed: enrollment.completed,
    completedLessonIds,
    certificate: enrollment.certificate,
    lastAccessedLesson: enrollment.lastAccessedLesson,
  };
};

export default {
  markLessonComplete,
  updateLessonProgress,
  getCourseProgress,
};
