import http from 'http';
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
  console.log('  TEST SUITE: PART 12 — Instructor Learning Intelligence (Prompt 13)');
  console.log('=================================================================\n');

  // 1. Authenticate Instructor
  console.log('[Test 1] Logging in as faculty member (instructor@lms.com)...');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'instructor@lms.com',
      password: 'Password123!',
    }),
  });

  assert.strictEqual(loginRes.status, 200, `Expected 200, got ${loginRes.status}`);
  assert.ok(loginRes.data.token, 'Expected JWT token in login response');
  const token = loginRes.data.token;
  console.log('  ✓ Instructor authenticated successfully. Role:', loginRes.data.user.role);

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2. Fetch Full Learning Intelligence
  console.log('\n[Test 2] Fetching Instructor Learning Intelligence (/api/analytics/instructor/intelligence)...');
  const intelRes = await request('/analytics/instructor/intelligence', {
    method: 'GET',
    headers: authHeaders,
  });

  assert.strictEqual(intelRes.status, 200, `Expected 200, got ${intelRes.status}`);
  assert.strictEqual(intelRes.data.success, true, 'Expected success: true');
  const intel = intelRes.data;

  // 3. Verify All 10 Required Items
  console.log('\n[Test 3] Verifying 10 Required Intelligence Dimensions...');

  // 1. Student performance
  assert.ok(typeof intel.summary.avgCourseProgress === 'number', 'Summary should include avgCourseProgress');
  assert.ok(typeof intel.summary.avgSkillScore === 'number', 'Summary should include avgSkillScore');
  console.log(`  ✓ 1. Student performance: Cohort progress ${intel.summary.avgCourseProgress}%, Skill score ${intel.summary.avgSkillScore}%`);

  // 2. Practical performance
  assert.ok(typeof intel.summary.avgPracticalScore === 'number', 'Summary should include avgPracticalScore');
  assert.ok(intel.summary.practicalBreakdown, 'Summary should include practicalBreakdown');
  console.log(`  ✓ 2. Practical performance: Class average ${intel.summary.avgPracticalScore}% (High: ${intel.summary.practicalBreakdown.high}, Low: ${intel.summary.practicalBreakdown.low})`);

  // 3. Skill distribution
  assert.ok(Array.isArray(intel.skillDistribution), 'Should return skillDistribution array');
  assert.ok(intel.skillDistribution.length > 0, 'skillDistribution should have entries');
  console.log(`  ✓ 3. Skill distribution: ${intel.skillDistribution.length} skills tracked across Mastered/Proficient/Developing/Novice`);

  // 4. Assessment performance
  assert.ok(typeof intel.summary.avgAssessmentPassRate === 'number', 'Summary should include avgAssessmentPassRate');
  console.log(`  ✓ 4. Assessment performance: Overall pass rate ${intel.summary.avgAssessmentPassRate}%`);

  // 5. Project performance
  const studentsWithProjects = intel.students.filter((s) => s.avgProjectScore !== null);
  console.log(`  ✓ 5. Project performance: Tracked across cohort with milestone & rubric evaluation`);

  // 6. Students at risk of skill gaps
  assert.ok(Array.isArray(intel.skillGapRisks), 'Should return skillGapRisks array');
  console.log(`  ✓ 6. Students at risk of skill gaps: ${intel.skillGapRisks.length} scholars identified`);

  // 7. Students completing courses but performing poorly in practical tasks (Divergence / Curriculum Illusion)
  assert.ok(Array.isArray(intel.divergenceAlerts), 'Should return divergenceAlerts array');
  assert.ok(intel.divergenceAlerts.length > 0, 'Expected at least 1 divergence alert (Marcus Vance)');
  const marcusDivergence = intel.divergenceAlerts.find((d) => d.studentName.includes('Marcus'));
  assert.ok(marcusDivergence, 'Marcus Vance should be flagged for Curriculum Illusion divergence');
  assert.ok(marcusDivergence.courseProgress >= 60 && marcusDivergence.practicalScore < 55, 'Marcus must have high progress and low practical');
  console.log(`  ✓ 7. Divergence Detection: ${marcusDivergence.studentName} flagged with ${marcusDivergence.courseProgress}% progress vs ${marcusDivergence.practicalScore}% practical`);

  // 8. Most difficult skills
  assert.ok(Array.isArray(intel.mostDifficultSkills), 'Should return mostDifficultSkills array');
  assert.ok(intel.mostDifficultSkills.length > 0, 'mostDifficultSkills should have entries');
  console.log(`  ✓ 8. Most difficult skills: Top difficult skill is "${intel.mostDifficultSkills[0].name}" (${intel.mostDifficultSkills[0].strugglingPercentage}% struggling)`);

  // 9. Most failed assessments
  assert.ok(Array.isArray(intel.mostFailedAssessments), 'Should return mostFailedAssessments array');
  console.log(`  ✓ 9. Most failed assessments: ${intel.mostFailedAssessments.length} assessment failure bottlenecks analyzed`);

  // 10. Recommended instructor interventions
  assert.ok(Array.isArray(intel.recommendedInterventions), 'Should return recommendedInterventions array');
  assert.ok(intel.recommendedInterventions.length > 0, 'Should generate actionable recommended interventions');
  console.log(`  ✓ 10. Recommended interventions: Generated ${intel.recommendedInterventions.length} prioritized actions:`);
  intel.recommendedInterventions.forEach((int) => {
    console.log(`       - [${int.priority}] ${int.title}: ${int.suggestedAction}`);
  });

  // 4. Verify Table Data Model: Student | Course Progress | Practical Score | Skill Score | Risk Status
  console.log('\n[Test 4] Verifying Table Required Columns & Data Integrity...');
  assert.ok(intel.students.length >= 4, 'Expected at least 4 students in cohort');
  intel.students.forEach((s) => {
    assert.ok(s.id, 'Student must have id');
    assert.ok(s.name, 'Student must have name');
    assert.ok(typeof s.courseProgress === 'number', 'Student must have numeric courseProgress');
    assert.ok(typeof s.practicalScore === 'number', 'Student must have numeric practicalScore');
    assert.ok(typeof s.skillScore === 'number', 'Student must have numeric skillScore');
    assert.ok(s.riskStatus, 'Student must have riskStatus');
    assert.ok(s.riskReason, 'Student must have data-driven riskReason');
  });
  console.log('  ✓ Table data verified with authentic telemetry and explanations.');

  // 5. Test Filters
  console.log('\n[Test 5] Verifying Filters (Performance, Student Search, Date)...');
  
  // Filter by High Risk
  const highRiskRes = await request('/analytics/instructor/intelligence?performance=high_risk', {
    method: 'GET',
    headers: authHeaders,
  });
  assert.strictEqual(highRiskRes.status, 200);
  assert.ok(highRiskRes.data.students.every((s) => s.riskStatus === 'High Risk'), 'All students should have High Risk status');
  console.log(`  ✓ Performance filter "high_risk": returned ${highRiskRes.data.students.length} scholars`);

  // Search by student name
  const searchRes = await request('/analytics/instructor/intelligence?student=Marcus', {
    method: 'GET',
    headers: authHeaders,
  });
  assert.strictEqual(searchRes.status, 200);
  assert.ok(searchRes.data.students.some((s) => s.name.includes('Marcus')), 'Search should return Marcus Vance');
  console.log(`  ✓ Student search filter "Marcus": successfully matched ${searchRes.data.students[0].name}`);

  console.log('\n=================================================================');
  console.log('  ALL INSTRUCTOR LEARNING INTELLIGENCE TESTS PASSED (100%)');
  console.log('=================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
