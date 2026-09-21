import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from './models/User.js';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';
import Enrollment from './models/Enrollment.js';
import Progress from './models/Progress.js';
import Certificate from './models/Certificate.js';
import progressService from './services/progressService.js';
import lessonService from './services/lessonService.js';
import certificateService from './services/certificateService.js';
import enrollmentService from './services/enrollmentService.js';

let mongoServer;

async function runTests() {
  console.log('🧪 Starting Course Learning System Test Suite...\n');
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
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('  📦 Connected to in-memory test database.\n');

    // 1. Setup instructor and student users
    const instructor = await User.create({
      name: 'Dr. Elena Vance',
      email: 'elena@quantum.edu',
      password: 'Password123!',
      role: 'instructor',
    });

    const student = await User.create({
      name: 'Alice Scholar',
      email: 'alice@student.edu',
      password: 'Password123!',
      role: 'student',
    });

    const student2 = await User.create({
      name: 'Bob Unenrolled',
      email: 'bob@student.edu',
      password: 'Password123!',
      role: 'student',
    });

    // 2. Setup course with 4 lessons
    const course = await Course.create({
      title: 'Neural Networks & Quantum Computing',
      description: 'Master hybrid tensor networks and NISQ algorithms.',
      category: 'AI & Quantum',
      level: 'Advanced',
      price: 99,
      published: true,
      instructor: instructor._id,
    });

    const lesson1 = await Lesson.create({
      course: course._id,
      title: '01: Tensor Network Foundations',
      section: 'Module 1: Foundations',
      order: 1,
      duration: 15,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Introduction to Matrix Product States (MPS).',
      isFreePreview: true,
    });

    const lesson2 = await Lesson.create({
      course: course._id,
      title: '02: Parameterized Quantum Circuits',
      section: 'Module 1: Foundations',
      order: 2,
      duration: 20,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'PQC topology and variational ansatz.',
      isFreePreview: false,
    });

    const lesson3 = await Lesson.create({
      course: course._id,
      title: '03: Quantum Gradients & Backprop',
      section: 'Module 2: Advanced Ops',
      order: 3,
      duration: 25,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Parameter-shift rule implementation in PyTorch/PennyLane.',
      isFreePreview: false,
    });

    const lesson4 = await Lesson.create({
      course: course._id,
      title: '04: NISQ Benchmarks & Capstone',
      section: 'Module 2: Advanced Ops',
      order: 4,
      duration: 30,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Final benchmark against quantum hardware emulators.',
      isFreePreview: false,
    });

    console.log('--- TEST 1: Protected Content Authorization ---');
    // Non-enrolled user accessing lessons list
    const unenrolledLessons = await lessonService.getLessonsByCourse(course._id, {
      id: student2._id.toString(),
      role: 'student',
    });
    assert(unenrolledLessons.hasFullAccess === false, 'Non-enrolled user hasFullAccess is false');
    assert(unenrolledLessons.lessons[0].videoUrl !== '', 'Free preview lesson retains videoUrl');
    assert(unenrolledLessons.lessons[1].videoUrl === '', 'Protected lesson videoUrl is stripped for non-enrolled user');

    // Non-enrolled user accessing single protected lesson
    let accessDenied = false;
    try {
      await lessonService.getLessonById(lesson2._id, {
        id: student2._id.toString(),
        role: 'student',
      });
    } catch (err) {
      if (err.statusCode === 403) accessDenied = true;
    }
    assert(accessDenied, 'Non-enrolled student gets 403 Forbidden on protected lesson');

    console.log('\n--- TEST 2: Student Enrollment & Initial Progress ---');
    await enrollmentService.enrollInCourse(student._id.toString(), course._id.toString());
    const initialProgress = await progressService.getCourseProgress(
      student._id.toString(),
      course._id.toString()
    );
    assert(initialProgress.isEnrolled === true, 'Student is properly enrolled');
    assert(initialProgress.progressPercentage === 0, 'Initial progress percentage is 0%');
    assert(initialProgress.completedLessonIds.length === 0, 'Initial completed lessons count is 0');

    console.log('\n--- TEST 3: Resume From Last Accessed Lesson Tracking ---');
    // Record student accessing Lesson 2
    const accessRes1 = await progressService.recordLessonAccess(
      student._id.toString(),
      course._id.toString(),
      lesson2._id.toString()
    );
    assert(
      accessRes1.lastAccessedLesson.toString() === lesson2._id.toString(),
      'Recorded lesson 2 access successfully'
    );

    const progressAfterAccess = await progressService.getCourseProgress(
      student._id.toString(),
      course._id.toString()
    );
    assert(
      progressAfterAccess.lastAccessedLesson.toString() === lesson2._id.toString(),
      'Course progress returns correct lastAccessedLesson for auto-resume'
    );

    console.log('\n--- TEST 4: Incremental Progress & Automatic Calculation ---');
    // Mark Lesson 1 complete (1 / 4 = 25%)
    const markRes1 = await progressService.markLessonComplete(
      student._id.toString(),
      course._id.toString(),
      lesson1._id.toString()
    );
    assert(markRes1.isMarkedComplete === true, 'Lesson 1 marked complete');
    assert(markRes1.progressPercentage === 25, 'Progress automatically calculated as 25%');
    assert(markRes1.completed === false, 'Course is not yet marked 100% completed');

    // Mark Lesson 2 complete (2 / 4 = 50%)
    const markRes2 = await progressService.markLessonComplete(
      student._id.toString(),
      course._id.toString(),
      lesson2._id.toString()
    );
    assert(markRes2.progressPercentage === 50, 'Progress automatically calculated as 50%');

    // Mark Lesson 3 complete (3 / 4 = 75%)
    const markRes3 = await progressService.markLessonComplete(
      student._id.toString(),
      course._id.toString(),
      lesson3._id.toString()
    );
    assert(markRes3.progressPercentage === 75, 'Progress automatically calculated as 75%');

    console.log('\n--- TEST 5: Toggle Lesson Incomplete Decrements Progress ---');
    // Toggle Lesson 3 back to incomplete (2 / 4 = 50%)
    const unmarkRes3 = await progressService.markLessonComplete(
      student._id.toString(),
      course._id.toString(),
      lesson3._id.toString()
    );
    assert(unmarkRes3.isMarkedComplete === false, 'Lesson 3 toggled to incomplete');
    assert(unmarkRes3.progressPercentage === 50, 'Progress automatically decrements back to 50%');

    // Re-complete Lesson 3 (3 / 4 = 75%)
    await progressService.markLessonComplete(
      student._id.toString(),
      course._id.toString(),
      lesson3._id.toString()
    );

    console.log('\n--- TEST 6: Incomplete Certificate Protection ---');
    let certRejected = false;
    try {
      await certificateService.generateCertificate(student._id.toString(), course._id.toString());
    } catch (err) {
      if (err.statusCode === 400) certRejected = true;
    }
    assert(certRejected, 'Cannot generate certificate when course is only 75% completed');

    console.log('\n--- TEST 7: 100% Course Completion & Certificate Unlock ---');
    // Complete Lesson 4 (4 / 4 = 100%)
    const markRes4 = await progressService.markLessonComplete(
      student._id.toString(),
      course._id.toString(),
      lesson4._id.toString()
    );
    assert(markRes4.progressPercentage === 100, 'Progress reached 100%');
    assert(markRes4.completed === true, 'Course status marked completed: true');
    assert(markRes4.certificate !== null, 'Certificate generated upon 100% completion');

    // Verify certificate generation service idempotency
    const cert = await certificateService.generateCertificate(
      student._id.toString(),
      course._id.toString()
    );
    assert(cert && cert.certificateId, 'Certificate verified with code: ' + cert?.certificateId);
    assert(
      cert.grade.includes('100% Course Completion') || cert.grade.includes('Achievement'),
      'Certificate grade recorded properly'
    );

    console.log('\n==========================================');
    console.log(`Summary: ${passed} Passed, ${failed} Failed`);
    console.log('==========================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during test run:', error);
    process.exit(1);
  } finally {
    if (mongoServer) {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
  }
}

runTests();
