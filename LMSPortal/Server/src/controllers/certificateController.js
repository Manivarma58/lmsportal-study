import asyncHandler from '../middleware/asyncHandler.js';
import certificateService from '../services/certificateService.js';

/**
 * @desc    Generate a certificate for an eligible course
 * @route   POST /api/certificates/generate/:courseId
 * @access  Private/Student
 */
export const generateCertificate = asyncHandler(async (req, res) => {
  const certificate = await certificateService.generateCertificate(
    req.user.id,
    req.params.courseId
  );

  res.status(201).json({
    success: true,
    message: 'Certificate generated successfully!',
    certificate,
  });
});

/**
 * @desc    Get all certificates belonging to current student
 * @route   GET /api/certificates/student/my-certificates, GET /api/certificates
 * @access  Private
 */
export const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificateService.getStudentCertificates(req.user.id);
  res.status(200).json({
    success: true,
    count: certificates.length,
    certificates,
  });
});

/**
 * @desc    Get certificate details by ID
 * @route   GET /api/certificates/:id
 * @access  Public / Authenticated
 */
export const getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await certificateService.getCertificateById(req.params.id);
  res.status(200).json({
    success: true,
    certificate,
  });
});

/**
 * @desc    Public verification of a certificate by certificate code/ID
 * @route   GET /api/certificates/verify/:code
 * @access  Public
 */
export const verifyCertificate = asyncHandler(async (req, res) => {
  const result = await certificateService.verifyCertificate(req.params.code);
  res.status(result.isValid ? 200 : 404).json({
    success: result.isValid,
    ...result,
  });
});

export default {
  generateCertificate,
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
};
