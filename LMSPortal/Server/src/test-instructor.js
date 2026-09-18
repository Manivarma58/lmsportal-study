import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

let mongod;
let server;
let port;

process.env.JWT_SECRET = 'test_instructor_secret_key_123456789';

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

async function runInstructorTests() {
  try {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    const app = express();
    app.use(express.json());

    app.use('/api/auth', authRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/lessons', lessonRoutes);
    app.use('/api/enrollments', enrollmentRoutes);
    app.use('/api/quizzes', quizRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/users', userRoutes);

    app.use(notFound);
    app.use(errorHandler);

    server = http.createServer(app);
    await new Promise((res) => {
      server.listen(0, () => {
        port = server.address().port;
        res();
      });
    });

    console.log(`\n================================================================`);
    console.log(`👨‍🏫 TESTING INSTRUCTOR MODULE & OWNERSHIP AUTHORIZATION 👨‍🏫`);
    console.log(`================================================================\n`);

    // 1. Create two instructors and a student
    const inst1 = await request('POST', '/api/auth/register', {
      name: 'Instructor One',
      email: 'inst1@lms.com',
      password: 'Password123!',
      role: 'instructor',
    });
    const token1 = inst1.body.token;

    const inst2 = await request('POST', '/api/auth/register', {
      name: 'Instructor Two',
      email: 'inst2@lms.com',
      password: 'Password123!',
      role: 'instructor',
    });
    const token2 = inst2.body.token;

    const student = await request('POST', '/api/auth/register', {
      name: 'Student Learner',
      email: 'learner@lms.com',
      password: 'Password123!',
      role: 'student',
    });
    const studentToken = student.body.token;
    console.log('✔ Created test users (Instructor 1, Instructor 2, Student)');

    // 2. Instructor 1 creates a course
    const courseRes = await request(
      'POST',
      '/api/courses',
      {
        title: 'Fullstack Microservices',
        description: 'Complete architecture course for production environments.',
        category: 'Web Development',
        level: 'Intermediate',
        price: 99,
        willLearn: ['Docker', 'Kafka', 'Kubernetes'],
      },
      token1
    );
    if (courseRes.status !== 201) throw new Error('Failed to create course: ' + JSON.stringify(courseRes.body));
    const courseId = courseRes.body.course._id;
    console.log('✔ Instructor 1 created course -> 201');

    // 3. Instructor 1 edits course
    const updateRes = await request(
      'PUT',
      `/api/courses/${courseId}`,
      { title: 'Fullstack Microservices Pro Edition' },
      token1
    );
    if (updateRes.status !== 200 || updateRes.body.course.title !== 'Fullstack Microservices Pro Edition') {
      throw new Error('Failed to update course: ' + JSON.stringify(updateRes.body));
    }
    console.log('✔ Instructor 1 updated course -> 200');

    // 4. Ownership check: Instructor 2 tries to modify Instructor 1's course -> MUST BE 403
    const unauthorizedCourseEdit = await request(
      'PUT',
      `/api/courses/${courseId}`,
      { title: 'Hacked Course Title' },
      token2
    );
    if (unauthorizedCourseEdit.status !== 403) {
      throw new Error(`Expected 403 for unauthorized edit, got ${unauthorizedCourseEdit.status}`);
    }
    console.log('✔ Ownership authorization enforced: Non-owner instructor rejected -> 403 Forbidden');

    // 5. Toggle publish
    const publishRes = await request('PATCH', `/api/courses/${courseId}/publish`, {}, token1);
    if (publishRes.status !== 200 || !publishRes.body.isPublished) {
      throw new Error('Failed to publish course: ' + JSON.stringify(publishRes.body));
    }
    console.log('✔ Instructor 1 toggled course to published -> 200');

    // 6. Instructor 1 adds lessons
    const l1Res = await request(
      'POST',
      '/api/lessons',
      {
        courseId,
        title: 'Lesson 1: Architecture Overview',
        duration: 15,
        videoUrl: 'https://youtube.com/watch?v=demo1',
        isFreePreview: true,
      },
      token1
    );
    const lesson1Id = l1Res.body.lesson._id;

    const l2Res = await request(
      'POST',
      '/api/lessons',
      {
        courseId,
        title: 'Lesson 2: Event-Driven Kafka',
        duration: 25,
        videoUrl: 'https://youtube.com/watch?v=demo2',
        isFreePreview: false,
      },
      token1
    );
    const lesson2Id = l2Res.body.lesson._id;
    console.log('✔ Instructor 1 added Lesson 1 and Lesson 2 -> 201');

    // 7. Ownership check on lesson modification
    const unauthorizedLessonEdit = await request(
      'PUT',
      `/api/lessons/${lesson1Id}`,
      { title: 'Hacked Lesson' },
      token2
    );
    if (unauthorizedLessonEdit.status !== 403) {
      throw new Error(`Expected 403 for unauthorized lesson edit, got ${unauthorizedLessonEdit.status}`);
    }
    console.log('✔ Lesson ownership enforced: Non-owner instructor rejected -> 403 Forbidden');

    // 8. Instructor 1 updates lesson
    const editLessonRes = await request(
      'PUT',
      `/api/lessons/${lesson1Id}`,
      { title: 'Lesson 1: Deep Architecture Overview' },
      token1
    );
    if (editLessonRes.status !== 200) throw new Error('Failed to update lesson');
    console.log('✔ Instructor 1 edited lesson -> 200');

    // 9. Instructor 1 reorders lessons
    const reorderRes = await request(
      'PUT',
      `/api/lessons/course/${courseId}/reorder`,
      {
        lessonOrders: [
          { lessonId: lesson2Id, order: 1 },
          { lessonId: lesson1Id, order: 2 },
        ],
      },
      token1
    );
    if (reorderRes.status !== 200 || reorderRes.body.lessons[0]._id !== lesson2Id) {
      throw new Error('Failed to reorder lessons: ' + JSON.stringify(reorderRes.body));
    }
    console.log('✔ Instructor 1 reordered lessons -> 200');

    // 10. Instructor 1 creates quiz
    const quizRes = await request(
      'POST',
      '/api/quizzes',
      {
        courseId,
        title: 'Microservices Mastery Quiz',
        passingScore: 80,
        timeLimitMinutes: 15,
        questions: [
          {
            questionText: 'What protocol is typically used for synchronous RPC in microservices?',
            options: ['gRPC', 'FTP', 'SMTP', 'Telnet'],
            correctAnswerIndex: 0,
            explanation: 'gRPC utilizes HTTP/2 for high-speed binary RPC.',
          },
        ],
      },
      token1
    );
    if (quizRes.status !== 201) throw new Error('Failed to create quiz: ' + JSON.stringify(quizRes.body));
    const quizId = quizRes.body.quiz._id;
    console.log('✔ Instructor 1 created quiz with questions -> 201');

    // 11. Ownership check on quiz
    const unauthorizedQuizEdit = await request(
      'PUT',
      `/api/quizzes/${quizId}`,
      { title: 'Hacked Quiz' },
      token2
    );
    if (unauthorizedQuizEdit.status !== 403) {
      throw new Error(`Expected 403 for unauthorized quiz edit, got ${unauthorizedQuizEdit.status}`);
    }
    console.log('✔ Quiz ownership enforced: Non-owner instructor rejected -> 403 Forbidden');

    // 12. Instructor 1 updates quiz
    const updateQuizRes = await request(
      'PUT',
      `/api/quizzes/${quizId}`,
      { title: 'Microservices Final Assessment' },
      token1
    );
    if (updateQuizRes.status !== 200) throw new Error('Failed to update quiz');
    console.log('✔ Instructor 1 updated quiz -> 200');

    // 13. Student enrolls
    await request('POST', `/api/enrollments/${courseId}`, {}, studentToken);

    // 14. Instructor Analytics check
    const analyticsRes = await request('GET', '/api/analytics/instructor', null, token1);
    if (analyticsRes.status !== 200) throw new Error('Failed to get analytics: ' + JSON.stringify(analyticsRes.body));
    const stats = analyticsRes.body.stats;
    if (stats.totalCourses !== 1 || stats.publishedCourses !== 1 || stats.totalEnrollments !== 1) {
      throw new Error('Analytics stats mismatch: ' + JSON.stringify(stats));
    }
    console.log('✔ Instructor Analytics API verified (totalCourses: 1, publishedCourses: 1, totalEnrollments: 1) -> 200');

    // 15. Clean up delete
    const deleteCourseRes = await request('DELETE', `/api/courses/${courseId}`, null, token1);
    if (deleteCourseRes.status !== 200) throw new Error('Failed to delete course');
    console.log('✔ Instructor 1 deleted course -> 200');

    console.log(`\n================================================================`);
    console.log(`🎉 ALL INSTRUCTOR MODULE REQUIREMENTS VERIFIED CLEANLY! 🎉`);
    console.log(`================================================================\n`);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongod) await mongod.stop();
  }
}

runInstructorTests();
