import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import Skill from './models/Skill.js';
import Course from './models/Course.js';
import CourseSkill from './models/CourseSkill.js';

dotenv.config();

export const INITIAL_SKILLS = [
  {
    name: 'Quantum Circuits & QPU Optimization',
    slug: 'quantum-circuits-qpu-optimization',
    description: 'Design and synthesize variational quantum circuits, tensor contractions, Hamiltonian simulation, and state tomography.',
    category: 'AI & Machine Learning',
    difficulty: 'Advanced',
    icon: 'memory',
    tags: ['Quantum', 'Qiskit', 'PennyLane', 'TensorContraction'],
    courseSlugs: ['neural-networks-quantum-computing'],
  },
  {
    name: 'Zero-Trust Architecture & Cryptographic Primitives',
    slug: 'zero-trust-architecture-cryptographic-primitives',
    description: 'Implement SPIFFE/SPIRE workload identities, mutual TLS, elliptic curve cryptography, and defensive perimeter telemetry.',
    category: 'Cybersecurity & Crypto',
    difficulty: 'Intermediate',
    icon: 'shield_lock',
    tags: ['ZeroTrust', 'mTLS', 'SPIFFE', 'Cryptography'],
    courseSlugs: ['cyber-defense-cryptographic-security', 'zero-trust-identity-spiffe-spire'],
  },
  {
    name: 'Kubernetes Mesh & Container Orchestration',
    slug: 'kubernetes-mesh-container-orchestration',
    description: 'Architect multi-tenant Kubernetes clusters, Istio service mesh, Cilium CNI, and GitOps deployments with ArgoCD.',
    category: 'Cloud Architecture & DevOps',
    difficulty: 'Advanced',
    icon: 'cloud_circle',
    tags: ['Kubernetes', 'Istio', 'Envoy', 'CloudNative'],
    courseSlugs: ['cloud-architecture-kubernetes-clusters'],
  },
  {
    name: 'Distributed Consensus & Fault Tolerant Protocols',
    slug: 'distributed-consensus-fault-tolerant-protocols',
    description: 'Master Raft and Paxos state machine replication, leader election, split-brain mitigation, and Byzantine fault tolerance.',
    category: 'Cloud Architecture & DevOps',
    difficulty: 'Advanced',
    icon: 'hub',
    tags: ['DistributedSystems', 'Raft', 'Paxos', 'Consensus'],
    courseSlugs: ['distributed-systems-consensus', 'cloud-architecture-kubernetes-clusters'],
  },
  {
    name: 'Zero-Knowledge Proofs & zk-SNARKs in Rust',
    slug: 'zero-knowledge-proofs-zk-snarks-rust',
    description: 'Formulate arithmetic circuits, R1CS constraints, Groth16, and Plonk verifiers from scratch using Rust memory safety.',
    category: 'Systems & Architecture',
    difficulty: 'Expert',
    icon: 'lock_open',
    tags: ['ZKP', 'Rust', 'Groth16', 'Plonk'],
    courseSlugs: ['zero-knowledge-proofs-rust'],
  },
  {
    name: 'GPU Kernel Programming in Triton & CUDA',
    slug: 'gpu-kernel-programming-triton-cuda',
    description: 'Implement block-level SRAM memory tiling, fused matrix multiplications, and custom FlashAttention GPU inference kernels.',
    category: 'Systems & Architecture',
    difficulty: 'Expert',
    icon: 'developer_board',
    tags: ['CUDA', 'Triton', 'GPU', 'FlashAttention'],
    courseSlugs: ['gpu-kernel-dev-triton-cuda'],
  },
  {
    name: 'Vector Embeddings & Autonomous RAG Systems',
    slug: 'vector-embeddings-autonomous-rag-systems',
    description: 'Construct dense vector indexing, HNSW graphs, hybrid lexical-semantic retrieval, and agentic query reranking.',
    category: 'AI & Machine Learning',
    difficulty: 'Intermediate',
    icon: 'dataset',
    tags: ['RAG', 'VectorDB', 'HNSW', 'Embeddings'],
    courseSlugs: ['autonomous-vector-databases-rag'],
  },
  {
    name: 'eBPF Linux Kernel Observability & Telemetry',
    slug: 'ebpf-linux-kernel-observability-telemetry',
    description: 'Develop low-overhead kernel tracepoints, packet filtering with XDP, and ring-buffer security audit telemetry.',
    category: 'Cloud Architecture & DevOps',
    difficulty: 'Intermediate',
    icon: 'terminal',
    tags: ['eBPF', 'Linux', 'XDP', 'Telemetry'],
    courseSlugs: ['ebpf-linux-observability-telemetry'],
  },
  {
    name: 'JavaScript',
    slug: 'javascript',
    description: 'Master core JavaScript runtime mechanics, asynchronous event loops, prototypal inheritance, and modern ESNext syntax.',
    category: 'Software Engineering',
    difficulty: 'Advanced',
    icon: 'javascript',
    tags: ['JavaScript', 'ES6+', 'Frontend', 'Backend'],
    courseSlugs: ['full-stack-web-development-bootcamp'],
  },
  {
    name: 'React',
    slug: 'react',
    description: 'Build performant user interfaces with virtual DOM reconciliation, state atomicity, custom hooks, and concurrent features.',
    category: 'Frontend Engineering',
    difficulty: 'Intermediate',
    icon: 'code_blocks',
    tags: ['React', 'Hooks', 'VirtualDOM', 'StateManagement'],
    courseSlugs: ['full-stack-web-development-bootcamp'],
  },
  {
    name: 'Node.js',
    slug: 'node-js',
    description: 'Design scalable asynchronous server architectures, non-blocking I/O streams, secure authentication, and microservice APIs.',
    category: 'Backend Architecture',
    difficulty: 'Intermediate',
    icon: 'dns',
    tags: ['Node.js', 'Express', 'Auth', 'APIs'],
    courseSlugs: ['full-stack-web-development-bootcamp'],
  },
  {
    name: 'SQL',
    slug: 'sql',
    description: 'Master relational schema modeling, ACID transactions, complex joins, indexing strategies, and query performance tuning.',
    category: 'Database Systems',
    difficulty: 'Intermediate',
    icon: 'database',
    tags: ['SQL', 'Database', 'Queries', 'Relational'],
    courseSlugs: ['full-stack-web-development-bootcamp'],
  },
  {
    name: 'UI/UX Design Systems',
    slug: 'ui-ux-design-systems',
    description: 'Architect scalable design tokens, accessible components, atomic UI workflows, and modern utility-first layouts.',
    category: 'Design & Architecture',
    difficulty: 'Intermediate',
    icon: 'palette',
    tags: ['Figma', 'Tailwind', 'DesignSystems'],
    courseSlugs: ['modern-ui-ux-design-systems'],
  },
];

