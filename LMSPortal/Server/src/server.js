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

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(async () => {
  try {
    const User = (await import('./models/User.js')).default;
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[LMS Server] No users detected in database. Seeding demo accounts...');
      const { seedDatabase } = await import('./seed.js');
      await seedDatabase();
      console.log('[LMS Server] Auto-seed completed successfully.');
    }
  } catch (seedErr) {
    console.warn('[LMS Server] Auto-seed check notice:', seedErr.message);
  }
});

const app = express();
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
    cleanOrigin.endsWith('.vercel.app') ||
    cleanOrigin.endsWith('.onrender.com') ||
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
