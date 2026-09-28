import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';

import { connectDB } from './config/db.js';
import { initSocket } from './socket/socketHandler.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import securityHeaders from './middleware/securityHeaders.js';
import mongoSanitize from './middleware/mongoSanitize.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import targetRoleRoutes from './routes/targetRoleRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import aiMentorRoutes from './routes/aiMentorRoutes.js';
import jobSimulationRoutes from './routes/jobSimulationRoutes.js';
import adaptiveLearningRoutes from './routes/adaptiveLearningRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';

// Load environment variables
dotenv.config();

// Catalog bootstrapper function to ensure all collections are seeded on startup
export const bootstrapDatabaseCatalogs = async () => {
  console.log('[LMS Server] Running database catalog verification & self-healing checks...');

  // 1. Core Users and Courses
  try {
    const User = (await import('./models/User.js')).default;
    const userCount = await User.countDocuments();
    const Course = (await import('./models/Course.js')).default;
    const courseCount = await Course.countDocuments();
    if (userCount === 0 || courseCount === 0) {
      console.log('[LMS Server] Seeding core platform users and courses...');
      const { seedDatabase } = await import('./seed.js');
      await seedDatabase();
    }
  } catch (err) {
    console.warn('[LMS Server] Users/Courses seed notice:', err.message);
  }

  // 2. Skills Taxonomy
  try {
    const Skill = (await import('./models/Skill.js')).default;
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
      console.log('[LMS Server] Seeding core skills taxonomy...');
      const { seedSkills } = await import('./seed-skills.js');
      await seedSkills();
    }
  } catch (err) {
    console.warn('[LMS Server] Skills seed notice:', err.message);
  }

  // 3. Target Roles Catalog
  try {
    const TargetRole = (await import('./models/TargetRole.js')).default;
    const targetRoleCount = await TargetRole.countDocuments();
    if (targetRoleCount < 3) {
      console.log('[LMS Server] Seeding target roles catalog...');
      const { seedTargetRoles } = await import('./seed-target-roles.js');
      await seedTargetRoles();
    }
  } catch (err) {
    console.warn('[LMS Server] Target roles seed notice:', err.message);
  }

  // 4. Coding Laboratory Challenges
  try {
    const CodingChallenge = (await import('./models/CodingChallenge.js')).default;
    const challengeCount = await CodingChallenge.countDocuments();
    if (challengeCount === 0) {
      console.log('[LMS Server] Seeding coding laboratory challenges...');
      const { seedChallenges } = await import('./seed-challenges.js');
      await seedChallenges();
    }
  } catch (err) {
    console.warn('[LMS Server] Coding challenges seed notice:', err.message);
  }

  // 5. Real-World Practical Projects
  try {
    const Project = (await import('./models/Project.js')).default;
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      console.log('[LMS Server] Seeding real-world projects catalog...');
      const { seedProjects } = await import('./seed-projects.js');
      await seedProjects();
    }
  } catch (err) {
    console.warn('[LMS Server] Projects seed notice:', err.message);
  }

  // 6. Practical Assignments
  try {
    const Assignment = (await import('./models/Assignment.js')).default;
    const assignmentCount = await Assignment.countDocuments();
    if (assignmentCount === 0) {
      console.log('[LMS Server] Seeding practical assignments catalog...');
      const { seedAssignments } = await import('./seed-assignments.js');
      await seedAssignments();
    }
  } catch (err) {
    console.warn('[LMS Server] Assignments seed notice:', err.message);
  }

  // 7. Job Simulations
  try {
    const JobSimulation = (await import('./models/JobSimulation.js')).default;
    const simCount = await JobSimulation.countDocuments();
    if (simCount === 0) {
      console.log('[LMS Server] Seeding job simulations catalog...');
      const { seedJobSimulations } = await import('./services/jobSimulationService.js');
      await seedJobSimulations();
    }
  } catch (err) {
    console.warn('[LMS Server] Job simulations seed notice:', err.message);
  }

  // 8. Cohorts and Student Evidence
  try {
    const { seedInstructorIntelligenceCohort } = await import('./seed-instructor-intelligence.js');
    await seedInstructorIntelligenceCohort();
  } catch (err) {
    console.warn('[LMS Server] Instructor intelligence notice:', err.message);
  }

  try {
    const { seedPortfolioEvidenceForStudent } = await import('./seed-portfolio-evidence.js');
    await seedPortfolioEvidenceForStudent();
  } catch (err) {
    console.warn('[LMS Server] Portfolio evidence notice:', err.message);
  }

  console.log('[LMS Server] Catalog verification complete.');
};

// Connect to MongoDB
connectDB().then(async () => {
  await bootstrapDatabaseCatalogs();
});

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://lmsportal-study.vercel.app',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((s) => s.trim().replace(/\/$/, '')) : []),
];

