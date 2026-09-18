import express from 'express';
import {
  generateCertificate,
  getCertificateById,
  verifyCertificate,
  getMyCertificates,
} from '../controllers/certificateController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public certificate verification
router.get('/verify/:code', verifyCertificate);

// Student certificate management
router.post('/generate/:courseId', authMiddleware, generateCertificate);
router.get('/student/my-certificates', authMiddleware, getMyCertificates);
router.get('/', authMiddleware, getMyCertificates);

// Specific certificate details
router.get('/:id', getCertificateById);

export default router;
