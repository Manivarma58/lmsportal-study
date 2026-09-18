import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/authRoutes.js';
import { authMiddleware, roleMiddleware } from './middleware/authMiddleware.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import User from './models/User.js';

let mongoServer;
let server;
let baseUrl;

// Set environment for testing
process.env.JWT_SECRET = 'test_jwt_secret_key_1234567890_!@#$%^';

async function setupApp() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const app = express();
  app.use(express.json());

  // Mount auth routes
  app.use('/api/auth', authRoutes);

  // Test routes for role-based authorization verification
  app.get('/api/test/student-only', authMiddleware, roleMiddleware('student'), (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome student!', user: req.user.name });
  });

  app.get('/api/test/instructor-only', authMiddleware, roleMiddleware('instructor'), (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome instructor!', user: req.user.name });
  });

  app.get('/api/test/admin-only', authMiddleware, roleMiddleware('admin'), (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome admin!', user: req.user.name });
  });

  app.get('/api/test/staff-only', authMiddleware, roleMiddleware('instructor', 'admin'), (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome staff!', user: req.user.name });
  });

  app.use(notFound);
  app.use(errorHandler);

  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`✔ Test server running on ${baseUrl}`);
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
  console.log('✔ Test server and In-Memory MongoDB cleanly stopped.');
}

// Assertion helper
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
}

