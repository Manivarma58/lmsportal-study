import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import Assignment from './models/Assignment.js';
import Course from './models/Course.js';
import Skill from './models/Skill.js';
import User from './models/User.js';

dotenv.config();

export const PRACTICAL_ASSIGNMENTS = [
  {
    title: 'Fullstack Microservices & REST API Pipeline',
    slug: 'fullstack-microservices-rest-api-pipeline',
    description:
      'Architect, develop, and deploy an enterprise-grade RESTful microservice adhering to clean architecture, JWT authentication, and automated integration tests.',
    instructions: `### Objective
Build a robust REST API service for an enterprise resource management module.

### Core Requirements:
1. **API Endpoints**:
   - \`POST /api/v1/auth/login\` - Issue cryptographically signed JWT with 1-hour expiration.
   - \`GET /api/v1/resources\` - Paginated query with sorting (\`?page=1&limit=10&sort=-createdAt\`).
   - \`POST /api/v1/resources\` - Create resource with strict JSON schema validation.
   - \`PUT /api/v1/resources/:id\` - Update existing resource with idempotency guarantee.
   - \`DELETE /api/v1/resources/:id\` - Soft-delete with audit logging.
2. **Database Schema**:
   - Normalized relational or document schema with unique indices on tenant keys.
3. **Resilience & Security**:
   - Rate limiting, CORS origin restrictions, security headers (Helmet).
   - Global asynchronous error handling returning standard RFC-7807 problem details.
4. **Test Suite**:
   - Provide automated integration tests (Supertest / Jest) covering happy paths and 4xx/5xx edge cases.

### Deliverables:
- GitHub repository URL containing source code and automated test suite.
- Live deployment URL (e.g. Render, Railway, AWS ECS).
- Architecture notes and OpenAPI/Swagger specification in the submission notes.`,
    difficulty: 'Medium',
    estimatedTime: '4 hours',
    skillSlugs: ['nodejs', 'javascript', 'sql'],
    evaluationCriteria: [
      {
        name: 'Functionality',
        description: 'Core CRUD routes, token auth, pagination, and edge case error handling',
        maxPoints: 30,
        weight: 1.0,
      },
      {
        name: 'Code Quality',
        description: 'Clean architecture, modular service layer, and naming conventions',
        maxPoints: 20,
        weight: 1.0,
      },
      {
        name: 'API Design',
        description: 'RESTful verbs, consistent status codes, and input validation schemas',
        maxPoints: 20,
        weight: 1.0,
      },
      {
        name: 'Database',
        description: 'Schema indexing, relations/references, and query efficiency',
        maxPoints: 15,
        weight: 1.0,
      },
      {
        name: 'Testing',
        description: 'Automated test suite coverage (>80%) and realistic mock fixtures',
        maxPoints: 15,
        weight: 1.0,
      },
    ],
  },
  {
    title: 'Zero-Trust Istio Service Mesh & Envoy Proxy Configuration',
    slug: 'zero-trust-istio-service-mesh-envoy-proxy',
    description:
      'Configure mutual TLS (mTLS), strict PeerAuthentication, and dynamic EnvoyFilter header attestation across a multi-tenant Kubernetes cluster.',
    instructions: `### Objective
Implement defense-in-depth zero-trust network boundaries across microservice communications.

### Core Requirements:
1. **Mutual TLS Enforcement**:
   - Deploy \`PeerAuthentication\` in \`STRICT\` mode across the target namespace.
   - Verify non-mTLS plaintext requests are rejected with code 503 / connection reset.
2. **Authorization Policies**:
   - Define least-privilege \`AuthorizationPolicy\` resources enforcing method-level RBAC.
3. **Envoy Filter Header Attestation**:
   - Configure dynamic Lua filter or EnvoyFilter to attest cryptographically signed header claims.
4. **Resilience & Chaos Testing**:
   - Execute rolling restarts with zero dropped packets using proper readiness probes and pre-stop lifecycle hooks.

### Deliverables:
- Git repository link with Kubernetes manifests / Kustomize overlays.
- Execution logs demonstrating successful mTLS handshake verification.`,
    difficulty: 'Hard',
    estimatedTime: '6 hours',
    skillSlugs: ['kubernetes-mesh', 'cybersecurity', 'nodejs'],
    evaluationCriteria: [
      {
        name: 'Functionality',
        description: 'mTLS PeerAuthentication strict mode and least-privilege authorization rules',
        maxPoints: 35,
        weight: 1.0,
      },
      {
        name: 'Code Quality',
        description: 'Declarative K8s YAML structure, Helm values separation, and linting',
        maxPoints: 20,
        weight: 1.0,
      },
      {
        name: 'Testing',
        description: 'Chaos simulation, failure injection, and zero-downtime rolling restart proof',
        maxPoints: 25,
        weight: 1.0,
      },
      {
        name: 'Documentation',
        description: 'Architectural threat model and verification runbook',
        maxPoints: 20,
        weight: 1.0,
      },
    ],
  },
  {
    title: 'React High-Performance Dashboard & Real-Time Telemetry',
    slug: 'react-high-performance-dashboard-telemetry',
    description:
      'Construct a 60fps responsive analytics dashboard rendering high-frequency WebSocket data streams with virtualized lists and custom hooks.',
    instructions: `### Objective
Engineer a responsive real-time operations dashboard capable of ingesting 100+ events/sec without UI frame drops.

### Core Requirements:
1. **Real-time Streaming**:
   - Connect to a streaming WebSocket provider with exponential backoff reconnection.
2. **Performance Optimization**:
   - Utilize windowing/virtualization (\`react-window\` or \`tanstack-virtual\`) for event log rendering.
   - Decouple state updates to prevent unnecessary re-renders of heavy chart components.
3. **Responsive Cyber-Aesthetic Design**:
   - Polished dark UI with accessible contrast, accessible keyboard navigation, and loading skeletons.

### Deliverables:
- GitHub repository with modern React 18 / Vite setup.
- Deployed web application URL with simulated live telemetry feed.`,
    difficulty: 'Medium',
    estimatedTime: '3.5 hours',
    skillSlugs: ['react', 'javascript'],
    evaluationCriteria: [
      {
        name: 'Functionality',
        description: 'Live WebSocket ingest, windowed rendering, and responsive charting',
        maxPoints: 30,
        weight: 1.0,
      },
      {
        name: 'Code Quality',
        description: 'Custom hook architecture, strict typing or prop-types, and memoization',
        maxPoints: 25,
        weight: 1.0,
      },
      {
        name: 'API Design',
        description: 'Resilient WebSocket event handling and reconnection state machine',
        maxPoints: 20,
        weight: 1.0,
      },
      {
        name: 'Testing',
        description: 'Unit and component tests using React Testing Library',
        maxPoints: 15,
        weight: 1.0,
      },
      {
        name: 'Documentation',
        description: 'Readme with architecture diagram and performance profiling benchmarks',
        maxPoints: 10,
        weight: 1.0,
      },
    ],
  },
  {
    title: 'Distributed Byzantine Fault Tolerant Consensus Engine',
    slug: 'distributed-byzantine-fault-tolerant-consensus',
    description:
      'Implement an asynchronous state-machine replication protocol supporting quorum certificate validation, view change timeout safety, and block commit guarantees.',
    instructions: `### Objective
Implement a fault-tolerant consensus state machine demonstrating safety and liveness under adversarial network conditions.

### Core Requirements:
1. **Protocol Phases**:
   - Prepare, Pre-commit, Commit, and Finalize rounds with 2f + 1 quorum signatures.
2. **View Change Protocol**:
   - Safe view transitions when leader node halts or behaves arbitrarily.
3. **Partition Simulation**:
   - Automated test suite validating that no split-brain conflicting state can be finalized during network partition.

### Deliverables:
- GitHub repository with full source code and unit test coverage.
- Telemetry trace output showing successful consensus under simulated 33% Byzantine node failure.`,
    difficulty: 'Expert',
    estimatedTime: '8 hours',
    skillSlugs: ['nodejs', 'javascript', 'distributed-systems'],
    evaluationCriteria: [
      {
        name: 'Functionality',
        description: 'Quorum certificate assembly, leader election, and state commit finality',
        maxPoints: 40,
        weight: 1.0,
      },
      {
        name: 'Code Quality',
        description: 'Deterministic state machine design and concurrency safety',
        maxPoints: 20,
        weight: 1.0,
      },
      {
        name: 'Testing',
        description: 'Simulated network partition and Byzantine node adversarial test suite',
        maxPoints: 25,
        weight: 1.0,
      },
      {
        name: 'Documentation',
        description: 'Safety proof and mathematical invariant specification',
        maxPoints: 15,
        weight: 1.0,
      },
    ],
  },
];

