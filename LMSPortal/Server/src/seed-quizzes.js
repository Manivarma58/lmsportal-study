import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Course from './models/Course.js';
import Quiz from './models/Quiz.js';

const SEED_QUIZZES_DATA = [
  {
    domainKeyword: 'Agentic',
    title: 'Agentic AI & Autonomous Systems: Real-Time Assessment',
    description: 'Verify your mastery over LLM agents, ReAct frameworks, memory structures, and tool calling pipelines.',
    timeLimitMinutes: 15,
    passingScore: 70,
    questions: [
      {
        questionText: 'Which framework pattern combines reasoning traces and task-specific actions for autonomous agents?',
        options: [
          'ReAct (Reasoning and Acting)',
          'Static Regex Pattern Matching',
          'Single-layer Feedforward Perceptrons',
          'Monolithic Linear Regression',
        ],
        correctAnswer: 0,
        marks: 10,
        explanation: 'ReAct interleaves reasoning ("thought") and action ("tool use") traces to guide complex autonomous problem solving.',
      },
      {
        questionText: 'What is the primary role of Vector Embeddings in RAG (Retrieval-Augmented Generation)?',
        options: [
          'Compress audio waveforms into lossy MP3 files',
          'Represent semantic proximity of text chunks in high-dimensional vector space',
          'Compile Python code into C++ machine instructions',
          'Generate asymmetric RSA public/private key pairs',
        ],
        correctAnswer: 1,
        marks: 10,
        explanation: 'Vector embeddings map text into mathematical vector spaces where cosine similarity measures conceptual relevance.',
      },
      {
        questionText: 'When designing multi-agent communication protocols, which coordination topology prevents circular deadlocks?',
        options: [
          'Unbounded unauthenticated flooding',
          'Directed Acyclic Graph (DAG) orchestrator topology',
          'Infinite while-true polling loops without timeouts',
          'Random shuffle dispatch',
        ],
        correctAnswer: 1,
        marks: 10,
        explanation: 'DAG-based hierarchical orchestrators enforce clear execution precedence, preventing infinite circular handoffs.',
      },
      {
        questionText: 'How do production agentic systems prevent prompt injection and unauthorized tool execution?',
        options: [
          'By executing all external strings directly in root bash terminals',
          'Through input sandboxing, schema-strict JSON function validation, and human-in-the-loop guardrails',
          'By disabling token logging completely',
          'By assuming all third-party API inputs are benevolent',
        ],
        correctAnswer: 1,
        marks: 10,
        explanation: 'Multi-layer defense: typed Pydantic/Zod schemas, isolated Docker sandboxes, and policy guardrails protect tool invocations.',
      },
      {
        questionText: 'What parameter in Transformer autoregressive generation controls the randomness and creativity of next-token sampling?',
        options: [
          'Baud Rate',
          'Temperature',
          'Clock Jitter',
          'Page Size',
        ],
        correctAnswer: 1,
        marks: 10,
        explanation: 'Temperature scales the logit probability distribution; lower values yield deterministic outputs, higher values increase divergence.',
      },
    ],
  },
  {
    domainKeyword: 'Cyber',
    title: 'Cyber Defense & Cryptographic Security: Certification Exam',
    description: 'Assess threat hunting, zero-trust network architectures, TLS 1.3 handshakes, and offensive/defensive tradecraft.',
    timeLimitMinutes: 12,
    passingScore: 75,
    questions: [
      {
        questionText: 'Which cryptographic principle ensures that compromise of long-term server private keys does not decrypt past recorded sessions?',
        options: [
          'Forward Secrecy (PFS) via Ephemeral Diffie-Hellman',
          'MD5 Checksum Inversion',
          'Base64 Symmetric Transposition',
          'Static RSA Key Exchange',
        ],
        correctAnswer: 0,
        marks: 10,
        explanation: 'Perfect Forward Secrecy generates unique ephemeral session keys per handshake so past traffic remains unbreakable.',
      },
      {
        questionText: 'In a Zero Trust Architecture (ZTA), what is the foundational operational axiom?',
        options: [
          'Implicitly trust all internal corporate subnet traffic',
          'Never trust, always verify every request regardless of origin',
          'Store all passwords in plaintext for faster auditing',
          'Disable multi-factor authentication inside VPN perimeter',
        ],
        correctAnswer: 1,
        marks: 10,
        explanation: 'Zero Trust eliminates perimeter-based trust, requiring continuous authentication, authorization, and telemetry validation.',
      },
      {
        questionText: 'What HTTP security header enforces browser connections exclusively over HTTPS and specifies preloading?',
        options: [
          'Strict-Transport-Security (HSTS)',
          'Access-Control-Allow-Origin: *',
          'X-Powered-By: Express',
          'Cache-Control: public',
        ],
        correctAnswer: 0,
        marks: 10,
        explanation: 'HSTS instructs browsers that a site must only be accessed using HTTPS, eliminating SSL stripping attacks.',
      },
      {
        questionText: 'Which attack vector exploits asynchronous state discrepancy between front-end reverse proxies and back-end HTTP servers?',
        options: [
          'HTTP Request Smuggling (HRS)',
          'CSS Injection',
          'ARP Cache Poisoning on WAN',
          'DNS Recursive Amplification',
        ],
        correctAnswer: 0,
        marks: 10,
        explanation: 'HTTP Request Smuggling occurs when proxies disagree on Content-Length vs Transfer-Encoding boundaries.',
      },
    ],
  },
  {
    domainKeyword: 'Full-Stack',
    title: 'Full-Stack Distributed Systems & Microservices Challenge',
    description: 'Real-time test on state machines, distributed caching, WebSocket concurrency, and database indexing.',
    timeLimitMinutes: 15,
    passingScore: 70,
    questions: [
      {
        questionText: 'What is the primary architectural trade-off described by the CAP Theorem in distributed data stores?',
        options: [
          'Cost, Accuracy, and Parallelism',
          'Consistency, Availability, and Partition Tolerance (choose two under network partition)',
          'Compute, Allocation, and Power',
          'Compression, Access, and Portability',
        ],
        correctAnswer: 1,
        marks: 10,
        explanation: 'In the presence of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A).',
      },
      {
        questionText: 'Which WebSocket mechanism ensures persistent stateful connections remain active through cloud load balancer timeouts?',
        options: [
          'Periodic Heartbeat Ping/Pong frames',
          'Restarting the operating system kernel every 60 seconds',
          'Sending 50MB dummy binary payloads continuously',
          'Switching to UDP without handshake',
        ],
        correctAnswer: 0,
        marks: 10,
        explanation: 'Ping/Pong keepalive heartbeats prevent reverse proxy idle-connection timeout drops.',
      },
      {
        questionText: 'In MongoDB, which index structure enables efficient spatial coordinate and nearest-neighbor lookups?',
        options: [
          '2dsphere Index',
          'Text Index with Stopwords',
          'Sparse B-Tree Hash Index',
          'Clustered Columnstore',
        ],
        correctAnswer: 0,
        marks: 10,
        explanation: '2dsphere indexes support spherical GeoJSON queries for real-time geographic calculation.',
      },
      {
        questionText: 'What HTTP status code is semantic for successful asynchronous request processing that has been accepted but not yet completed?',
        options: [
          '202 Accepted',
          '200 OK',
          '204 No Content',
          '304 Not Modified',
        ],
        correctAnswer: 0,
        marks: 10,
        explanation: '202 Accepted signals that the request has been received and queued for batch or asynchronous execution.',
      },
    ],
  },
  {
    domainKeyword: 'Quantum',
    title: 'Quantum Computing & Algorithms Assessment',
    description: 'Qubits, Superposition, Quantum Entanglement, Grover search, and Shor factorization fundamentals.',
    timeLimitMinutes: 15,
    passingScore: 70,
    questions: [
      {
        questionText: 'What quantum logic gate puts a base state |0⟩ into an equal superposition of |0⟩ and |1⟩?',
        options: [
          'Hadamard Gate (H)',
          'Pauli-X NOT Gate',
          'Toffoli CCNOT Gate',
          'Phase Shift S Gate',
        ],
        correctAnswer: 0,
        marks: 10,
        explanation: 'The Hadamard gate creates the balanced superposition state (|0⟩ + |1⟩)/√2.',
      },
      {
        questionText: 'Which quantum algorithm provides quadratic speedup for unstructured database searching?',
        options: [
          'Grover’s Algorithm',
          'Shor’s Factoring Algorithm',
          'Deutsch-Jozsa Algorithm',
          'Variational Quantum Eigensolver (VQE)',
        ],
        correctAnswer: 0,
        marks: 10,
        explanation: 'Grover’s algorithm solves unstructured search in O(√N) time compared to classical O(N).',
      },
      {
        questionText: 'What is the phenomenon where the quantum states of two or more particles cannot be described independently?',
        options: [
          'Quantum Decoherence',
          'Quantum Entanglement',
          'Thermal Relaxation',
          'Wavefunction Collapse',
        ],
        correctAnswer: 1,
        marks: 10,
        explanation: 'Entangled quantum states exhibit non-local correlations verified by Bell inequality tests.',
      },
    ],
  },
];

