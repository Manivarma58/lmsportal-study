import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  User,
  Course,
  Lesson,
  Enrollment,
  Progress,
  Quiz,
  Question,
  QuizAttempt,
  Certificate,
  Notification,
  Message,
} from './models/index.js';

let mongoServer;

async function runTests() {
  console.log('=== STARTING MONGOOSE LMS MODELS COMPREHENSIVE VERIFICATION ===\n');

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('✔ Connected to In-Memory MongoDB');

  try {
    // 1. User Model & Password Hashing
    console.log('\n--- 1. Testing User Model & Password Hashing ---');
    const studentUser = await User.create({
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'PlainSecretPassword123!',
      role: 'student',
      profileImage: 'https://example.com/alice.jpg',
      bio: 'Enthusiastic web dev learner',
    });

    const instructorUser = await User.create({
      name: 'Bob Teacher',
      email: 'bob@example.com',
      password: 'TeacherPassword456!',
      role: 'instructor',
      avatar: 'https://example.com/bob.jpg', // testing alias
      bio: 'Senior Software Architect',
    });

    const adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin@example.com',
      password: 'AdminPassword789!',
      role: 'admin',
    });

    console.log('✔ Created Student, Instructor, Admin users');

    // Verify password is NOT plain text
    const fetchedRawUser = await User.findById(studentUser._id).select('+password');
    if (fetchedRawUser.password === 'PlainSecretPassword123!') {
      throw new Error('SECURITY VIOLATION: Password was stored in plain text!');
    }
    console.log('✔ Password hashed successfully with bcrypt (Hash prefix: ' + fetchedRawUser.password.substring(0, 7) + '...)');

    // Test matchPassword
    const isMatch = await studentUser.matchPassword('PlainSecretPassword123!');
    const isWrongMatch = await studentUser.matchPassword('WrongPassword');
    if (!isMatch || isWrongMatch) {
      throw new Error('Password match verification failed');
    }
    console.log('✔ matchPassword() method verified');

    // Test JWT generation
    const token = studentUser.getSignedJwtToken();
    if (!token || typeof token !== 'string') {
      throw new Error('JWT token generation failed');
    }
    console.log('✔ getSignedJwtToken() verified');

    // Test unique email constraint
    let duplicateErrorCaught = false;
    try {
      await User.create({
        name: 'Duplicate Alice',
        email: 'alice@example.com',
        password: 'Password123!',
      });
    } catch (err) {
      duplicateErrorCaught = true;
    }
    if (!duplicateErrorCaught) {
      throw new Error('Unique email constraint failed!');
    }
    console.log('✔ Unique email constraint enforced');

    // Test alias avatar <-> profileImage
    if (instructorUser.profileImage !== 'https://example.com/bob.jpg' || instructorUser.avatar !== 'https://example.com/bob.jpg') {
      throw new Error('profileImage / avatar alias failed');
    }
    console.log('✔ profileImage / avatar alias verified');

    // 2. Course Model
    console.log('\n--- 2. Testing Course Model ---');
    const course = await Course.create({
      title: 'Full Stack JavaScript Mastery',
      description: 'Comprehensive guide to modern web development.',
      category: 'Web Development',
      level: 'Intermediate',
      thumbnail: 'https://example.com/course.jpg',
      instructor: instructorUser._id,
      price: 49.99,
      published: true, // test published
    });

    if (!course.isPublished || !course.published) {
      throw new Error('Course published / isPublished alias failed');
    }
    console.log('✔ Course created with instructor reference and published alias verified');

    // 3. Lesson Model
    console.log('\n--- 3. Testing Lesson Model ---');
    const lesson1 = await Lesson.create({
      course: course._id,
      title: 'Lesson 1: Introduction to Node.js',
      description: 'Understanding event loop and runtime.',
      videoUrl: 'https://youtube.com/watch?v=example1',
      resources: [
        { title: 'Slides.pdf', fileUrl: 'https://example.com/slides.pdf', fileType: 'pdf' },
      ],
      duration: 15,
      order: 1,
    });

    const lesson2 = await Lesson.create({
      course: course._id,
      title: 'Lesson 2: Mongoose Modeling',
      description: 'Schemas, indexes, and validation.',
      videoUrl: 'https://youtube.com/watch?v=example2',
      duration: 20,
      order: 2,
    });

    console.log('✔ Lessons created with course reference, resources, duration, order');

    // Test virtual populate of lessons on course
    const populatedCourse = await Course.findById(course._id).populate('lessons');
    if (!populatedCourse.lessons || populatedCourse.lessons.length !== 2) {
      throw new Error(`Expected 2 populated lessons on Course, got ${populatedCourse.lessons?.length}`);
    }
    console.log('✔ Course virtual lessons populate verified (Found ' + populatedCourse.lessons.length + ' lessons)');

    // 4. Enrollment Model
    console.log('\n--- 4. Testing Enrollment Model ---');
    const enrollment = await Enrollment.create({
      student: studentUser._id,
      course: course._id,
      enrolledAt: new Date(),
      completed: false,
      completionPercentage: 50,
      completedLessons: [{ lesson: lesson1._id, completedAt: new Date() }],
      lastAccessedLesson: lesson1._id,
    });

    if (enrollment.progressPercentage !== 50 || enrollment.isCompleted !== false) {
      throw new Error('Enrollment aliases failed');
    }
    console.log('✔ Enrollment created and aliases verified');

    // Test unique student + course constraint
    let dupEnrollmentCaught = false;
    try {
      await Enrollment.create({
        student: studentUser._id,
        course: course._id,
      });
    } catch (err) {
      dupEnrollmentCaught = true;
    }
    if (!dupEnrollmentCaught) {
      throw new Error('Enrollment unique constraint failed');
    }
    console.log('✔ Enrollment compound unique constraint (student + course) verified');

    // 5. Progress Model
    console.log('\n--- 5. Testing Progress Model ---');
    const progress = await Progress.create({
      student: studentUser._id,
      course: course._id,
      completedLessons: [lesson1._id],
      lastAccessedLesson: lesson1._id,
      percentage: 50,
    });

    let dupProgressCaught = false;
    try {
      await Progress.create({
        student: studentUser._id,
        course: course._id,
      });
    } catch (err) {
      dupProgressCaught = true;
    }
    if (!dupProgressCaught) {
      throw new Error('Progress unique constraint failed');
    }
    console.log('✔ Progress model created and unique constraint verified');

    // 6 & 7. Quiz and Question Models
    console.log('\n--- 6 & 7. Testing Quiz & Question Models ---');
    const quiz = await Quiz.create({
      course: course._id,
      lesson: lesson2._id,
      title: 'Mongoose Basics Quiz',
      description: 'Test your understanding of schemas',
      passingScore: 80,
      questions: [
        {
          questionText: 'What is Mongoose?',
          options: ['ODM for MongoDB', 'A relational DB', 'A CSS Framework', 'A compiler'],
          correctAnswerIndex: 0,
          points: 10,
        },
      ],
    });

    console.log('✔ Quiz created with embedded question schema compatibility');

    // Test standalone Question model
    const standaloneQuestion = await Question.create({
      quiz: quiz._id,
      question: 'Which method hashes passwords?',
      options: ['bcrypt.hash', 'JSON.stringify', 'Math.random', 'crypto.pad'],
      correctAnswer: 0,
      marks: 10,
    });

    if (standaloneQuestion.questionText !== 'Which method hashes passwords?' || standaloneQuestion.points !== 10) {
      throw new Error('Question model aliases failed');
    }
    console.log('✔ Standalone Question model created, validated, and aliases verified');

    // 8. QuizAttempt Model
    console.log('\n--- 8. Testing QuizAttempt Model ---');
    const attempt = await QuizAttempt.create({
      student: studentUser._id,
      quiz: quiz._id,
      answers: [
        {
          question: standaloneQuestion._id,
          questionIndex: 0,
          selectedOption: 0,
          isCorrect: true,
          marksObtained: 10,
        },
      ],
      score: 10,
      passed: true,
      attemptedAt: new Date(),
    });

    console.log('✔ QuizAttempt model created with student, quiz, answers, score, passed, attemptedAt');

    // 9. Certificate Model
    console.log('\n--- 9. Testing Certificate Model ---');
    const cert = await Certificate.create({
      student: studentUser._id,
      course: course._id,
      certificateId: 'CERT-TEST-12345',
      issueDate: new Date(),
    });

    if (cert.certificateCode !== 'CERT-TEST-12345') {
      throw new Error('Certificate certificateCode alias failed');
    }

    let dupCertCaught = false;
    try {
      await Certificate.create({
        student: studentUser._id,
        course: course._id,
        certificateId: 'CERT-TEST-DIFFERENT',
      });
    } catch (err) {
      dupCertCaught = true;
    }
    if (!dupCertCaught) {
      throw new Error('Certificate unique student + course constraint failed');
    }
    console.log('✔ Certificate model created and unique constraint verified');

    // 10. Notification Model
    console.log('\n--- 10. Testing Notification Model ---');
    const notification = await Notification.create({
      recipient: studentUser._id,
      title: 'Welcome to LMS',
      message: 'You have enrolled in Full Stack JavaScript Mastery',
      type: 'enrollment',
      read: false,
    });

    if (notification.isRead !== false) {
      throw new Error('Notification read / isRead alias failed');
    }
    console.log('✔ Notification model created, validated, and alias verified');

    // 11. Message Model
    console.log('\n--- 11. Testing Message Model ---');
    const msg = await Message.create({
      sender: studentUser._id,
      receiver: instructorUser._id,
      message: 'Hello instructor! I have a question on lesson 2.',
      timestamp: new Date(),
      read: false,
    });

    if (msg.recipient.toString() !== instructorUser._id.toString() || msg.text !== 'Hello instructor! I have a question on lesson 2.') {
      throw new Error('Message recipient / text alias failed');
    }
    console.log('✔ Message model created, direct messaging and aliases verified');

    console.log('\n======================================================');
    console.log('🎉 ALL 11 MONGOOSE MODELS VERIFIED SUCCESSFULLY! 🎉');
    console.log('======================================================\n');
  } finally {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

runTests().catch((err) => {
  console.error('❌ Model Verification Failed:', err);
  process.exit(1);
});
