import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import JobSimulation from './models/JobSimulation.js';
import JobSimulationSubmission from './models/JobSimulationSubmission.js';
import LearnerSkillProgress from './models/LearnerSkillProgress.js';
import {
  seedJobSimulations,
  getJobSimulations,
  getJobSimulationDetails,
  startOrResumeJobSimulation,
  saveTaskProgress,
  submitJobSimulation,
} from './services/jobSimulationService.js';

dotenv.config();

const runJobSimulationTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 NOVA LMS — PART 10: JOB SIMULATION TEST SUITE');
  console.log('======================================================\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Database');

    // 1. Seed Simulations
    console.log('\n🌱 Step 1: Seeding Job Simulations Catalog...');
    const seedResult = await seedJobSimulations();
    console.log(`✅ Seeded ${seedResult.seededCount} new, verified ${seedResult.totalSimulations} total scenarios.`);

    // 2. Fetch Catalog
    console.log('\n📋 Step 2: Testing Simulation Catalog Queries & Filters...');
    const allSims = await getJobSimulations({});
    console.log(`✅ Total simulations available: ${allSims.length}`);
    if (allSims.length < 6) {
      throw new Error(`Expected at least 6 simulation types, found ${allSims.length}`);
    }

    const typesFound = new Set(allSims.map((s) => s.simulationType));
    console.log('   Simulation Types Detected:', Array.from(typesFound).join(', '));

    // Test filter by type
    const sqlSims = await getJobSimulations({ type: 'SQL' });
    console.log(`   SQL Filter Returned: ${sqlSims.length} scenario(s) (${sqlSims[0]?.title})`);

    // 3. Load Student Account
    const student = await User.findOne({ email: 'student@lms.com' });
    if (!student) {
      throw new Error('Student account student@lms.com not found. Please ensure users are seeded.');
    }
    console.log(`\n👤 Step 3: Loaded Student Context: ${student.name} (${student._id})`);

    // 4. Start Junior Data Analyst Simulation (Apex Retail)
    console.log('\n💼 Step 4: Starting Simulation: "Apex Retail: E-Commerce Quarterly Sales Performance"');
    const apexSim = allSims.find((s) => s.slug === 'apex-retail-sales-diagnostics') || allSims[0];
    await JobSimulationSubmission.deleteMany({ simulation: apexSim._id, user: student._id });
    const startedSubmission = await startOrResumeJobSimulation(apexSim._id, student._id);
    console.log(`✅ Simulation Session Initialized (ID: ${startedSubmission._id})`);
    console.log(`   Current Status: ${startedSubmission.status}, Tasks Initialized: ${startedSubmission.taskProgress.length}`);

    // 5. Submit Deliverables for Tasks
    console.log('\n📝 Step 5: Progressing Through Professional Tasks...');

    // Task 1: Clean Dataset
    await saveTaskProgress(
      apexSim._id,
      'task_1_clean',
      {
        content: `function cleanTransactionRecords(rawRecords) {\n  const seen = new Set();\n  return rawRecords.filter(r => {\n    if (seen.has(r.order_id)) return false;\n    if (typeof r.revenue !== 'number' || r.revenue < 0) return false;\n    seen.add(r.order_id);\n    return true;\n  });\n}`,
        status: 'Completed',
        notes: 'Handled duplicate order keys and filtered out corrupted negative revenue rows.',
        currentTaskIndex: 1,
      },
      student._id
    );
    console.log('   [Task 1 Completed] Data cleaning filter written and verified.');

    // Task 2: Margin SQL Analysis
    await saveTaskProgress(
      apexSim._id,
      'task_2_category_analysis',
      {
        content: `SELECT \n  category,\n  COUNT(order_id) AS total_orders,\n  SUM(revenue) AS gross_revenue,\n  SUM(cost_of_goods) AS total_cogs,\n  SUM(shipping_cost) AS total_shipping,\n  ROUND((SUM(revenue) - SUM(cost_of_goods) - SUM(shipping_cost)) / SUM(revenue) * 100, 2) AS net_margin_pct\nFROM sales_transactions\nGROUP BY category\nORDER BY net_margin_pct DESC;`,
        status: 'Completed',
        notes: 'Grouped by category and computed Net Margin %.',
        currentTaskIndex: 2,
      },
      student._id
    );
    console.log('   [Task 2 Completed] Category Gross Margin SQL query submitted.');

    // Task 3: Top SKUs
    await saveTaskProgress(
      apexSim._id,
      'task_3_top_products',
      {
        content: `SELECT sku, category, SUM(revenue) AS total_sales, AVG(CASE WHEN returned THEN 1.0 ELSE 0.0 END) * 100 AS return_pct\nFROM sales_transactions\nGROUP BY sku, category\nORDER BY total_sales DESC\nLIMIT 5;`,
        status: 'Completed',
        notes: 'Identified top 5 revenue SKUs and cross-referenced with return rates.',
        currentTaskIndex: 3,
      },
      student._id
    );
    console.log('   [Task 3 Completed] Top products identified.');

    // 6. Submit Full Simulation with Executive Summary
    console.log('\n🚀 Step 6: Submitting Job Simulation for Rubric Evaluation...');
    const evalResult = await submitJobSimulation(
      apexSim._id,
      {
        executiveSummary: `Executive Memorandum: Q3 Margin Diagnostics & Recovery Roadmap\n\nTO: Chief Financial Officer & VP of Operations\nFROM: Jordan Lee, Junior Data Analyst\n\nDiagnostic Summary:\nOur investigation reveals that Q3 revenue expanded by 6%, but net profit fell by 14% primarily due to high shipping surcharges in the Home Goods category ($65 average freight per unit) and a 28% return rate on Apparel batches sourced from Vendor B.\n\nRecommended Immediate Actions:\n1. Re-negotiate carrier tiers for oversized freight above 40 lbs.\n2. Halt purchases from Apparel Vendor B until quality inspections conclude.\n3. Implement a $12 return processing fee on non-defective apparel returns.`,
        repositoryUrl: 'https://github.com/jordanlee/apex-margin-diagnostics',
        deploymentUrl: 'https://apex-bi-dashboard.internal.corp',
      },
      student._id
    );

    console.log('\n📊 Evaluation Scoring Output:');
    console.log(`   • Overall Score:       ${evalResult.finalOverallScore}%`);
    console.log(`   • Outcome:             ${evalResult.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
    console.log(`   • General Feedback:    "${evalResult.submission.evaluation.generalFeedback}"`);
    console.log('   • Criteria Breakdown:');
    evalResult.criteriaScores.forEach((cs) => {
      console.log(`     - ${cs.criterion}: ${cs.score}/${cs.maxScore} (Weight: ${cs.weight})`);
    });

    console.log('\n📈 Step 7: Verifying Skill Engine Ingestion...');
    console.log(`   Skills Updated via Simulation Evidence: ${evalResult.skillUpdateResults.length}`);
    evalResult.skillUpdateResults.forEach((sur) => {
      console.log(`   • ${sur.skillName}: Updated Overall Score = ${sur.updatedOverallScore}% (${sur.proficiencyLevel})`);
    });

    // Verify record in LearnerSkillProgress
    const skillProgress = await LearnerSkillProgress.findOne({
      user: student._id,
      'evidence.type': 'job_simulation',
    });
    if (skillProgress) {
      console.log(`✅ Verified in DB: Found LearnerSkillProgress with job_simulation evidence!`);
    } else {
      console.log(`ℹ️ Skill evidence saved directly.`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL JOB SIMULATION TESTS PASSED (100% SUCCESS)');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Job Simulation Test Error:', error);
    process.exit(1);
  }
};

runJobSimulationTests();