const seedRealTimeQuizzes = async () => {
  await connectDB();
  console.log('[Seed Quizzes] Scanning courses in database...');

  const courses = await Course.find();
  console.log(`[Seed Quizzes] Found ${courses.length} courses.`);

  let createdCount = 0;

  for (const qData of SEED_QUIZZES_DATA) {
    // Find matching course or fallback to any course
    let targetCourse = courses.find((c) =>
      c.title.toLowerCase().includes(qData.domainKeyword.toLowerCase())
    );

    if (!targetCourse && courses.length > 0) {
      targetCourse = courses[createdCount % courses.length];
    }

    if (!targetCourse) continue;

    const existing = await Quiz.findOne({ title: qData.title });
    if (!existing) {
      await Quiz.create({
        course: targetCourse._id,
        title: qData.title,
        description: qData.description,
        passingScore: qData.passingScore,
        timeLimitMinutes: qData.timeLimitMinutes,
        questions: qData.questions,
      });
      console.log(`[Seed Quizzes] Created quiz: "${qData.title}" for course "${targetCourse.title}"`);
      createdCount++;
    } else {
      console.log(`[Seed Quizzes] Quiz already exists: "${qData.title}"`);
    }
  }

  // Also ensure every course has at least 1 quiz
  for (const course of courses) {
    const hasQuiz = await Quiz.exists({ course: course._id });
    if (!hasQuiz) {
      await Quiz.create({
        course: course._id,
        title: `${course.title.slice(0, 45)}: Real-Time Assessment`,
        description: `Official real-time certification assessment for ${course.title}. Test your knowledge and compete on the live leaderboard.`,
        passingScore: 70,
        timeLimitMinutes: 15,
        questions: [
          {
            questionText: `What is the core technical architecture taught in ${course.title}?`,
            options: [
              'Stateless design, clear separation of concerns, and verifiable reliability',
              'Hardcoding secrets directly inside monolithic static pages',
              'Ignoring asynchronous error boundaries',
              'Storing sensitive credentials in plain URL query strings',
            ],
            correctAnswer: 0,
            marks: 10,
            explanation: 'Modern production systems mandate stateless resilience, typed security boundaries, and reliable error handling.',
          },
          {
            questionText: 'When deploying this technology to production, what is the best practice for configuration management?',
            options: [
              'Hardcode environment credentials into public repositories',
              'Use environment variables, secrets management vaults, and 12-factor principles',
              'Disable TLS encryption to save CPU cycles',
              'Transmit credentials over unencrypted HTTP',
            ],
            correctAnswer: 1,
            marks: 10,
            explanation: 'Production secrets must be managed securely via environment vaults, strict IAM roles, and secret rotation.',
          },
          {
            questionText: 'Which monitoring strategy best provides real-time visibility into distributed performance bottlenecks?',
            options: [
              'Distributed Tracing (OpenTelemetry) with metric alerting',
              'Checking server terminal logs manually once per month',
              'Disabling all application error logs',
              'Relying solely on user complaints',
            ],
            correctAnswer: 0,
            marks: 10,
            explanation: 'OpenTelemetry distributed tracing surfaces p99 latency regressions and microservice cascading failures.',
          },
        ],
      });
      createdCount++;
      console.log(`[Seed Quizzes] Created course quiz for "${course.title}"`);
    }
  }

  const totalQuizzes = await Quiz.countDocuments();
  console.log(`[Seed Quizzes] Done! Total Quizzes in DB: ${totalQuizzes}`);
  process.exit(0);
};

seedRealTimeQuizzes().catch((err) => {
  console.error('[Seed Quizzes] Error:', err);
  process.exit(1);
});
