import JobSimulation from '../models/JobSimulation.js';
import JobSimulationSubmission from '../models/JobSimulationSubmission.js';
import Skill from '../models/Skill.js';
import { evaluateSubmission } from './jobSimulationEvaluationService.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Retrieve catalog of job simulations with learner progress metadata
 */
export const getJobSimulations = async ({
  type = null,
  difficulty = null,
  role = null,
  search = null,
  userId = null,
}) => {
  const query = { status: 'Published' };

  if (type && type !== 'All') {
    query.simulationType = type;
  }
  if (difficulty && difficulty !== 'All') {
    query.difficulty = difficulty;
  }
  if (role) {
    query.role = new RegExp(role, 'i');
  }
  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { role: new RegExp(search, 'i') },
      { 'companyScenario.companyName': new RegExp(search, 'i') },
    ];
  }

  const simulations = await JobSimulation.find(query)
    .populate('requiredSkills.skill', 'name slug category')
    .sort({ createdAt: -1 });

  // If user provided, attach learner submission status
  let userSubmissionsMap = new Map();
  if (userId) {
    const userSubs = await JobSimulationSubmission.find({ user: userId });
    userSubs.forEach((sub) => {
      userSubmissionsMap.set(String(sub.simulation), sub);
    });
  }

  const enriched = simulations.map((sim) => {
    const simObj = sim.toObject();
    const userSub = userSubmissionsMap.get(String(sim._id));

    if (userSub) {
      const completedTasksCount = userSub.taskProgress.filter(
        (tp) => tp.status === 'Completed'
      ).length;
      const totalTasks = sim.tasks?.length || 1;

      simObj.learnerStatus = {
        hasStarted: true,
        submissionId: userSub._id,
        status: userSub.status, // 'In Progress' | 'Submitted' | 'Evaluated'
        progressPercentage: Math.round((completedTasksCount / totalTasks) * 100),
        overallScore: userSub.evaluation?.overallScore || null,
        passed: userSub.evaluation?.passed || false,
        evaluatedAt: userSub.evaluatedAt,
      };
    } else {
      simObj.learnerStatus = {
        hasStarted: false,
        status: 'Not Started',
        progressPercentage: 0,
        overallScore: null,
        passed: false,
      };
    }

    return simObj;
  });

  return enriched;
};

/**
 * Get detailed simulation context, tasks, datasets, and active learner progress
 */
export const getJobSimulationDetails = async (idOrSlug, userId = null) => {
  let sim = null;
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    sim = await JobSimulation.findById(idOrSlug).populate('requiredSkills.skill');
  }
  if (!sim) {
    sim = await JobSimulation.findOne({ slug: idOrSlug.toLowerCase() }).populate(
      'requiredSkills.skill'
    );
  }

  if (!sim) {
    throw new ErrorResponse('Job simulation not found', 404);
  }

  let learnerSubmission = null;
  if (userId) {
    learnerSubmission = await JobSimulationSubmission.findOne({
      simulation: sim._id,
      user: userId,
    });
  }

  return {
    simulation: sim,
    learnerSubmission,
  };
};

/**
 * Start or resume a job simulation
 */
export const startOrResumeJobSimulation = async (simulationId, userId) => {
  const sim = await JobSimulation.findById(simulationId);
  if (!sim) {
    throw new ErrorResponse('Simulation not found', 404);
  }

  let submission = await JobSimulationSubmission.findOne({
    simulation: sim._id,
    user: userId,
  });

  if (!submission) {
    // Initialize task progress array from simulation tasks
    const initialTasks = (sim.tasks || []).map((t) => ({
      taskId: t.id,
      taskNumber: t.taskNumber,
      deliverableType: t.deliverableType,
      content: t.starterTemplate || '',
      notes: '',
      status: 'Not Started',
    }));

    submission = await JobSimulationSubmission.create({
      simulation: sim._id,
      user: userId,
      status: 'In Progress',
      currentTaskIndex: 0,
      taskProgress: initialTasks,
      startedAt: new Date(),
    });

    // Increment enrolled count
    await JobSimulation.findByIdAndUpdate(sim._id, { $inc: { enrolledCount: 1 } });
  }

  return submission;
};

/**
 * Save draft/completed task deliverable
 */
export const saveTaskProgress = async (simulationId, taskId, deliverableData, userId) => {
  const submission = await JobSimulationSubmission.findOne({
    simulation: simulationId,
    user: userId,
  });

  if (!submission) {
    throw new ErrorResponse('Active simulation submission not found. Please start first.', 404);
  }

  if (submission.status === 'Submitted' || submission.status === 'Evaluated') {
    throw new ErrorResponse('Simulation has already been submitted for evaluation.', 400);
  }

  const { content, notes, status, currentTaskIndex } = deliverableData;

  const taskIndex = submission.taskProgress.findIndex((tp) => tp.taskId === taskId);
  if (taskIndex >= 0) {
    if (content !== undefined) submission.taskProgress[taskIndex].content = content;
    if (notes !== undefined) submission.taskProgress[taskIndex].notes = notes;
    if (status) {
      submission.taskProgress[taskIndex].status = status;
      if (status === 'Completed') {
        submission.taskProgress[taskIndex].completedAt = new Date();
      }
    }
  } else {
    submission.taskProgress.push({
      taskId,
      taskNumber: submission.taskProgress.length + 1,
      content: content || '',
      notes: notes || '',
      status: status || 'In Progress',
      completedAt: status === 'Completed' ? new Date() : undefined,
    });
  }

  if (typeof currentTaskIndex === 'number') {
    submission.currentTaskIndex = currentTaskIndex;
  }

  await submission.save();
  return submission;
};

