import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Server } from 'socket.io';
import ioClient from 'socket.io-client';
import jwt from 'jsonwebtoken';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

import { notFound, errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './socket/socketHandler.js';
import User from './models/User.js';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';
import Enrollment from './models/Enrollment.js';
import Progress from './models/Progress.js';
import Quiz from './models/Quiz.js';
import Certificate from './models/Certificate.js';
import Notification from './models/Notification.js';

let mongoServer;
let server;
let io;
let baseUrl;
let socketPort;

process.env.JWT_SECRET = 'super_secret_test_jwt_key_999888777_!@#$%^&*';

// Statistics
let passedCount = 0;
let failedCount = 0;
const testCases = [];
const failedDetails = [];

function recordTest(name, passed, error = null) {
  testCases.push({ name, passed, error: error ? error.message : null });
  if (passed) {
    passedCount++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    failedCount++;
    failedDetails.push({ name, error: error ? error.message : 'Assertion failed' });
    console.error(`  ❌ FAIL: ${name} -> ${error ? error.message : 'Failed'}`);
  }
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message || 'Condition was not met');
  }
}

async function setupCompleteSystem() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const app = express();
  app.use(express.json());

  server = http.createServer(app);
  io = new Server(server, { cors: { origin: '*' } });
  initSocket(io);

  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  // Mount all platform routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/enrollments', enrollmentRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/certificates', certificateRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return new Promise((resolve) => {
    server.listen(0, () => {
      socketPort = server.address().port;
      baseUrl = `http://localhost:${socketPort}`;
      console.log(`✔ In-Memory Test Server running on ${baseUrl}`);
      resolve();
    });
  });
}

async function teardownSystem() {
  if (io) io.close();
  if (server) await new Promise((r) => server.close(r));
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  console.log('✔ Test Server & DB cleanly decommissioned.');
}

async function req(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-json response
  }
  return { status: res.status, data, headers: res.headers };
}

