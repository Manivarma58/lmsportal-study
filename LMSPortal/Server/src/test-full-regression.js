const BASE_URL = 'http://localhost:5000/api';

let passed = 0;
let failed = 0;
const failures = [];

const logSection = (title) => {
  console.log(`\n=================================================================`);
  console.log(`🔷 ${title}`);
  console.log(`=================================================================`);
};

const assert = (condition, description, errorDetails = null) => {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    if (errorDetails) {
      console.error(`     Details:`, errorDetails);
    }
    failed++;
    failures.push({ description, errorDetails });
  }
};

const api = async (endpoint, options = {}, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      // Non-JSON response
    }
    return { status: res.status, ok: res.ok, data, headers: res.headers };
  } catch (netErr) {
    return { status: 0, ok: false, error: netErr.message };
  }
};

async function runRegressionSuite() {
  console.log('=================================================================');
  console.log('🚀 EXECUTING COMPLETE REGRESSION TEST SUITE FOR NOVA LMS');
  console.log('=================================================================');

  // Shared variables
  let studentToken = null;
  let studentUser = null;
  let instructorToken = null;
  let instructorUser = null;
  let adminToken = null;
  let adminUser = null;

  let testCourse = null;
  let testLesson = null;
  let testQuiz = null;
  let testChallenge = null;
  let testAssignment = null;
  let testProject = null;
  let testSimulation = null;
  let testTargetRole = null;
  let generatedCertId = null;

  // -----------------------------------------------------------------
  // 1. AUTHENTICATION & MULTI-ROLE CREDENTIAL TESTS
  // -----------------------------------------------------------------
  logSection('1. Authentication & Multi-Role Validation');

  // Valid Student Login
  const studentLoginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'student@lms.com', password: 'Password123!' }),
  });
  assert(studentLoginRes.status === 200, 'Student authenticates successfully with valid credentials');
  assert(studentLoginRes.data?.user?.role === 'student', 'Student user role is confirmed as "student"');
  studentToken = studentLoginRes.data?.token;
  studentUser = studentLoginRes.data?.user;

  // Valid Instructor Login
  const instLoginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'instructor@lms.com', password: 'Password123!' }),
  });
  assert(instLoginRes.status === 200, 'Instructor authenticates successfully with valid credentials');
  assert(instLoginRes.data?.user?.role === 'instructor', 'Instructor user role is confirmed as "instructor"');
  instructorToken = instLoginRes.data?.token;
  instructorUser = instLoginRes.data?.user;

  // Valid Admin Login or Registration
  const adminLoginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@lms.com', password: 'Password123!' }),
  });
  if (adminLoginRes.status === 200) {
    adminToken = adminLoginRes.data?.token;
    adminUser = adminLoginRes.data?.user;
    assert(adminUser.role === 'admin', 'Existing Admin authenticates successfully');
  } else {
    // Bootstrap test admin
    const adminRegRes = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Super Administrator',
        email: 'admin_regression@lms.com',
        password: 'Password123!',
        role: 'admin',
        adminSecret: process.env.ADMIN_REGISTRATION_KEY || 'secret_admin_key_99999',
      }),
    });
    if (adminRegRes.status === 201) {
      adminToken = adminRegRes.data?.token;
      adminUser = adminRegRes.data?.user;
      assert(adminUser?.role === 'admin', 'Admin account registered with administrative authorization');
    } else {
      // Use fallback admin login if already exists
      const fallbackLogin = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin_regression@lms.com', password: 'Password123!' }),
      });
      adminToken = fallbackLogin.data?.token;
      adminUser = fallbackLogin.data?.user;
      assert(fallbackLogin.status === 200, 'Admin fallback authentication succeeded');
    }
  }

  // Invalid Inputs: Wrong Password
  const badPassRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'student@lms.com', password: 'IncorrectPassword999!' }),
  });
  assert(badPassRes.status === 401, 'Invalid password is cleanly rejected with HTTP 401 Unauthorized');
  assert(Boolean(badPassRes.data?.message), 'Meaningful error message returned for invalid password');

  // Invalid Inputs: Malformed Email
  const badEmailRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email', password: 'Password123!' }),
  });
  assert(badEmailRes.status === 400 || badEmailRes.status === 401, 'Malformed email format is rejected with meaningful error');

  // Expired / Forged Session Token
  const fakeTokenRes = await api('/auth/me', { method: 'GET' }, 'Bearer invalid_signature_token_12345');
  assert(fakeTokenRes.status === 401, 'Tampered/Forged JWT token rejected with HTTP 401 Unauthorized');

  // Missing Authorization Header
  const unauthRes = await api('/auth/me', { method: 'GET' });
  assert(unauthRes.status === 401, 'Unauthenticated request to protected route blocked with 401');

  // -----------------------------------------------------------------
  // 2. AUTHORIZATION & ROLE-BASED ACCESS CONTROL (RBAC)
  // -----------------------------------------------------------------
  logSection('2. Authorization & Role-Based Access Control');

  // Student blocked from Admin User Management
  const studentUsersReq = await api('/users', { method: 'GET' }, studentToken);
  assert(studentUsersReq.status === 403, 'Student blocked from GET /api/users (403 Forbidden)');

  // Student blocked from Admin Analytics
  const studentAdminAnalytics = await api('/analytics/admin', { method: 'GET' }, studentToken);
  assert(studentAdminAnalytics.status === 403, 'Student blocked from GET /api/analytics/admin (403 Forbidden)');

  // Student blocked from Instructor Intelligence
  const studentInstIntel = await api('/analytics/instructor/intelligence', { method: 'GET' }, studentToken);
  assert(studentInstIntel.status === 403, 'Student blocked from GET /api/analytics/instructor/intelligence (403 Forbidden)');

  // Student blocked from creating courses
  const studentCreateCourse = await api('/courses', {
    method: 'POST',
    body: JSON.stringify({ title: 'Hacked Course', category: 'Tech' }),
  }, studentToken);
  assert(studentCreateCourse.status === 403, 'Student blocked from POST /api/courses (403 Forbidden)');

  // Student blocked from manual skill tampering (VULN-02 fix verification)
  const studentSkillHack = await api('/skills/evidence', {
    method: 'POST',
    body: JSON.stringify({ skillId: '65f000000000000000000001', score: 100 }),
  }, studentToken);
  assert(studentSkillHack.status === 403, 'Student blocked from self-awarding skill scores via POST /api/skills/evidence (403 Forbidden)');

  // Instructor allowed on Instructor Intelligence
  const instIntelReq = await api('/analytics/instructor/intelligence', { method: 'GET' }, instructorToken);
  assert(instIntelReq.status === 200, 'Instructor authorized for GET /api/analytics/instructor/intelligence (200 OK)');

  // Admin allowed on Admin Analytics
  if (adminToken) {
    const adminAnalyticsReq = await api('/analytics/admin', { method: 'GET' }, adminToken);
    assert(adminAnalyticsReq.status === 200, 'Admin authorized for GET /api/analytics/admin (200 OK)');
  }

  // -----------------------------------------------------------------
  // 3. COURSE DISCOVERY, ENROLLMENT & LEARNING PROGRESS
  // -----------------------------------------------------------------
  logSection('3. Course Discovery, Enrollment & Progress');

  // Browse Courses
  const coursesRes = await api('/courses?limit=10', { method: 'GET' });
  assert(coursesRes.status === 200 && Array.isArray(coursesRes.data?.courses), 'Course discovery lists catalog successfully');
  testCourse = (coursesRes.data?.courses || [])[0];
  assert(Boolean(testCourse), `Selected active course for testing: "${testCourse?.title}"`);

  if (testCourse) {
    // Check Enrollment Status
    const checkEnr = await api(`/enrollments/check/${testCourse._id}`, { method: 'GET' }, studentToken);
    assert(checkEnr.status === 200, 'Student enrollment status checked successfully');

    // Enroll in Course (or verify idempotent already enrolled)
    const enrollRes = await api(`/enrollments/${testCourse._id}`, { method: 'POST' }, studentToken);
    assert(
      enrollRes.status === 200 || enrollRes.status === 201 || (enrollRes.status === 400 && enrollRes.data?.message?.includes('already enrolled')),
      'Course enrollment handles new or existing enrollment gracefully without crashing'
    );

    // Fetch Course Lessons
    const lessonsRes = await api(`/lessons/course/${testCourse._id}`, { method: 'GET' }, studentToken);
    assert(lessonsRes.status === 200, 'Course lessons retrieved for student');
    testLesson = (lessonsRes.data?.lessons || [])[0];

    if (testLesson) {
      // Mark Lesson Complete
      const markRes = await api(`/progress/${testCourse._id}/lesson/${testLesson._id}/complete`, { method: 'POST' }, studentToken);
      assert(markRes.status === 200, 'Lesson progress updated / marked complete successfully');
      assert(typeof markRes.data?.progressPercentage === 'number', 'Accurate progress percentage computed and returned');

      // Fetch Course Overall Progress
      const progressRes = await api(`/progress/${testCourse._id}`, { method: 'GET' }, studentToken);
      assert(progressRes.status === 200, 'Student course overall progress retrieved');
    }
  }

  // Edge Case: Invalid Course ID
  const invalidCourseRes = await api('/courses/non_existent_id_999999', { method: 'GET' });
  assert(invalidCourseRes.status === 404, 'Invalid course ID handled gracefully with HTTP 404 Not Found');

  // -----------------------------------------------------------------
  // 4. QUIZZES & ASSESSMENTS
  // -----------------------------------------------------------------
  logSection('4. Quizzes & Assessments');

  const quizzesRes = await api('/quizzes', { method: 'GET' }, studentToken);
  assert(quizzesRes.status === 200, 'Quizzes catalog retrieved successfully');
  testQuiz = (quizzesRes.data?.quizzes || [])[0];

  if (testQuiz) {
    // Fetch Quiz Details (Verify answers are redacted for student)
    const quizDetail = await api(`/quizzes/${testQuiz._id}`, { method: 'GET' }, studentToken);
    assert(quizDetail.status === 200, 'Quiz questions retrieved for student');
    const firstQ = quizDetail.data?.quiz?.questions?.[0];
    assert(firstQ?.correctAnswer === undefined, 'Quiz answer key is securely redacted from student query');

    // Submit Quiz Attempt
    const quizSubmit = await api(`/quizzes/${testQuiz._id}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        answers: [{ questionIndex: 0, selectedOption: 0 }],
        timeSpentSeconds: 45,
      }),
    }, studentToken);
    assert(quizSubmit.status === 200, 'Quiz submitted and evaluated server-side successfully');
    assert(typeof quizSubmit.data?.percentage === 'number', 'Quiz earned score percentage computed server-side');

    // Retrieve My Submissions for this Quiz
    const mySubmissions = await api(`/quizzes/${testQuiz._id}/my-submissions`, { method: 'GET' }, studentToken);
    assert(mySubmissions.status === 200, 'Student retrieved their own quiz submission history');
  }

  // -----------------------------------------------------------------
  // 5. CODING CHALLENGES & EXECUTION SANDBOX
  // -----------------------------------------------------------------
  logSection('5. Coding Challenges & Isolated Sandbox Execution');

  const challengesRes = await api('/challenges?limit=5', { method: 'GET' }, studentToken);
  assert(challengesRes.status === 200, 'Coding challenges catalog retrieved successfully');
  testChallenge = (challengesRes.data?.challenges || [])[0];

  if (testChallenge) {
    // Single Challenge Details
    const chDetail = await api(`/challenges/${testChallenge._id}`, { method: 'GET' }, studentToken);
    assert(chDetail.status === 200, 'Single coding challenge details retrieved');
    assert(Array.isArray(chDetail.data?.challenge?.testCases), 'Challenge test cases array provided');
    // Ensure hidden test cases are stripped
    const anyHiddenExposed = (chDetail.data?.challenge?.testCases || []).some((tc) => tc.isHidden);
    assert(!anyHiddenExposed, 'Hidden test cases stripped from regular challenge details query');

    // Run Code against Sample Test Cases
    const runRes = await api(`/challenges/${testChallenge._id}/run`, {
      method: 'POST',
      body: JSON.stringify({
        language: 'javascript',
        sourceCode: 'function solution(s) { return s; }',
      }),
    }, studentToken);
    assert(runRes.status === 200, 'Non-evaluative code runner executed sample test cases successfully');

    // Test Runner Sandbox Protection (Attempting to execute child_process)
    const maliciousRunRes = await api(`/challenges/${testChallenge._id}/run`, {
      method: 'POST',
      body: JSON.stringify({
        language: 'javascript',
        sourceCode: 'function solution() { return require("child_process").execSync("dir"); }',
      }),
    }, studentToken);
    assert(
      maliciousRunRes.data?.error && maliciousRunRes.data.error.includes('Security Error'),
      'Sandbox blocks unauthorized process/require calls with Security Error'
    );

    // Full Submission Evaluation
    const submitCodeRes = await api(`/challenges/${testChallenge._id}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        language: 'javascript',
        sourceCode: 'function solution(s) { return s; }',
      }),
    }, studentToken);
    assert(submitCodeRes.status === 200, 'Challenge code submitted and evaluated against full test suite');

    // Verify Hidden Test Case Outputs are Redacted in Submission History
    const historyRes = await api('/challenges/submissions/my', { method: 'GET' }, studentToken);
    assert(historyRes.status === 200, 'Student challenge submission history retrieved');
    const firstSub = historyRes.data?.submissions?.[0];
    const hiddenResult = (firstSub?.testResults || []).find((tr) => tr.isHidden);
    if (hiddenResult) {
      assert(hiddenResult.actualOutput === '[Hidden Test Case]', 'Hidden test case actualOutput masked in submission history');
    }
  }

  // -----------------------------------------------------------------
  // 6. PRACTICAL ASSIGNMENTS & WORKSPACE
  // -----------------------------------------------------------------
  logSection('6. Practical Assignments Workflow');

  const assignmentsRes = await api('/assignments', { method: 'GET' }, studentToken);
  assert(assignmentsRes.status === 200, 'Practical assignments catalog retrieved');
  testAssignment = (assignmentsRes.data?.assignments || [])[0];

  if (testAssignment) {
    // Single Assignment View
    const asgnDetail = await api(`/assignments/${testAssignment._id}`, { method: 'GET' }, studentToken);
    assert(asgnDetail.status === 200, 'Assignment details retrieved with rubric criteria');

    // Submit Assignment Deliverables
    const asgnSubmit = await api(`/assignments/${testAssignment._id}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        submissionType: 'github_repo',
        repositoryUrl: 'https://github.com/student/lms-practical-assignment',
        deploymentUrl: 'https://lms-practical.onrender.com',
        content: 'Completed architecture implementation with unit tests and swagger docs.',
      }),
    }, studentToken);
    assert(asgnSubmit.status === 201, 'Assignment deliverables submitted successfully');
    assert(asgnSubmit.data?.submission?.status === 'Submitted', 'Submission status reset to "Submitted" for review');
    assert(asgnSubmit.data?.submission?.score === null, 'Submission score initialized to null (no self-scoring)');

    // Edge Case: Empty submission deliverable
    const emptySubmit = await api(`/assignments/${testAssignment._id}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        content: '',
        repositoryUrl: '',
        deploymentUrl: '',
        attachments: [],
      }),
    }, studentToken);
    assert(emptySubmit.status === 400, 'Empty assignment deliverable rejected with clear validation error');
  }

  // -----------------------------------------------------------------
  // 7. REAL-WORLD PROJECTS & MILESTONES
  // -----------------------------------------------------------------
  logSection('7. Real-World Projects Workflow');

  const projectsRes = await api('/projects', { method: 'GET' }, studentToken);
  assert(projectsRes.status === 200, 'Projects catalog retrieved successfully');
  testProject = (projectsRes.data?.projects || [])[0];

  if (testProject) {
    // Update Milestone Progress
    const milestoneRes = await api(`/projects/${testProject._id}/milestones`, {
      method: 'PATCH',
      body: JSON.stringify({
        milestoneIndex: 0,
        completed: true,
      }),
    }, studentToken);
    assert(milestoneRes.status === 200, 'Project milestone progress checked off');

    // Submit Project
    const projectSubmit = await api(`/projects/${testProject._id}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        repositoryUrl: 'https://github.com/student/autonomous-agent-hub',
        deploymentUrl: 'https://autonomous-agent.vercel.app',
        liveDemoUrl: 'https://autonomous-agent.vercel.app',
        documentationUrl: 'https://autonomous-agent.vercel.app/docs',
      }),
    }, studentToken);
    assert(projectSubmit.status === 201, 'Project submitted successfully for rubric evaluation');
    assert(projectSubmit.data?.submission?.status === 'Submitted', 'Project submission status set to "Submitted"');
  }

  // -----------------------------------------------------------------
  // 8. SKILL ENGINE, PROFICIENCY CALCULATION & SKILL GAP ANALYZER
  // -----------------------------------------------------------------
  logSection('8. Skill Engine, Proficiency Scoring & Skill Gap');

  // Dashboard Skills Summary
  const skillSummary = await api('/skills/dashboard-summary', { method: 'GET' }, studentToken);
  assert(skillSummary.status === 200, 'Student skills dashboard summary retrieved');
  assert(typeof skillSummary.data?.stats?.averageScore === 'number', 'Valid average skill score calculated from DB records');

  // Next Meaningful Action (Primary CTA)
  const nextActionRes = await api('/skills/next-action', { method: 'GET' }, studentToken);
  assert(nextActionRes.status === 200, 'Student Next Action primary CTA determined dynamically');
  assert(Boolean(nextActionRes.data?.nextAction?.title || nextActionRes.data?.nextAction?.actionTitle), 'Clear action title provided for Next Action CTA');

  // Target Roles Catalog & Skill Gap
  const targetRolesRes = await api('/target-roles', { method: 'GET' }, studentToken);
  assert(targetRolesRes.status === 200, 'Target roles catalog retrieved');
  testTargetRole = (targetRolesRes.data?.targetRoles || [])[0];

  if (testTargetRole) {
    // Select Target Role
    const selectRole = await api('/target-roles/learner/select', {
      method: 'POST',
      body: JSON.stringify({ roleId: testTargetRole._id }),
    }, studentToken);
    assert(selectRole.status === 200, 'Learner selected target role successfully');

    // Skill Gap Analysis
    const gapRes = await api('/target-roles/analyzer', { method: 'GET' }, studentToken);
    assert(gapRes.status === 200, 'Skill gap analysis computed dynamically against target role');
    assert(typeof gapRes.data?.gapSummary?.matchPercentage === 'number', 'Valid match percentage calculated');
  }

  // -----------------------------------------------------------------
  // 9. AI MENTOR CONVERSATIONS & CONTEXT
  // -----------------------------------------------------------------
  logSection('9. AI Mentor Interaction');

  // Factual Learner Context Snapshot
  const mentorCtx = await api('/mentor/context', { method: 'GET' }, studentToken);
  assert(mentorCtx.status === 200, 'AI Mentor fetched factual learner context snapshot from DB');

  // Send Message to Mentor
  const mentorChat = await api('/mentor/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: 'Hello NOVA Mentor, what skill should I focus on next to advance toward my target role?',
    }),
  }, studentToken);
  assert(mentorChat.status === 200, 'AI Mentor answered user query with context-aware guidance');
  assert(Boolean(mentorChat.data?.message?.content), 'AI Mentor provided detailed recommendations');
  const convId = mentorChat.data?.conversationId;

  // Retrieve Conversation History
  if (convId) {
    const convDetail = await api(`/mentor/conversations/${convId}`, { method: 'GET' }, studentToken);
    assert(convDetail.status === 200, 'Retrieved AI Mentor conversation by ID');

    // IDOR Check: Instructor cannot access student's private AI mentor conversation
    const idorMentor = await api(`/mentor/conversations/${convId}`, { method: 'GET' }, instructorToken);
    assert(idorMentor.status === 404, 'Unauthorized user blocked from accessing student AI conversation (404/IDOR blocked)');
  }

  // -----------------------------------------------------------------
  // 10. ENTERPRISE JOB SIMULATIONS
  // -----------------------------------------------------------------
  logSection('10. Enterprise Job Simulations');

  const simsRes = await api('/simulations', { method: 'GET' }, studentToken);
  assert(simsRes.status === 200, 'Enterprise Job Simulations catalog retrieved');
  testSimulation = (simsRes.data?.simulations || [])[0];

  if (testSimulation) {
    // Start Simulation
    const startSim = await api(`/simulations/${testSimulation._id}/start`, { method: 'POST' }, studentToken);
    assert(startSim.status === 200, 'Job simulation workspace session initiated');

    // Update Task Progress
    const updateSimTask = await api(`/simulations/${testSimulation._id}/tasks/task-1`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'Completed',
        content: 'Cleaned null values, validated data types, and documented pipeline anomaly.',
        currentTaskIndex: 1,
      }),
    }, studentToken);
    assert(updateSimTask.status === 200, 'Simulation task deliverable recorded');

    // Fetch Learner Submission Workspace
    const getSub = await api(`/simulations/${testSimulation._id}/submission`, { method: 'GET' }, studentToken);
    assert(getSub.status === 200, 'Learner simulation workspace state retrieved');
  }

  // -----------------------------------------------------------------
  // 11. LEARNER PORTFOLIO & RECRUITER PUBLIC ACCESS
  // -----------------------------------------------------------------
  logSection('11. Learner Portfolio & Privacy Settings');

  // Private Learner Portfolio
  const myPortfolio = await api('/portfolio/me', { method: 'GET' }, studentToken);
  assert(myPortfolio.status === 200, 'Private student portfolio retrieved with verified achievements');
  const portfolioSlug = myPortfolio.data?.data?.portfolioSlug || myPortfolio.data?.portfolioSlug;

  // Update Portfolio Privacy Settings
  const updateSettings = await api('/portfolio/settings', {
    method: 'PUT',
    body: JSON.stringify({
      isPublic: true,
      displayProjects: true,
      displaySkills: true,
      displaySimulations: true,
    }),
  }, studentToken);
  assert(updateSettings.status === 200, 'Portfolio privacy settings updated successfully');

  // Recruiter Public Portfolio Access
  if (portfolioSlug) {
    const publicPort = await api(`/portfolio/public/${portfolioSlug}`, { method: 'GET' });
    assert(publicPort.status === 200, 'Public portfolio accessible to unauthenticated recruiters');
    assert(Boolean(publicPort.data?.data?.student?.name), 'Public portfolio displays verified student name');
  }

  // -----------------------------------------------------------------
  // 12. PROOF-OF-SKILL CERTIFICATE & PUBLIC VERIFICATION
  // -----------------------------------------------------------------
  logSection('12. Proof-of-Skill Certificate & Verification');

  // Generate Proof-of-Skill Certificate
  const genPosCert = await api('/certificates/generate-proof-of-skill', {
    method: 'POST',
    body: JSON.stringify({
      roleOrSkillTitle: 'Full Stack Cloud Engineer',
    }),
  }, studentToken);
  assert(genPosCert.status === 201, 'Proof-of-Skill certificate generated from verified achievements');
  generatedCertId = genPosCert.data?.certificate?.certificateId;
  assert(Boolean(generatedCertId), `Certificate ID generated: ${generatedCertId}`);

  // Verify all 11 required fields
  const cert = genPosCert.data?.certificate;
  assert(Boolean(cert?.learnerName || cert?.student?.name), '1. Field learnerName exists');
  assert(Boolean(cert?.roleOrSkillTitle), '2. Field roleOrSkillTitle exists');
  assert(Array.isArray(cert?.demonstratedSkills) && cert.demonstratedSkills.length > 0, '3. Field demonstratedSkills exists');
  assert(Array.isArray(cert?.skillLevels) && cert.skillLevels.length > 0, '4. Field skillLevels exists');
  assert(Array.isArray(cert?.practicalProjects), '5. Field practicalProjects exists');
  assert(typeof cert?.codingAssessmentsCount === 'number', '6. Field codingAssessmentsCount exists');
  assert(typeof cert?.jobSimulationsCount === 'number', '7. Field jobSimulationsCount exists');
  assert(Boolean(cert?.capstoneProject?.title), '8. Field capstoneProject exists');
  assert(Boolean(cert?.issueDate), '9. Field issueDate exists');
  assert(Boolean(cert?.certificateId), '10. Field certificateId exists');
  assert(Boolean(cert?.verificationUrl), '11. Field verificationUrl exists');

  // Public Database Verification by Certificate ID
  if (generatedCertId) {
    const verifyRes = await api(`/certificates/verify/${generatedCertId}`, { method: 'GET' });
    assert(verifyRes.status === 200, 'Public verification checks database using Certificate ID');
    assert(verifyRes.data?.isValid === true, 'Verification status returned VALID');
    assert(verifyRes.data?.certificate?.student?.email === undefined, 'Student private email redacted from public verification (PII protected)');
  }

  // Verification of Non-Existent Certificate ID
  const fakeVerify = await api('/certificates/verify/FAKE-INVALID-CERT-999', { method: 'GET' });
  assert(fakeVerify.data?.isValid === false || fakeVerify.status === 404, 'Fake/Invalid certificate properly rejected');

  // -----------------------------------------------------------------
  // SUMMARY REPORT
  // -----------------------------------------------------------------
  console.log('\n=================================================================');
  console.log(`🏁 REGRESSION SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('=================================================================');

  if (failed > 0) {
    console.error('\nFailure details:');
    failures.forEach((f, i) => console.error(`${i + 1}. ${f.description}:`, f.errorDetails));
    process.exit(1);
  } else {
    console.log('\n✨ ALL MULTI-ROLE REGRESSION TESTS COMPLETED WITH ZERO FAILURES (100% PASSED)!\n');
    process.exit(0);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
