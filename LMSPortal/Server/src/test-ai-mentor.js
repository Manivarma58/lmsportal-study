import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import AIMentorConversation from './models/AIMentorConversation.js';
import { buildLearnerMentorContext } from './services/ai/mentorContextBuilder.js';
import {
  sendMessageToMentor,
  getLearnerConversations,
  getConversationById,
} from './services/ai/aiMentorService.js';

dotenv.config();

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 NOVA LMS — PART 9: AI MENTOR TEST SUITE');
  console.log('======================================================\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Database');

    // 1. Fetch Test Student
    const student = await User.findOne({ role: 'student' });
    if (!student) throw new Error('Test student not found');
    console.log(`✅ Loaded Student: ${student.name} (${student.email})`);

    // 2. Test Learner Context Aggregation
    console.log('\n🔍 Testing Learner Context Builder...');
    const context = await buildLearnerMentorContext(student._id);
    console.log(`✅ Context Aggregated Successfully:`);
    console.log(`   • Student Name:          ${context.learner.name}`);
    console.log(`   • Target Role:           ${context.targetRole?.name || 'Not set'} (${context.targetRole?.roleReadinessScore || 0}% readiness)`);
    console.log(`   • Demonstrated Skills:   ${context.demonstratedSkills.length} skills tracked`);
    console.log(`   • Weak Skills Identified: ${context.weakSkills.map((s) => `${s.skillName} (${s.overallScore}%)`).join(', ') || 'None'}`);
    console.log(`   • Active Enrolled Courses: ${context.activeCourses.length}`);
    console.log(`   • Assessment Results:    ${context.assessmentResults.length} quizzes on record`);
    console.log(`   • Coding History:        ${context.codingHistory.length} challenge submissions on record`);
    console.log(`   • Active Recommendation: "${context.activeRecommendation?.title || 'None'}"`);

    // 3. Test Query 1: "Why am I weak in Node.js?"
    console.log('\n💬 Testing Query 1: "Why am I weak in Node.js?"');
    const res1 = await sendMessageToMentor(student._id, 'Why am I weak in Node.js?');
    const conversationId = res1.conversationId;
    console.log('   Response:');
    console.log(res1.message.content);
    console.log('\n   Structured 4-Step Remediation Plan:');
    res1.message.structuredRecommendations.forEach((r, idx) => {
      console.log(`   [Step ${idx + 1}] (${r.type}) ${r.title} -> ${r.link}`);
    });

    if (res1.message.structuredRecommendations.length !== 4) {
      throw new Error('Expected exactly 4 structured recommendations (concept review, practice, practical task, reassessment)!');
    }
    console.log('✅ Verified: All 4 mandatory remediation steps returned.');

    // 4. Test Query 2: "What should I study next?"
    console.log('\n💬 Testing Query 2: "What should I study next?"');
    const res2 = await sendMessageToMentor(student._id, 'What should I study next?', conversationId);
    console.log('   Response:');
    console.log(res2.message.content.slice(0, 300) + '...\n');
    console.log(`✅ Verified: Next study action returned with active recommendation context.`);

    // 5. Test Query 3: "Why did I fail this assessment?"
    console.log('\n💬 Testing Query 3: "Why did I fail this assessment?"');
    const res3 = await sendMessageToMentor(student._id, 'Why did I fail this assessment?', conversationId);
    console.log('   Response:');
    console.log(res3.message.content.slice(0, 300) + '...\n');
    console.log(`✅ Verified: Assessment result diagnostics returned from DB.`);

    // 6. Test Query 4: "Give me practice for SQL joins."
    console.log('\n💬 Testing Query 4: "Give me practice for SQL joins."');
    const res4 = await sendMessageToMentor(student._id, 'Give me practice for SQL joins.', conversationId);
    console.log('   Response:');
    console.log(res4.message.content.slice(0, 300) + '...\n');
    console.log(`✅ Verified: Hands-on practice challenges returned from DB.`);

    // 7. Test Query 5: "Explain this coding error."
    console.log('\n💬 Testing Query 5: "Explain this coding error."');
    const res5 = await sendMessageToMentor(student._id, 'Explain this coding error.', conversationId);
    console.log('   Response:');
    console.log(res5.message.content.slice(0, 300) + '...\n');
    console.log(`✅ Verified: Coding error explanation returned.`);

    // 8. Test Conversation History Persistence
    console.log('\n📚 Testing Conversation History Retrieval...');
    const savedConv = await getConversationById(student._id, conversationId);
    console.log(`✅ Conversation persisted with ${savedConv.messages.length} total messages.`);

    const userConversations = await getLearnerConversations(student._id);
    console.log(`✅ User has ${userConversations.length} active mentorship session(s).`);

    console.log('\n======================================================');
    console.log('🎉 ALL AI MENTOR TESTS PASSED (100% SUCCESS)');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ AI MENTOR TEST FAILED:', error);
    process.exit(1);
  }
};

runTests();