const corsOriginHandler = (origin, callback) => {
  // Allow requests with no origin (such as mobile apps, curl, Postman, test scripts)
  if (!origin) return callback(null, true);

  const cleanOrigin = origin.replace(/\/$/, '');
  const isAllowed =
    allowedOrigins.some((allowed) => allowed.replace(/\/$/, '') === cleanOrigin) ||
    (cleanOrigin.startsWith('https://lmsportal-') && cleanOrigin.endsWith('.vercel.app')) ||
    process.env.NODE_ENV !== 'production';

  if (isAllowed) {
    return callback(null, true);
  }

  // Reject unauthorized origins cleanly without crashing preflight requests
  return callback(null, false);
};

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security & performance headers
app.use(securityHeaders);
app.use(
  cors({
    origin: corsOriginHandler,
    credentials: true,
  })
);

// High-performance gzip/deflate response compression for payloads > 1KB
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  })
);

// Body Parsers (Restricted to 2MB to prevent memory exhaustion DoS)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Sanitize MongoDB / NoSQL injection attempts across body, query, and params
app.use(mongoSanitize);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve static uploaded files with strict no-sniff and sandbox headers
const uploadDir = path.resolve('uploads');
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox;");
    next();
  },
  express.static(uploadDir)
);

// Initialize Socket.IO logic
initSocket(io);

// Apply General API Rate Limiting (300 req / 15 min per IP)
app.use(['/api', '/auth', '/courses'], apiLimiter);

// Strict Rate Limiting on Authentication Endpoints (15 req / 15 min per IP)
app.use(['/api/auth/login', '/auth/login'], authLimiter);
app.use(['/api/auth/register', '/auth/register'], authLimiter);
app.use(['/api/auth/forgot-password', '/auth/forgot-password'], authLimiter);

// Health check route (supports both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'LMS Portal REST API & Socket.IO Server is online.',
    timestamp: new Date().toISOString(),
  });
});

// Self-healing catalog seeding & status trigger
app.all(['/api/system/auto-seed', '/system/auto-seed'], async (req, res) => {
  try {
    await bootstrapDatabaseCatalogs();
    const [skills, roles, challenges, projects, assignments, courses] = await Promise.all([
      (await import('./models/Skill.js')).default.countDocuments(),
      (await import('./models/TargetRole.js')).default.countDocuments(),
      (await import('./models/CodingChallenge.js')).default.countDocuments(),
      (await import('./models/Project.js')).default.countDocuments(),
      (await import('./models/Assignment.js')).default.countDocuments(),
      (await import('./models/Course.js')).default.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      message: 'Platform catalogs verified and seeded successfully.',
      counts: { skills, targetRoles: roles, codingChallenges: challenges, projects, assignments, courses },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to mount routes on both /api and root paths
const mountAllRoutes = (prefix = '/api') => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/courses`, courseRoutes);
  app.use(`${prefix}/lessons`, lessonRoutes);
  app.use(`${prefix}/enrollments`, enrollmentRoutes);
  app.use(`${prefix}/progress`, progressRoutes);
  app.use(`${prefix}/quizzes`, quizRoutes);
  app.use(`${prefix}/certificates`, certificateRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/chat`, chatRoutes);
  app.use(`${prefix}/analytics`, analyticsRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/upload`, uploadRoutes);
  app.use(`${prefix}/skills`, skillRoutes);
  app.use(`${prefix}/challenges`, challengeRoutes);
  app.use(`${prefix}/assignments`, assignmentRoutes);
  app.use(`${prefix}/projects`, projectRoutes);
  app.use(`${prefix}/target-roles`, targetRoleRoutes);
  app.use(`${prefix}/recommendations`, recommendationRoutes);
  app.use(`${prefix}/mentor`, aiMentorRoutes);
  app.use(`${prefix}/simulations`, jobSimulationRoutes);
  app.use(`${prefix}/adaptive`, adaptiveLearningRoutes);
  app.use(`${prefix}/portfolio`, portfolioRoutes);
};

// Mount primary /api/* routes and root fallback routes
mountAllRoutes('/api');
mountAllRoutes('');

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n[LMS Server Error] Port ${PORT} is already in use by another process.`);
    console.error(`[LMS Server Tip] You can free port ${PORT} by stopping any existing process or running in PowerShell:`);
    console.error(`   Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`);
    process.exit(1);
  } else {
    console.error('[LMS Server Error]', error);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`[LMS Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[LMS Server] API Health Check: http://localhost:${PORT}/api/health`);
});

const handleShutdown = (signal) => {
  console.log(`\n[LMS Server] Received ${signal}. Closing server gracefully...`);
  server.close(() => {
    console.log('[LMS Server] Server closed. Port released.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export { app, server, io };
