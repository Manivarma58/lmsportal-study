import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

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

import { notFound, errorHandler } from './middleware/errorHandler.js';

let mongoServer;
let server;
let baseUrl;

process.env.JWT_SECRET = 'api_test_jwt_secret_key_987654321_!@#$';

async function setupTestServer() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const app = express();
  app.use(express.json());

  // Mount API routes exactly as in server.js
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/enrollments', enrollmentRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/certificates', certificateRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`✔ API Test Server running on ${baseUrl}`);
      resolve();
    });
  });
}

async function tearDown() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('✔ API Test Server and In-Memory MongoDB cleanly stopped.');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
}

async function runApiTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE REST API & SERVICES TEST SUITE 🚀');
  console.log('================================================================\n');

  await setupTestServer();

  let studentToken, instructorToken, adminToken;
  let studentUser, instructorUser;
  let courseId, lessonId, lessonId2, quizId, certificateId, certificateCode, notificationId;

  try {
    // =============================================================
    // 1. AUTH DOMAIN
    // =============================================================
    console.log('--- 1. Testing AUTH APIs ---');

    // Register Student
    const regStudent = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Student',
        email: 'alice.student@example.com',
        password: 'Password123!',
        role: 'student',
      }),
    });
    const regStudentData = await regStudent.json();
    assert(regStudent.status === 201, `Expected 201 for student register, got ${regStudent.status}`);
    studentToken = regStudentData.token;
    studentUser = regStudentData.user;
    console.log('✔ POST /api/auth/register (student) -> 201');

    // Register Instructor
    const regInst = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Instructor',
        email: 'bob.instructor@example.com',
        password: 'Password123!',
        role: 'instructor',
      }),
    });
    const regInstData = await regInst.json();
    assert(regInst.status === 201, `Expected 201 for instructor register, got ${regInst.status}`);
    instructorToken = regInstData.token;
    instructorUser = regInstData.user;
    console.log('✔ POST /api/auth/register (instructor) -> 201');

    // Register Admin
    const regAdmin = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Charlie Admin',
        email: 'charlie.admin@example.com',
        password: 'Password123!',
        role: 'admin',
      }),
    });
    const regAdminData = await regAdmin.json();
    assert(regAdmin.status === 201, `Expected 201 for admin register, got ${regAdmin.status}`);
    adminToken = regAdminData.token;
    console.log('✔ POST /api/auth/register (admin) -> 201');

    // Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.student@example.com',
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, `Expected 200 for login, got ${loginRes.status}`);
    assert(Boolean(loginData.token), 'Expected token in login');
    console.log('✔ POST /api/auth/login -> 200');

    // Logout
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });
    assert(logoutRes.status === 200, `Expected 200 for logout, got ${logoutRes.status}`);
    console.log('✔ POST /api/auth/logout -> 200');

    // Current User (GET /api/auth/me)
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, `Expected 200 for /auth/me, got ${meRes.status}`);
    assert(meData.user.email === 'alice.student@example.com', 'Incorrect user email returned');
    console.log('✔ GET /api/auth/me -> 200');

    // =============================================================
    // 2. USERS DOMAIN
    // =============================================================
    console.log('\n--- 2. Testing USERS APIs ---');

    // Get Profile
    const profileRes = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const profileData = await profileRes.json();
    assert(profileRes.status === 200, `Expected 200 for get profile, got ${profileRes.status}`);
    assert(profileData.user.name === 'Alice Student', 'Incorrect name in profile');
    console.log('✔ GET /api/users/profile -> 200');

    // Update Profile
    const updateProfileRes = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        headline: 'Aspiring Full Stack Engineer',
        bio: 'Learning Node.js, Mongoose & React',
      }),
    });
    const updateProfileData = await updateProfileRes.json();
    assert(updateProfileRes.status === 200, `Expected 200 for update profile, got ${updateProfileRes.status}`);
    assert(updateProfileData.user.headline === 'Aspiring Full Stack Engineer', 'Headline not updated');
    console.log('✔ PUT /api/users/profile -> 200');

    // Change Password
    const changePassRes = await fetch(`${baseUrl}/api/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword456!',
      }),
    });
    const changePassData = await changePassRes.json();
    assert(changePassRes.status === 200, `Expected 200 for change password, got ${changePassRes.status}`);
    assert(Boolean(changePassData.token), 'Expected new token after changing password');
    studentToken = changePassData.token;
    console.log('✔ PUT /api/users/change-password -> 200');

    // =============================================================
    // 3. COURSES DOMAIN
    // =============================================================
    console.log('\n--- 3. Testing COURSES APIs ---');

    // Create Course (as instructor)
    const createCourseRes = await fetch(`${baseUrl}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        title: 'Mastering Full Stack Architecture',
        description: 'Complete guide to building resilient distributed applications.',
        category: 'Web Development',
        level: 'Intermediate',
        price: 29.99,
        isFree: false,
        published: true,
        tags: ['FullStack', 'NodeJS', 'MongoDB'],
      }),
    });
    const createCourseData = await createCourseRes.json();
    assert(createCourseRes.status === 201, `Expected 201 for create course, got ${createCourseRes.status}`);
    courseId = createCourseData.course._id;
    console.log('✔ POST /api/courses -> 201');

    // Create second course for search/filtering verification
    await fetch(`${baseUrl}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        title: 'Python for Artificial Intelligence',
        description: 'Deep dive into PyTorch and Neural Networks.',
        category: 'Artificial Intelligence',
        level: 'Advanced',
        price: 0,
        isFree: true,
        published: true,
        tags: ['Python', 'AI'],
      }),
    });

    // Get All Courses with Search, Filtering, Sorting, and Pagination
    const getCoursesRes = await fetch(
      `${baseUrl}/api/courses?keyword=FullStack&category=Web%20Development&sort=price-high&page=1&limit=5`
    );
    const getCoursesData = await getCoursesRes.json();
    assert(getCoursesRes.status === 200, `Expected 200 for get courses, got ${getCoursesRes.status}`);
    assert(getCoursesData.courses.length >= 1, 'Search and filter returned 0 courses');
    assert(getCoursesData.page === 1, 'Expected page === 1');
    assert(getCoursesData.total >= 1, 'Expected total >= 1');
    console.log('✔ GET /api/courses (with pagination, search, category, sort) -> 200');

    // Get Course By ID
    const getCourseRes = await fetch(`${baseUrl}/api/courses/${courseId}`);
    const getCourseData = await getCourseRes.json();
    assert(getCourseRes.status === 200, `Expected 200 for get course by ID, got ${getCourseRes.status}`);
    assert(getCourseData.course._id === courseId, 'Course ID mismatch');
    console.log('✔ GET /api/courses/:id -> 200');

    // Update Course
    const updateCourseRes = await fetch(`${baseUrl}/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        title: 'Mastering Full Stack Architecture (Updated)',
        price: 39.99,
      }),
    });
    const updateCourseData = await updateCourseRes.json();
    assert(updateCourseRes.status === 200, `Expected 200 for update course, got ${updateCourseRes.status}`);
    assert(updateCourseData.course.title.includes('(Updated)'), 'Course title not updated');
    console.log('✔ PUT /api/courses/:id -> 200');

    // Publish/Unpublish Course
    const togglePubRes = await fetch(`${baseUrl}/api/courses/${courseId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    const togglePubData = await togglePubRes.json();
    assert(togglePubRes.status === 200, `Expected 200 for toggle publish, got ${togglePubRes.status}`);
    // toggle back to true
    await fetch(`${baseUrl}/api/courses/${courseId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    console.log('✔ PATCH /api/courses/:id/publish -> 200');

    // =============================================================
    // 4. LESSONS DOMAIN
    // =============================================================
    console.log('\n--- 4. Testing LESSONS APIs ---');

    // Create Lesson 1 (Free preview)
    const createL1Res = await fetch(`${baseUrl}/api/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        courseId,
        title: 'Lesson 1: Introduction to Service Oriented Architecture',
        order: 1,
        duration: 12,
        videoUrl: 'https://youtube.com/watch?v=demo1',
        isFreePreview: true,
      }),
    });
    const createL1Data = await createL1Res.json();
    assert(createL1Res.status === 201, `Expected 201 for create lesson 1, got ${createL1Res.status}`);
    lessonId = createL1Data.lesson._id;
    console.log('✔ POST /api/lessons (Lesson 1 - Preview) -> 201');

    // Create Lesson 2 (Paid content)
    const createL2Res = await fetch(`${baseUrl}/api/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        courseId,
        title: 'Lesson 2: Advanced Scalability Patterns',
        order: 2,
        duration: 25,
        videoUrl: 'https://youtube.com/watch?v=demo2',
        isFreePreview: false,
      }),
    });
    const createL2Data = await createL2Res.json();
    assert(createL2Res.status === 201, `Expected 201 for create lesson 2, got ${createL2Res.status}`);
    lessonId2 = createL2Data.lesson._id;
    console.log('✔ POST /api/lessons (Lesson 2 - Paid) -> 201');

    // Get Course Lessons (before enrollment, student sees paid lesson masked)
    const getLessonsUnenrolled = await fetch(`${baseUrl}/api/lessons/course/${courseId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const unenrolledLessonsData = await getLessonsUnenrolled.json();
    assert(getLessonsUnenrolled.status === 200, `Expected 200 for course lessons, got ${getLessonsUnenrolled.status}`);
    assert(unenrolledLessonsData.hasFullAccess === false, 'Student should not have full access prior to enrollment');
    assert(unenrolledLessonsData.lessons[1].videoUrl === '', 'Paid lesson video URL should be masked for unenrolled student');
    console.log('✔ GET /api/lessons/course/:courseId (access restriction verified) -> 200');

    // Get Single Lesson By ID
    const getL1Res = await fetch(`${baseUrl}/api/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(getL1Res.status === 200, `Expected 200 for preview lesson, got ${getL1Res.status}`);
    console.log('✔ GET /api/lessons/:id -> 200');

    // Update Lesson
    const updateLRes = await fetch(`${baseUrl}/api/lessons/${lessonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({ duration: 15 }),
    });
    const updateLData = await updateLRes.json();
    assert(updateLRes.status === 200, `Expected 200 for update lesson, got ${updateLRes.status}`);
    assert(updateLData.lesson.duration === 15, 'Lesson duration not updated');
    console.log('✔ PUT /api/lessons/:id -> 200');

    // =============================================================
    // 5. ENROLLMENT DOMAIN
    // =============================================================
    console.log('\n--- 5. Testing ENROLLMENT APIs ---');

    // Enroll in Course
    const enrollRes = await fetch(`${baseUrl}/api/enrollments/${courseId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const enrollData = await enrollRes.json();
    assert(enrollRes.status === 201, `Expected 201 for enroll course, got ${enrollRes.status}`);
    console.log('✔ POST /api/enrollments/:courseId -> 201');

    // Check Enrollment
    const checkEnrollRes = await fetch(`${baseUrl}/api/enrollments/check/${courseId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const checkEnrollData = await checkEnrollRes.json();
    assert(checkEnrollRes.status === 200, `Expected 200 for check enrollment, got ${checkEnrollRes.status}`);
    assert(checkEnrollData.isEnrolled === true, 'Expected isEnrolled === true');
    console.log('✔ GET /api/enrollments/check/:courseId -> 200');

    // Get Student Enrolled Courses
    const myEnrollRes = await fetch(`${baseUrl}/api/enrollments/my-courses`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const myEnrollData = await myEnrollRes.json();
    assert(myEnrollRes.status === 200, `Expected 200 for my enrollments, got ${myEnrollRes.status}`);
    assert(myEnrollData.enrollments.length >= 1, 'Expected at least 1 enrollment');
    console.log('✔ GET /api/enrollments/my-courses -> 200');

    // =============================================================
    // 6. PROGRESS DOMAIN
    // =============================================================
    console.log('\n--- 6. Testing PROGRESS APIs ---');

    // Update Lesson Progress / Mark Lesson 1 Complete
    const prog1Res = await fetch(`${baseUrl}/api/progress/${courseId}/lesson/${lessonId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const prog1Data = await prog1Res.json();
    assert(prog1Res.status === 200, `Expected 200 for mark lesson complete, got ${prog1Res.status}`);
    assert(prog1Data.progressPercentage === 50, `Expected 50% completion after 1 of 2 lessons, got ${prog1Data.progressPercentage}`);
    console.log('✔ POST /api/progress/:courseId/lesson/:lessonId (50% progress) -> 200');

    // Mark Lesson 2 Complete -> Triggers 100% completion & Certificate issuance
    const prog2Res = await fetch(`${baseUrl}/api/progress/${courseId}/lesson/${lessonId2}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const prog2Data = await prog2Res.json();
    assert(prog2Res.status === 200, `Expected 200 for mark lesson 2 complete, got ${prog2Res.status}`);
    assert(prog2Data.progressPercentage === 100, `Expected 100% completion, got ${prog2Data.progressPercentage}`);
    assert(prog2Data.completed === true, 'Expected course completed === true');
    assert(Boolean(prog2Data.certificate), 'Expected auto-issued certificate on 100% completion');
    certificateId = prog2Data.certificate._id;
    certificateCode = prog2Data.certificate.certificateId || prog2Data.certificate.certificateCode;
    console.log('✔ POST /api/progress/:courseId/lesson/:lessonId/complete (100% + Auto Certificate) -> 200');

    // Get Course Progress
    const getProgRes = await fetch(`${baseUrl}/api/progress/${courseId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const getProgData = await getProgRes.json();
    assert(getProgRes.status === 200, `Expected 200 for get course progress, got ${getProgRes.status}`);
    assert(getProgData.progressPercentage === 100, 'Expected progressPercentage === 100 in get progress');
    console.log('✔ GET /api/progress/:courseId -> 200');

    // =============================================================
    // 7. QUIZZES DOMAIN
    // =============================================================
    console.log('\n--- 7. Testing QUIZZES APIs ---');

    // Create Quiz
    const createQuizRes = await fetch(`${baseUrl}/api/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        courseId,
        lessonId,
        title: 'Distributed Systems & Services Quiz',
        passingScore: 75,
        questions: [
          {
            question: 'What is the primary role of a Service layer in MVC?',
            options: [
              'Encapsulate business logic and database queries',
              'Render HTML templates',
              'Handle HTTP request headers',
              'Configure Webpack',
            ],
            correctAnswer: 0,
            marks: 10,
          },
          {
            question: 'Which status code represents Bad Request?',
            options: ['200', '400', '404', '500'],
            correctAnswer: 1,
            marks: 10,
          },
        ],
      }),
    });
    const createQuizData = await createQuizRes.json();
    assert(createQuizRes.status === 201, `Expected 201 for create quiz, got ${createQuizRes.status}`);
    quizId = createQuizData.quiz._id;
    console.log('✔ POST /api/quizzes -> 201');

    // Get Quiz (as student - verify answer keys are hidden)
    const getQuizStudent = await fetch(`${baseUrl}/api/quizzes/${quizId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const quizStudentData = await getQuizStudent.json();
    assert(getQuizStudent.status === 200, `Expected 200 for student get quiz, got ${getQuizStudent.status}`);
    assert(quizStudentData.quiz.questions[0].correctAnswer === undefined, 'SECURITY LEAK: Correct answer leaked to student!');
    console.log('✔ GET /api/quizzes/:id (student masked view) -> 200');

    // Update Quiz
    const updateQuizRes = await fetch(`${baseUrl}/api/quizzes/${quizId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({ description: 'Updated quiz guidelines' }),
    });
    assert(updateQuizRes.status === 200, `Expected 200 for update quiz, got ${updateQuizRes.status}`);
    console.log('✔ PUT /api/quizzes/:id -> 200');

    // Submit Quiz & Calculate Score
    const submitQuizRes = await fetch(`${baseUrl}/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        answers: [
          { questionIndex: 0, selectedOption: 0 },
          { questionIndex: 1, selectedOption: 1 },
        ],
        timeSpentSeconds: 45,
      }),
    });
    const submitQuizData = await submitQuizRes.json();
    assert(submitQuizRes.status === 200, `Expected 200 for submit quiz, got ${submitQuizRes.status}`);
    assert(submitQuizData.score === 20, `Expected score === 20, got ${submitQuizData.score}`);
    assert(submitQuizData.percentage === 100, `Expected 100%, got ${submitQuizData.percentage}`);
    assert(submitQuizData.passed === true, 'Expected passed === true');
    console.log('✔ POST /api/quizzes/:id/submit (Score calculated & evaluated) -> 200');

    // Get My Quiz Submissions
    const getSubmissionsRes = await fetch(`${baseUrl}/api/quizzes/${quizId}/my-submissions`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const submissionsData = await getSubmissionsRes.json();
    assert(getSubmissionsRes.status === 200, `Expected 200 for my submissions, got ${getSubmissionsRes.status}`);
    assert(submissionsData.submissions.length >= 1, 'Expected at least 1 submission');
    console.log('✔ GET /api/quizzes/:id/my-submissions -> 200');

    // =============================================================
    // 8. CERTIFICATES DOMAIN
    // =============================================================
    console.log('\n--- 8. Testing CERTIFICATES APIs ---');

    // Get Student Certificates
    const certsRes = await fetch(`${baseUrl}/api/certificates/student/my-certificates`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const certsData = await certsRes.json();
    assert(certsRes.status === 200, `Expected 200 for student certificates, got ${certsRes.status}`);
    assert(certsData.certificates.length >= 1, 'Expected student certificate list to have >= 1 certificate');
    console.log('✔ GET /api/certificates/student/my-certificates -> 200');

    // Get Certificate By ID
    const certByIdRes = await fetch(`${baseUrl}/api/certificates/${certificateId}`);
    const certByIdData = await certByIdRes.json();
    assert(certByIdRes.status === 200, `Expected 200 for cert by ID, got ${certByIdRes.status}`);
    assert(certByIdData.certificate._id === certificateId, 'Certificate ID mismatch');
    console.log('✔ GET /api/certificates/:id -> 200');

    // Verify Certificate by code
    const verifyRes = await fetch(`${baseUrl}/api/certificates/verify/${certificateCode}`);
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200, `Expected 200 for verify cert, got ${verifyRes.status}`);
    assert(verifyData.isValid === true, 'Expected certificate to be valid');
    console.log('✔ GET /api/certificates/verify/:code -> 200');

    // =============================================================
    // 9. NOTIFICATIONS DOMAIN
    // =============================================================
    console.log('\n--- 9. Testing NOTIFICATIONS APIs ---');

    // Get Notifications
    const notifsRes = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const notifsData = await notifsRes.json();
    assert(notifsRes.status === 200, `Expected 200 for notifications, got ${notifsRes.status}`);
    assert(notifsData.notifications.length >= 1, 'Expected student to have notifications from enrollment & quiz');
    notificationId = notifsData.notifications[0]._id;
    console.log('✔ GET /api/notifications -> 200');

    // Mark Single Notification as Read
    const markReadRes = await fetch(`${baseUrl}/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const markReadData = await markReadRes.json();
    assert(markReadRes.status === 200, `Expected 200 for mark read, got ${markReadRes.status}`);
    assert(markReadData.notification.read === true, 'Notification read flag not set to true');
    console.log('✔ PATCH /api/notifications/:id/read -> 200');

    // Mark All Notifications as Read
    const markAllRes = await fetch(`${baseUrl}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(markAllRes.status === 200, `Expected 200 for read all, got ${markAllRes.status}`);
    console.log('✔ PATCH /api/notifications/read-all -> 200');

    // Delete Single Notification
    const delNotifRes = await fetch(`${baseUrl}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(delNotifRes.status === 200, `Expected 200 for delete notification, got ${delNotifRes.status}`);
    console.log('✔ DELETE /api/notifications/:id -> 200');

    console.log('\n================================================================');
    console.log('🎉 ALL REST API ENDPOINTS & SERVICES VERIFIED SUCCESSFULLY! 🎉');
    console.log('================================================================\n');
  } finally {
    await tearDown();
  }
}

runApiTests().catch((err) => {
  console.error('\n❌ REST API TEST SUITE FAILED:', err);
  process.exit(1);
});