/**
 * Submit Job Simulation for evaluation
 */
export const submitJobSimulation = async (
  simulationId,
  { executiveSummary, repositoryUrl, deploymentUrl },
  userId
) => {
  const submission = await JobSimulationSubmission.findOne({
    simulation: simulationId,
    user: userId,
  });

  if (!submission) {
    throw new ErrorResponse('Submission not found.', 404);
  }

  if (submission.status === 'Submitted' || submission.status === 'Evaluated') {
    throw new ErrorResponse('Simulation already submitted.', 400);
  }

  submission.finalExecutiveSummary = executiveSummary || '';
  submission.repositoryUrl = repositoryUrl || '';
  submission.deploymentUrl = deploymentUrl || '';
  submission.status = 'Evaluating';
  submission.submittedAt = new Date();

  await submission.save();

  // Run objective rubric evaluation engine
  const evalResult = await evaluateSubmission(submission._id, null);

  return evalResult;
};

/**
 * Seed realistic enterprise Job Simulations covering all 6 required types
 */
export const seedJobSimulations = async (adminUserId = null) => {
  // Find primary skills in DB to map
  const [dataAnalysisSkill, sqlSkill, nodeSkill, jsSkill, systemDesignSkill] = await Promise.all([
    Skill.findOne({ slug: 'data-analysis' }) || Skill.findOne({ name: /data/i }),
    Skill.findOne({ slug: 'sql' }) || Skill.findOne({ name: /sql/i }),
    Skill.findOne({ slug: 'node-js' }) || Skill.findOne({ name: /node/i }),
    Skill.findOne({ slug: 'javascript' }) || Skill.findOne({ name: /javascript/i }),
    Skill.findOne({ slug: 'system-design' }) || Skill.findOne({ name: /design|architecture/i }),
  ]);

  const simulationsData = [
    // 1. Data Analysis (Junior Data Analyst)
    {
      title: 'Apex Retail: E-Commerce Quarterly Sales Performance & Margin Diagnostics',
      slug: 'apex-retail-sales-diagnostics',
      role: 'Junior Data Analyst',
      simulationType: 'Data Analysis',
      difficulty: 'Beginner',
      estimatedTime: '90 mins',
      companyScenario: {
        companyName: 'Apex Retail Group',
        industry: 'Omnichannel Consumer Goods & Retail',
        context:
          'Apex Retail experienced an unexpected 14% drop in Q3 net profit despite a 6% revenue surge. The Executive Vice President of Operations needs an immediate diagnostic to identify which product categories and shipping routes are eroding company margins.',
        stakes:
          'Findings will be presented directly to the CFO to guide inventory purchasing decisions and vendor contract renegotiations for the upcoming holiday season.',
        mentorPersona: {
          name: 'Elena Rostova',
          role: 'Lead Business Intelligence Architect',
          avatar: '📊',
          welcomeMessage:
            'Hi and welcome to the BI Team! I loaded the raw Q3 transaction dump into your workspace. Work through our standard 7-phase analysis protocol and provide an executive-ready diagnosis.',
        },
      },
      description:
        'Step into the shoes of a Junior Data Analyst at Apex Retail. Clean dirty transaction records, compute key metrics (margins, category revenue, return rates), identify declining product lines, and draft an executive briefing for leadership.',
      requiredSkills: [
        {
          skill: dataAnalysisSkill?._id,
          skillName: dataAnalysisSkill?.name || 'Data Analysis',
          minProficiency: 55,
        },
        {
          skill: sqlSkill?._id,
          skillName: sqlSkill?.name || 'SQL',
          minProficiency: 50,
        },
      ],
      datasets: [
        {
          id: 'apex_q3_sales',
          name: 'apex_q3_transactions.json',
          description: '2,500 raw order lines with customer ID, product SKU, units, revenue, cost, returns, and shipping channels.',
          format: 'json',
          columns: [
            { name: 'order_id', type: 'string', description: 'Unique order identifier' },
            { name: 'sku', type: 'string', description: 'Product Stock Keeping Unit' },
            { name: 'category', type: 'string', description: 'Merchandise Category (Electronics, Apparel, Home, Groceries)' },
            { name: 'revenue', type: 'number', description: 'Gross sale amount in USD' },
            { name: 'cost_of_goods', type: 'number', description: 'Wholesale COGS' },
            { name: 'shipping_cost', type: 'number', description: 'Fulfillment & Carrier cost' },
            { name: 'returned', type: 'boolean', description: 'Whether customer initiated return' },
          ],
          sampleData: [
            { order_id: 'ORD-9021', sku: 'ELEC-440', category: 'Electronics', revenue: 249.99, cost_of_goods: 180.00, shipping_cost: 14.50, returned: false },
            { order_id: 'ORD-9022', sku: 'APPR-102', category: 'Apparel', revenue: 79.50, cost_of_goods: 22.00, shipping_cost: 8.00, returned: true },
            { order_id: 'ORD-9023', sku: 'HOME-881', category: 'Home', revenue: 399.00, cost_of_goods: 310.00, shipping_cost: 65.00, returned: false },
          ],
        },
      ],
      tasks: [
        {
          id: 'task_1_clean',
          taskNumber: 1,
          title: 'Clean and Validate Dataset',
          description: 'Filter corrupted records, handle null attributes, and standardize revenue data types.',
          instructions:
            'Review the raw transaction records. Write a data cleaning script or transformation routine in Python/JavaScript or SQL to remove duplicate order IDs and flag records with negative revenue.',
          deliverableType: 'code',
          starterTemplate: `// Task 1: Data Cleaning Routine\nfunction cleanTransactionRecords(rawRecords) {\n  // 1. Remove duplicate order_id entries\n  // 2. Filter out negative or NaN revenue rows\n  // 3. Impute missing shipping costs with category median\n  return cleaned;\n}`,
          placeholderText: 'Paste your transformation code or SQL data cleaning queries here...',
          validationRules: [
            { ruleType: 'contains_keyword', expected: 'filter', message: 'Include filtering logic for invalid records' },
            { ruleType: 'min_length', expected: '60', message: 'Ensure transformation code covers full criteria' },
          ],
          maxScore: 15,
        },
        {
          id: 'task_2_category_analysis',
          taskNumber: 2,
          title: 'Analyze Sales & Gross Margin by Category',
          description: 'Calculate net profit margin: (Revenue - COGS - Shipping Cost) / Revenue for each category.',
          instructions:
            'Group the cleaned dataset by product category. Compute total revenue, total margin dollar amount, and gross margin percentage.',
          deliverableType: 'sql',
          starterTemplate: `-- Task 2: Margin Diagnostic Query\nSELECT \n  category,\n  COUNT(order_id) AS total_orders,\n  SUM(revenue) AS gross_revenue,\n  -- TODO: Calculate Net Margin %:\nFROM sales_transactions\nGROUP BY category;`,
          validationRules: [
            { ruleType: 'sql_select', expected: 'SELECT', message: 'Must be a valid SQL aggregate query' },
            { ruleType: 'contains_keyword', expected: 'group by', message: 'Query must contain GROUP BY category clause' },
          ],
          maxScore: 20,
        },
        {
          id: 'task_3_top_products',
          taskNumber: 3,
          title: 'Identify Top 5 Revenue Generating Products',
          description: 'Rank individual SKUs by total gross sales volume and review their respective return rates.',
          instructions:
            'Write query or ranking script returning the top 5 SKUs by gross revenue and calculate what fraction of their volume resulted in customer returns.',
          deliverableType: 'sql',
          starterTemplate: `-- Task 3: Top 5 SKUs by Gross Revenue\nSELECT \n  sku,\n  category,\n  SUM(revenue) AS total_sales,\n  AVG(CASE WHEN returned = true THEN 1.0 ELSE 0.0 END) * 100 AS return_rate_pct\nFROM sales_transactions\nGROUP BY sku, category\nORDER BY total_sales DESC\nLIMIT 5;`,
          maxScore: 15,
        },
        {
          id: 'task_4_monthly_revenue',
          taskNumber: 4,
          title: 'Calculate Monthly Revenue Trend & Seasonality',
          description: 'Track week-over-week and month-over-month growth trajectories.',
          instructions:
            'Aggregate transactions across July, August, and September to determine whether the revenue drop was sudden or progressive.',
          deliverableType: 'text',
          starterTemplate: `### Monthly Revenue Aggregation:\n- July: $X,XXX,XXX (Margin: XX%)\n- August: $X,XXX,XXX (Margin: XX%)\n- September: $X,XXX,XXX (Margin: XX%)\n\nKey inflection point identified:`,
          maxScore: 15,
        },
        {
          id: 'task_5_declining_products',
          taskNumber: 5,
          title: 'Isolate Margin Drainers & Declining Products',
          description: 'Identify product lines where high shipping costs or return rates resulted in net operating losses.',
          instructions:
            'Locate products where (Revenue - COGS - Shipping) < 0. Specify why they lost money (e.g. oversized dimensions causing shipping penalties or defective batches causing returns).',
          deliverableType: 'text',
          starterTemplate: `### Identified Margin Drainers:\n1. SKU / Category:\n   - Loss Amount: $\n   - Primary Cause (Shipping vs Returns vs Discounting):\n2. SKU / Category:`,
          maxScore: 15,
        },
        {
          id: 'task_6_visualization_summary',
          taskNumber: 6,
          title: 'Design Dashboard Visualization Specification',
          description: 'Specify charts (waterfall, category bar, scatter plot) for the executive team.',
          instructions:
            'Outline the layout of the BI dashboard you would deliver in Tableau/PowerBI or Looker to let the VP inspect margins continuously.',
          deliverableType: 'report',
          starterTemplate: `### Executive Dashboard Wireframe & Metrics:\n1. KPI Cards: (Gross Sales, Net Margin, Return Rate)\n2. Chart 1 (Waterfall): Revenue to Net Operating Margin\n3. Chart 2: Category Margin vs Shipping Ratio\n4. Alert Thresholds:`,
          maxScore: 10,
        },
        {
          id: 'task_7_executive_briefing',
          taskNumber: 7,
          title: 'Draft Business Summary & Recommendations',
          description: 'Synthesize findings into actionable executive briefing with recommendations for the CFO.',
          instructions:
            'Formulate 3 strategic recommendations for the executive leadership to recapture lost margins in Q4.',
          deliverableType: 'report',
          starterTemplate: `### Executive Memorandum: Q3 Margin Remediation Plan\nTO: Chief Financial Officer & VP of Operations\nFROM: Junior Data Analyst, BI Team\n\n1. Executive Summary:\n2. Primary Findings:\n3. Actionable Recommendations:\n   - Renegotiate Carrier Tiers for Oversized Freight:\n   - Review Vendor Quality for High-Return Apparel:\n   - Dynamic Pricing Adjustments:`,
          maxScore: 10,
        },
      ],
      evaluationCriteria: [
        {
          criterion: 'Data Cleaning & Accuracy',
          description: 'Effectiveness of cleaning logic, treatment of anomalies, and mathematical correctness of calculated margins.',
          maxScore: 25,
          weight: 1.2,
        },
        {
          criterion: 'Analytical Rigor & SQL Quality',
          description: 'Use of appropriate grouping, aggregate functions, and windowing methods to isolate trends without data distortion.',
          maxScore: 25,
          weight: 1.0,
        },
        {
          criterion: 'Business Acumen & Insight Depth',
          description: 'Ability to connect raw numbers to real-world commercial impact, root causes of margin decline, and cost drivers.',
          maxScore: 25,
          weight: 1.2,
        },
        {
          criterion: 'Executive Communication & Presentation',
          description: 'Clarity, conciseness, and professionalism of the written memorandum for C-suite decision-makers.',
          maxScore: 25,
          weight: 1.0,
        },
      ],
    },

    // 2. Software Development (Junior Backend Engineer)
    {
      title: 'NovaPay: Resilient Webhook Ingestion & Idempotency Engine',
      slug: 'novapay-webhook-idempotency',
      role: 'Junior Backend Engineer',
      simulationType: 'Software Development',
      difficulty: 'Intermediate',
      estimatedTime: '120 mins',
      companyScenario: {
        companyName: 'NovaPay Global',
        industry: 'FinTech & Payments Infrastructure',
        context:
          'Payment gateway webhooks are occasionally delivered multiple times during network retries, causing double-credit vulnerabilities in merchant accounts. Your sprint objective is to implement a robust, idempotent webhook processor backed by atomic Redis/DB locks.',
        stakes:
          'Prevents duplicate financial settlements totaling hundreds of thousands of dollars during provider upstream disruptions.',
        mentorPersona: {
          name: 'Marcus Vance',
          role: 'Staff Infrastructure Engineer',
          avatar: '⚡',
          welcomeMessage:
            'Welcome aboard NovaPay! Financial systems must be idempotent by default. Never trust the network. Build our webhook handler with deterministic verification and distributed locking.',
        },
      },
      description:
        'Implement an enterprise payment webhook processor with HMAC signature verification, atomic idempotency keys, replay-attack protection, and transaction audit trails.',
      requiredSkills: [
        {
          skill: nodeSkill?._id,
          skillName: nodeSkill?.name || 'Node.js',
          minProficiency: 65,
        },
        {
          skill: jsSkill?._id,
          skillName: jsSkill?.name || 'JavaScript',
          minProficiency: 65,
        },
      ],
      datasets: [
        {
          id: 'novapay_webhook_payloads',
          name: 'sample_webhook_events.json',
          description: 'Simulated payment gateway webhook events with cryptographic headers and idempotency IDs.',
          format: 'json',
          sampleData: [
            {
              event_id: 'evt_998124',
              type: 'charge.succeeded',
              amount_cents: 8500,
              currency: 'usd',
              idempotency_key: 'idem_a81f-49b2-c0e1',
              signature: 'sha256=4f3b...89a',
            },
          ],
        },
      ],
      tasks: [
        {
          id: 'task_dev_1_hmac',
          taskNumber: 1,
          title: 'Implement Cryptographic HMAC Signature Verification',
          description: 'Verify raw request payload against shared secret using timing-safe buffer comparison.',
          instructions:
            'Write the cryptographic middleware using Node.js crypto module to prevent webhook spoofing.',
          deliverableType: 'code',
          starterTemplate: `import crypto from 'crypto';\n\nexport function verifyWebhookSignature(rawBody, signatureHeader, secret) {\n  // 1. Compute HMAC SHA256 of rawBody\n  // 2. Use crypto.timingSafeEqual to prevent timing attacks\n  // 3. Return boolean\n}`,
          validationRules: [
            { ruleType: 'contains_keyword', expected: 'timingsafeequal', message: 'Must use crypto.timingSafeEqual for security' },
          ],
          maxScore: 25,
        },
        {
          id: 'task_dev_2_idempotency',
          taskNumber: 2,
          title: 'Atomic Idempotency Lock & Deduplication Store',
          description: 'Ensure incoming event is processed exactly once even under concurrent race conditions.',
          instructions:
            'Implement an atomic lock acquisition using key-value storage with TTL expiration.',
          deliverableType: 'code',
          starterTemplate: `export async function processIdempotentEvent(event, db) {\n  const { idempotency_key, event_id } = event;\n  // 1. Check or set atomic lock\n  // 2. If already processed, return cached outcome\n  // 3. If in progress, return 409 Conflict\n  // 4. Record successful settlement\n}`,
          validationRules: [
            { ruleType: 'contains_keyword', expected: 'idempotency_key', message: 'Ensure idempotency key is checked and stored' },
          ],
          maxScore: 35,
        },
        {
          id: 'task_dev_3_audit',
          taskNumber: 3,
          title: 'Audit Logging & Dead-Letter Queue Handler',
          description: 'Gracefully route unhandled malformed payloads to DLQ with operational metadata.',
          instructions:
            'Implement failure recovery and logging for operational observability.',
          deliverableType: 'code',
          starterTemplate: `export async function handleWebhookFailure(event, error, dlqService) {\n  // Log to structured audit trail and publish to DLQ\n}`,
          maxScore: 20,
        },
        {
          id: 'task_dev_4_architecture',
          taskNumber: 4,
          title: 'Service Resilience Documentation',
          description: 'Document system behavior during network partition or database lag.',
          instructions:
            'Write brief markdown documentation explaining the failure recovery SLA and replay protection.',
          deliverableType: 'report',
          starterTemplate: `### NovaPay Webhook Ingestion SLA & Resilience Document\n\n1. Deduplication Guarantee:\n2. Replay Attack Mitigation:\n3. Maximum Retry Horizon:`,
          maxScore: 20,
        },
      ],
      evaluationCriteria: [
        {
          criterion: 'Security & Cryptographic Rigor',
          description: 'Implementation of secure HMAC signature checks and timing-safe comparisons.',
          maxScore: 25,
          weight: 1.2,
        },
        {
          criterion: 'Concurrency & Idempotency Guarantees',
          description: 'Prevention of race conditions and duplicate processing under concurrent delivery.',
          maxScore: 25,
          weight: 1.4,
        },
        {
          criterion: 'Error Handling & Dead Letter Routing',
          description: 'Graceful degradation, structured logging, and non-blocking recovery.',
          maxScore: 25,
          weight: 1.0,
        },
        {
          criterion: 'Code Quality & Production Standards',
          description: 'Clean modular architecture, modern async patterns, and documentation.',
          maxScore: 25,
          weight: 1.0,
        },
      ],
    },

    // 3. SQL (SQL Analytics Specialist)
    {
      title: 'PulseStream: Churn Cohort Analytics & Multi-Table Attribution',
      slug: 'pulsestream-sql-analytics',
      role: 'SQL Analytics Specialist',
      simulationType: 'SQL',
      difficulty: 'Intermediate',
      estimatedTime: '75 mins',
      companyScenario: {
        companyName: 'PulseStream Media',
        industry: 'Subscription Video Streaming',
        context:
          'PulseStream noticed elevated 90-day churn in subscribers acquired through affiliate campaigns. The Growth Analytics team needs complex SQL cohort models and windowed retention tables to pinpoint customer dropoff milestones.',
        stakes:
          'Directly influences a $2.4M performance marketing budget allocation across YouTube, TikTok, and Search partners.',
        mentorPersona: {
          name: 'Darius Thorne',
          role: 'Principal Analytics Engineer',
          avatar: '📈',
          welcomeMessage:
            'Greetings! We rely heavily on window functions and CTEs to understand subscriber retention. Show us how you handle multi-touch attribution and weekly cohort decay.',
        },
      },
      description:
        'Construct production SQL models utilizing Common Table Expressions (CTEs), window functions (ROW_NUMBER, LAG, LEAD), and cohort retention matrices.',
      requiredSkills: [
        {
          skill: sqlSkill?._id,
          skillName: sqlSkill?.name || 'SQL',
          minProficiency: 65,
        },
      ],
      datasets: [
        {
          id: 'pulsestream_tables',
          name: 'pulsestream_schema.sql',
          description: 'Subscribers, SubscriptionEvents, and MarketingAttribution tables with millions of event logs.',
          format: 'sql',
          columns: [
            { name: 'user_id', type: 'UUID', description: 'Subscriber identifier' },
            { name: 'cohort_month', type: 'DATE', description: 'Month of initial signup' },
            { name: 'channel', type: 'VARCHAR', description: 'Acquisition channel (Organic, Affiliate, PaidSocial)' },
            { name: 'status', type: 'VARCHAR', description: 'Active, Cancelled, Paused' },
          ],
        },
      ],
      tasks: [
        {
          id: 'task_sql_1_cohort',
          taskNumber: 1,
          title: 'Build Monthly Subscriber Retention Matrix',
          description: 'Calculate Month 1, Month 2, Month 3 retention percentages per acquisition cohort.',
          instructions:
            'Write a SQL query using CTEs that partitions users into signup cohorts and computes retention rate at 30, 60, and 90 days.',
          deliverableType: 'sql',
          starterTemplate: `WITH user_cohorts AS (\n  SELECT user_id, DATE_TRUNC('month', signup_date) AS cohort_month, channel\n  FROM subscribers\n),\nactivity_log AS (\n  -- Calculate retention months\n)\nSELECT cohort_month, channel, count(user_id) AS cohort_size\nFROM user_cohorts\nGROUP BY 1, 2;`,
          validationRules: [
            { ruleType: 'sql_select', expected: 'SELECT', message: 'Valid SQL query required' },
            { ruleType: 'contains_keyword', expected: 'with', message: 'Must utilize Common Table Expressions (CTE)' },
          ],
          maxScore: 35,
        },
        {
          id: 'task_sql_2_attribution',
          taskNumber: 2,
          title: 'First-Touch vs Last-Touch Multi-Channel Attribution',
          description: 'Compare conversion values across acquisition channels.',
          instructions:
            'Write window function queries using FIRST_VALUE and LAST_VALUE over customer touchpoint events.',
          deliverableType: 'sql',
          starterTemplate: `-- Attribution Query\nSELECT \n  user_id,\n  FIRST_VALUE(channel) OVER (PARTITION BY user_id ORDER BY touch_timestamp) AS first_touch,\n  LAST_VALUE(channel) OVER (PARTITION BY user_id ORDER BY touch_timestamp ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_touch\nFROM customer_touchpoints;`,
          maxScore: 35,
        },
        {
          id: 'task_sql_3_recommendation',
          taskNumber: 3,
          title: 'Marketing Channel Budget Reallocation Memo',
          description: 'Translate SQL outputs into a marketing spend reallocation recommendation.',
          instructions:
            'Provide recommendations on which channels should receive increased or decreased budget based on retention economics.',
          deliverableType: 'report',
          starterTemplate: `### PulseStream Marketing Capital Reallocation Recommendation:\n\n1. Underperforming Channels (Highest 90-Day Churn):\n2. High-LTV Channels (Stickiest Cohorts):\n3. Recommended Budget Shift:`,
          maxScore: 30,
        },
      ],
      evaluationCriteria: [
        {
          criterion: 'Advanced SQL Syntactic Mastery',
          description: 'Proficiency in CTEs, Windowing, Aggregates, and Date truncations.',
          maxScore: 35,
          weight: 1.3,
        },
        {
          criterion: 'Query Efficiency & Performance',
          description: 'Optimal joins, partitioning, and avoidance of cartesian explosions.',
          maxScore: 35,
          weight: 1.1,
        },
        {
          criterion: 'Strategic Business Translation',
          description: 'Translating cohort decay figures into actionable marketing reallocation decisions.',
          maxScore: 30,
          weight: 1.0,
        },
      ],
    },

    // 4. Debugging (Site Reliability Incident Engineer)
    {
      title: 'CloudScale: Production Memory Leak & Event Loop Block Incident',
      slug: 'cloudscale-incident-debugging',
      role: 'Site Reliability Incident Engineer',
      simulationType: 'Debugging',
      difficulty: 'Advanced',
      estimatedTime: '90 mins',
      companyScenario: {
        companyName: 'CloudScale Telemetry Inc',
        industry: 'Cloud Monitoring & Observability',
        context:
          'At 14:22 UTC, worker nodes running the streaming telemetry pipeline began reporting 100% CPU utilization and out-of-memory (OOM) pod crashes. You are the on-call engineer tasked with triaging heap snapshots and patching the catastrophic event loop block.',
        stakes:
          'Critical Sev-1 outage affecting streaming metrics ingestion for 450 enterprise Kubernetes clusters.',
        mentorPersona: {
          name: 'Sarah Chen',
          role: 'VP of Site Reliability Engineering',
          avatar: '🚨',
          welcomeMessage:
            'The incident war room is live! Check the attached node heap profiles and CPU flamegraphs. Identify the memory retention root cause and ship the hotfix.',
        },
      },
      description:
        'Triage a live production Sev-1 incident: inspect memory heap dumps, locate unclosed socket listeners, fix an infinite recursion event-loop lock, and write the post-mortem RCAs.',
      requiredSkills: [
        {
          skill: nodeSkill?._id,
          skillName: nodeSkill?.name || 'Node.js',
          minProficiency: 70,
        },
        {
          skill: systemDesignSkill?._id,
          skillName: systemDesignSkill?.name || 'System Design',
          minProficiency: 65,
        },
      ],
      datasets: [
        {
          id: 'cloudscale_heap_logs',
          name: 'incident_heap_analysis.log',
          description: 'V8 heap snapshot summary showing detached DOM/Buffer instances and unresolved Promise arrays.',
          format: 'log',
          urlOrContent: `2026-09-27T14:22:01Z [CRIT] Worker-04 HeapUsed: 1980MB (Max 2048MB)
2026-09-27T14:22:04Z [WARN] Event Loop Delay: 14,890ms (Threshold: 50ms)
2026-09-27T14:22:08Z [CRIT] Retained Objects: 4,120,000 Buffer chunks in GlobalEventEmitter.listeners`,
        },
      ],
      tasks: [
        {
          id: 'task_debug_1_triage',
          taskNumber: 1,
          title: 'Analyze Heap Retainer Tree & Root Cause Identification',
          description: 'Identify the exact memory leak vector in the provided codebase snippet.',
          instructions:
            'Inspect the provided worker ingestion code. Identify why Buffer objects are never collected by the garbage collector.',
          deliverableType: 'text',
          starterTemplate: `### Triage Findings:\n1. Leaking Object Reference:\n2. Memory Retention Root Cause:\n3. Event Loop Block Mechanism:`,
          maxScore: 25,
        },
        {
          id: 'task_debug_2_patch',
          taskNumber: 2,
          title: 'Implement Production Hotfix Code',
          description: 'Rewrite the streaming pipeline with backpressure handling and listener cleanup.',
          instructions:
            'Provide the patched code utilizing stream.pipeline with proper error callbacks and bounded queue size.',
          deliverableType: 'code',
          starterTemplate: `import { pipeline } from 'stream/promises';\n\nexport async function safeIngestStream(sourceStream, destinationStorage) {\n  // Implement backpressure and ensure listeners are removed\n}`,
          validationRules: [
            { ruleType: 'contains_keyword', expected: 'pipeline', message: 'Use stream pipeline for backpressure management' },
          ],
          maxScore: 40,
        },
        {
          id: 'task_debug_3_postmortem',
          taskNumber: 3,
          title: 'Draft Sev-1 Incident Post-Mortem (RCA)',
          description: 'Author an enterprise blameless post-mortem report for executive stakeholders.',
          instructions:
            'Complete the post-mortem detailing Timeline, Impact, Root Cause, Trigger, and Preventative Action Items.',
          deliverableType: 'report',
          starterTemplate: `### Sev-1 Post-Mortem Incident Report\n- Service Impacted: Telemetry Ingestion API\n- Severity: SEV-1 (Critical)\n- Duration of Outage:\n- Root Cause (5 Whys):\n- Corrective & Preventative Action Items:`,
          maxScore: 35,
        },
      ],
      evaluationCriteria: [
        {
          criterion: 'Root Cause Diagnostic Accuracy',
          description: 'Precision in pinpointing the uncollected event listeners and event loop delays.',
          maxScore: 30,
          weight: 1.2,
        },
        {
          criterion: 'Hotfix Engineering & Backpressure Handling',
          description: 'Production safety of the patch, memory bounding, and cleanup routines.',
          maxScore: 40,
          weight: 1.3,
        },
        {
          criterion: 'Post-Mortem & Preventative Rigor',
          description: 'Industry-standard blameless post-mortem documentation with measurable action items.',
          maxScore: 30,
          weight: 1.0,
        },
      ],
    },

    // 5. API Development (Platform API Engineer)
    {
      title: 'FleetLogix: High-Throughput Vehicle Telemetry Ingestion API',
      slug: 'fleetlogix-telemetry-api',
      role: 'Platform API Engineer',
      simulationType: 'API Development',
      difficulty: 'Intermediate',
      estimatedTime: '90 mins',
      companyScenario: {
        companyName: 'FleetLogix Connected Mobility',
        industry: 'IoT & Autonomous Fleet Operations',
        context:
          '15,000 commercial delivery vans transmit GPS coordinates, battery temperature, and speed telematics every 5 seconds. Design and implement a secure, rate-limited, high-throughput REST/JSON ingestion API.',
        stakes:
          'Ensures real-time dispatch routing and predictive maintenance alerting without dropped packets.',
        mentorPersona: {
          name: 'Kenji Sato',
          role: 'Principal IoT Solutions Architect',
          avatar: '🚚',
          welcomeMessage:
            'Welcome to FleetLogix! Telemetry ingestion requires strict input schema validation, fast responses (<20ms), and intelligent rate limiting. Let us see your API specification and handler.',
        },
      },
      description:
        'Build a production-grade IoT telemetry ingestion endpoint with Joi/Zod schema validation, sliding-window rate limiting, and batch ingestion support.',
      requiredSkills: [
        {
          skill: nodeSkill?._id,
          skillName: nodeSkill?.name || 'Node.js',
          minProficiency: 60,
        },
        {
          skill: systemDesignSkill?._id,
          skillName: systemDesignSkill?.name || 'System Design',
          minProficiency: 55,
        },
      ],
      tasks: [
        {
          id: 'task_api_1_schema',
          taskNumber: 1,
          title: 'Define Telemetry Validation Schema',
          description: 'Create validation schema for lat/long coordinates, vehicle UUID, velocity, and battery stats.',
          instructions:
            'Use standard validation patterns to reject spoofed coordinates (lat -90 to +90, lon -180 to +180) and negative velocity.',
          deliverableType: 'code',
          starterTemplate: `// Telemetry Schema Validator\nexport function validateTelemetryPayload(payload) {\n  // Return { isValid: boolean, errors: [] }\n}`,
          maxScore: 30,
        },
        {
          id: 'task_api_2_handler',
          taskNumber: 2,
          title: 'Implement High-Throughput Batch Ingestion Route',
          description: 'Implement Express handler supporting single or batch vehicle updates with 202 Accepted status.',
          instructions:
            'Write the Express route handler with asynchronous persistence and proper HTTP status codes.',
          deliverableType: 'code',
          starterTemplate: `export async function postTelemetryBatchHandler(req, res) {\n  // 1. Validate payload\n  // 2. Queue for asynchronous disk write\n  // 3. Return 202 Accepted with batch acknowledgment ID\n}`,
          maxScore: 40,
        },
        {
          id: 'task_api_3_openapi',
          taskNumber: 3,
          title: 'Author OpenAPI 3.0 Contract Specification',
          description: 'Document the ingestion API endpoints, request bodies, and error responses in YAML/JSON.',
          instructions:
            'Draft the OpenAPI specification describing the endpoint, authentication header, and 400/429/500 schemas.',
          deliverableType: 'report',
          starterTemplate: `openapi: 3.0.0\ninfo:\n  title: FleetLogix Telemetry Ingestion API\n  version: 1.0.0\npaths:\n  /api/v1/telemetry/batch:\n    post:\n      summary: Ingest vehicle sensor batch`,
          maxScore: 30,
        },
      ],
      evaluationCriteria: [
        {
          criterion: 'Input Validation & Edge Cases',
          description: 'Strict boundary validation on coordinates, velocities, and timestamps.',
          maxScore: 35,
          weight: 1.2,
        },
        {
          criterion: 'REST Architectural Conformance & Async Flow',
          description: 'Appropriate HTTP status codes (202 Accepted), headers, and non-blocking I/O.',
          maxScore: 35,
          weight: 1.2,
        },
        {
          criterion: 'OpenAPI Documentation Completeness',
          description: 'Precision of the API contract, request/response examples, and error definitions.',
          maxScore: 30,
          weight: 1.0,
        },
      ],
    },

    // 6. Business Case (Technical Solutions Architect)
    {
      title: 'Enterprise Legacy to Microservices Cloud Migration Strategy',
      slug: 'enterprise-cloud-migration-case',
      role: 'Technical Solutions Architect',
      simulationType: 'Business Case',
      difficulty: 'Advanced',
      estimatedTime: '120 mins',
      companyScenario: {
        companyName: 'Global Logistics Corp (GLC)',
        industry: 'Supply Chain & Freight Logistics',
        context:
          'GLC operates a 15-year-old monolithic Java/Oracle ERP that suffers 6 hours of scheduled downtime every release and cannot scale during Cyber Monday. The Board has allocated $8M to migrate core capabilities to AWS/Kubernetes using event-driven architecture.',
        stakes:
          'Determines company competitive positioning, operational cost reductions, and zero-downtime reliability over the next decade.',
        mentorPersona: {
          name: 'Victoria Sterling',
          role: 'Chief Technology Officer',
          avatar: '🏛️',
          welcomeMessage:
            'Hello! Monolithic migrations are fraught with risk. You need to demonstrate the Strangler Fig pattern, database decomposition, and organizational change management.',
        },
      },
      description:
        'Act as the Technical Solutions Architect evaluating legacy monolithic systems: design bounded contexts, formulate the Strangler Fig migration roadmap, and calculate TCO.',
      requiredSkills: [
        {
          skill: systemDesignSkill?._id,
          skillName: systemDesignSkill?.name || 'System Design',
          minProficiency: 75,
        },
      ],
      tasks: [
        {
          id: 'task_biz_1_strangler',
          taskNumber: 1,
          title: 'Design Strangler Fig Migration Phases',
          description: 'Map out the step-by-step phased extraction of Billing, Inventory, and Order Management.',
          instructions:
            'Define how an API gateway routes traffic between legacy monolith and new microservices during the 18-month transition.',
          deliverableType: 'report',
          starterTemplate: `### Strangler Fig Architecture Strategy\n\n1. Ingress Routing & Facade Pattern:\n2. Phase 1 Extraction Target (Low-risk, high-value domain):\n3. Phase 2 Extraction Target:\n4. Final Monolith Decommissioning Criteria:`,
          maxScore: 35,
        },
        {
          id: 'task_biz_2_data_sync',
          taskNumber: 2,
          title: 'Database Decomposition & Dual-Write Synchronization',
          description: 'Design Change Data Capture (CDC) pipeline using Debezium/Kafka to keep data consistent.',
          instructions:
            'Address dual-write consistency and eventual consistency trade-offs between Oracle and new microservice databases.',
          deliverableType: 'report',
          starterTemplate: `### Data Migration & CDC Architecture\n\n1. Change Data Capture Mechanism (Debezium + Kafka):\n2. Handling Distributed Transactions (Saga Pattern vs 2PC):\n3. Conflict Resolution Strategy:`,
          maxScore: 35,
        },
        {
          id: 'task_biz_3_csuite_summary',
          taskNumber: 3,
          title: 'Total Cost of Ownership (TCO) & Board Presentation',
          description: 'Synthesize infrastructure cost projections, risk matrices, and ROI for executive leadership.',
          instructions:
            'Write the executive summary outlining the cost-benefit analysis, staffing changes, and risk mitigations.',
          deliverableType: 'report',
          starterTemplate: `### Executive Board Proposal: GLC Cloud Transformation\n\n1. Strategic Imperative:\n2. Financial Modeling (Projected 3-Year TCO Savings):\n3. Key Risk Matrix & Mitigations:\n4. Governance & Milestone Roadmap:`,
          maxScore: 30,
        },
      ],
      evaluationCriteria: [
        {
          criterion: 'Architectural Soundness & Pattern Application',
          description: 'Proper application of Strangler Fig, CDC, Event Sourcing, and Bounded Contexts.',
          maxScore: 35,
          weight: 1.3,
        },
        {
          criterion: 'Risk Assessment & Mitigation Depth',
          description: 'Realism in addressing data drift, network failure, and organizational pushback.',
          maxScore: 35,
          weight: 1.2,
        },
        {
          criterion: 'C-Suite Communication & Financial Justification',
          description: 'Clarity, persuasion, and financial acumen in presenting to executive leadership.',
          maxScore: 30,
          weight: 1.0,
        },
      ],
    },
  ];

  let seededCount = 0;
  for (const simData of simulationsData) {
    const existing = await JobSimulation.findOne({ slug: simData.slug });
    if (!existing) {
      if (adminUserId) simData.createdBy = adminUserId;
      await JobSimulation.create(simData);
      seededCount++;
    } else {
      // Update with rich fields
      await JobSimulation.findByIdAndUpdate(existing._id, {
        $set: {
          tasks: simData.tasks,
          datasets: simData.datasets,
          evaluationCriteria: simData.evaluationCriteria,
          companyScenario: simData.companyScenario,
          requiredSkills: simData.requiredSkills,
        },
      });
    }
  }

  return { seededCount, totalSimulations: simulationsData.length };
};
