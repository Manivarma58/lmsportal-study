import crypto from 'crypto';
import mongoose from 'mongoose';
import Certificate from '../models/Certificate.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import { createNotification } from './notificationService.js';
import ErrorResponse from '../utils/errorResponse.js';
import {
  generateProofOfSkillCertificate as generatePOS,
  verifyCertificateById as verifyPOSById,
} from './proofOfSkillCertificateService.js';

/**
 * Generate a Course Completion Certificate (Preserved backward compatibility)
 */
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
  const certificateCode = `CERT-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;

  const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const clientOrigin = rawClientUrl.split(',')[0].trim();
  const verificationUrl = `${clientOrigin}/verify/${certificateCode}`;

  const certificate = await Certificate.create({
    student: studentId,
    course: courseId,
    certificateType: 'course_completion',
    certificateId: certificateCode,
    grade: 'Certificate of Achievement',
    instructorName: course?.instructor?.name || 'Certified Instructor',
    issueDate: new Date(),
    assessmentDate: new Date(),
    verificationUrl,
    merkleProof: `0x${crypto.createHash('sha256').update(`${studentId}:${certificateCode}:${courseId}`).digest('hex')}`,
  });

  enrollment.certificate = certificate._id;
  enrollment.completed = true;
  await enrollment.save();

  await createNotification({
    recipient: studentId,
    title: '🎓 Official Certificate Issued!',
    message: `Your Certificate of Completion for "${course?.title}" is ready to view and share.`,
    type: 'certificate_generation',
    link: `/student/certificates/${certificate._id}`,
  });

  return certificate;
};

/**
 * Generate a Proof-of-Skill Certificate from verified learner telemetry
 */
export const generateProofOfSkillCertificate = async (studentId, options = {}) => {
  return await generatePOS({
    userId: studentId,
    roleOrSkillTitle: options.roleOrSkillTitle,
    targetRoleId: options.targetRoleId,
  });
};

/**
 * Get all certificates for a student (both course completion and proof-of-skill)
 */
export const getStudentCertificates = async (studentId) => {
  const certificates = await Certificate.find({ student: studentId })
    .populate('course', 'title thumbnail category level')
    .populate('targetRole', 'title category level')
    .sort({ issueDate: -1, createdAt: -1 });

  return certificates;
};

/**
 * Get certificate details by ID or code
 */
export const getCertificateById = async (certificateId) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(certificateId);
  const query = isObjectId
    ? { $or: [{ _id: certificateId }, { certificateId: certificateId }, { certificateCode: certificateId }] }
    : { $or: [{ certificateId: certificateId }, { certificateCode: certificateId }] };

  const certificate = await Certificate.findOne(query)
    .populate('student', 'name avatar profileImage headline bio')
    .populate({
      path: 'course',
      select: 'title category level thumbnail instructor',
      populate: { path: 'instructor', select: 'name headline avatar profileImage' },
    })
    .populate('targetRole', 'title category level description');

  if (!certificate) {
    throw new ErrorResponse('Certificate not found.', 404);
  }

  return certificate;
};

/**
 * Public verification of a certificate by certificate ID/code
 */
export const verifyCertificate = async (certificateCode) => {
  return await verifyPOSById(certificateCode);
};

export default {
  generateCertificate,
  generateProofOfSkillCertificate,
  getStudentCertificates,
  getCertificateById,
  verifyCertificate,
};
