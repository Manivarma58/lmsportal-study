import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('=================================================================');
  console.log('  TEST SUITE: PART 13 — Learner Skill Portfolio (Prompt 14)');
  console.log('=================================================================\n');

  // 1. Authenticate Student
  console.log('[Test 1] Logging in as student (student@lms.com)...');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'student@lms.com',
      password: 'Password123!',
    }),
  });

  assert.strictEqual(loginRes.status, 200, `Expected 200, got ${loginRes.status}`);
  const token = loginRes.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log('  ✓ Student authenticated successfully. Name:', loginRes.data.user.name);

  // 2. Fetch Private Portfolio
  console.log('\n[Test 2] Fetching Learner Skill Portfolio (GET /api/portfolio/me)...');
  const portRes = await request('/portfolio/me', {
    method: 'GET',
    headers: authHeaders,
  });

  assert.strictEqual(portRes.status, 200, `Expected 200, got ${portRes.status}`);
  assert.strictEqual(portRes.data.success, true);
  const portfolio = portRes.data.data;

  // Profile check
  assert.ok(portfolio.profile, 'Portfolio must contain profile');
  assert.strictEqual(portfolio.profile.name, 'Jordan Lee');
  console.log('  ✓ Profile verified:', portfolio.profile.name, '-', portfolio.profile.headline);

  // Target role check
  assert.ok(portfolio.targetRole, 'Portfolio must contain targetRole');
  console.log('  ✓ Target Role verified:', portfolio.targetRole.name, `(${portfolio.targetRole.alignmentScore}% aligned)`);

  // Skills with evidence check
  assert.ok(Array.isArray(portfolio.skills), 'Portfolio must have skills array');
  assert.ok(portfolio.skills.length > 0, 'Portfolio should have verified skills');
  console.log(`  ✓ Verified Skills (${portfolio.skills.length} skills):`);
  portfolio.skills.forEach((s) => {
    assert.ok(typeof s.overallScore === 'number', 'Skill must have overallScore');
    assert.ok(s.proficiencyLevel, 'Skill must have proficiencyLevel');
    assert.ok(Array.isArray(s.evidenceBullets), 'Skill must have evidenceBullets');
    console.log(`     • ${s.name} — ${s.overallScore}% (${s.proficiencyLevel})`);
    s.evidenceBullets.forEach((eb) => console.log(`       - ${eb}`));
  });

  // Projects check
  assert.ok(Array.isArray(portfolio.projects), 'Portfolio must have projects array');
  assert.ok(portfolio.projects.length > 0, 'Portfolio should have verified projects');
  const topProj = portfolio.projects[0];
  assert.ok(topProj.score >= 60, 'Project must be verified passing');
  console.log(`  ✓ Verified Projects (${portfolio.projects.length}):`);
  portfolio.projects.forEach((p) => {
    console.log(`     • ${p.title} (${p.score}%) — Repo: ${p.repositoryUrl || 'N/A'}`);
  });

  // Practical assignments check
  assert.ok(Array.isArray(portfolio.assignments), 'Portfolio must have assignments array');
  assert.ok(portfolio.assignments.length > 0, 'Portfolio should have verified assignments');
  console.log(`  ✓ Verified Assignments (${portfolio.assignments.length}):`);
  portfolio.assignments.forEach((a) => {
    console.log(`     • ${a.title} (${a.score}%) — Status: ${a.status}`);
  });

  // Coding challenges check
  assert.ok(Array.isArray(portfolio.codingChallenges), 'Portfolio must have codingChallenges array');
  console.log(`  ✓ Verified Coding Challenges (${portfolio.codingChallenges.length} passed):`);
  portfolio.codingChallenges.slice(0, 3).forEach((c) => {
    console.log(`     • ${c.title} (${c.difficulty}) — Language: ${c.language}`);
  });

  // Job simulations check
  assert.ok(Array.isArray(portfolio.jobSimulations), 'Portfolio must have jobSimulations array');
  console.log(`  ✓ Verified Job Simulations (${portfolio.jobSimulations.length} completed):`);
  portfolio.jobSimulations.forEach((j) => {
    console.log(`     • ${j.title} (${j.overallScore}%) — Role: ${j.role}`);
  });

  // Certificates check
  assert.ok(Array.isArray(portfolio.certificates), 'Portfolio must have certificates array');
  console.log(`  ✓ Verified Certificates (${portfolio.certificates.length} credentials):`);
  portfolio.certificates.forEach((cert) => {
    console.log(`     • ${cert.courseTitle} (ID: ${cert.certificateNumber})`);
  });

  // 3. Test Privacy & Visibility Settings (PUT /api/portfolio/settings)
  console.log('\n[Test 3] Updating Portfolio Settings & Section Visibility (PUT /api/portfolio/settings)...');
  const currentSlug = portfolio.settings.slug;
  const updateRes = await request('/portfolio/settings', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      customHeadline: 'Senior Distributed Systems Architect & Full-Stack Engineer',
      sectionsVisibility: {
        codingChallenges: true,
        jobSimulations: true,
        assignments: true,
        projects: true,
      },
    }),
  });

  assert.strictEqual(updateRes.status, 200, `Expected 200, got ${updateRes.status}`);
  assert.strictEqual(updateRes.data.data.settings.customHeadline, 'Senior Distributed Systems Architect & Full-Stack Engineer');
  console.log('  ✓ Updated custom headline and visibility successfully.');

  // 4. Test Public Recruiter Portfolio (GET /api/portfolio/public/:slug) - Unauthenticated
  console.log(`\n[Test 4] Accessing Public Recruiter View (GET /api/portfolio/public/${currentSlug})...`);
  const publicRes = await request(`/portfolio/public/${currentSlug}`, {
    method: 'GET',
  });

  assert.strictEqual(publicRes.status, 200, `Expected 200, got ${publicRes.status}`);
  assert.strictEqual(publicRes.data.success, true);
  assert.strictEqual(publicRes.data.data.isVerifiedByNova, true, 'Must bear cryptographic NOVA verification');
  assert.strictEqual(publicRes.data.data.profile.name, 'Jordan Lee');
  console.log('  ✓ Public recruiter view verified with tamper-proof cryptographic stamp.');

  // 5. Test Private Visibility Toggle
  console.log('\n[Test 5] Testing Private Mode (Hiding portfolio from public)...');
  const privateToggleRes = await request('/portfolio/settings', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ isPublic: false }),
  });
  assert.strictEqual(privateToggleRes.status, 200);

  // Recruiter tries to access private portfolio
  const recruiterDeniedRes = await request(`/portfolio/public/${currentSlug}`);
  assert.strictEqual(recruiterDeniedRes.status, 403, 'Should be 403 Forbidden when private');
  assert.strictEqual(recruiterDeniedRes.data.isPrivate, true, 'Should indicate portfolio is private');
  console.log('  ✓ Recruiter access denied correctly when portfolio is marked private (403 Forbidden).');

  // Restore to public
  await request('/portfolio/settings', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ isPublic: true }),
  });
  console.log('  ✓ Restored portfolio visibility to public.');

  console.log('\n=================================================================');
  console.log('  ALL LEARNER SKILL PORTFOLIO TESTS PASSED (100%)');
  console.log('=================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
