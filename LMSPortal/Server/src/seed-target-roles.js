import mongoose from 'mongoose';
import TargetRole from './models/TargetRole.js';
import Skill from './models/Skill.js';
import User from './models/User.js';

export const seedTargetRoles = async () => {
  try {
    const existingCount = await TargetRole.countDocuments();
    if (existingCount > 0) {
      console.log(`[Seed TargetRoles] ${existingCount} target roles already exist. Skipping.`);
      return;
    }

    const admin = await User.findOne({ role: 'admin' });
    const adminId = admin ? admin._id : null;

    // Fetch existing skills or create them if missing
    const getOrCreateSkill = async (name, category, difficulty, icon) => {
      let skill = await Skill.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
      if (!skill) {
        skill = await Skill.create({
          name,
          category,
          difficulty,
          icon: icon || 'code',
          description: `Core proficiency in ${name} principles, frameworks, and architecture.`,
        });
      }
      return skill;
    };

    const jsSkill = await getOrCreateSkill('JavaScript', 'Programming Languages', 'Intermediate', 'code');
    const reactSkill = await getOrCreateSkill('React', 'Frontend Engineering', 'Intermediate', 'layout');
    const nodeSkill = await getOrCreateSkill('Node.js', 'Backend Engineering', 'Intermediate', 'server');
    const sqlSkill = await getOrCreateSkill('SQL', 'Database & Persistence', 'Intermediate', 'database');
    const testingSkill = await getOrCreateSkill('Testing', 'Quality Engineering', 'Intermediate', 'check-circle');
    const sysDesignSkill = await getOrCreateSkill('System Design', 'Architecture & Scalability', 'Advanced', 'cpu');
    const pythonSkill = await getOrCreateSkill('Python', 'Programming Languages', 'Intermediate', 'terminal');
    const dockerSkill = await getOrCreateSkill('Docker', 'DevOps & Infrastructure', 'Intermediate', 'container');
    const k8sSkill = await getOrCreateSkill('Kubernetes', 'DevOps & Infrastructure', 'Advanced', 'cloud');
    const mlSkill = await getOrCreateSkill('Machine Learning', 'Data & AI', 'Advanced', 'sparkles');

    const defaultRoles = [
      {
        name: 'Full Stack Developer',
        slug: 'full-stack-developer',
        category: 'Software Engineering',
        description:
          'Build and scale production web applications across the entire stack—from high-performance frontend SPAs to resilient backend microservices, database schemas, and end-to-end automated testing.',
        icon: 'layers',
        color: '#06b6d4', // cyan-500
        careerOutlook: {
          averageSalary: '$120,000 - $165,000',
          demandLevel: 'Exponential',
          marketGrowth: '+26% YoY growth',
        },
        requiredSkills: [
          { skill: jsSkill._id, requiredScore: 80, importance: 'Critical', minProficiency: 'Advanced', benchmarkNotes: 'ES6+, async pipelines, closures, memory optimization' },
          { skill: reactSkill._id, requiredScore: 75, importance: 'Critical', minProficiency: 'Intermediate', benchmarkNotes: 'Component architecture, custom hooks, state stores, virtual DOM' },
          { skill: nodeSkill._id, requiredScore: 75, importance: 'Critical', minProficiency: 'Intermediate', benchmarkNotes: 'Event loop, RESTful microservices, stream processing, middleware' },
          { skill: sqlSkill._id, requiredScore: 70, importance: 'Important', minProficiency: 'Intermediate', benchmarkNotes: 'Relational schema design, indexes, transactional ACID integrity' },
          { skill: testingSkill._id, requiredScore: 65, importance: 'Important', minProficiency: 'Intermediate', benchmarkNotes: 'Unit, integration, and contract test assertions' },
          { skill: sysDesignSkill._id, requiredScore: 60, importance: 'Important', minProficiency: 'Intermediate', benchmarkNotes: 'Load balancing, caching strategies, horizontal scaling patterns' },
        ],
        isPublished: true,
        createdBy: adminId,
      },
      {
        name: 'Cloud & DevOps Architect',
        slug: 'cloud-devops-architect',
        category: 'Infrastructure & Cloud',
        description:
          'Design resilient cloud topologies, manage container orchestration, and automate zero-downtime deployment pipelines with state-of-the-art infrastructure as code and observability systems.',
        icon: 'cloud',
        color: '#3b82f6', // blue-500
        careerOutlook: {
          averageSalary: '$135,000 - $185,000',
          demandLevel: 'Very High',
          marketGrowth: '+29% YoY growth',
        },
        requiredSkills: [
          { skill: k8sSkill._id, requiredScore: 85, importance: 'Critical', minProficiency: 'Advanced', benchmarkNotes: 'Cluster lifecycle, ingress, service meshes, helm packaging' },
          { skill: dockerSkill._id, requiredScore: 80, importance: 'Critical', minProficiency: 'Advanced', benchmarkNotes: 'Multi-stage builds, security scanning, minimal base images' },
          { skill: sysDesignSkill._id, requiredScore: 80, importance: 'Critical', minProficiency: 'Advanced', benchmarkNotes: 'High-availability failover, disaster recovery, cloud cost economics' },
          { skill: nodeSkill._id, requiredScore: 70, importance: 'Important', minProficiency: 'Intermediate', benchmarkNotes: 'Backend services and API gateways automation' },
          { skill: testingSkill._id, requiredScore: 65, importance: 'Optional', minProficiency: 'Intermediate', benchmarkNotes: 'Automated CI/CD test harness integration' },
        ],
        isPublished: true,
        createdBy: adminId,
      },
      {
        name: 'AI & Data Systems Engineer',
        slug: 'ai-data-systems-engineer',
        category: 'Data & Artificial Intelligence',
        description:
          'Construct enterprise intelligence systems, LLM orchestration pipelines, vector embeddings storage, and low-latency inference services operating across distributed compute clusters.',
        icon: 'cpu',
        color: '#a855f7', // purple-500
        careerOutlook: {
          averageSalary: '$140,000 - $195,000',
          demandLevel: 'Exponential',
          marketGrowth: '+42% YoY growth',
        },
        requiredSkills: [
          { skill: pythonSkill._id, requiredScore: 85, importance: 'Critical', minProficiency: 'Advanced', benchmarkNotes: 'Asynchronous concurrency, vectorization, PyTorch/Numpy bindings' },
          { skill: mlSkill._id, requiredScore: 80, importance: 'Critical', minProficiency: 'Advanced', benchmarkNotes: 'Transformers, embeddings, fine-tuning, RAG retrieval workflows' },
          { skill: sqlSkill._id, requiredScore: 75, importance: 'Important', minProficiency: 'Intermediate', benchmarkNotes: 'Feature store schemas, analytic SQL queries, data pipelines' },
          { skill: sysDesignSkill._id, requiredScore: 70, importance: 'Important', minProficiency: 'Intermediate', benchmarkNotes: 'Distributed streaming, low-latency API serving, model caching' },
          { skill: dockerSkill._id, requiredScore: 65, importance: 'Optional', minProficiency: 'Intermediate', benchmarkNotes: 'Containerized model packaging and GPU execution layers' },
        ],
        isPublished: true,
        createdBy: adminId,
      },
      {
        name: 'Frontend Systems Engineer',
        slug: 'frontend-systems-engineer',
        category: 'Software Engineering',
        description:
          'Engineer hyper-responsive, accessible, and resilient client-side web architectures with pixel-perfect design systems, sub-second TTFB, and rock-solid state management.',
        icon: 'layout',
        color: '#10b981', // emerald-500
        careerOutlook: {
          averageSalary: '$115,000 - $155,000',
          demandLevel: 'High',
          marketGrowth: '+19% YoY growth',
        },
        requiredSkills: [
          { skill: jsSkill._id, requiredScore: 85, importance: 'Critical', minProficiency: 'Advanced', benchmarkNotes: 'Deep JS internals, ASTs, browser event loops, memory profiling' },
          { skill: reactSkill._id, requiredScore: 85, importance: 'Critical', minProficiency: 'Advanced', benchmarkNotes: 'SSR, suspense streaming, atomic state, concurrent rendering' },
          { skill: testingSkill._id, requiredScore: 70, importance: 'Important', minProficiency: 'Intermediate', benchmarkNotes: 'Component unit tests, Playwright E2E, accessibility auditing' },
          { skill: nodeSkill._id, requiredScore: 60, importance: 'Optional', minProficiency: 'Intermediate', benchmarkNotes: 'BFF (Backend for Frontend) layers and Next.js server actions' },
        ],
        isPublished: true,
        createdBy: adminId,
      },
    ];

    for (const r of defaultRoles) {
      await TargetRole.create(r);
      console.log(`[Seed TargetRoles] Created role: ${r.name}`);
    }

    console.log('[Seed TargetRoles] Successfully seeded target roles catalog.');
  } catch (error) {
    console.error('[Seed TargetRoles] Error seeding target roles:', error.message);
  }
};
