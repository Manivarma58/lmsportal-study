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
  console.log('  TEST SUITE: PART 14 — Proof-of-Skill Certificate (Prompt 15)');
  console.log('=================================================================\n');

  try {
    // 1. Authenticate Student
    console.log('[Test 1] Logging in as student (student@lms.com)...');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'student@lms.com',
        password: 'Password123!',
      }),
    });

    assert.strictEqual(loginRes.status, 200, `Login failed: status ${loginRes.status}`);
    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    const studentName = loginRes.data.user.name;
    console.log(`  ✓ Authenticated as: ${studentName}`);

    // 2. Generate Proof-of-Skill Certificate
    console.log('\n[Test 2] Generating Proof-of-Skill Certificate (POST /api/certificates/generate-proof-of-skill)...');
    const genRes = await request('/certificates/generate-proof-of-skill', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        roleOrSkillTitle: 'Full Stack Cloud Engineer',
      }),
    });

    console.log('  Response status:', genRes.status);
    assert.strictEqual(genRes.status, 201, `Failed to generate: ${JSON.stringify(genRes.data)}`);
    const cert = genRes.data.certificate;
    assert.ok(cert, 'Expected certificate object in response');
    console.log('  ✓ Certificate generated successfully!');
    console.log('    Certificate ID:', cert.certificateId);
    console.log('    Type:', cert.certificateType);
    console.log('    Role / Skill:', cert.roleOrSkillTitle);

    // 3. Verify All 11 Required Fields
    console.log('\n[Test 3] Verifying all 11 required fields in generated certificate:');
    
    // 1. Learner name
    assert.ok(studentName, 'Learner name must be present');
    console.log('  1. Learner name:', studentName);

    // 2. Skill / Role
    assert.ok(cert.roleOrSkillTitle, 'Skill / Role must be present');
    console.log('  2. Skill / Role:', cert.roleOrSkillTitle);

    // 3. Demonstrated skills
    assert.ok(Array.isArray(cert.demonstratedSkills), 'Demonstrated skills must be an array');
    console.log(`  3. Demonstrated skills (${cert.demonstratedSkills.length} skills):`, cert.demonstratedSkills.map((s) => `${s.name} (${s.score}%)`).join(', '));

    // 4. Skill levels & STRICT Expert rule verification
    const skillLevels = cert.demonstratedSkills.map((s) => s.level);
    console.log('  4. Skill levels:', skillLevels.join(', '));
    for (const skill of cert.demonstratedSkills) {
      if (skill.level === 'Expert' && skill.score < 90) {
        throw new Error(`VIOLATION: Skill "${skill.name}" scored ${skill.score}% but is claimed as Expert!`);
      }
      if (skill.score === 86 && skill.level === 'Expert') {
        throw new Error('VIOLATION: Score 86% must NOT be labeled Expert!');
      }
    }
    console.log('     ✓ Expert level strictly restricted to scores >= 90% (No fabricated levels)');

    // 5. Practical projects completed
    assert.ok(Array.isArray(cert.practicalProjects), 'Practical projects must be an array');
    console.log(`  5. Practical projects completed (${cert.practicalProjects.length} projects):`, cert.practicalProjects.map((p) => p.title).join(', '));

    // 6. Coding assessments completed
    assert.ok(typeof cert.codingAssessmentsCount === 'number', 'Coding assessments count must be number');
    console.log(`  6. Coding assessments completed: ${cert.codingAssessmentsCount}`);

    // 7. Job simulations completed
    assert.ok(typeof cert.jobSimulationsCount === 'number', 'Job simulations count must be number');
    console.log(`  7. Job simulations completed: ${cert.jobSimulationsCount}`);

    // 8. Capstone project
    assert.ok(cert.capstoneProject, 'Capstone project must be present');
    console.log(`  8. Capstone project: "${cert.capstoneProject.title}" (Score: ${cert.capstoneProject.score}%)`);

    // 9. Assessment date
    assert.ok(cert.assessmentDate, 'Assessment date must be present');
    console.log('  9. Assessment date:', new Date(cert.assessmentDate).toISOString());

    // 10. Certificate ID
    assert.ok(cert.certificateId && cert.certificateId.startsWith('CERT-POS-'), 'Certificate ID must be valid format');
    console.log('  10. Certificate ID:', cert.certificateId);

    // 11. Verification URL
    assert.ok(cert.verificationUrl && cert.verificationUrl.includes(cert.certificateId), 'Verification URL must link to certificate ID');
    console.log('  11. Verification URL:', cert.verificationUrl);

    // 4. Public Certificate Verification (Check Database by Certificate ID)
    console.log('\n[Test 4] Public Verification via Database (GET /api/certificates/verify/:id)...');
    const verifyRes = await request(`/certificates/verify/${cert.certificateId}`);
    assert.strictEqual(verifyRes.status, 200, `Public verification failed: ${JSON.stringify(verifyRes.data)}`);
    assert.strictEqual(verifyRes.data.isValid, true, 'Certificate should be valid');
    const verifiedCert = verifyRes.data.certificate;
    assert.strictEqual(verifiedCert.certificateId, cert.certificateId);
    assert.strictEqual(verifiedCert.student.name, studentName);
    console.log('  ✓ Public database verification returned status: VALID');
    console.log('    Verified Student:', verifiedCert.student.name);
    console.log('    Verified Role:', verifiedCert.roleOrSkillTitle);
    console.log('    Verified Capstone:', verifiedCert.capstoneProject?.title);

    // 5. Test Non-Existent Certificate ID Verification (Returns 404 / isValid: false)
    console.log('\n[Test 5] Rejecting invalid certificate code (GET /api/certificates/verify/FAKE-ID-999)...');
    const fakeRes = await request('/certificates/verify/FAKE-ID-999');
    assert.strictEqual(fakeRes.status, 404, 'Should return 404 for invalid certificate ID');
    assert.strictEqual(fakeRes.data.isValid, false, 'Invalid certificate should have isValid: false');
    console.log('  ✓ Fake certificate ID properly rejected:', fakeRes.data.message);

    // 6. Test Fetching Certificate by MongoDB ID
    console.log('\n[Test 6] Fetching certificate by ID (GET /api/certificates/:id)...');
    const getByIdRes = await request(`/certificates/${cert._id}`);
    assert.strictEqual(getByIdRes.status, 200);
    assert.strictEqual(getByIdRes.data.certificate.certificateId, cert.certificateId);
    console.log('  ✓ Certificate successfully retrieved by ID');

    // 7. Verify My Certificates List Includes Proof-of-Skill Certificate
    console.log('\n[Test 7] Verifying student certificates list (GET /api/certificates/student/my-certificates)...');
    const myCertsRes = await request('/certificates/student/my-certificates', {
      headers: authHeaders,
    });
    assert.strictEqual(myCertsRes.status, 200);
    const hasCert = myCertsRes.data.certificates.some((c) => c.certificateId === cert.certificateId);
    assert.ok(hasCert, 'My certificates should include newly generated Proof-of-Skill certificate');
    console.log(`  ✓ Found Proof-of-Skill certificate in student gallery (${myCertsRes.data.certificates.length} total certificates)`);

    console.log('\n=================================================================');
    console.log('  🎉 ALL PART 14 (PROMPT 15) INTEGRATION TESTS PASSED (100%)');
    console.log('=================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTests();
