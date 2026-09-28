import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import Project from './models/Project.js';
import Course from './models/Course.js';
import Skill from './models/Skill.js';
import User from './models/User.js';

dotenv.config();

export const REAL_WORLD_PROJECTS = [
  {
    title: 'Enterprise Zero-Downtime Microservice Platform',
    slug: 'enterprise-zero-downtime-microservice-platform',
    description:
      'Architect, develop, and deploy an enterprise-grade microservice platform featuring authenticated API gateway routing, distributed database transactions, automated test pipelines, and zero-downtime containerized deployments.',
    objectives: [
      'Architect modular backend microservices adhering to Domain-Driven Design principles.',
      'Implement JWT token authentication with role-based access control and token revocation.',
      'Build normalized database schemas with migration runbooks, ACID guarantees, and indexes.',
      'Achieve >85% automated test coverage across unit and integration test suites.',
      'Deploy containerized services to a production cloud environment with health check probes.',
    ],
    difficulty: 'Advanced',
    estimatedDuration: '2 weeks',
    skillSlugs: ['nodejs', 'javascript', 'sql', 'kubernetes-mesh'],
    requirements: [
      'Modular architecture with distinct service, repository, and controller layers.',
      'Database migration scripts with rollback capability and seed fixtures.',
      'Strict input validation using Joi, Zod, or JSON Schema on all endpoints.',
      'Centralized RFC-7807 problem details error handling with correlation IDs.',
      'Docker Compose setup for local development and production Dockerfile.',
      'OpenAPI 3.0 (Swagger) specification document and Postman test collection.',
    ],
    milestones: [
      {
        title: 'Domain Architecture & Schema Modeling',
        description: 'Design the domain boundaries, relational/document database schemas, and migration scripts.',
        deliverables: [
          'ER diagram and architecture overview document',
          'Database migration scripts and seed dataset',
        ],
        order: 1,
      },
      {
        title: 'API Gateway & Core Business Logic',
        description: 'Implement core CRUD endpoints, JWT authentication middleware, and input validation schemas.',
        deliverables: [
          'Authenticated REST API routes with pagination and filtering',
          'JWT verification and RBAC middleware integration',
        ],
        order: 2,
      },
      {
        title: 'Automated Test Suite & Mock Fixtures',
        description: 'Develop comprehensive integration and unit tests covering positive flows and edge cases.',
        deliverables: [
          'Supertest/Jest test suite with >80% code coverage report',
          'Database mock fixtures and test container setup',
        ],
        order: 3,
      },
      {
        title: 'Containerization & Live Production Deployment',
        description: 'Package the application into lightweight multi-stage Docker containers and deploy to cloud staging.',
        deliverables: [
          'Production-ready Dockerfile and docker-compose.yml',
          'Publicly accessible live deployment URL with SSL',
          'Comprehensive README and API documentation runbook',
        ],
        order: 4,
      },
    ],
    evaluationCriteria: [
      {
        name: 'Functionality',
        description: 'Core microservice capabilities, business logic correctness, and resilience',
        maxPoints: 30,
        weight: 1.0,
      },
      {
        name: 'API Design',
        description: 'RESTful semantics, status code consistency, validation, and error structures',
        maxPoints: 20,
        weight: 1.0,
      },
      {
        name: 'Database',
        description: 'Schema normalization, indexing strategy, transaction safety, and migrations',
        maxPoints: 15,
        weight: 1.0,
      },
      {
        name: 'Code Quality',
        description: 'Modular clean architecture, separation of concerns, and clean coding standards',
        maxPoints: 15,
        weight: 1.0,
      },
      {
        name: 'Testing',
        description: 'Automated unit and integration test coverage with edge case validation',
        maxPoints: 10,
        weight: 1.0,
      },
      {
        name: 'Documentation',
        description: 'Architecture diagrams, OpenAPI specifications, and deployment runbook',
        maxPoints: 10,
        weight: 1.0,
      },
    ],
  },
  {
    title: 'Real-Time Cyber Threat Intelligence & Telemetry Platform',
    slug: 'real-time-cyber-threat-intelligence-platform',
    description:
      'Engineer a real-time event streaming and security anomaly detection system capable of processing high-frequency audit logs, evaluating heuristic threat rules, and rendering a sub-second reactive frontend operations console.',
    objectives: [
      'Build a high-throughput event ingestion pipeline over WebSockets with exponential backoff.',
      'Implement dynamic rule-matching algorithms to detect brute-force attacks and rate anomalies.',
      'Design a 60fps responsive cybersecurity console with windowed virtualization and dark telemetry visuals.',
      'Produce comprehensive audit logs, threat incident exports, and security hardening measures.',
    ],
    difficulty: 'Expert',
    estimatedDuration: '3 weeks',
    skillSlugs: ['nodejs', 'react', 'javascript'],
    requirements: [
      'WebSocket event stream server handling >100 security events per second without memory leaks.',
      'Heuristic rule engine detecting credential stuffing, distributed brute-force, and token anomalies.',
      'Virtual list rendering on frontend to handle thousands of incoming telemetry events seamlessly.',
      'OWASP Top 10 security verification including CSP headers and strict CORS origin verification.',
    ],
    milestones: [
      {
        title: 'Event Streaming Engine & WebSocket Protocol',
        description: 'Set up resilient WebSocket server with heartbeats, protocol negotiation, and reconnection.',
        deliverables: ['WebSocket server service', 'Mock telemetry event generator script'],
        order: 1,
      },
      {
        title: 'Anomaly Detection & Heuristic Rules Engine',
        description: 'Build algorithmic rule matching to flag anomalies and generate security incident tickets.',
        deliverables: ['Rule evaluation pipeline with unit tests', 'Incident alert dispatcher'],
        order: 2,
      },
      {
        title: 'Reactive Cyber Telemetry Console in React',
        description: 'Build the operations dashboard with virtualized scrolling, audio-visual alert indicators, and charts.',
        deliverables: ['React frontend console with live state updates', 'Component unit tests'],
        order: 3,
      },
      {
        title: 'Hardening, Threat Modeling & Production Deployment',
        description: 'Perform security threat modeling, optimize bundle size, and deploy with HTTPS.',
        deliverables: ['Live deployment link', 'Threat model document and architecture specification'],
        order: 4,
      },
    ],
    evaluationCriteria: [
      {
        name: 'Functionality',
        description: 'High-throughput stream processing, accurate anomaly detection, and real-time alerts',
        maxPoints: 30,
        weight: 1.0,
      },
      {
        name: 'API Design',
        description: 'WebSocket packet protocol, bidirectional RPC messaging, and REST fallbacks',
        maxPoints: 20,
        weight: 1.0,
      },
      {
        name: 'Database',
        description: 'Time-series or document schema optimization for high write throughput',
        maxPoints: 15,
        weight: 1.0,
      },
      {
        name: 'Code Quality',
        description: 'Memory efficiency, async pipeline decoupling, and clean design patterns',
        maxPoints: 15,
        weight: 1.0,
      },
      {
        name: 'Testing',
        description: 'Load stress tests, network simulation benchmarks, and automated coverage',
        maxPoints: 10,
        weight: 1.0,
      },
      {
        name: 'Documentation',
        description: 'System telemetry architecture, performance benchmarks, and threat model',
        maxPoints: 10,
        weight: 1.0,
      },
    ],
  },
  {
    title: 'Fullstack Autonomous AI Agent Orchestration Hub',
    slug: 'fullstack-autonomous-ai-agent-orchestration-hub',
    description:
      'Construct a fullstack multi-agent orchestration hub where users can trigger autonomous workflows, monitor thought-reasoning traces via Server-Sent Events, and manage external tool executions with safety sandboxes.',
    objectives: [
      'Design deterministic agent planning and tool execution pipelines with guardrails.',
      'Implement real-time token and step streaming over SSE / WebSockets to the web interface.',
      'Store complete agent execution graphs, intermediate steps, and latency metrics in the database.',
      'Deliver an interactive web console allowing users to inspect reasoning graphs and rerun failures.',
    ],
    difficulty: 'Intermediate',
    estimatedDuration: '1.5 weeks',
    skillSlugs: ['react', 'nodejs', 'javascript'],
    requirements: [
      'Agent state-machine engine supporting tool execution, reflection, and retry budgets.',
      'Streaming backend endpoint yielding incremental JSON progress tokens.',
      'Frontend timeline graph rendering agent tool invocations and intermediate thought traces.',
      'Secure sandbox isolation preventing arbitrary shell command execution from agent steps.',
    ],
    milestones: [
      {
        title: 'Agent State Machine & Tool Execution Engine',
        description: 'Implement the core agent loop with tool registry and step evaluation.',
        deliverables: ['Agent orchestration loop and tool executor', 'Unit test harness'],
        order: 1,
      },
      {
        title: 'Streaming API & Execution Telemetry Storage',
        description: 'Build Server-Sent Events (SSE) streaming routes and store execution traces.',
        deliverables: ['Streaming SSE router', 'Execution trace database schemas'],
        order: 2,
      },
      {
        title: 'Interactive Visual Workflow Console in React',
        description: 'Build the React UI with workflow creation, live step visualization, and log replay.',
        deliverables: ['React orchestration dashboard', 'Live step timeline component'],
        order: 3,
      },
      {
        title: 'E2E Validation & Production Runbook',
        description: 'Run integration test scenarios, verify safety boundaries, and deploy to cloud.',
        deliverables: ['Live deployment link', 'Architecture guide and sample workflow recipes'],
        order: 4,
      },
    ],
    evaluationCriteria: [
      {
        name: 'Functionality',
        description: 'Agent planning reliability, streaming delivery, and tool execution correctness',
        maxPoints: 30,
        weight: 1.0,
      },
      {
        name: 'API Design',
        description: 'Streaming SSE protocol design, RESTful trace retrieval, and input validation',
        maxPoints: 20,
        weight: 1.0,
      },
      {
        name: 'Database',
        description: 'Execution trace and step history schema design with fast querying',
        maxPoints: 15,
        weight: 1.0,
      },
      {
        name: 'Code Quality',
        description: 'Extensible tool plugin architecture and clean async orchestration',
        maxPoints: 15,
        weight: 1.0,
      },
      {
        name: 'Testing',
        description: 'Automated test suite simulating agent multi-step loops and failure recovery',
        maxPoints: 10,
        weight: 1.0,
      },
      {
        name: 'Documentation',
        description: 'Setup guide, agent prompt templates, and architecture diagram',
        maxPoints: 10,
        weight: 1.0,
      },
    ],
  },
];

