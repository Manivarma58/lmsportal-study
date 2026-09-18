import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

let mongod;
let server;
let port;

process.env.JWT_SECRET = 'test_admin_secret_key_987654321';

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(
      {
        host: 'localhost',
        port,
        path,
        method,
        headers,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(responseBody);
          } catch {
            parsed = responseBody;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function runAdminTests() {
  try {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    const app = express();
    app.use(express.json());

    app.use('/api/auth', authRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/lessons', lessonRoutes);
    app.use('/api/enrollments', enrollmentRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/notifications', notificationRoutes);

    app.use(notFound);
    app.use(errorHandler);

    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });

    console.log(`\n======================================================`);
    console.log(`[TEST RUNNER] Admin Module & Role Authorization Tests`);
    console.log(`======================================================\n`);

    let passed = 0;
    let failed = 0;

    const assert = (condition, name, details = '') => {
      if (condition) {
        console.log(`  PASS: ${name}`);
        passed++;
      } else {
        console.error(`  FAIL: ${name}`);
        if (details) console.error(`    ${details}`);
        failed++;
      }
    };

    // 1. SETUP USERS: Student, Instructor, Admin
    console.log(`--- SECTION 1: User Registration ---`);
    const studentRes = await request('POST', '/api/auth/register', {
      name: 'Test Student',
      email: 'student@example.com',
      password: 'Password123!',
      role: 'student',
    });
    const studentToken = studentRes.body.token;
    const studentId = studentRes.body.user._id || studentRes.body.user.id;
    assert(studentRes.status === 201 && studentToken, 'Register Student Account');

    const instructorRes = await request('POST', '/api/auth/register', {
      name: 'Test Instructor',
      email: 'instructor@example.com',
      password: 'Password123!',
      role: 'instructor',
    });
    const instructorToken = instructorRes.body.token;
    const instructorId = instructorRes.body.user._id || instructorRes.body.user.id;
    assert(instructorRes.status === 201 && instructorToken, 'Register Instructor Account');

    const adminRes = await request('POST', '/api/auth/register', {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin',
    });
    const adminToken = adminRes.body.token;
    const adminId = adminRes.body.user._id || adminRes.body.user.id;
    assert(adminRes.status === 201 && adminToken, 'Register Admin Account');

    // 2. SECURITY TESTS: Role-based Authorization on Backend
    console.log(`\n--- SECTION 2: Security & Role-Based Authorization Constraints ---`);

    // Student attempts admin routes
    const studentUserGet = await request('GET', '/api/users', null, studentToken);
    assert(studentUserGet.status === 403, 'Student blocked from GET /api/users (403 Forbidden)');

    const studentAnalyticsGet = await request('GET', '/api/analytics/admin', null, studentToken);
    assert(studentAnalyticsGet.status === 403, 'Student blocked from GET /api/analytics/admin (403 Forbidden)');

    const studentBroadcast = await request('POST', '/api/notifications/broadcast', {
      title: 'Hacked Announcement',
      message: 'This should fail',
    }, studentToken);
    assert(studentBroadcast.status === 403, 'Student blocked from POST /api/notifications/broadcast (403 Forbidden)');

    const studentInstructorsGet = await request('GET', '/api/users/instructors', null, studentToken);
    assert(studentInstructorsGet.status === 403, 'Student blocked from GET /api/users/instructors (403 Forbidden)');

    const studentStudentsGet = await request('GET', '/api/users/students', null, studentToken);
    assert(studentStudentsGet.status === 403, 'Student blocked from GET /api/users/students (403 Forbidden)');

    // Instructor attempts admin routes
    const instructorUserGet = await request('GET', '/api/users', null, instructorToken);
    assert(instructorUserGet.status === 403, 'Instructor blocked from GET /api/users (403 Forbidden)');

    const instructorAnalyticsGet = await request('GET', '/api/analytics/admin', null, instructorToken);
    assert(instructorAnalyticsGet.status === 403, 'Instructor blocked from GET /api/analytics/admin (403 Forbidden)');

    const instructorBroadcast = await request('POST', '/api/notifications/broadcast', {
      title: 'Instructor Broadcast',
      message: 'Should fail',
    }, instructorToken);
    assert(instructorBroadcast.status === 403, 'Instructor blocked from POST /api/notifications/broadcast (403 Forbidden)');

    // Unauthenticated request
    const anonUserGet = await request('GET', '/api/users');
    assert(anonUserGet.status === 401, 'Unauthenticated user blocked from GET /api/users (401 Unauthorized)');

    // 3. ADMIN DASHBOARD & PLATFORM METRICS
    console.log(`\n--- SECTION 3: Admin Dashboard 7 Platform Metrics ---`);
    const adminAnalytics = await request('GET', '/api/analytics/admin', null, adminToken);
    assert(adminAnalytics.status === 200, 'Admin can access GET /api/analytics/admin (200 OK)');

    const stats = adminAnalytics.body.stats || {};
    assert(typeof stats.totalUsers === 'number', 'Metric 1: totalUsers exists and is numeric', `Got ${stats.totalUsers}`);
    assert(typeof stats.totalStudents === 'number', 'Metric 2: totalStudents exists and is numeric', `Got ${stats.totalStudents}`);
    assert(typeof stats.totalInstructors === 'number', 'Metric 3: totalInstructors exists and is numeric', `Got ${stats.totalInstructors}`);
    assert(typeof stats.totalCourses === 'number', 'Metric 4: totalCourses exists and is numeric', `Got ${stats.totalCourses}`);
    assert(typeof stats.publishedCourses === 'number', 'Metric 5: publishedCourses exists and is numeric', `Got ${stats.publishedCourses}`);
    assert(typeof stats.totalEnrollments === 'number', 'Metric 6: totalEnrollments exists and is numeric', `Got ${stats.totalEnrollments}`);
    assert(
      stats.completionStatistics && typeof stats.completionStatistics.completionRate === 'number',
      'Metric 7: completionStatistics exists with completionRate',
      JSON.stringify(stats.completionStatistics)
    );

    // 4. USER MANAGEMENT OPERATIONS
    console.log(`\n--- SECTION 4: User Management Operations ---`);
    const allUsers = await request('GET', '/api/users', null, adminToken);
    assert(allUsers.status === 200 && allUsers.body.users.length >= 3, 'Admin views users list (GET /api/users)');

    const filteredUsers = await request('GET', '/api/users?role=student', null, adminToken);
    assert(
      filteredUsers.status === 200 && filteredUsers.body.users.every((u) => u.role === 'student'),
      'Admin filters users by role (role=student)'
    );

    const searchedUsers = await request('GET', '/api/users?keyword=Super', null, adminToken);
    assert(
      searchedUsers.status === 200 && searchedUsers.body.users.some((u) => u.name.includes('Super')),
      'Admin searches users by keyword'
    );

    // Activate/deactivate user
    const toggleStatus = await request('PATCH', `/api/users/${studentId}/status`, null, adminToken);
    assert(toggleStatus.status === 200 && toggleStatus.body.isActive === false, 'Admin deactivates user status');

    const toggleBack = await request('PATCH', `/api/users/${studentId}/status`, null, adminToken);
    assert(toggleBack.status === 200 && toggleBack.body.isActive === true, 'Admin reactivates user status');

    // Admin safety check: cannot deactivate own account
    const toggleSelf = await request('PATCH', `/api/users/${adminId}/status`, null, adminToken);
    assert(toggleSelf.status === 400, 'Admin cannot deactivate their own account (400 Bad Request)');

    // Role update
    const updateRole = await request('PATCH', `/api/users/${studentId}/role`, { role: 'instructor' }, adminToken);
    assert(updateRole.status === 200 && updateRole.body.user.role === 'instructor', 'Admin updates user role');

    // Revert role back to student
    await request('PATCH', `/api/users/${studentId}/role`, { role: 'student' }, adminToken);

    // 5. INSTRUCTOR & STUDENT OVERVIEW
    console.log(`\n--- SECTION 5: Instructor & Student Management Views ---`);
    const instructorsOverview = await request('GET', '/api/users/instructors', null, adminToken);
    assert(
      instructorsOverview.status === 200 && Array.isArray(instructorsOverview.body.instructors),
      'Admin accesses GET /api/users/instructors with courses/student reach metrics'
    );

    const studentsOverview = await request('GET', '/api/users/students', null, adminToken);
    assert(
      studentsOverview.status === 200 && Array.isArray(studentsOverview.body.students),
      'Admin accesses GET /api/users/students with enrollment/completion metrics'
    );

    // 6. COURSE MODERATION & DELETION
    console.log(`\n--- SECTION 6: Course Management & Moderation ---`);
    // Instructor creates a course
    const courseCreateRes = await request(
      'POST',
      '/api/courses',
      {
        title: 'Test Course to Moderate',
        description: 'Test description for moderation',
        category: 'Development',
        price: 49.99,
        published: false,
      },
      instructorToken
    );
    const createdCourseId = courseCreateRes.body.course._id || courseCreateRes.body.course.id;
    assert(courseCreateRes.status === 201 && createdCourseId, 'Instructor creates draft course');

    // Admin views courses including draft
    const adminCoursesGet = await request('GET', '/api/courses?includeUnpublished=true', null, adminToken);
    assert(
      adminCoursesGet.status === 200 && adminCoursesGet.body.courses.some((c) => c._id === createdCourseId),
      'Admin views draft courses in catalog'
    );

    // Admin toggles publish status
    const togglePublish = await request('PATCH', `/api/courses/${createdCourseId}/publish`, null, adminToken);
    assert(togglePublish.status === 200, 'Admin toggles course publish status (PATCH /api/courses/:id/publish)');

    // Admin deletes inappropriate course
    const deleteCourseRes = await request('DELETE', `/api/courses/${createdCourseId}`, null, adminToken);
    assert(deleteCourseRes.status === 200, 'Admin deletes inappropriate course (DELETE /api/courses/:id)');

    // 7. BROADCAST NOTIFICATIONS
    console.log(`\n--- SECTION 7: Broadcast Notifications ---`);
    const broadcastRes = await request(
      'POST',
      '/api/notifications/broadcast',
      {
        title: 'System Maintenance Alert',
        message: 'The portal will be upgraded at midnight UTC.',
        type: 'system',
        targetRole: 'all',
        link: '/status',
      },
      adminToken
    );
    assert(
      broadcastRes.status === 201 && broadcastRes.body.recipientsCount >= 2,
      'Admin broadcasts notification to all users (POST /api/notifications/broadcast)'
    );

    // Verify student receives the broadcast
    const studentNotifications = await request('GET', '/api/notifications', null, studentToken);
    assert(
      studentNotifications.status === 200 &&
        studentNotifications.body.notifications.some((n) => n.title === 'System Maintenance Alert'),
      'Student receives the platform broadcast in their notifications inbox'
    );

    // Admin views broadcast history
    const broadcastHistory = await request('GET', '/api/notifications/broadcasts', null, adminToken);
    assert(
      broadcastHistory.status === 200 && broadcastHistory.body.broadcasts.length > 0,
      'Admin views broadcast history log (GET /api/notifications/broadcasts)'
    );

    console.log(`\n======================================================`);
    console.log(`[TEST RESULTS] Passed: ${passed} | Failed: ${failed}`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal Test Error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    if (mongod) await mongod.stop();
  }
}

runAdminTests();
