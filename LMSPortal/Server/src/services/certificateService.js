import Certificate from '../models/Certificate.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import ErrorResponse from '../utils/errorResponse.js';

export const generateCertificate = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (!enrollment) {
    throw new ErrorResponse('You must be enrolled in this course to receive a certificate.', 404);
  }

  // Check if certificate already exists
  const existingCertificate = await Certificate.findOne({
    student: studentId,
    course: courseId,
  });

  if (existingCertificate) {
    return existingCertificate;
  }

  // Verify eligibility (either 100% completion or completed is true)
  if (enrollment.completionPercentage < 100 && !enrollment.completed) {
    throw new ErrorResponse(
      `Course is not yet completed. Current progress: ${enrollment.completionPercentage}%.`,
      400
    );
  }

  const course = await Course.findById(courseId).populate('instructor', 'name');
  const certificateCode = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

  const certificate = await Certificate.create({
    student: studentId,
    course: courseId,
    certificateId: certificateCode,
    grade: 'Certificate of Achievement',
    instructorName: course?.instructor?.name || 'Certified Instructor',
    issueDate: new Date(),
  });

  enrollment.certificate = certificate._id;
  enrollment.completed = true;
  await enrollment.save();

  await Notification.create({
    recipient: studentId,
    title: '🎓 Official Certificate Issued!',
    message: `Your Certificate of Completion for "${course?.title}" is ready to view and share.`,
    type: 'certificate',
    link: `/student/certificates/${certificate._id}`,
  });

  return certificate;
};

export const getStudentCertificates = async (studentId) => {
  const certificates = await Certificate.find({ student: studentId })
    .populate('course', 'title thumbnail category level')
    .sort({ issueDate: -1 });

  return certificates;
};

export const getCertificateById = async (certificateId) => {
  const certificate = await Certificate.findById(certificateId)
    .populate('student', 'name email avatar profileImage')
    .populate({
      path: 'course',
      select: 'title category level thumbnail instructor',
      populate: { path: 'instructor', select: 'name headline avatar profileImage' },
    });

  if (!certificate) {
    throw new ErrorResponse('Certificate not found.', 404);
  }

  return certificate;
};

export const verifyCertificate = async (certificateCode) => {
  const certificate = await Certificate.findOne({
    $or: [{ certificateId: certificateCode }, { certificateCode: certificateCode }],
  })
    .populate('student', 'name avatar profileImage')
    .populate('course', 'title category level');

  if (!certificate) {
    return {
      isValid: false,
      message: 'Certificate code is invalid or does not exist.',
      certificate: null,
    };
  }

  return {
    isValid: true,
    message: 'Certificate verified as authentic.',
    certificate,
  };
};

export default {
  generateCertificate,
  getStudentCertificates,
  getCertificateById,
  verifyCertificate,
};
