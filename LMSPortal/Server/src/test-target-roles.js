import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import User from './models/User.js';
import Skill from './models/Skill.js';
import TargetRole from './models/TargetRole.js';
import LearnerTargetRole from './models/LearnerTargetRole.js';
import { seedTargetRoles } from './seed-target-roles.js';
import {
  getAllTargetRoles,
  getTargetRoleByIdOrSlug,
  createTargetRole,
  updateTargetRole,
  deleteTargetRole,
  getLearnerActiveTargetRole,
  setLearnerTargetRole,
  analyzeSkillGap,
} from './services/targetRoleService.js';

dotenv.config();

const runTests = async () => {
  console.log('\n==================================================');
  console.log('🧪 NOVA LMS — PART 7: SKILL GAP ANALYZER TEST SUITE');
  console.log('==================================================\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Database');

    // 1. Ensure Benchmark Roles are Seeded
    await seedTargetRoles();
    const allRoles = await getAllTargetRoles();
    console.log(`✅ Loaded ${allRoles.length} target roles from database`);

    const fullStackRole = allRoles.find((r) => r.slug === 'full-stack-developer');
    if (!fullStackRole) {
      throw new Error('Full Stack Developer benchmark role not found!');
    }
    console.log(`✅ Found Benchmark Role: "${fullStackRole.name}" with ${fullStackRole.requiredSkills.length} required skills`);

    // Verify benchmark requirement scores
    const reqMap = {};
    fullStackRole.requiredSkills.forEach((rs) => {
      if (rs.skill) reqMap[rs.skill.name] = rs.requiredScore;
    });
    console.log('   Requirements:', JSON.stringify(reqMap, null, 2));

    // 2. Fetch or Create Test Student
    let student = await User.findOne({ role: 'student' });
    if (!student) {
      student = await User.create({
        name: 'Alex Rivera',
        email: 'alex.rivera.test@novalms.io',
        password: 'Password123!',
        role: 'student',
      });
    }
    console.log(`✅ Identified Test Student: ${student.name} (${student.email})`);

    // 3. Set Student's Target Role
    const setRoleResult = await setLearnerTargetRole(student._id, {
      targetRoleId: fullStackRole._id,
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      targetPace: 'intensive',
      notes: 'Transitioning to Senior Full Stack Engineer before Q4',
    });
    console.log(`✅ Set Learner Target Role: Target Date = ${setRoleResult.targetDate.toISOString().slice(0, 10)}, Pace = ${setRoleResult.targetPace}`);

    // 4. Retrieve Active Target Role
    const activeGoal = await getLearnerActiveTargetRole(student._id);
    console.log(`✅ Active Learner Target Role Retrieved: ${activeGoal.targetRole.name}`);

    // 5. Run Skill Gap Analyzer Engine
    console.log('\n🔬 Running NOVA Skill Gap Analyzer Engine for Learner...');
    const analysis = await analyzeSkillGap(student._id, fullStackRole._id);

    console.log(`\n📊 ANALYSIS RESULTS FOR ROLE: ${analysis.targetRole.name}`);
    console.log(`   Role Readiness Score: ${analysis.summary.roleReadinessScore}% (${analysis.summary.readinessTier})`);
    console.log(`   Total Skills Required: ${analysis.summary.totalSkillsRequired}`);
    console.log(`   Strong Skills Count:   ${analysis.summary.strongCount}`);
    console.log(`   Developing Skills:     ${analysis.summary.developingCount}`);
    console.log(`   Skill Gaps Count:      ${analysis.summary.gapCount}`);

    console.log('\n📋 ROLE SKILL MATRIX:');
    analysis.roleSkillMatrix.forEach((m) => {
      const bar = '█'.repeat(Math.round(m.currentScore / 10)) + '░'.repeat(Math.max(0, 10 - Math.round(m.currentScore / 10)));
      console.log(
        `   • ${m.skillName.padEnd(16)} | Current: ${String(m.currentScore).padStart(3)}% ${bar} | Required: ${String(m.requiredScore).padStart(3)}% | Gap: ${String(m.gapSize).padStart(2)} | Status: [${m.status.toUpperCase()}]`
      );
    });

    console.log('\n🎯 NON-ARBITRARY TARGETED RECOMMENDATIONS:');
    if (analysis.recommendedActions.length === 0) {
      console.log('   All target skills mastered! No gaps detected.');
    } else {
      analysis.recommendedActions.slice(0, 3).forEach((rec, idx) => {
        console.log(`\n   [Action ${idx + 1}] Skill: ${rec.skillName} (Gap: ${rec.gapSize} pts | Importance: ${rec.importance})`);
        console.log(`   Diagnosis: ${rec.diagnosis}`);
        if (rec.recommendedPracticalChallenge) {
          console.log(`   -> Recommended Challenge: "${rec.recommendedPracticalChallenge.title}" [${rec.recommendedPracticalChallenge.difficulty}] (${rec.recommendedPracticalChallenge.note})`);
        }
        if (rec.recommendedProject) {
          console.log(`   -> Recommended Capstone Project: "${rec.recommendedProject.title}" [${rec.recommendedProject.difficulty}]`);
        }
        if (rec.recommendedLearningResources && rec.recommendedLearningResources.length > 0) {
          console.log(`   -> Recommended Course: "${rec.recommendedLearningResources[0].title}" (${rec.recommendedLearningResources[0].actionLabel})`);
        }
      });
    }

    // 6. Test Extensibility: Dynamic Role Creation & Management
    console.log('\n🛠️ Testing Extensibility: Dynamic Target Role Creation...');
    const someSkills = await Skill.find().limit(3);
    const customRole = await createTargetRole(
      {
        name: 'Web3 & Smart Contract Architect Test',
        slug: 'web3-smart-contract-architect-test',
        category: 'Blockchain Engineering',
        description: 'Test role to verify dynamic zero-code additions to target role catalog',
        requiredSkills: someSkills.map((s, idx) => ({
          skill: s._id,
          requiredScore: 70 + idx * 5,
          importance: 'Important',
        })),
      },
      null
    );
    console.log(`✅ Extensible Role Created dynamically: ${customRole.name} (ID: ${customRole._id})`);

    // Verify retrieval by slug
    const fetchedCustom = await getTargetRoleByIdOrSlug('web3-smart-contract-architect-test');
    console.log(`✅ Dynamic Role Retrieved by Slug: ${fetchedCustom.name}`);

    // Update dynamic role
    const updatedCustom = await updateTargetRole(customRole._id, {
      description: 'Updated description for dynamic role testing.',
    });
    console.log(`✅ Dynamic Role Updated: "${updatedCustom.description}"`);

    // Delete dynamic test role
    await deleteTargetRole(customRole._id);
    console.log('✅ Dynamic Test Role Deleted cleanly');

    console.log('\n==================================================');
    console.log('🎉 ALL SKILL GAP ANALYZER TESTS PASSED (100% SUCCESS)');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST RUNNER FAILED:', error);
    process.exit(1);
  }
};

runTests();