export const seedAssignments = async () => {
  console.log('[Seed Assignments] Starting practical assignments seeding...');

  // Find instructor or admin user
  const instructor = await User.findOne({ role: { $in: ['instructor', 'admin'] } });
  if (!instructor) {
    console.warn('[Seed Assignments] No instructor found. Skipping assignments seed.');
    return;
  }

  // Find existing courses
  const courses = await Course.find();
  if (courses.length === 0) {
    console.warn('[Seed Assignments] No courses found. Skipping assignments seed.');
    return;
  }

  const allSkills = await Skill.find();
  const skillMap = new Map();
  allSkills.forEach((s) => skillMap.set(s.slug, s._id));

  let createdCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < PRACTICAL_ASSIGNMENTS.length; i++) {
    const item = PRACTICAL_ASSIGNMENTS[i];
    const course = courses[i % courses.length];

    // Map skill slugs to ObjectIds
    const skillIds = (item.skillSlugs || [])
      .map((slug) => skillMap.get(slug))
      .filter(Boolean);

    const deadline = new Date(Date.now() + (14 + i * 5) * 24 * 60 * 60 * 1000);

    const existing = await Assignment.findOne({
      $or: [{ slug: item.slug }, { title: item.title }],
    });

    if (existing) {
      existing.title = item.title;
      existing.description = item.description;
      existing.instructions = item.instructions;
      existing.difficulty = item.difficulty;
      existing.estimatedTime = item.estimatedTime;
      existing.skills = skillIds;
      existing.evaluationCriteria = item.evaluationCriteria;
      existing.course = course._id;
      existing.instructor = instructor._id;
      existing.deadline = deadline;
      existing.isPublished = true;
      await existing.save();
      updatedCount++;
    } else {
      const assignment = new Assignment({
        title: item.title,
        slug: item.slug,
        description: item.description,
        instructions: item.instructions,
        difficulty: item.difficulty,
        estimatedTime: item.estimatedTime,
        skills: skillIds,
        course: course._id,
        instructor: instructor._id,
        deadline,
        evaluationCriteria: item.evaluationCriteria,
        maxScore: 100,
        isPublished: true,
      });
      await assignment.save();
      createdCount++;
    }
  }

  console.log(
    `[Seed Assignments] Completed. Created: ${createdCount}, Updated: ${updatedCount} practical assignments.`
  );
};

// Direct script execution
if (process.argv[1]?.endsWith('seed-assignments.js')) {
  (async () => {
    try {
      await connectDB();
      await seedAssignments();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Assignments Error]:', err);
      process.exit(1);
    }
  })();
}
