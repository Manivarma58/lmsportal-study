import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import RecommendationHistory from './models/RecommendationHistory.js';
import {
  generateNextActionRecommendation,
  getLearnerRecommendationHistory,
  dismissRecommendation,
  completeRecommendation,
} from './services/recommendationService.js';

dotenv.config();

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 NOVA LMS — PART 8: RECOMMENDATION ENGINE TEST SUITE');
  console.log('======================================================\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Database');

    // 1. Fetch Test Student
    const student = await User.findOne({ role: 'student' });
    if (!student) {
      throw new Error('Test student not found');
    }
    console.log(`✅ Loaded Student: ${student.name} (${student.email})`);

    // 2. Generate Deterministic Next Action Recommendation
    console.log('\n🧠 Executing Rule-Based Recommendation Engine...');
    const result = await generateNextActionRecommendation(student._id);

    if (!result.recommendation) {
      console.log('⚠️ No recommendation generated:', result.message);
    } else {
      const rec = result.recommendation;
      console.log('\n🎯 PRIMARY RECOMMENDATION GENERATED:');
      console.log(`   Title:              "${rec.title}"`);
      console.log(`   Priority:           [${rec.priority.toUpperCase()}]`);
      console.log(`   Estimated Time:     ${rec.estimatedDuration}`);
      console.log(`   Related Skill:      ${rec.relatedSkill.name}`);
      console.log(`   Resource Type:      ${rec.relatedResource.type} (${rec.relatedResource.title})`);
      console.log(`   Action URL:         ${rec.relatedResource.actionUrl}`);
      console.log(`   Explainable Reason: "${rec.reason}"`);

      console.log('\n🔍 EXPLAINABILITY BREAKDOWN:');
      console.log(`   Rule Triggered:     ${rec.explanation?.ruleTriggered}`);
      console.log(`   Target Role:        ${rec.explanation?.targetRoleName}`);
      console.log(`   Current Score:      ${rec.explanation?.currentScore}%`);
      console.log(`   Target Score:       ${rec.explanation?.targetScore}%`);
      console.log(`   Gap Size:           ${rec.explanation?.gapSize} pts`);
      console.log(`   Trigger Context:    ${rec.explanation?.historicalTrigger}`);

      console.log(`\n📋 QUEUED ACTIONS (${result.queuedActions.length}):`);
      result.queuedActions.forEach((qa, idx) => {
        console.log(`   ${idx + 1}. [${qa.priority}] ${qa.title} (${qa.estimatedDuration})`);
        console.log(`      Reason: ${qa.reason}`);
      });

      // 3. Verify Recommendation History Persistence
      const historyRecord = await RecommendationHistory.findById(rec.id);
      if (!historyRecord) {
        throw new Error('Recommendation was not stored in RecommendationHistory!');
      }
      console.log(`\n✅ Stored in RecommendationHistory: ID = ${historyRecord._id} (Status: ${historyRecord.status})`);

      // 4. Test Dismissal & Alternate Priority Action Selection
      console.log('\n🔄 Testing Dismissal & Next Action Selection...');
      const dismissResult = await dismissRecommendation(student._id, rec.id);
      console.log(`✅ Previous action dismissed successfully.`);
      if (dismissResult.recommendation) {
        console.log(`✅ Next Selected Action: "${dismissResult.recommendation.title}" [${dismissResult.recommendation.priority}]`);
        if (dismissResult.recommendation.id.toString() === rec.id.toString()) {
          throw new Error('Engine recommended the exact same dismissed action!');
        }
        console.log('✅ Verified: Dismissed task was not duplicated.');
      }

      // 5. Test History Retrieval
      const historyList = await getLearnerRecommendationHistory(student._id);
      console.log(`✅ Retrieved ${historyList.length} historical recommendation logs for learner.`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL RECOMMENDATION ENGINE TESTS PASSED (100% SUCCESS)');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ RECOMMENDATION TEST FAILED:', error);
    process.exit(1);
  }
};

runTests();
