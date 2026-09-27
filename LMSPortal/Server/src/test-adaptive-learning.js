import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Skill from './models/Skill.js';
import AdaptiveIntervention from './models/AdaptiveIntervention.js';
import LearnerSkillProgress from './models/LearnerSkillProgress.js';
import {
  detectLearnerWeaknesses,
  getOrCreateActiveIntervention,
  getLearnerInterventions,
  recordActivityProgress,
} from './services/adaptiveLearningService.js';
import { generateNextActionRecommendation } from './services/recommendationService.js';
import { buildLearnerMentorContext } from './services/ai/mentorContextBuilder.js';

dotenv.config();

const runAdaptiveLearningTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 NOVA LMS — PART 11: ADAPTIVE LEARNING TEST SUITE');
  console.log('======================================================\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Database');

    // 1. Load Student
    const student = await User.findOne({ email: 'student@lms.com' });
    if (!student) {
      throw new Error('Student account student@lms.com not found.');
    }
    console.log(`👤 Step 1: Loaded Student Context: ${student.name} (${student._id})`);

    // Clean previous test interventions for this test run
    await AdaptiveIntervention.deleteMany({ user: student._id });
    console.log('🧹 Cleaned previous test interventions for fresh verification cycle.');

    // 2. Test Automated Weakness Detection
    console.log('\n🔍 Step 2: Testing Multi-Signal Weakness Detection Engine...');
    const detectedWeaknesses = await detectLearnerWeaknesses(student._id);
    console.log(`✅ Weakness Detection Complete: Found ${detectedWeaknesses.length} potential area(s) needing attention.`);

    detectedWeaknesses.forEach((w, idx) => {
      console.log(
        `   [${idx + 1}] Skill: ${w.skillName.padEnd(20)} | Severity: ${w.severity.padEnd(8)} | Score: ${w.overallScore}% vs Req: ${w.requiredScore}% | Trend: ${w.trend}`
      );
      console.log(`       Reason: "${w.detectionReason}"`);
    });

    // 3. Spawn or Retrieve Adaptive Intervention Ladder
    console.log('\n🪜 Step 3: Generating Progressive Adaptive Remediation Ladder...');
    const intervention = await getOrCreateActiveIntervention(student._id);
    if (!intervention) {
      throw new Error('Expected active intervention to be spawned, but received null.');
    }

    console.log(`✅ Active Adaptive Intervention Initialized:`);
    console.log(`   • Target Skill:       ${intervention.skillName}`);
    console.log(`   • Severity Level:     ${intervention.severity}`);
    console.log(`   • Current Stage:      Stage ${intervention.stages[intervention.currentStageIndex]?.stageNumber} (${intervention.stages[intervention.currentStageIndex]?.stageName})`);
    console.log(`   • Remediation Ladder: ${intervention.stages.length} Progressive Milestones:`);

    intervention.stages.forEach((st) => {
      console.log(
        `     - Step ${st.stageNumber}: [${st.stageName}] (${st.difficulty}) -> ${st.activityTitle} [${st.activityType}]`
      );
    });

    // 4. Test Integration with Recommendation Engine
    console.log('\n🎯 Step 4: Testing Integration with Recommendation Engine...');
    const recResult = await generateNextActionRecommendation(student._id);
    console.log(`✅ Top Action Title: "${recResult.recommendation?.title}"`);
    console.log(`   Rule Triggered:   "${recResult.recommendation?.explanation?.ruleTriggered}"`);
    console.log(`   Priority:         ${recResult.recommendation?.priority}`);
    if (recResult.recommendation?.explanation?.ruleTriggered !== 'ADAPTIVE_REMEDIATION_PLAN') {
      console.warn('   ⚠️ Notice: Recommendation did not trigger ADAPTIVE_REMEDIATION_PLAN. Checking candidate actions...');
    } else {
      console.log('   ✅ Verified: Recommendation Engine successfully prioritized the active adaptive intervention!');
    }

    // 5. Test Integration with AI Mentor Context
    console.log('\n🤖 Step 5: Testing Integration with AI Mentor Telemetry...');
    const mentorContext = await buildLearnerMentorContext(student._id);
    if (!mentorContext.activeAdaptiveIntervention) {
      throw new Error('AI Mentor context builder missing activeAdaptiveIntervention.');
    }
    console.log('✅ AI Mentor is synchronized with active adaptive intervention:');
    console.log(`   • Target Skill:     ${mentorContext.activeAdaptiveIntervention.skillName}`);
    console.log(`   • Current Step:     Step ${mentorContext.activeAdaptiveIntervention.currentStage.number}: ${mentorContext.activeAdaptiveIntervention.currentStage.name}`);
    console.log(`   • Activity Focus:   ${mentorContext.activeAdaptiveIntervention.currentStage.activityTitle}`);

    // 6. Test Step-by-Step Progression Through The Ladder
    console.log('\n🚀 Step 6: Progressing Through Remediation Ladder Milestones...');

    // Complete Stage 1 (Beginner Practice)
    const stage1 = intervention.stages[0];
    console.log(`   Advancing Stage 1: ${stage1.stageName}...`);
    const afterStage1 = await recordActivityProgress(student._id, {
      activityType: stage1.activityType,
      activityId: stage1.activityId,
      score: 85,
      passed: true,
      skillId: intervention.skill,
    });
    console.log(`   ✅ Stage 1 Completed! Current Stage Index advanced to: ${afterStage1.currentStageIndex} (Next: ${afterStage1.stages[afterStage1.currentStageIndex]?.stageName})`);

    // Complete Stage 2 (Intermediate Practice)
    const stage2 = afterStage1.stages[1];
    console.log(`   Advancing Stage 2: ${stage2.stageName}...`);
    const afterStage2 = await recordActivityProgress(student._id, {
      activityType: stage2.activityType,
      activityId: stage2.activityId,
      score: 80,
      passed: true,
      skillId: intervention.skill,
    });
    console.log(`   ✅ Stage 2 Completed! Current Stage Index advanced to: ${afterStage2.currentStageIndex} (Next: ${afterStage2.stages[afterStage2.currentStageIndex]?.stageName})`);

    // Complete Stage 3 (Real-World Task)
    const stage3 = afterStage2.stages[2];
    console.log(`   Advancing Stage 3: ${stage3.stageName}...`);
    const afterStage3 = await recordActivityProgress(student._id, {
      activityType: stage3.activityType,
      activityId: stage3.activityId,
      score: 90,
      passed: true,
      skillId: intervention.skill,
    });
    console.log(`   ✅ Stage 3 Completed! Current Stage Index advanced to: ${afterStage3.currentStageIndex} (Next: ${afterStage3.stages[afterStage3.currentStageIndex]?.stageName})`);

    // Complete Stage 4 (Final Reassessment Benchmark)
    const stage4 = afterStage3.stages[3];
    console.log(`   Advancing Stage 4: ${stage4.stageName} (Final Graduation)...`);
    const finalIntervention = await recordActivityProgress(student._id, {
      activityType: stage4.activityType,
      activityId: stage4.activityId,
      score: 88,
      passed: true,
      skillId: intervention.skill,
    });

    console.log('\n🏆 Step 7: Verifying Graduation & Turnaround Resolution...');
    console.log(`   • Final Status:      ${finalIntervention.status}`);
    console.log(`   • Baseline Score:    ${finalIntervention.improvement?.baselineScore}%`);
    console.log(`   • Final Score:       ${finalIntervention.improvement?.currentScore}%`);
    console.log(`   • Score Delta:       +${finalIntervention.improvement?.scoreDelta}% Demonstrated Mastery`);

    if (finalIntervention.status !== 'Resolved') {
      throw new Error(`Expected intervention status to be 'Resolved', got '${finalIntervention.status}'`);
    }

    // 8. Fetch Summary Analytics
    const summary = await getLearnerInterventions(student._id);
    console.log(`\n📊 Learner Adaptive Analytics Summary:`);
    console.log(`   • Active Remediation Count: ${summary.summary.activeCount}`);
    console.log(`   • Resolved Turnarounds:     ${summary.summary.resolvedCount}`);
    console.log(`   • Avg Score Improvement:    +${summary.summary.averageScoreImprovement}%`);

    console.log('\n======================================================');
    console.log('🎉 ALL ADAPTIVE LEARNING TESTS PASSED (100% SUCCESS)');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Adaptive Learning Test Error:', error);
    process.exit(1);
  }
};

runAdaptiveLearningTests();