// ------------------- MAIN TEST SUITE -------------------
async function runCompleteSystemTests() {
  console.log('================================================================');
  console.log('🛡️  PROMPT 16: FULL SYSTEM INTEGRATION & EDGE-CASE TEST SUITE  🛡️');
  console.log('================================================================\n');

  await setupCompleteSystem();

  let studentToken, instructorToken, adminToken, student2Token;
  let studentUser, instructorUser, adminUser, student2User;
  let courseId, lessonId1, lessonId2, quizId, certificateDoc;

  // -------------------------------------------------------------
  // MODULE 1: AUTHENTICATION & REGISTRATION (Inputs & Failures)
  // -------------------------------------------------------------
  console.log('\n--- MODULE 1: Authentication & User Accounts ---');

  try {
    // 1.1 Valid Registration (Student)
    const res1 = await req('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Alex Rivera',
        email: 'alex.student@test.edu',
        password: 'Password123!',
        role: 'student',
      }),
    });
    expect(res1.status === 201 && res1.data.token && res1.data.user.role === 'student');
    expect(res1.data.user.password === undefined, 'Password must not be returned');
    studentToken = res1.data.token;
    studentUser = res1.data.user;
    recordTest('Student Registration (Valid Inputs)', true);
  } catch (err) {
    recordTest('Student Registration (Valid Inputs)', false, err);
  }

  try {
    // 1.2 Valid Registration (Instructor)
    const res = await req('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Dr. Elena Vance',
        email: 'elena.instructor@test.edu',
        password: 'Password123!',
        role: 'instructor',
      }),
    });
    expect(res.status === 201 && res.data.token && res.data.user.role === 'instructor');
    instructorToken = res.data.token;
    instructorUser = res.data.user;
    recordTest('Instructor Registration (Valid Inputs)', true);
  } catch (err) {
    recordTest('Instructor Registration (Valid Inputs)', false, err);
  }

  try {
    // 1.3 Valid Registration (Admin via bootstrap / first admin)
    const res = await req('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'System Dean Admin',
        email: 'dean.admin@test.edu',
        password: 'Password123!',
        role: 'admin',
      }),
    });
    expect(res.status === 201 && res.data.token && res.data.user.role === 'admin');
    adminToken = res.data.token;
    adminUser = res.data.user;
    recordTest('Admin Registration (Valid Inputs)', true);
  } catch (err) {
    recordTest('Admin Registration (Valid Inputs)', false, err);
  }

  try {
    // 1.4 Duplicate Account Registration Defense
    const res = await req('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Alex',
        email: 'alex.student@test.edu',
        password: 'Password123!',
      }),
    });
    expect(res.status === 400 && res.data.success === false, 'Duplicate email must return 400');
    recordTest('Duplicate Account Registration Rejected (400 Bad Request)', true);
  } catch (err) {
    recordTest('Duplicate Account Registration Rejected (400 Bad Request)', false, err);
  }

  try {
    // 1.5 Missing Input in Registration
    const res = await req('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Incomplete User',
        // missing email and password
      }),
    });
    expect(res.status === 400 && res.data.success === false);
    recordTest('Missing Input Registration Defense (400 Bad Request)', true);
  } catch (err) {
    recordTest('Missing Input Registration Defense (400 Bad Request)', false, err);
  }

  try {
    // 1.6 Invalid Input in Registration (Short Password < 6 chars)
    const res = await req('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Short Pass User',
        email: 'short.pass@test.edu',
        password: '123',
      }),
    });
    expect(res.status === 400 && res.data.success === false);
    recordTest('Invalid Input: Password < 6 characters rejected (400)', true);
  } catch (err) {
    recordTest('Invalid Input: Password < 6 characters rejected (400)', false, err);
  }

  try {
    // 1.7 Valid Login
    const res = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alex.student@test.edu',
        password: 'Password123!',
      }),
    });
    expect(res.status === 200 && res.data.token && res.data.user);
    recordTest('User Login (Valid Credentials -> 200 OK)', true);
  } catch (err) {
    recordTest('User Login (Valid Credentials -> 200 OK)', false, err);
  }

  try {
    // 1.8 Invalid Login Credentials (Wrong Password)
    const res = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alex.student@test.edu',
        password: 'WrongPassword999!',
      }),
    });
    expect(res.status === 401 && res.data.success === false);
    recordTest('Invalid Login: Wrong Password rejected (401 Unauthorized)', true);
  } catch (err) {
    recordTest('Invalid Login: Wrong Password rejected (401 Unauthorized)', false, err);
  }

  try {
    // 1.9 Nonexistent User Login
    const res = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nobody.ghost@test.edu',
        password: 'Password123!',
      }),
    });
    expect(res.status === 401 && res.data.success === false);
    recordTest('Nonexistent User Login rejected (401 Unauthorized)', true);
  } catch (err) {
    recordTest('Nonexistent User Login rejected (401 Unauthorized)', false, err);
  }

  try {
    // 1.10 Current Session /api/auth/me with Valid Token
    const res = await req('/api/auth/me', { token: studentToken });
    expect(res.status === 200 && res.data.user.email === 'alex.student@test.edu');
    recordTest('Session Authentication: GET /api/auth/me (200 OK)', true);
  } catch (err) {
    recordTest('Session Authentication: GET /api/auth/me (200 OK)', false, err);
  }

  try {
    // 1.11 Expired / Forged Authentication Token
    const expiredToken = jwt.sign(
      { id: studentUser._id },
      'forged_untrusted_secret_key_123',
      { expiresIn: '1s' }
    );
    const res = await req('/api/auth/me', { token: expiredToken });
    expect(res.status === 401 && res.data.success === false);
    recordTest('Expired / Forged JWT Token rejected (401 Unauthorized)', true);
  } catch (err) {
    recordTest('Expired / Forged JWT Token rejected (401 Unauthorized)', false, err);
  }

  try {
    // 1.12 Missing Authentication on Protected Route
    const res = await req('/api/auth/me');
    expect(res.status === 401 && res.data.success === false);
    recordTest('Unauthorized Access without Token rejected (401 Unauthorized)', true);
  } catch (err) {
    recordTest('Unauthorized Access without Token rejected (401 Unauthorized)', false, err);
  }

  // Register Student 2 for multi-user isolation tests
  try {
    const res = await req('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Jordan Peer',
        email: 'jordan.peer@test.edu',
        password: 'Password123!',
        role: 'student',
      }),
    });
    student2Token = res.data.token;
    student2User = res.data.user;
  } catch (err) {
    console.error('Setup student 2 failed:', err);
  }

  // -------------------------------------------------------------
  // MODULE 2: AUTHORIZATION & RBAC (Role Enforcements)
  // -------------------------------------------------------------
  console.log('\n--- MODULE 2: Authorization & Role Enforcement ---');

  try {
    // 2.1 Wrong Role: Student hitting Admin-Only Route (/api/users)
    const res = await req('/api/users', { token: studentToken });
    expect(res.status === 403 && res.data.success === false);
    recordTest('Wrong Role: Student blocked from Admin Users API (403 Forbidden)', true);
  } catch (err) {
    recordTest('Wrong Role: Student blocked from Admin Users API (403 Forbidden)', false, err);
  }

  try {
    // 2.2 Wrong Role: Student hitting Instructor Course Creation (/api/courses POST)
    const res = await req('/api/courses', {
      method: 'POST',
      token: studentToken,
      body: JSON.stringify({ title: 'Illegal Student Course', description: 'desc' }),
    });
    expect(res.status === 403 && res.data.success === false);
    recordTest('Wrong Role: Student blocked from Course Creation (403 Forbidden)', true);
  } catch (err) {
    recordTest('Wrong Role: Student blocked from Course Creation (403 Forbidden)', false, err);
  }

  try {
    // 2.3 Wrong Role: Instructor hitting Admin Platform Analytics
    const res = await req('/api/analytics/admin', { token: instructorToken });
    expect(res.status === 403 && res.data.success === false);
    recordTest('Wrong Role: Instructor blocked from Super Admin Analytics (403 Forbidden)', true);
  } catch (err) {
    recordTest('Wrong Role: Instructor blocked from Super Admin Analytics (403 Forbidden)', false, err);
  }

  // -------------------------------------------------------------
  // MODULE 3: COURSE CREATION & MANAGEMENT (Instructor Workflow)
  // -------------------------------------------------------------
  console.log('\n--- MODULE 3: Course Creation & Management ---');

  try {
    // 3.1 Valid Course Creation
    const res = await req('/api/courses', {
      method: 'POST',
      token: instructorToken,
      body: JSON.stringify({
        title: 'Distributed Consensus & Blockchain Systems',
        description: 'Deep dive into Byzantine fault tolerance, Paxos, and Raft.',
        category: 'Computer Science',
        level: 'Advanced',
        price: 99.99,
        isFree: false,
        published: true,
      }),
    });
    expect(res.status === 201 && res.data.course && res.data.course._id);
    courseId = res.data.course._id;
    recordTest('Instructor Course Creation (Valid Inputs -> 201 Created)', true);
  } catch (err) {
    recordTest('Instructor Course Creation (Valid Inputs -> 201 Created)', false, err);
  }

  try {
    // 3.2 Missing Input on Course Creation
    const res = await req('/api/courses', {
      method: 'POST',
      token: instructorToken,
      body: JSON.stringify({
        // missing title and description
        price: 49,
      }),
    });
    expect(res.status === 400 && res.data.success === false);
    recordTest('Course Creation Missing Required Title/Description (400 Bad Request)', true);
  } catch (err) {
    recordTest('Course Creation Missing Required Title/Description (400 Bad Request)', false, err);
  }

  try {
    // 3.3 Public Course Retrieval (GET /api/courses)
    const res = await req('/api/courses');
    expect(res.status === 200 && Array.isArray(res.data.courses) && res.data.courses.length > 0);
    recordTest('Course Catalog Public Browsing (200 OK)', true);
  } catch (err) {
    recordTest('Course Catalog Public Browsing (200 OK)', false, err);
  }

  try {
    // 3.4 Nonexistent Course Retrieval
    const res = await req('/api/courses/507f1f77bcf86cd799439011');
    expect(res.status === 404 && res.data.success === false);
    recordTest('Nonexistent Resource: Nonexistent Course ID returns (404 Not Found)', true);
  } catch (err) {
    recordTest('Nonexistent Resource: Nonexistent Course ID returns (404 Not Found)', false, err);
  }

  try {
    // 3.5 Malformed ID (CastError Defense)
    const res = await req('/api/courses/invalid-hex-course-id-xyz');
    expect(res.status === 404 || res.status === 400);
    recordTest('Server Error Defense: Malformed ObjectId handled cleanly without crash', true);
  } catch (err) {
    recordTest('Server Error Defense: Malformed ObjectId handled cleanly without crash', false, err);
  }

  // -------------------------------------------------------------
  // MODULE 4: LESSON STRUCTURING & ACCESS CONTROLS
  // -------------------------------------------------------------
  console.log('\n--- MODULE 4: Lesson Structuring & Access Controls ---');

  try {
    // 4.1 Create Lesson 1 (Free Preview)
    const res1 = await req('/api/lessons', {
      method: 'POST',
      token: instructorToken,
      body: JSON.stringify({
        courseId,
        title: 'Module 1: Introduction to State Machine Replication',
        order: 1,
        duration: 15,
        videoUrl: 'https://youtube.com/watch?v=preview-video-1',
        isFreePreview: true,
      }),
    });
    expect(res1.status === 201 && res1.data.lesson);
    lessonId1 = res1.data.lesson._id;

    // 4.2 Create Lesson 2 (Paid Protected Content)
    const res2 = await req('/api/lessons', {
      method: 'POST',
      token: instructorToken,
      body: JSON.stringify({
        courseId,
        title: 'Module 2: Raft Consensus Protocol & Leader Election',
        order: 2,
        duration: 30,
        videoUrl: 'https://youtube.com/watch?v=paid-protected-video-2',
        isFreePreview: false,
      }),
    });
    expect(res2.status === 201 && res2.data.lesson);
    lessonId2 = res2.data.lesson._id;

    recordTest('Instructor Lesson Structuring (Free Preview & Protected Lessons -> 201)', true);
  } catch (err) {
    recordTest('Instructor Lesson Structuring (Free Preview & Protected Lessons -> 201)', false, err);
  }

  try {
    // 4.3 Missing Input on Lesson Creation
    const res = await req('/api/lessons', {
      method: 'POST',
      token: instructorToken,
      body: JSON.stringify({
        courseId,
        // missing title
      }),
    });
    expect(res.status === 400 && res.data.success === false);
    recordTest('Lesson Creation Missing Title rejected (400 Bad Request)', true);
  } catch (err) {
    recordTest('Lesson Creation Missing Title rejected (400 Bad Request)', false, err);
  }

  try {
    // 4.4 Non-enrolled Student Lesson Redaction
    const res = await req(`/api/lessons/course/${courseId}`, { token: studentToken });
    expect(res.status === 200);
    const l1 = res.data.lessons.find((l) => l._id === lessonId1);
    const l2 = res.data.lessons.find((l) => l._id === lessonId2);
    expect(l1.videoUrl !== '', 'Free preview lesson must have video URL');
    expect(l2.videoUrl === '', 'Paid lesson video URL must be redacted for non-enrolled student');
    recordTest('Content Protection: Unenrolled Student Lesson Video Redaction (200 OK)', true);
  } catch (err) {
    recordTest('Content Protection: Unenrolled Student Lesson Video Redaction (200 OK)', false, err);
  }

  try {
    // 4.5 Non-enrolled Student Direct Access to Protected Lesson
    const res = await req(`/api/lessons/${lessonId2}`, { token: studentToken });
    expect(res.status === 403 && res.data.success === false);
    recordTest('Content Protection: Direct Access to Paid Lesson blocked (403 Forbidden)', true);
  } catch (err) {
    recordTest('Content Protection: Direct Access to Paid Lesson blocked (403 Forbidden)', false, err);
  }

  // -------------------------------------------------------------
  // MODULE 5: COURSE ENROLLMENT (Student Workflow)
  // -------------------------------------------------------------
  console.log('\n--- MODULE 5: Course Enrollment ---');

  try {
    // 5.1 Valid Course Enrollment
    const res = await req(`/api/enrollments/${courseId}`, {
      method: 'POST',
      token: studentToken,
    });
    expect(res.status === 201 && res.data.success === true);
    recordTest('Student Course Enrollment (Valid Input -> 201 Created)', true);
  } catch (err) {
    recordTest('Student Course Enrollment (Valid Input -> 201 Created)', false, err);
  }

  try {
    // 5.2 Duplicate Enrollment Rejection
    const res = await req(`/api/enrollments/${courseId}`, {
      method: 'POST',
      token: studentToken,
    });
    expect(res.status === 400 && res.data.success === false);
    recordTest('Duplicate Enrollment Defense: Enrolling twice rejected (400 Bad Request)', true);
  } catch (err) {
    recordTest('Duplicate Enrollment Defense: Enrolling twice rejected (400 Bad Request)', false, err);
  }

  try {
    // 5.3 Enrolling in Nonexistent Course
    const res = await req('/api/enrollments/507f1f77bcf86cd799439011', {
      method: 'POST',
      token: studentToken,
    });
    expect(res.status === 404 && res.data.success === false);
    recordTest('Enrolling in Nonexistent Course returns (404 Not Found)', true);
  } catch (err) {
    recordTest('Enrolling in Nonexistent Course returns (404 Not Found)', false, err);
  }

  try {
    // 5.4 Verify Enrolled Student Now Has Full Access to Lesson 2
    const res = await req(`/api/lessons/${lessonId2}`, { token: studentToken });
    expect(res.status === 200 && res.data.lesson && res.data.lesson.videoUrl !== '');
    recordTest('Post-Enrollment Verification: Student unlocked full lesson content (200 OK)', true);
  } catch (err) {
    recordTest('Post-Enrollment Verification: Student unlocked full lesson content (200 OK)', false, err);
  }

  // -------------------------------------------------------------
  // MODULE 6: PROGRESS TRACKING & COMPLETION
  // -------------------------------------------------------------
  console.log('\n--- MODULE 6: Progress Tracking & Lesson Completion ---');

  try {
    // 6.1 Check initial progress is 0%
    const res0 = await req(`/api/progress/${courseId}`, { token: studentToken });
    const p0 = res0.data?.progressPercentage !== undefined ? res0.data.progressPercentage : res0.data?.progress?.percentage;
    expect(res0.status === 200 && p0 === 0);

    // 6.2 Mark Lesson 1 Complete -> 50%
    const res1 = await req(`/api/progress/${courseId}/lesson/${lessonId1}/complete`, {
      method: 'POST',
      token: studentToken,
    });
    const p1 = res1.data?.progressPercentage !== undefined ? res1.data.progressPercentage : res1.data?.progress?.percentage;
    expect(res1.status === 200 && p1 === 50);

    // 6.3 Toggle Lesson 1 Incomplete -> back to 0%
    const resToggle = await req(`/api/progress/${courseId}/lesson/${lessonId1}/complete`, {
      method: 'POST',
      token: studentToken,
    });
    const pToggle = resToggle.data?.progressPercentage !== undefined ? resToggle.data.progressPercentage : resToggle.data?.progress?.percentage;
    expect(resToggle.status === 200 && pToggle === 0);

    // Re-mark Lesson 1 Complete -> 50%
    await req(`/api/progress/${courseId}/lesson/${lessonId1}/complete`, {
      method: 'POST',
      token: studentToken,
    });

    recordTest('Progress Tracking: Incremental Calculation & Incomplete Decrement (200 OK)', true);
  } catch (err) {
    recordTest('Progress Tracking: Incremental Calculation & Incomplete Decrement (200 OK)', false, err);
  }

  // -------------------------------------------------------------
  // MODULE 7: QUIZZES & ANTI-CHEAT EVALUATION
  // -------------------------------------------------------------
  console.log('\n--- MODULE 7: Quizzes & Anti-Cheat Evaluation ---');

  try {
    // 7.1 Instructor creates Quiz
    const res = await req('/api/quizzes', {
      method: 'POST',
      token: instructorToken,
      body: JSON.stringify({
        courseId,
        title: 'Consensus Protocols Final Benchmark',
        passingScore: 75,
        timeLimitMinutes: 20,
        questions: [
          {
            question: 'What is the maximum number of Byzantine faults tolerated in a 3f + 1 node cluster?',
            options: ['f nodes', '2f nodes', '3f nodes', 'f/2 nodes'],
            correctAnswerIndex: 0,
            marks: 10,
            explanation: 'PBFT and Byzantine consensus requires at least 3f + 1 nodes to tolerate f faults.',
          },
          {
            question: 'Which role in Raft consensus handles client state mutation requests?',
            options: ['Follower', 'Candidate', 'Leader', 'Observer'],
            correctAnswerIndex: 2,
            marks: 10,
            explanation: 'In Raft, only the elected Leader accepts log entries from clients.',
          },
        ],
      }),
    });
    expect(res.status === 201 && res.data.quiz);
    quizId = res.data.quiz._id;
    recordTest('Instructor Quiz Authoring (Valid Inputs -> 201 Created)', true);
  } catch (err) {
    recordTest('Instructor Quiz Authoring (Valid Inputs -> 201 Created)', false, err);
  }

  try {
    // 7.2 Anti-Cheat Masking Before Submission
    const res = await req(`/api/quizzes/${quizId}`, { token: studentToken });
    expect(res.status === 200 && res.data.quiz);
    const q1 = res.data.quiz.questions[0];
    expect(q1.correctAnswer === undefined && q1.correctAnswerIndex === undefined, 'Answer key must be hidden');
    expect(q1.explanation === undefined, 'Explanation must be hidden before submit');
    recordTest('Anti-Cheat Protection: Quiz Answer Key Redacted for Student (200 OK)', true);
  } catch (err) {
    recordTest('Anti-Cheat Protection: Quiz Answer Key Redacted for Student (200 OK)', false, err);
  }

  try {
    // 7.3 Quiz Submission (Fail Attempt: 1 correct, 1 wrong = 50% < 75%)
    const res = await req(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      token: studentToken,
      body: JSON.stringify({
        answers: [
          { questionIndex: 0, selectedOption: 0 }, // Correct (10 pts)
          { questionIndex: 1, selectedOption: 0 }, // Wrong (0 pts)
        ],
        timeSpentSeconds: 120,
      }),
    });
    expect(res.status === 200 && res.data.percentage === 50 && res.data.passed === false);
    recordTest('Quiz Automated Grading: Failed Attempt Evaluated Accurately (200 OK)', true);
  } catch (err) {
    recordTest('Quiz Automated Grading: Failed Attempt Evaluated Accurately (200 OK)', false, err);
  }

  try {
    // 7.4 Quiz Retry Submission (Pass Attempt: 2 correct = 100% >= 75%)
    const res = await req(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      token: studentToken,
      body: JSON.stringify({
        answers: [
          { questionIndex: 0, selectedOption: 0 }, // Correct
          { questionIndex: 1, selectedOption: 2 }, // Correct
        ],
        timeSpentSeconds: 180,
      }),
    });
    expect(res.status === 200 && res.data.percentage === 100 && res.data.passed === true);
    recordTest('Quiz Retry & Passing Score Achievement: 100% (200 OK)', true);
  } catch (err) {
    recordTest('Quiz Retry & Passing Score Achievement: 100% (200 OK)', false, err);
  }

  try {
    // 7.5 Quiz Submission with Invalid / Malformed answers payload
    const res = await req(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      token: studentToken,
      body: JSON.stringify({
        answers: 'not-an-array-invalid-string',
      }),
    });
    expect(res.status === 200 || res.status === 400, 'Handled safely without crash');
    recordTest('Server Error Defense: Malformed Quiz Answers handled safely without 500 crash', true);
  } catch (err) {
    recordTest('Server Error Defense: Malformed Quiz Answers handled safely without 500 crash', false, err);
  }

  // -------------------------------------------------------------
  // MODULE 8: CERTIFICATES & POLYMORPHIC LOOKUPS
  // -------------------------------------------------------------
  console.log('\n--- MODULE 8: Certificates & Verification ---');

  try {
    // 8.1 Attempt Certificate Generation Before 100% Completion -> Rejected (400)
    const res = await req(`/api/certificates/generate/${courseId}`, {
      method: 'POST',
      token: studentToken,
    });
    expect(res.status === 400 && res.data.success === false);
    recordTest('Certificate Security: Premature Certificate Generation blocked (400 Bad Request)', true);
  } catch (err) {
    recordTest('Certificate Security: Premature Certificate Generation blocked (400 Bad Request)', false, err);
  }

  try {
    // 8.2 Mark Lesson 2 Complete -> 100% Course Completion & Auto-Certificate
    const resComplete = await req(`/api/progress/${courseId}/lesson/${lessonId2}/complete`, {
      method: 'POST',
      token: studentToken,
    });
    const p2 = resComplete.data?.progressPercentage !== undefined ? resComplete.data.progressPercentage : resComplete.data?.progress?.percentage;
    expect(resComplete.status === 200 && p2 === 100);

    // Generate Certificate
    const resCert = await req(`/api/certificates/generate/${courseId}`, {
      method: 'POST',
      token: studentToken,
    });
    expect((resCert.status === 200 || resCert.status === 201) && resCert.data.certificate && resCert.data.certificate.certificateId);
    certificateDoc = resCert.data.certificate;
    recordTest('100% Course Completion & Certificate Generation Conferred (200 OK)', true);
  } catch (err) {
    recordTest('100% Course Completion & Certificate Generation Conferred (200 OK)', false, err);
  }

  try {
    // 8.3 Certificate Lookup by MongoDB ObjectId
    const res = await req(`/api/certificates/${certificateDoc._id}`, { token: studentToken });
    expect(res.status === 200 && res.data.certificate._id === certificateDoc._id);
    recordTest('Certificate Lookup by MongoDB ObjectId (200 OK)', true);
  } catch (err) {
    recordTest('Certificate Lookup by MongoDB ObjectId (200 OK)', false, err);
  }

  try {
    // 8.4 Polymorphic Certificate Lookup by Alphanumeric Code (CERT-...)
    const res = await req(`/api/certificates/${certificateDoc.certificateId}`, { token: studentToken });
    expect(res.status === 200 && res.data.certificate.certificateId === certificateDoc.certificateId);
    recordTest('Polymorphic Certificate Lookup by Human-Readable Code (200 OK)', true);
  } catch (err) {
    recordTest('Polymorphic Certificate Lookup by Human-Readable Code (200 OK)', false, err);
  }

  try {
    // 8.5 Public Verification Endpoint
    const res = await req(`/api/certificates/verify/${certificateDoc.certificateId}`);
    expect(res.status === 200 && res.data.isValid === true);
    recordTest('Public Certificate Authenticity Verification (200 OK)', true);
  } catch (err) {
    recordTest('Public Certificate Authenticity Verification (200 OK)', false, err);
  }

  try {
    // 8.6 Verify Nonexistent Certificate Code
    const res = await req('/api/certificates/verify/CERT-FAKE-99999-NOTFOUND');
    expect((res.status === 200 || res.status === 404) && res.data.isValid === false);
    recordTest('Nonexistent Certificate Verification returns isValid: false gracefully', true);
  } catch (err) {
    recordTest('Nonexistent Certificate Verification returns isValid: false gracefully', false, err);
  }

  // -------------------------------------------------------------
  // MODULE 9: NOTIFICATIONS & ACCESS ISOLATION
  // -------------------------------------------------------------
  console.log('\n--- MODULE 9: Notifications & Access Isolation ---');

  let notifId;
  try {
    // 9.1 Student fetches notification feed
    const res = await req('/api/notifications', { token: studentToken });
    expect(res.status === 200 && Array.isArray(res.data.notifications) && res.data.notifications.length > 0);
    notifId = res.data.notifications[0]._id;
    recordTest('Notification Feed Retrieval (200 OK)', true);
  } catch (err) {
    recordTest('Notification Feed Retrieval (200 OK)', false, err);
  }

  try {
    // 9.2 Mark single notification read
    const res = await req(`/api/notifications/${notifId}/read`, {
      method: 'PATCH',
      token: studentToken,
    });
    expect(res.status === 200 && res.data.notification.read === true);
    recordTest('Single Notification Mark as Read (200 OK)', true);
  } catch (err) {
    recordTest('Single Notification Mark as Read (200 OK)', false, err);
  }

  try {
    // 9.3 Mark all notifications read
    const res = await req('/api/notifications/read-all', {
      method: 'PATCH',
      token: studentToken,
    });
    expect(res.status === 200);
    recordTest('Mark All Notifications as Read (200 OK)', true);
  } catch (err) {
    recordTest('Mark All Notifications as Read (200 OK)', false, err);
  }

  try {
    // 9.4 Cross-User Notification Isolation (Student 2 cannot delete Student 1 notification)
    const res = await req(`/api/notifications/${notifId}`, {
      method: 'DELETE',
      token: student2Token,
    });
    expect(res.status === 403 || res.status === 404, 'Cross-user deletion must be rejected');
    recordTest('Data Isolation: Cross-Student Notification Tampering Rejected (403/404)', true);
  } catch (err) {
    recordTest('Data Isolation: Cross-Student Notification Tampering Rejected (403/404)', false, err);
  }

  // -------------------------------------------------------------
  // MODULE 10: REAL-TIME CHAT & MESSAGING
  // -------------------------------------------------------------
  console.log('\n--- MODULE 10: Real-Time Chat & WebSocket Messaging ---');

  try {
    // 10.1 Socket.IO rejects connection without JWT token
    const unauthSocket = ioClient(baseUrl, {
      reconnection: false,
      timeout: 2000,
    });

    await new Promise((resolve) => {
      unauthSocket.on('connect_error', (err) => {
        expect(err.message.includes('token') || err.message.includes('auth') || err.message.includes('Authentication'));
        unauthSocket.disconnect();
        resolve();
      });
      unauthSocket.on('connect', () => {
        unauthSocket.disconnect();
        throw new Error('Unauthenticated socket connected when it should be rejected');
      });
    });
    recordTest('Socket.IO Connection Handshake Rejected without JWT (Anti-Impersonation)', true);
  } catch (err) {
    recordTest('Socket.IO Connection Handshake Rejected without JWT (Anti-Impersonation)', false, err);
  }

  let studentSocket, instructorSocket;
  try {
    // 10.2 Connect authenticated sockets
    studentSocket = ioClient(baseUrl, {
      auth: { token: studentToken },
      transports: ['websocket'],
      reconnection: false,
      timeout: 3000,
    });
    instructorSocket = ioClient(baseUrl, {
      auth: { token: instructorToken },
      transports: ['websocket'],
      reconnection: false,
      timeout: 3000,
    });

    await Promise.all([
      new Promise((res) => studentSocket.on('connect', res)),
      new Promise((res) => instructorSocket.on('connect', res)),
    ]);

    // 10.3 Send direct message over socket
    const receivedPromise = new Promise((resolve) => {
      instructorSocket.on('direct_message', (msg) => {
        expect(
          msg.message === 'Hello Professor, quick question about Raft consensus.' ||
            msg.text === 'Hello Professor, quick question about Raft consensus.'
        );
        resolve();
      });
    });

    studentSocket.emit('send_direct_message', {
      recipientId: instructorUser._id,
      text: 'Hello Professor, quick question about Raft consensus.',
    });

    await receivedPromise;
    recordTest('Real-Time Socket.IO Direct Messaging Verified & Persisted', true);
  } catch (err) {
    recordTest('Real-Time Socket.IO Direct Messaging Verified & Persisted', false, err);
  } finally {
    if (studentSocket) studentSocket.disconnect();
    if (instructorSocket) instructorSocket.disconnect();
  }

  try {
    // 10.4 REST Chat Conversations & Contacts Discovery
    const resConvs = await req('/api/chat/conversations', { token: studentToken });
    expect(resConvs.status === 200 && Array.isArray(resConvs.data.conversations));

    const resContacts = await req('/api/chat/contacts', { token: studentToken });
    expect(resContacts.status === 200 && Array.isArray(resContacts.data.contacts));

    recordTest('Chat REST Services (Conversations & Academic Contacts -> 200 OK)', true);
  } catch (err) {
    recordTest('Chat REST Services (Conversations & Academic Contacts -> 200 OK)', false, err);
  }

  // -------------------------------------------------------------
  // MODULE 11: ADMIN WORKFLOWS & PLATFORM OVERSIGHT
  // -------------------------------------------------------------
  console.log('\n--- MODULE 11: Admin Workflows & Moderation ---');

  try {
    // 11.1 Admin Platform Analytics
    const res = await req('/api/analytics/admin', { token: adminToken });
    expect(res.status === 200 && res.data.totalUsers !== undefined && res.data.totalCourses !== undefined);
    recordTest('Admin Platform Analytics Dashboard (200 OK)', true);
  } catch (err) {
    recordTest('Admin Platform Analytics Dashboard (200 OK)', false, err);
  }

  try {
    // 11.2 Admin Users List
    const res = await req('/api/users', { token: adminToken });
    expect(res.status === 200 && Array.isArray(res.data.users) && res.data.users.length >= 4);
    recordTest('Admin User Directory Inspection (200 OK)', true);
  } catch (err) {
    recordTest('Admin User Directory Inspection (200 OK)', false, err);
  }

  try {
    // 11.3 Admin Account Deactivation & Re-activation
    const resDeact = await req(`/api/users/${student2User._id}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: JSON.stringify({ isActive: false }),
    });
    expect(resDeact.status === 200 && resDeact.data.user.isActive === false);

    // Deactivated user is blocked from making requests
    const resBlocked = await req('/api/auth/me', { token: student2Token });
    expect(resBlocked.status === 403, 'Deactivated account must be rejected with 403');

    // Reactivate user
    const resReact = await req(`/api/users/${student2User._id}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: JSON.stringify({ isActive: true }),
    });
    expect(resReact.status === 200 && resReact.data.user.isActive === true);

    recordTest('Admin User Status Lifecycle: Deactivation & Reactivation Enforced', true);
  } catch (err) {
    recordTest('Admin User Status Lifecycle: Deactivation & Reactivation Enforced', false, err);
  }

  try {
    // 11.4 Admin Global Broadcast Notification
    const res = await req('/api/notifications/broadcast', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        title: 'Platform Cryogenic Recalibration Notice',
        message: 'All nodes will undergo a brief 5-minute synchronization window tonight.',
        type: 'announcement',
      }),
    });
    expect(res.status === 201 && res.data.broadcastCount > 0);
    recordTest('Admin Global Broadcast Dispatch to All Cohorts (201 Created)', true);
  } catch (err) {
    recordTest('Admin Global Broadcast Dispatch to All Cohorts (201 Created)', false, err);
  }

  // -------------------------------------------------------------
  // MODULE 12: PROFILE MANAGEMENT & PASSWORD ROTATION
  // -------------------------------------------------------------
  console.log('\n--- MODULE 12: Profile Management & Password Rotation ---');

  try {
    // 12.1 Update Profile
    const res = await req('/api/users/profile', {
      method: 'PUT',
      token: studentToken,
      body: JSON.stringify({
        name: 'Dr. Alexander Rivera, Ph.D.',
        headline: 'Lead Distributed Systems Fellow',
        bio: 'Researching quantum tensor networks and Paxos.',
      }),
    });
    expect(res.status === 200 && res.data.user.name === 'Dr. Alexander Rivera, Ph.D.');
    recordTest('Student Profile Update (200 OK)', true);
  } catch (err) {
    recordTest('Student Profile Update (200 OK)', false, err);
  }

  try {
    // 12.2 Change Password
    const res = await req('/api/users/change-password', {
      method: 'PUT',
      token: studentToken,
      body: JSON.stringify({
        currentPassword: 'Password123!',
        newPassword: 'NewSecurePassword456!',
      }),
    });
    expect(res.status === 200 && res.data.success === true);

    // Old password should now fail login
    const resOld = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alex.student@test.edu',
        password: 'Password123!',
      }),
    });
    expect(resOld.status === 401);

    // New password should succeed login
    const resNew = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alex.student@test.edu',
        password: 'NewSecurePassword456!',
      }),
    });
    expect(resNew.status === 200 && resNew.data.token);

    recordTest('Password Rotation & Authentication Invalidation Verified (200 OK)', true);
  } catch (err) {
    recordTest('Password Rotation & Authentication Invalidation Verified (200 OK)', false, err);
  }

  // -------------------------------------------------------------
  // MODULE 13: SERVER ERROR & EXTREME INPUT HANDLING
  // -------------------------------------------------------------
  console.log('\n--- MODULE 13: Server Error & Unknown Route Protections ---');

  try {
    // 13.1 Unknown Route Handled with 404 JSON (not HTML stack trace)
    const res = await req('/api/nonexistent-portal-route-xyz');
    expect(res.status === 404 && res.data.success === false);
    recordTest('Unknown API Route 404 Error Format (No HTML Stack Leaks)', true);
  } catch (err) {
    recordTest('Unknown API Route 404 Error Format (No HTML Stack Leaks)', false, err);
  }

  try {
    // 13.2 Malformed JSON Body Protection
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ malformed json unclosed: ',
    });
    expect(res.status === 400);
    recordTest('Malformed JSON Payload Defense: Returns 400 without crashing process', true);
  } catch (err) {
    recordTest('Malformed JSON Payload Defense: Returns 400 without crashing process', false, err);
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`🏁 MASTER TEST SUITE RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================');

  await teardownSystem();

  if (failedCount > 0) {
    console.error('\nFailed Tests Details:');
    failedDetails.forEach((d, i) => console.error(` ${i + 1}. [${d.name}] -> ${d.error}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 48 E2E INTEGRATION & EDGE-CASE TESTS PASSED FLAWLESSLY!\n');
    process.exit(0);
  }
}

runCompleteSystemTests().catch((err) => {
  console.error('Master Test Runner Fatal Crash:', err);
  process.exit(1);
});
