import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';

import User from './models/User.js';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';
import Enrollment from './models/Enrollment.js';
import Quiz from './models/Quiz.js';
import Certificate from './models/Certificate.js';
import Notification from './models/Notification.js';
import ChatMessage from './models/ChatMessage.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing data...');
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    await Enrollment.deleteMany();
    await Quiz.deleteMany();
    await Certificate.deleteMany();
    await Notification.deleteMany();
    await ChatMessage.deleteMany();

    console.log('[Seed] Creating default users...');
    // Create users one by one to ensure pre-save bcrypt hook executes
    const admin = await User.create({
      name: 'Dr. Sarah Jenkins (Admin)',
      email: 'admin@lms.com',
      password: 'Password123!',
      role: 'admin',
      headline: 'Platform Administrator & Chief Curriculum Officer',
      bio: 'Leading technological and pedagogical standards across the LMS platform.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    });

    const instructor = await User.create({
      name: 'Prof. Alex Rivera',
      email: 'instructor@lms.com',
      password: 'Password123!',
      role: 'instructor',
      headline: 'Senior Full-Stack Engineer & AI Researcher',
      bio: 'Over 12 years of industry experience leading teams at top tech firms. Passionate about empowering learners.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        website: 'https://example.com',
      },
    });

    const student = await User.create({
      name: 'Jordan Lee (Student)',
      email: 'student@lms.com',
      password: 'Password123!',
      role: 'student',
      headline: 'Aspiring Full-Stack Software Developer',
      bio: 'Learning modern web architectures, cloud deployment, and system design.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    });

    const student2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena@lms.com',
      password: 'Password123!',
      role: 'student',
      headline: 'Data Analyst & Machine Learning Enthusiast',
      bio: 'Exploring Python data pipelines and AI foundations.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    });

    console.log('[Seed] Users created:');
    console.log(`  Admin:      ${admin.email} / Password123!`);
    console.log(`  Instructor: ${instructor.email} / Password123!`);
    console.log(`  Student:    ${student.email} / Password123!`);

    console.log('[Seed] Creating courses...');
    const course1 = await Course.create({
      title: 'Full-Stack Web Development Bootcamp: React, Node & MongoDB',
      slug: 'full-stack-web-development-bootcamp',
      description: 'Master modern full-stack application development from scratch. Build end-to-end production systems using React 19, Tailwind CSS, Node.js, Express, and MongoDB with real-time WebSockets and JWT security.',
      shortDescription: 'Master modern full-stack web engineering with React, Node.js, and MongoDB.',
      category: 'Web Development',
      level: 'Beginner',
      instructor: instructor._id,
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      price: 49,
      isFree: false,
      isPublished: true,
      isFeatured: true,
      requirements: [
        'Basic understanding of HTML, CSS, and modern JavaScript (ES6+)',
        'A computer with Node.js and VS Code or Antigravity installed',
      ],
      willLearn: [
        'Build scalable RESTful APIs with Express and Mongoose',
        'Implement robust JWT authentication and Role-Based Access Control',
        'State management using Redux Toolkit and Axios interceptors',
        'Deploy production web applications to cloud platforms',
      ],
      tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
      rating: 4.9,
      numReviews: 48,
      enrollmentCount: 2,
    });

    const course2 = await Course.create({
      title: 'Python for Data Science & Machine Learning Masterclass',
      slug: 'python-data-science-machine-learning',
      description: 'Comprehensive pathway to data science and machine learning. Learn NumPy, Pandas, Matplotlib, Scikit-Learn, and build predictive algorithms from real-world datasets.',
      shortDescription: 'Learn Python, statistical data analysis, and predictive machine learning models.',
      category: 'Data Science',
      level: 'Intermediate',
      instructor: instructor._id,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      price: 59,
      isFree: false,
      isPublished: true,
      isFeatured: true,
      requirements: ['Basic Python programming syntax'],
      willLearn: [
        'Data cleaning, transformation, and wrangling with Pandas',
        'Exploratory Data Analysis and statistical visualizations',
        'Supervised and unsupervised machine learning algorithms',
      ],
      tags: ['Python', 'Data Science', 'Machine Learning', 'Pandas'],
      rating: 4.8,
      numReviews: 32,
      enrollmentCount: 1,
    });

    const course3 = await Course.create({
      title: 'Modern UI/UX Design Systems with Figma & Tailwind',
      slug: 'modern-ui-ux-design-systems',
      description: 'Learn the craft of modern interface design, typography, spacing hierarchies, component tokens, and translation to responsive Tailwind CSS code.',
      shortDescription: 'Craft intuitive, accessible user interfaces and modern design tokens.',
      category: 'UI/UX Design',
      level: 'All Levels',
      instructor: instructor._id,
      thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      price: 0,
      isFree: true,
      isPublished: true,
      isFeatured: true,
      requirements: ['No prior design experience necessary'],
      willLearn: [
        'Master UI design principles and accessibility standards',
        'Create scalable Figma design tokens and component variants',
        'Translate designs into pixel-perfect responsive Tailwind layouts',
      ],
      tags: ['Figma', 'UI/UX', 'Design Systems', 'Tailwind CSS'],
      rating: 4.95,
      numReviews: 24,
      enrollmentCount: 1,
    });

    console.log('[Seed] Creating curriculum and lessons for Course 1...');
    const l1 = await Lesson.create({
      course: course1._id,
      section: 'Module 1: Foundations & Architecture',
      title: '1. Introduction to Client-Server Architecture & REST APIs',
      order: 1,
      duration: 12,
      videoUrl: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
      videoType: 'youtube',
      description: 'In this lesson, we dissect the request-response lifecycle, HTTP verbs, status codes, and the anatomy of scalable web backends.',
      isFreePreview: true,
    });

    const l2 = await Lesson.create({
      course: course1._id,
      section: 'Module 1: Foundations & Architecture',
      title: '2. Express.js Middleware Pipeline & Database Modeling',
      order: 2,
      duration: 18,
      videoUrl: 'https://www.youtube.com/watch?v=SccSCuHhOw0',
      videoType: 'youtube',
      description: 'Explore middleware sequencing in Express, error handling boundaries, and designing relational data structures in MongoDB using Mongoose.',
      isFreePreview: false,
    });

    const l3 = await Lesson.create({
      course: course1._id,
      section: 'Module 2: Frontend State & React 19',
      title: '3. Redux Toolkit Architecture & Slice Design',
      order: 3,
      duration: 15,
      videoUrl: 'https://www.youtube.com/watch?v=9zySeP5vH9c',
      videoType: 'youtube',
      description: 'Learn how to configure the Redux store, implement asynchronous thunks, and integrate Axios interceptors for seamless JWT authentication.',
      isFreePreview: false,
    });

    const l4 = await Lesson.create({
      course: course1._id,
      section: 'Module 2: Frontend State & React 19',
      title: '4. Real-time Communication with Socket.IO',
      order: 4,
      duration: 20,
      videoUrl: 'https://www.youtube.com/watch?v=1BfCnjr_Vjg',
      videoType: 'youtube',
      description: 'Connect the frontend React client to the Socket.IO server for instant two-way chat messaging, room subscription, and live notifications.',
      isFreePreview: false,
    });

    console.log('[Seed] Creating lessons for Course 2 & 3...');
    await Lesson.create({
      course: course2._id,
      section: 'Module 1: Data Analysis Basics',
      title: '1. Introduction to NumPy Arrays & Vectorized Computing',
      order: 1,
      duration: 15,
      videoUrl: 'https://www.youtube.com/watch?v=QUT1VHiLmmI',
      videoType: 'youtube',
      description: 'Understanding memory-efficient numerical computation with Python.',
      isFreePreview: true,
    });

    await Lesson.create({
      course: course3._id,
      section: 'Module 1: Design Fundamentals',
      title: '1. Visual Hierarchy, Spacing, and Typographic Scales',
      order: 1,
      duration: 14,
      videoUrl: 'https://www.youtube.com/watch?v=TRst8P_53jA',
      videoType: 'youtube',
      description: 'The core foundations of clean, modern digital interface design.',
      isFreePreview: true,
    });

    console.log('[Seed] Creating assessment quiz for Course 1...');
    const quiz1 = await Quiz.create({
      course: course1._id,
      lesson: l4._id,
      title: 'Full-Stack Architecture & Security Comprehensive Quiz',
      description: 'Evaluate your understanding of REST architecture, JWT security, and state management.',
      passingScore: 70,
      timeLimitMinutes: 10,
      questions: [
        {
          questionText: 'What is the primary architectural purpose of an Axios Request Interceptor in a JWT auth flow?',
          options: [
            'To encrypt the payload with symmetric keys',
            'To automatically inject the Authorization: Bearer <token> header into outgoing requests',
            'To prevent SQL injection on client machines',
            'To render React components faster',
          ],
          correctAnswerIndex: 1,
          explanation: 'Request interceptors allow you to modify outgoing HTTP requests before dispatch, making them the standard pattern for attaching authentication tokens.',
          points: 10,
        },
        {
          questionText: 'Which HTTP status code should a server return when an invalid or expired JWT token is received?',
          options: ['200 OK', '401 Unauthorized', '403 Forbidden', '500 Internal Server Error'],
          correctAnswerIndex: 1,
          explanation: '401 Unauthorized denotes that the request lacks valid authentication credentials for the target resource.',
          points: 10,
        },
        {
          questionText: 'In MongoDB with Mongoose, what is the best practice for storing confidential user password hashes?',
          options: [
            'Store in plaintext for rapid lookup',
            'Hash with bcrypt and set "select: false" on the Mongoose schema',
            'Encrypt with Base64 encoding',
            'Store inside the local browser localStorage',
          ],
          correctAnswerIndex: 1,
          explanation: 'Using bcrypt with a high salt work factor and setting select: false ensures that password hashes are never accidentally leaked in API responses.',
          points: 10,
        },
      ],
    });

    l4.quiz = quiz1._id;
    await l4.save();

    console.log('[Seed] Enrolling student in Course 1...');
    const enrollment = await Enrollment.create({
      student: student._id,
      course: course1._id,
      completedLessons: [
        { lesson: l1._id, completedAt: new Date(Date.now() - 86400000 * 3) },
        { lesson: l2._id, completedAt: new Date(Date.now() - 86400000 * 2) },
        { lesson: l3._id, completedAt: new Date(Date.now() - 86400000 * 1) },
      ],
      progressPercentage: 75,
      lastAccessedLesson: l4._id,
    });

    console.log('[Seed] Enrolling student in Course 3 (100% completed with Certificate)...');
    const certCode = 'CERT-LMS-2026-DEMO99';
    const certificate = await Certificate.create({
      student: student._id,
      course: course3._id,
      certificateCode: certCode,
      issueDate: new Date(),
      grade: 'Distinction - 100% Mastery',
      instructorName: instructor.name,
    });

    await Enrollment.create({
      student: student._id,
      course: course3._id,
      completedLessons: [],
      progressPercentage: 100,
      isCompleted: true,
      completedAt: new Date(),
      certificate: certificate._id,
    });

    console.log('[Seed] Creating sample notifications...');
    await Notification.create([
      {
        recipient: student._id,
        title: 'Welcome to the LMS Portal!',
        message: 'Explore our rich course catalog, watch interactive lessons, and earn certified credentials.',
        type: 'system',
        link: '/student/dashboard',
        isRead: false,
      },
      {
        recipient: student._id,
        title: '🎓 Certificate Awarded!',
        message: `You completed "Modern UI/UX Design Systems" with distinction. Your certificate #${certCode} is ready.`,
        type: 'system',
        link: `/student/certificates/${certificate._id}`,
        isRead: false,
      },
      {
        recipient: instructor._id,
        title: 'New Student Enrollment',
        message: `${student.name} enrolled in "Full-Stack Web Development Bootcamp".`,
        type: 'enrollment',
        link: '/instructor/dashboard',
        isRead: false,
      },
    ]);

    console.log('[Seed] Creating initial chat messages...');
    await ChatMessage.create([
      {
        sender: instructor._id,
        room: 'general',
        text: 'Welcome everyone to the LMS community! Feel free to ask questions about courses, assignments, and tech stacks here.',
      },
      {
        sender: student._id,
        room: 'general',
        text: 'Hello Professor Rivera! Excited to be learning React 19 and Node.js architectures here.',
      },
      {
        sender: instructor._id,
        room: `course_${course1._id}`,
        course: course1._id,
        text: 'Welcome to the Full-Stack Bootcamp discussion channel! Post your questions on REST design and Redux state management in this thread.',
      },
    ]);

    console.log('[Seed] Database seeding completed successfully!');
    return true;
  } catch (err) {
    console.error('[Seed] Database seeding failed:', err);
    throw err;
  }
};

// If run directly via "node src/seed.js"
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      console.log('[Seed] Closing database connection...');
      await closeDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await closeDB();
      process.exit(1);
    });
}