export const seedProjects = async () => {
  console.log('[Seed Projects] Starting real-world projects seeding...');

  let instructor = await User.findOne({ role: { $in: ['instructor', 'admin'] } });
  if (!instructor) {
    instructor = await User.findOne({});
  }
  if (!instructor) {
    try {
      instructor = await User.create({
        name: 'Prof. Alex Rivera',
        email: 'instructor@lms.com',
        password: 'Password123!',
        role: 'instructor',
        headline: 'Principal Full-Stack Architect',
      });
    } catch (_) {
      instructor = await User.findOne({});
    }
  }
  if (!instructor) {
    console.warn('[Seed Projects] No user available for instructor assignment. Skipping project seed.');
    return;
  }

  const courses = await Course.find();
  const allSkills = await Skill.find();
  const skillMap = new Map();
  allSkills.forEach((s) => skillMap.set(s.slug, s._id));

  let createdCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < REAL_WORLD_PROJECTS.length; i++) {
    const item = REAL_WORLD_PROJECTS[i];
    const course = courses.length > 0 ? courses[i % courses.length] : null;

    const skillIds = (item.skillSlugs || [])
      .map((slug) => skillMap.get(slug))
      .filter(Boolean);

    const existing = await Project.findOne({
      $or: [{ slug: item.slug }, { title: item.title }],
    });

    if (existing) {
      existing.title = item.title;
      existing.description = item.description;
      existing.objectives = item.objectives;
      existing.difficulty = item.difficulty;
      existing.estimatedDuration = item.estimatedDuration;
      existing.requiredSkills = skillIds;
      existing.requirements = item.requirements;
      existing.milestones = item.milestones;
      existing.evaluationCriteria = item.evaluationCriteria;
      if (course) existing.course = course._id;
      existing.instructor = instructor._id;
      existing.isPublished = true;
      await existing.save();
      updatedCount++;
    } else {
      const project = new Project({
        title: item.title,
        slug: item.slug,
        description: item.description,
        objectives: item.objectives,
        difficulty: item.difficulty,
        estimatedDuration: item.estimatedDuration,
        requiredSkills: skillIds,
        requirements: item.requirements,
        milestones: item.milestones,
        evaluationCriteria: item.evaluationCriteria,
        course: course?._id,
        instructor: instructor._id,
        isPublished: true,
      });
      await project.save();
      createdCount++;
    }
  }

  console.log(
    `[Seed Projects] Completed. Created: ${createdCount}, Updated: ${updatedCount} real-world practical projects.`
  );
};

// Direct script execution
if (process.argv[1]?.endsWith('seed-projects.js')) {
  (async () => {
    try {
      await connectDB();
      await seedProjects();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Projects Error]:', err);
      process.exit(1);
    }
  })();
}
