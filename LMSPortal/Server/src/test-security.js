import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

import User from './models/User.js';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';
import Enrollment from './models/Enrollment.js';
import Quiz from './models/Quiz.js';
import Certificate from './models/Certificate.js';
import Notification from './models/Notification.js';

import { getJwtSecret } from './config/env.js';
import securityHeaders from './middleware/securityHeaders.js';
import mongoSanitize from './middleware/mongoSanitize.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import { initSocket } from './socket/socketHandler.js';
import { upload } from './middleware/uploadMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

let mongoServer;
let httpServer;
let ioServer;
let port;
let baseUrl;

async function runSecurityAudit() {
  console.log('================================================================');
  console.log('🔒 EXECUTING COMPREHENSIVE LMS SECURITY AUDIT & VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    // 1. Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('  📦 In-memory isolated security test database initialized.');

    // 2. Setup Full Express & Socket.IO App with all production security middleware
    const app = express();
    httpServer = http.createServer(app);
    ioServer = new Server(httpServer, {
      cors: { origin: '*' },
    });
    initSocket(ioServer);

    app.use((req, res, next) => {
      req.io = ioServer;
      next();
    });

    // Production security stack
    app.use(securityHeaders);
    app.use(express.json({ limit: '2mb' }));
    app.use(express.urlencoded({ extended: true, limit: '2mb' }));
    app.use(mongoSanitize);

    // Rate limiters
    app.use('/api', apiLimiter);
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
    app.use('/api/auth/forgot-password', authLimiter);

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/lessons', lessonRoutes);
    app.use('/api/enrollments', enrollmentRoutes);
    app.use('/api/quizzes', quizRoutes);
    app.use('/api/certificates', certificateRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/upload', uploadRoutes);

    app.use(notFound);
    app.use(errorHandler);

    await new Promise((resolve) => {
      httpServer.listen(0, () => {
        port = httpServer.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`  🚀 Security test server listening on port ${port}.\n`);
        resolve();
      });
    });

    // Helper request wrapper
    const request = async (method, path, body = null, token = null, customHeaders = {}) => {
      const headers = { 'Content-Type': 'application/json', ...customHeaders };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const opts = { method, headers };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(`${baseUrl}${path}`, opts);
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        // non-json response
      }
      return { status: res.status, headers: res.headers, data };
    };

    // =========================================================================
    // AUDIT CHECK 1: HTTP Security Headers & DoS Limits
    // =========================================================================
    console.log('🔹 CHECK 1 & 22: HTTP Security Headers & DoS Protection');
    const healthRes = await request('GET', '/api/health');
    assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff header is set');
    assert(healthRes.headers.get('x-frame-options') === 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN header is set');
    assert(Boolean(healthRes.headers.get('content-security-policy')), 'Content-Security-Policy header is configured');
    assert(healthRes.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Referrer-Policy header is set');

    // =========================================================================
    // AUDIT CHECK 2: Authentication Bypass & JWT Security
    // =========================================================================
    console.log('\n🔹 CHECK 1 & 5: Authentication Bypass & JWT Token Forgery Defense');
    const noTokenRes = await request('GET', '/api/auth/me');
    assert(noTokenRes.status === 401, 'Unauthenticated request to /api/auth/me is blocked with 401');

    // Forged JWT signed with a bogus key
    const forgedToken = jwt.sign({ id: new mongoose.Types.ObjectId(), role: 'admin' }, 'wrong_secret_key_12345');
    const forgedRes = await request('GET', '/api/auth/me', null, forgedToken);
    assert(forgedRes.status === 401, 'Forged JWT token signed with untrusted secret is rejected with 401');

    // =========================================================================
    // AUDIT CHECK 3: Password Security, Cryptographic Reset & No Plaintext Leaks
    // =========================================================================
    console.log('\n🔹 CHECK 6 & 16: Password Security & Cryptographic Password Reset');
    // Register test student
    const regStudentRes = await request('POST', '/api/auth/register', {
      name: 'Alice Learner',
      email: 'alice@security.com',
      password: 'Password123!',
      role: 'student',
    });
    assert(regStudentRes.status === 201, 'Student account registered successfully');
    const studentToken = regStudentRes.data.token;
    const studentUser = regStudentRes.data.user;

    // Verify password is NOT in response
    assert(studentUser.password === undefined, 'Password is not exposed in registration response');

    // Verify database stores bcrypt hash, never plaintext
    const dbUser = await User.findById(studentUser.id).select('+password');
    assert(dbUser.password !== 'Password123!', 'Database does NOT store plaintext password');
    assert(dbUser.password.startsWith('$2a$') || dbUser.password.startsWith('$2b$'), 'Password is valid bcrypt hash');

    // Password length > 128 chars rejected (prevent bcrypt CPU DoS)
    const longPass = 'A'.repeat(150);
    const longPassRes = await request('POST', '/api/auth/register', {
      name: 'Long Pass Tester',
      email: 'longpass@security.com',
      password: longPass,
    });
    assert(longPassRes.status === 400, 'Password exceeding 128 characters rejected with 400 (bcrypt DoS defense)');

    // Forgot Password: Request reset token
    const forgotRes = await request('POST', '/api/auth/forgot-password', {
      email: 'alice@security.com',
    });
    assert(forgotRes.status === 200, 'Forgot password request succeeds');
    const rawResetToken = forgotRes.data.resetToken;
    assert(typeof rawResetToken === 'string' && rawResetToken.length === 64, 'Reset token is cryptographically secure (64 hex characters)');

    // Verify reset token in DB is hashed with SHA-256 and NOT plaintext
    const dbUserAfterForgot = await User.findById(studentUser.id);
    assert(dbUserAfterForgot.resetPasswordToken !== rawResetToken, 'Reset token is NOT stored in plaintext in database');
    assert(dbUserAfterForgot.resetPasswordToken.length === 64, 'Reset token stored as 64-character SHA-256 hash in database');

    // Perform Reset Password using raw token
    const resetRes = await request('POST', '/api/auth/reset-password', {
      resetToken: rawResetToken,
      newPassword: 'NewPassword456!',
    });
    assert(resetRes.status === 200, 'Password reset succeeds with valid token');

    // Attempting to reuse or use invalid token fails
    const reuseResetRes = await request('POST', '/api/auth/reset-password', {
      resetToken: rawResetToken,
      newPassword: 'AnotherPassword789!',
    });
    assert(reuseResetRes.status === 400, 'Reusing previously consumed reset token is rejected with 400');

    // Login with new password
    const newLoginRes = await request('POST', '/api/auth/login', {
      email: 'alice@security.com',
      password: 'NewPassword456!',
    });
    assert(newLoginRes.status === 200, 'Login with newly reset password succeeds (200)');
    const activeStudentToken = newLoginRes.data.token;

    // =========================================================================
    // AUDIT CHECK 4: Broken RBAC & Unauthorized Admin Access Defense
    // =========================================================================
    console.log('\n🔹 CHECK 3 & 20: Broken RBAC & Admin Privilege Escalation Defense');
    // Register initial admin (permitted for platform bootstrap)
    const bootstrapAdminRes = await request('POST', '/api/auth/register', {
      name: 'Super Admin',
      email: 'admin@security.com',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    assert(bootstrapAdminRes.status === 201, 'Platform initial admin account bootstrapped');
    const adminToken = bootstrapAdminRes.data.token;

    // Now attempt unauthorized secondary admin registration
    process.env.ADMIN_REGISTRATION_KEY = 'secret_admin_key_99999';
    const unauthorizedAdminRes = await request('POST', '/api/auth/register', {
      name: 'Rogue Admin',
      email: 'rogue@security.com',
      password: 'RoguePassword123!',
      role: 'admin',
    });
    assert(unauthorizedAdminRes.status === 403, 'Unauthorized public attempt to register admin role blocked with 403 Forbidden');

    // Student attempting admin-only endpoints
    const studentAccessUsers = await request('GET', '/api/users', null, activeStudentToken);
    assert(studentAccessUsers.status === 403, 'Student blocked from GET /api/users (403 Forbidden)');

    const studentAccessAnalytics = await request('GET', '/api/analytics/admin', null, activeStudentToken);
    assert(studentAccessAnalytics.status === 403, 'Student blocked from GET /api/analytics/admin (403 Forbidden)');

    const studentBroadcast = await request('POST', '/api/notifications/broadcast', { title: 'Spam', message: 'Spam' }, activeStudentToken);
    assert(studentBroadcast.status === 403, 'Student blocked from POST /api/notifications/broadcast (403 Forbidden)');

    // =========================================================================
    // AUDIT CHECK 5: NoSQL Injection Defense
    // =========================================================================
    console.log('\n🔹 CHECK 8 & 9: MongoDB & NoSQL Injection Defense');
    // Attempt login bypass with NoSQL injection: { email: { $gt: "" }, password: { $gt: "" } }
    const injectionLoginRes = await request('POST', '/api/auth/login', {
      email: { $gt: '' },
      password: { $gt: '' },
    });
    assert(injectionLoginRes.status === 400 || injectionLoginRes.status === 401, 'NoSQL query injection login bypass rejected (sanitized)');

    // Attempt NoSQL injection via query string
    const sanitizedQueryRes = await request('GET', '/api/courses?category[$ne]=null');
    assert(sanitizedQueryRes.status === 200, 'NoSQL operator in query parameters sanitized safely without crash');

    // =========================================================================
    // AUDIT CHECK 6: IDOR & Course / Lesson Access Controls
    // =========================================================================
    console.log('\n🔹 CHECK 4, 18 & 19: IDOR & Course / Quiz / Lesson Protection');
    // Register instructor 1
    const inst1Res = await request('POST', '/api/auth/register', {
      name: 'Dr. John Watson',
      email: 'watson@security.com',
      password: 'Password123!',
      role: 'instructor',
    });
    const inst1Token = inst1Res.data.token;
    const inst1Id = inst1Res.data.user.id;

    // Register instructor 2
    const inst2Res = await request('POST', '/api/auth/register', {
      name: 'Prof. Moriarty',
      email: 'moriarty@security.com',
      password: 'Password123!',
      role: 'instructor',
    });
    const inst2Token = inst2Res.data.token;

    // Instructor 1 creates a paid course
    const courseRes = await request(
      'POST',
      '/api/courses',
      {
        title: 'Defensive Cryptography',
        description: 'Advanced applied cryptography course.',
        price: 99,
        isFree: false,
        published: true,
      },
      inst1Token
    );
    const courseId = courseRes.data.course._id;

    // Add paid lesson
    const lessonRes = await request(
      'POST',
      '/api/lessons',
      {
        courseId,
        title: 'Lesson 1: Symmetric Ciphers',
        videoUrl: 'https://youtube.com/watch?v=secret',
        isFreePreview: false,
      },
      inst1Token
    );
    const lessonId = lessonRes.data.lesson._id;

    // Create quiz inside course
    const quizRes = await request(
      'POST',
      '/api/quizzes',
      {
        courseId,
        title: 'Cipher Quiz',
        passingScore: 80,
        questions: [
          {
            question: 'What is AES block size?',
            options: ['64 bits', '128 bits', '256 bits'],
            correctAnswer: 1,
            marks: 10,
            explanation: 'AES uses a fixed 128-bit block size.',
          },
        ],
      },
      inst1Token
    );
    const quizId = quizRes.data.quiz._id;

    // IDOR Check 6a: Instructor 2 cannot modify Instructor 1's course
    const idorCourseUpdate = await request(
      'PUT',
      `/api/courses/${courseId}`,
      { title: 'Hacked by Moriarty' },
      inst2Token
    );
    assert(idorCourseUpdate.status === 403, 'Instructor 2 blocked from modifying Instructor 1 course (403 IDOR blocked)');

    // IDOR Check 6b: Instructor cannot reassign course ownership via update
    const attemptReassign = await request(
      'PUT',
      `/api/courses/${courseId}`,
      { instructor: inst2Res.data.user.id },
      inst1Token
    );
    const courseAfterUpdate = await Course.findById(courseId);
    assert(courseAfterUpdate.instructor.toString() === inst1Id.toString(), 'Course instructor ownership cannot be forged in update (field protected)');

    // IDOR Check 6c: Instructor 2 cannot view student enrollments of Instructor 1 course
    const idorStudentsGet = await request(
      'GET',
      `/api/enrollments/course/${courseId}/students`,
      null,
      inst2Token
    );
    assert(idorStudentsGet.status === 403, 'Instructor 2 blocked from viewing student list for other instructor course (403)');

    // Course Access Check 6d: Unenrolled student cannot access paid lesson
    const studentLessonGet = await request('GET', `/api/lessons/${lessonId}`, null, activeStudentToken);
    assert(studentLessonGet.status === 403, 'Unenrolled student blocked from accessing paid lesson content (403 Forbidden)');

    // Course Access Check 6e: Unenrolled student cannot access quiz
    const studentQuizGet = await request('GET', `/api/quizzes/${quizId}`, null, activeStudentToken);
    assert(studentQuizGet.status === 403, 'Unenrolled student blocked from viewing paid course quiz (403 Forbidden)');

    // Course Access Check 6f: Unenrolled student cannot submit quiz
    const studentQuizSubmit = await request(
      'POST',
      `/api/quizzes/${quizId}/submit`,
      { answers: [{ questionIndex: 0, selectedOption: 1 }] },
      activeStudentToken
    );
    assert(studentQuizSubmit.status === 403, 'Unenrolled student blocked from submitting quiz attempts (403 Forbidden)');

    // Now enroll student legitimately
    const enrollRes = await request('POST', `/api/enrollments/${courseId}`, {}, activeStudentToken);
    assert(enrollRes.status === 201, 'Student legitimately enrolled in course');

    // Enrolled student now accesses quiz and receives masked answer key
    const enrolledQuizGet = await request('GET', `/api/quizzes/${quizId}`, null, activeStudentToken);
    assert(enrolledQuizGet.status === 200, 'Enrolled student can now access quiz');
    assert(enrolledQuizGet.data.quiz.questions[0].correctAnswer === undefined, 'Answer key is redacted from student quiz retrieval');
    assert(enrolledQuizGet.data.quiz.questions[0].explanation === undefined, 'Answer explanation is redacted from student quiz retrieval');

    // =========================================================================
    // AUDIT CHECK 7: Sensitive Information in API Responses
    // =========================================================================
    console.log('\n🔹 CHECK 16: Sensitive PII Exposure Defense');
    const publicCourseView = await request('GET', `/api/courses/${courseId}`);
    assert(publicCourseView.status === 200, 'Public course details retrieved');
    assert(publicCourseView.data.course.instructor.email === undefined, 'Instructor private email is NOT exposed in public course view');

    // Certificate generation & verification PII check
    const certCode = 'CERT-AUDIT-SAFE-123';
    const certDoc = await Certificate.create({
      student: studentUser.id,
      course: courseId,
      certificateId: certCode,
      grade: 'Distinction',
      instructorName: 'Dr. John Watson',
    });
    const certView = await request('GET', `/api/certificates/${certDoc._id}`);
    assert(certView.status === 200, 'Certificate details retrieved');
    assert(certView.data.certificate.student.email === undefined, 'Student private email is NOT exposed in certificate view');

    // =========================================================================
    // AUDIT CHECK 8: Chat Room IDOR Eavesdropping Defense
    // =========================================================================
    console.log('\n🔹 CHECK 2 & 4: Chat Room IDOR Eavesdropping Defense');
    // Student attempts to query a private 1-on-1 direct room between inst1 and inst2
    const fakeDirectRoom = `direct_${inst1Id}_${inst2Res.data.user.id}`;
    const eavesdropRes = await request('GET', `/api/chat/room/${fakeDirectRoom}`, null, activeStudentToken);
    assert(eavesdropRes.status === 403, 'Unauthorized third-party student blocked from querying private direct room (403 Forbidden)');

    // =========================================================================
    // AUDIT CHECK 9: Rate Limiting & Brute-Force Defense
    // =========================================================================
    console.log('\n🔹 CHECK 15: Missing Rate Limiting & Brute-Force Defense');
    let rateLimited = false;
    for (let i = 0; i < 20; i++) {
      const floodRes = await request('POST', '/api/auth/login', {
        email: 'nobody@security.com',
        password: 'wrongpassword',
      });
      if (floodRes.status === 429) {
        rateLimited = true;
        assert(Boolean(floodRes.headers.get('ratelimit-limit')), 'RateLimit-Limit header is returned');
        assert(Boolean(floodRes.headers.get('retry-after')), 'Retry-After header is returned');
        break;
      }
    }
    assert(rateLimited, 'Authentication endpoint enforces rate limiting (HTTP 429 returned after excessive attempts)');

    // =========================================================================
    // AUDIT CHECK 10: Exposed Secrets & Environment File Checks
    // =========================================================================
    console.log('\n🔹 CHECK 7 & 17: Exposed Secrets & Repository Hygiene');
    const serverGitignoreExists = fs.existsSync(path.resolve('.gitignore'));
    const rootGitignoreExists = fs.existsSync(path.resolve('../../.gitignore'));
    const envExampleExists = fs.existsSync(path.resolve('.env.example'));

    assert(serverGitignoreExists, 'Server/.gitignore exists and is active');
    assert(rootGitignoreExists, 'Root .gitignore exists to prevent .env commits');
    assert(envExampleExists, 'Server/.env.example template exists without secrets');

    const gitignoreContent = fs.readFileSync(path.resolve('.gitignore'), 'utf8');
    assert(gitignoreContent.includes('.env'), 'Server/.gitignore explicitly ignores .env files');

    // =========================================================================
    // AUDIT CHECK 11: Socket.IO Authentication & Room Authorization
    // =========================================================================
    console.log('\n🔹 CHECK 21: Socket.IO Authentication & Anti-Eavesdropping');
    // Socket connection without token rejected
    let unauthSocketConnected = false;
    try {
      const clientSocketUnauth = Client(`${baseUrl}`, {
        transports: ['websocket'],
        reconnection: false,
        timeout: 1000,
      });
      await new Promise((resolve, reject) => {
        clientSocketUnauth.on('connect', () => {
          unauthSocketConnected = true;
          resolve();
        });
        clientSocketUnauth.on('connect_error', () => {
          resolve(); // Rejected as expected
        });
      });
      clientSocketUnauth.disconnect();
    } catch (e) {}
    assert(!unauthSocketConnected, 'Socket.IO rejects unauthenticated connection handshakes without token');

    // Socket connection with valid student token
    const clientSocketAuth = Client(`${baseUrl}`, {
      transports: ['websocket'],
      auth: { token: activeStudentToken },
      reconnection: false,
    });
    let authSocketConnected = false;
    await new Promise((resolve) => {
      clientSocketAuth.on('connect', () => {
        authSocketConnected = true;
        resolve();
      });
    });
    assert(authSocketConnected, 'Socket.IO accepts connection handshake with valid JWT');

    // Student attempts to join another user's private direct room via socket
    let eavesdropBlocked = false;
    clientSocketAuth.emit('join_room', fakeDirectRoom, (ack) => {
      if (ack && ack.error) eavesdropBlocked = true;
    });
    await new Promise((r) => setTimeout(r, 200));
    assert(eavesdropBlocked, 'Socket.IO blocks unauthorized client from joining private direct_* room');
    clientSocketAuth.disconnect();

    // =========================================================================
    // SUMMARY REPORT
    // =========================================================================
    console.log('\n================================================================');
    console.log(`🏁 SECURITY AUDIT COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      throw new Error(`Security Audit failed with ${failed} issues.`);
    }
  } finally {
    if (httpServer) httpServer.close();
    if (ioServer) ioServer.close();
    if (mongoose.connection) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
    process.exit(0);
  }
}

runSecurityAudit().catch((err) => {
  console.error('\n❌ SECURITY AUDIT SUITE ENCOUNTERED AN ERROR:', err);
  process.exit(1);
});