async function runAuthTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE AUTHENTICATION & AUTHORIZATION TESTS 🚀');
  console.log('================================================================\n');

  await setupApp();

  let studentToken, instructorToken, adminToken;
  let studentUser, instructorUser, adminUser;

  try {
    // -------------------------------------------------------------
    // TEST 1: Register Valid Student, Instructor, and Admin
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Registration (Valid Inputs) ---');

    // Register Student
    const regStudentRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Student',
        email: 'student@example.com',
        password: 'Password123!',
        role: 'student',
      }),
    });
    const regStudentData = await regStudentRes.json();
    assert(regStudentRes.status === 201, `Expected status 201 for student registration, got ${regStudentRes.status}`);
    assert(regStudentData.success === true, 'Expected success === true');
    assert(Boolean(regStudentData.token), 'Expected token in register response');
    assert(regStudentData.user.role === 'student', 'Expected role to be student');
    assert(regStudentData.user.password === undefined, 'SECURITY LEAK: Password exposed in register response!');
    assert(regStudentData.user.passwordHash === undefined, 'SECURITY LEAK: Password hash exposed in register response!');
    studentToken = regStudentData.token;
    studentUser = regStudentData.user;
    console.log('✔ Student registration passed (201 Created)');

    // Register Instructor
    const regInstRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Prof. Alan Turing',
        email: 'instructor@example.com',
        password: 'Password123!',
        role: 'instructor',
      }),
    });
    const regInstData = await regInstRes.json();
    assert(regInstRes.status === 201, `Expected status 201 for instructor registration, got ${regInstRes.status}`);
    assert(regInstData.user.role === 'instructor', 'Expected role to be instructor');
    assert(regInstData.user.password === undefined, 'Password exposed in instructor register!');
    instructorToken = regInstData.token;
    instructorUser = regInstData.user;
    console.log('✔ Instructor registration passed (201 Created)');

    // Register Admin
    const regAdminRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Chief Admin',
        email: 'admin@example.com',
        password: 'Password123!',
        role: 'admin',
      }),
    });
    const regAdminData = await regAdminRes.json();
    assert(regAdminRes.status === 201, `Expected status 201 for admin registration, got ${regAdminRes.status}`);
    assert(regAdminData.user.role === 'admin', 'Expected role to be admin');
    assert(regAdminData.user.password === undefined, 'Password exposed in admin register!');
    adminToken = regAdminData.token;
    adminUser = regAdminData.user;
    console.log('✔ Admin registration passed (201 Created)');

    // Verify Password in Database is bcrypt hashed
    const dbUser = await User.findById(studentUser.id).select('+password');
    assert(dbUser.password !== 'Password123!', 'SECURITY VIOLATION: Password stored in plaintext!');
    assert(dbUser.password.startsWith('$2a$') || dbUser.password.startsWith('$2b$'), 'Password is not a valid bcrypt hash!');
    console.log('✔ Password hashing verified (bcrypt salt 10, never plain text)');

    // -------------------------------------------------------------
    // TEST 2: Registration Validation & Error Handling (Bad Inputs)
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Registration Input Validation ---');

    // Duplicate email
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Clone',
        email: 'student@example.com',
        password: 'Password123!',
      }),
    });
    assert(dupRes.status === 400, `Expected 400 on duplicate email, got ${dupRes.status}`);
    console.log('✔ Duplicate email rejected with 400 Bad Request');

    // Missing / invalid name
    const shortNameRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: ' ',
        email: 'newperson@example.com',
        password: 'Password123!',
      }),
    });
    assert(shortNameRes.status === 400, `Expected 400 on empty name, got ${shortNameRes.status}`);
    console.log('✔ Empty name rejected with 400 Bad Request');

    // Invalid email format
    const badEmailRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        email: 'not-a-valid-email',
        password: 'Password123!',
      }),
    });
    assert(badEmailRes.status === 400, `Expected 400 on invalid email, got ${badEmailRes.status}`);
    console.log('✔ Invalid email format rejected with 400 Bad Request');

    // Short password (<6 characters)
    const shortPassRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        email: 'validemail@example.com',
        password: '123',
      }),
    });
    assert(shortPassRes.status === 400, `Expected 400 on short password, got ${shortPassRes.status}`);
    console.log('✔ Password < 6 characters rejected with 400 Bad Request');

    // Invalid role
    const badRoleRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        email: 'validemail2@example.com',
        password: 'Password123!',
        role: 'superhacker',
      }),
    });
    assert(badRoleRes.status === 400, `Expected 400 on invalid role, got ${badRoleRes.status}`);
    console.log('✔ Unauthorized role rejected with 400 Bad Request');

    // -------------------------------------------------------------
    // TEST 3: Login Authentication
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Login Authentication ---');

    // Successful login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@example.com',
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, `Expected 200 on valid login, got ${loginRes.status}`);
    assert(Boolean(loginData.token), 'Expected token in login response');
    assert(loginData.user.email === 'student@example.com', 'Expected user email to match');
    assert(loginData.user.password === undefined, 'SECURITY LEAK: Password exposed in login response!');
    console.log('✔ Successful login with correct credentials (200 OK)');

    // Wrong password
    const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@example.com',
        password: 'WrongPassword!',
      }),
    });
    assert(wrongPassRes.status === 401, `Expected 401 on wrong password, got ${wrongPassRes.status}`);
    console.log('✔ Wrong password rejected with 401 Unauthorized');

    // Non-existent email
    const noUserRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nobody@example.com',
        password: 'Password123!',
      }),
    });
    assert(noUserRes.status === 401, `Expected 401 on non-existent email, got ${noUserRes.status}`);
    console.log('✔ Non-existent user rejected with 401 Unauthorized');

    // Missing email or password
    const missingCredsRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com' }),
    });
    assert(missingCredsRes.status === 400, `Expected 400 on missing password, got ${missingCredsRes.status}`);
    console.log('✔ Missing credentials rejected with 400 Bad Request');

    // -------------------------------------------------------------
    // TEST 4: Logout Endpoint
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Logout Endpoint ---');

    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const logoutData = await logoutRes.json();
    assert(logoutRes.status === 200, `Expected 200 on logout, got ${logoutRes.status}`);
    assert(logoutData.success === true, 'Expected success === true on logout');
    console.log('✔ Logout endpoint passed (200 OK)');

    // -------------------------------------------------------------
    // TEST 5: Get Current User (GET /api/auth/me)
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Current User Endpoint (GET /api/auth/me) ---');

    // Valid student token
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, `Expected 200 on /me with valid token, got ${meRes.status}`);
    assert(meData.user.email === 'student@example.com', 'Expected correct user returned');
    assert(meData.user.password === undefined, 'SECURITY LEAK: Password returned in /me!');
    assert(meData.user.passwordHash === undefined, 'SECURITY LEAK: Password hash returned in /me!');
    console.log('✔ GET /api/auth/me succeeded with valid token (200 OK)');

    // Missing token
    const noTokenRes = await fetch(`${baseUrl}/api/auth/me`);
    assert(noTokenRes.status === 401, `Expected 401 on missing token, got ${noTokenRes.status}`);
    console.log('✔ Missing token rejected with 401 Unauthorized');

    // Tampered / invalid token
    const badTokenRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer this_is_a_forged_invalid_token' },
    });
    assert(badTokenRes.status === 401, `Expected 401 on invalid token, got ${badTokenRes.status}`);
    console.log('✔ Invalid token rejected with 401 Unauthorized');

    // -------------------------------------------------------------
    // TEST 6: Role-Based Authorization Middleware (roleMiddleware)
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Role-Based Authorization Middleware ---');

    // 6a. Student role checks
    const studentAccessStudent = await fetch(`${baseUrl}/api/test/student-only`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentAccessStudent.status === 200, `Student should access student route, got ${studentAccessStudent.status}`);
    console.log('✔ Student can access student functionality (200 OK)');

    const studentAccessInstructor = await fetch(`${baseUrl}/api/test/instructor-only`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentAccessInstructor.status === 403, `Student MUST NOT access instructor route, got ${studentAccessInstructor.status}`);
    console.log('✔ Student blocked from instructor functionality (403 Forbidden)');

    const studentAccessAdmin = await fetch(`${baseUrl}/api/test/admin-only`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentAccessAdmin.status === 403, `Student MUST NOT access admin route, got ${studentAccessAdmin.status}`);
    console.log('✔ Student blocked from admin functionality (403 Forbidden)');

    // 6b. Instructor role checks
    const instAccessInstructor = await fetch(`${baseUrl}/api/test/instructor-only`, {
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert(instAccessInstructor.status === 200, `Instructor should access instructor route, got ${instAccessInstructor.status}`);
    console.log('✔ Instructor can access instructor functionality (200 OK)');

    const instAccessAdmin = await fetch(`${baseUrl}/api/test/admin-only`, {
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert(instAccessAdmin.status === 403, `Instructor MUST NOT access admin route, got ${instAccessAdmin.status}`);
    console.log('✔ Instructor blocked from admin functionality (403 Forbidden)');

    const instAccessStaff = await fetch(`${baseUrl}/api/test/staff-only`, {
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert(instAccessStaff.status === 200, `Instructor should access staff route, got ${instAccessStaff.status}`);
    console.log('✔ Instructor can access shared staff route (200 OK)');

    // 6c. Admin role checks
    const adminAccessAdmin = await fetch(`${baseUrl}/api/test/admin-only`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminAccessAdmin.status === 200, `Admin should access admin route, got ${adminAccessAdmin.status}`);
    console.log('✔ Admin can access admin functionality (200 OK)');

    const adminAccessStaff = await fetch(`${baseUrl}/api/test/staff-only`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminAccessStaff.status === 200, `Admin should access staff route, got ${adminAccessStaff.status}`);
    console.log('✔ Admin can access shared staff route (200 OK)');

    // -------------------------------------------------------------
    // TEST 7: Account Deactivation Check
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Deactivated Account Access ---');

    await User.findByIdAndUpdate(studentUser.id, { isActive: false });

    const deactivatedMeRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(deactivatedMeRes.status === 403, `Deactivated user should get 403, got ${deactivatedMeRes.status}`);

    const deactivatedLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@example.com',
        password: 'Password123!',
      }),
    });
    assert(deactivatedLoginRes.status === 403, `Deactivated user login should get 403, got ${deactivatedLoginRes.status}`);
    console.log('✔ Deactivated account blocked on both login and authenticated routes (403 Forbidden)');

    console.log('\n================================================================');
    console.log('🎉 ALL AUTHENTICATION & AUTHORIZATION TESTS PASSED PERFECTLY! 🎉');
    console.log('================================================================\n');
  } finally {
    await tearDown();
  }
}

runAuthTests().catch((err) => {
  console.error('\n❌ AUTHENTICATION TEST SUITE FAILED:', err);
  process.exit(1);
});