export const seedSkills = async () => {
  console.log('[Seed Skills] Initializing Skill Taxonomy & Course Mappings...');

  const createdSkills = [];

  for (const sData of INITIAL_SKILLS) {
    const { courseSlugs, ...skillFields } = sData;

    let skill = await Skill.findOne({
      $or: [{ slug: skillFields.slug }, { name: skillFields.name }],
    });
    if (!skill) {
      skill = await Skill.create(skillFields);
      console.log(`[Seed Skills] Created Skill: ${skill.name}`);
    } else {
      Object.assign(skill, skillFields);
      await skill.save();
    }
    createdSkills.push({ skill, courseSlugs });
  }

  // Link skills to courses
  for (const item of createdSkills) {
    if (Array.isArray(item.courseSlugs)) {
      for (const slug of item.courseSlugs) {
        const course = await Course.findOne({ slug });
        if (course) {
          await CourseSkill.findOneAndUpdate(
            { course: course._id, skill: item.skill._id },
            {
              course: course._id,
              skill: item.skill._id,
              weight: 1.0,
              isPrimary: true,
            },
            { upsert: true, new: true }
          );
          console.log(`[Seed Skills] Mapped: ${course.title} -> ${item.skill.name}`);
        }
      }
    }
  }

  console.log('[Seed Skills] Skill taxonomy and course mapping completed.');

  // Seed authentic initial demonstrated performance evidence for student
  await seedStudentEvidence();

  return createdSkills;
};

export const seedStudentEvidence = async () => {
  try {
    const User = (await import('./models/User.js')).default;
    const { recordSkillEvidence } = await import('./services/skillService.js');

    const student = await User.findOne({ email: 'student@lms.com' });
    if (!student) {
      console.log('[Seed Skills] Student user not found, skipping evidence seed.');
      return;
    }

    const Course = (await import('./models/Course.js')).default;
    const fullstackCourse = await Course.findOne({ slug: 'full-stack-web-development-bootcamp' });

    const studentId = student._id;

    const skillRecords = [
      {
        slug: 'javascript',
        evidence: [
          { type: 'quiz', title: 'ES6+ Syntax & Scope Assessment', score: 88, maxScore: 100, weight: 1.0 },
          { type: 'coding_challenge', title: 'Async Pipeline & Event Loop Challenge', score: 84, maxScore: 100, weight: 1.2 },
        ],
      },
      {
        slug: 'react',
        evidence: [
          { type: 'quiz', title: 'Component Lifecycle & Hooks Quiz', score: 75, maxScore: 100, weight: 1.0 },
          { type: 'coding_challenge', title: 'Reusable Component System Lab', score: 70, maxScore: 100, weight: 1.2 },
        ],
      },
      {
        slug: 'node-js',
        evidence: [
          { type: 'quiz', title: 'Express REST Architecture Quiz', score: 78, maxScore: 100, weight: 1.0 },
          { type: 'coding_challenge', title: 'Node.js Authentication Lab', score: 45, maxScore: 100, weight: 1.3 },
        ],
      },
      {
        slug: 'sql',
        evidence: [
          { type: 'quiz', title: 'Relational Queries & Indexing Exam', score: 82, maxScore: 100, weight: 1.0 },
          { type: 'coding_challenge', title: 'Database Schema Optimization Challenge', score: 74, maxScore: 100, weight: 1.2 },
        ],
      },
    ];

    for (const sr of skillRecords) {
      const skill = await Skill.findOne({ slug: sr.slug });
      if (!skill) continue;

      for (const ev of sr.evidence) {
        await recordSkillEvidence({
          userId: studentId,
          skillId: skill._id,
          type: ev.type,
          title: ev.title,
          score: ev.score,
          maxScore: ev.maxScore,
          weight: ev.weight,
          courseId: fullstackCourse?._id,
          trigger: 'curriculum_evaluation',
        });
      }
    }

    console.log('[Seed Skills] Authentic learner demonstrated evidence seeded for student@lms.com.');
  } catch (err) {
    console.warn('[Seed Skills Warning] Could not seed student evidence:', err.message);
  }
};

// Standalone execution runner
if (process.argv[1]?.endsWith('seed-skills.js')) {
  (async () => {
    try {
      await connectDB();
      await seedSkills();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Skills Error]:', err);
      process.exit(1);
    }
  })();
}

export default seedSkills;
