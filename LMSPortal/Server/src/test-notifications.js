import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

import User from './models/User.js';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';
import Enrollment from './models/Enrollment.js';
import Notification from './models/Notification.js';
import { initSocket } from './socket/socketHandler.js';
import notificationService from './services/notificationService.js';
import enrollmentService from './services/enrollmentService.js';
import lessonService from './services/lessonService.js';
import courseService from './services/courseService.js';
import quizService from './services/quizService.js';
import progressService from './services/progressService.js';
import certificateService from './services/certificateService.js';

let mongoServer;
let httpServer;
let ioServer;
let port;
const JWT_SECRET = 'lms_super_secret_jwt_key_2026_xyz!@#';
process.env.JWT_SECRET = JWT_SECRET;

async function runNotificationTests() {
  console.log('🧪 Starting LMS Notification System Test Suite (PROMPT 13)...\n');
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
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('  📦 Connected to in-memory test database.');

    const app = express();
    httpServer = http.createServer(app);
    ioServer = new Server(httpServer, { cors: { origin: '*' } });
    initSocket(ioServer);

    await new Promise((resolve) => {
      httpServer.listen(0, () => {
        port = httpServer.address().port;
        console.log(`  🚀 Socket.IO Server active on port ${port}.\n`);
        resolve();
      });
    });

    // 1. Setup Users
    const instructor1 = await User.create({
      name: 'Prof. Katherine Johnson',
      email: 'katherine@space.edu',
      password: 'Password123!',
      role: 'instructor',
    });

    const instructor2 = await User.create({
      name: 'Dr. Rival Instructor',
      email: 'rival@other.edu',
      password: 'Password123!',
      role: 'instructor',
    });

    const studentA = await User.create({
      name: 'Dorothy Vaughan',
      email: 'dorothy@student.edu',
      password: 'Password123!',
      role: 'student',
    });

    const studentB = await User.create({
      name: 'Mary Jackson',
      email: 'mary@student.edu',
      password: 'Password123!',
      role: 'student',
    });

    const studentAToken = jwt.sign({ id: studentA._id }, JWT_SECRET, { expiresIn: '1d' });
    const studentASocket = Client(`http://localhost:${port}`, {
      auth: { token: studentAToken },
      reconnection: false,
    });

    await new Promise((resolve) => {
      studentASocket.on('connect', () => {
        console.log('  🔌 Student A connected via Socket.IO for real-time delivery.');
        resolve();
      });
    });

    // ============================================================
    // TEST GROUP 1: All 7 Notification Triggers & Real-Time Delivery
    // ============================================================
    console.log('\n🔹 Test Group 1: 7 Notification Triggers with Real-Time Delivery');

    // Trigger 1: New Course Published
    let realtimeNotifNewCourse = null;
    const newCoursePromise = new Promise((resolve) => {
      studentASocket.once('new_notification', (data) => {
        realtimeNotifNewCourse = data;
        resolve();
      });
    });

    const course = await courseService.createCourse(
      {
        title: 'Orbital Mechanics & Trajectory Analysis',
        description: 'Advanced astrodynamics and gravitational assists.',
        category: 'Physics & Engineering',
        level: 'Advanced',
        price: 99,
        published: true,
      },
      instructor1._id
    );

    await newCoursePromise;
    assert(realtimeNotifNewCourse !== null, 'Trigger 1: Student received real-time new_course notification');
    assert(realtimeNotifNewCourse.type === 'new_course', 'Notification type is new_course');

    // Trigger 2: Course Enrollment
    let realtimeNotifEnrollment = null;
    const enrollPromise = new Promise((resolve) => {
      studentASocket.once('new_notification', (data) => {
        realtimeNotifEnrollment = data;
        resolve();
      });
    });

    await enrollmentService.enrollInCourse(studentA._id, course._id, studentA.name);
    await enrollPromise;
    assert(realtimeNotifEnrollment !== null, 'Trigger 2: Student received real-time course_enrollment notification');
    assert(realtimeNotifEnrollment.type === 'course_enrollment', 'Notification type is course_enrollment');

    // Trigger 3: New Lesson
    let realtimeNotifLesson = null;
    const lessonPromise = new Promise((resolve) => {
      studentASocket.once('new_notification', (data) => {
        realtimeNotifLesson = data;
        resolve();
      });
    });

    const lesson = await lessonService.createLesson(
      {
        courseId: course._id.toString(),
        title: 'Hohmann Transfer Orbits',
        order: 1,
        duration: 30,
      },
      { id: instructor1._id.toString(), role: 'instructor' }
    );

    await lessonPromise;
    assert(realtimeNotifLesson !== null, 'Trigger 3: Enrolled student received real-time new_lesson notification');
    assert(realtimeNotifLesson.type === 'new_lesson', 'Notification type is new_lesson');

    // Trigger 4: Quiz Result
    const quiz = await quizService.createQuiz(
      {
        courseId: course._id.toString(),
        lessonId: lesson._id.toString(),
        title: 'Delta-v Budgeting Quiz',
        passingScore: 70,
        questions: [
          {
            question: 'What velocity change is required for coplanar circular orbit transfers?',
            options: ['Hohmann delta-v', 'Escape velocity', 'Terminal velocity', 'Light speed'],
            correctAnswer: 0,
            marks: 10,
          },
        ],
      },
      { id: instructor1._id.toString(), role: 'instructor' }
    );

    let realtimeNotifQuiz = null;
    const quizPromise = new Promise((resolve) => {
      studentASocket.once('new_notification', (data) => {
        realtimeNotifQuiz = data;
        resolve();
      });
    });

    await quizService.submitQuiz(quiz._id.toString(), studentA._id.toString(), {
      answers: [{ questionIndex: 0, selectedOption: 0 }],
      timeSpentSeconds: 60,
    });

    await quizPromise;
    assert(realtimeNotifQuiz !== null, 'Trigger 4: Student received real-time quiz_result notification');
    assert(realtimeNotifQuiz.type === 'quiz_result', 'Notification type is quiz_result');

    // Trigger 5 & 6: Course Completion & Certificate Generation
    let completionReceived = false;
    let certReceived = false;

    const progressPromise = new Promise((resolve) => {
      let count = 0;
      studentASocket.on('new_notification', (data) => {
        if (data.type === 'course_completion') completionReceived = true;
        if (data.type === 'certificate_generation') certReceived = true;
        count++;
        if (completionReceived && certReceived) resolve();
      });
    });

    await progressService.markLessonComplete(studentA._id, course._id, lesson._id);
    await progressPromise;

    assert(completionReceived, 'Trigger 5: Student received real-time course_completion notification');
    assert(certReceived, 'Trigger 6: Student received real-time certificate_generation notification');

    // Trigger 7: Instructor Announcements
    let realtimeNotifAnnouncement = null;
    const announcePromise = new Promise((resolve) => {
      studentASocket.once('new_notification', (data) => {
        realtimeNotifAnnouncement = data;
        resolve();
      });
    });

    await notificationService.createCourseAnnouncement({
      courseId: course._id.toString(),
      title: 'Midterm Research Presentations Scheduled',
      message: 'Please review the schedule and submit your presentation slides by Friday.',
      instructorUser: { id: instructor1._id.toString(), role: 'instructor' },
    });

    await announcePromise;
    assert(realtimeNotifAnnouncement !== null, 'Trigger 7: Enrolled student received real-time instructor_announcement');
    assert(realtimeNotifAnnouncement.type === 'instructor_announcement', 'Notification type is instructor_announcement');

    // ============================================================
    // TEST GROUP 2: Strict Backend Authorization
    // ============================================================
    console.log('\n🔹 Test Group 2: Strict Backend Authorization & Data Isolation');

    // Student A's notifications feed
    const studentANotifs = await notificationService.getUserNotifications(studentA._id.toString());
    assert(studentANotifs.count >= 7, 'Student A has notifications from all triggers in their inbox');
    assert(studentANotifs.unreadCount >= 7, 'Unread count reflects unread notifications');

    // Verify Student B cannot see Student A's notifications
    const studentBNotifs = await notificationService.getUserNotifications(studentB._id.toString());
    assert(
      !studentBNotifs.notifications.some((n) => n.recipient.toString() === studentA._id.toString()),
      'Student B inbox does NOT contain any notifications belonging to Student A'
    );

    // Verify Student B cannot mark Student A's notification as read
    const studentANotifId = studentANotifs.notifications[0]._id;
    let unauthorizedReadBlocked = false;
    try {
      await notificationService.markNotificationAsRead(studentANotifId, studentB._id.toString());
    } catch (err) {
      if (err.statusCode === 404 || err.message.includes('unauthorized')) {
        unauthorizedReadBlocked = true;
      }
    }
    assert(unauthorizedReadBlocked, 'Student B blocked from marking Student A notification as read (Unauthorized)');

    // Verify Student B cannot delete Student A's notification
    let unauthorizedDeleteBlocked = false;
    try {
      await notificationService.deleteNotification(studentANotifId, studentB._id.toString());
    } catch (err) {
      if (err.statusCode === 404 || err.message.includes('unauthorized')) {
        unauthorizedDeleteBlocked = true;
      }
    }
    assert(unauthorizedDeleteBlocked, 'Student B blocked from deleting Student A notification (Unauthorized)');

    // Verify non-owner instructor blocked from posting announcement to course
    let unauthorizedAnnouncementBlocked = false;
    try {
      await notificationService.createCourseAnnouncement({
        courseId: course._id.toString(),
        title: 'Spam announcement',
        message: 'Unauthorized',
        instructorUser: { id: instructor2._id.toString(), role: 'instructor' },
      });
    } catch (err) {
      if (err.statusCode === 403) {
        unauthorizedAnnouncementBlocked = true;
      }
    }
    assert(unauthorizedAnnouncementBlocked, 'Non-owner instructor blocked from posting course announcements (403)');

    // ============================================================
    // TEST GROUP 3: Read Status & Cleanup Operations
    // ============================================================
    console.log('\n🔹 Test Group 3: Read Status, Unread Count & Deletion');

    // Mark single notification as read
    const updated = await notificationService.markNotificationAsRead(studentANotifId, studentA._id.toString());
    assert(updated.read === true, 'Single notification marked as read (read: true)');

    const afterSingleRead = await notificationService.getUserNotifications(studentA._id.toString());
    assert(afterSingleRead.unreadCount === studentANotifs.unreadCount - 1, 'Unread count decremented by 1');

    // Mark all as read
    await notificationService.markAllNotificationsAsRead(studentA._id.toString());
    const afterAllRead = await notificationService.getUserNotifications(studentA._id.toString());
    assert(afterAllRead.unreadCount === 0, 'Mark all as read sets unreadCount to 0');

    // Delete notification
    const deleteResult = await notificationService.deleteNotification(studentANotifId, studentA._id.toString());
    assert(deleteResult.success === true, 'Notification successfully deleted');
    const finalFeed = await notificationService.getUserNotifications(studentA._id.toString());
    assert(finalFeed.count === studentANotifs.count - 1, 'Total notifications count decremented by 1 after deletion');

    studentASocket.disconnect();

    console.log(`\n========================================`);
    console.log(`🏁 Notification Test Suite Finished: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Unhandled error in notification tests:', err);
    process.exit(1);
  } finally {
    if (httpServer) httpServer.close();
    if (ioServer) ioServer.close();
    if (mongoServer) {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
  }
}

runNotificationTests();
