import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';

import User from './models/User.js';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';
import Enrollment from './models/Enrollment.js';
import Quiz from './models/Quiz.js';
import Certificate from './models/Certificate.js';
import Notification from './models/Notification.js';
import ChatMessage from './models/ChatMessage.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Purging dummy and old records...');
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    await Enrollment.deleteMany();
    await Quiz.deleteMany();
    await Certificate.deleteMany();
    await Notification.deleteMany();
    await ChatMessage.deleteMany();

    console.log('[Seed] Creating core faculty, administrators, and students...');
    // Create users one by one to ensure pre-save bcrypt hook executes
    const admin = await User.create({
      name: 'Dr. Sarah Jenkins (Admin)',
      email: 'admin@lms.com',
      password: 'Password123!',
      role: 'admin',
      headline: 'Chief Academic Officer & Platform Administrator',
      bio: 'Leading technological curriculum standards and accreditation across the global LMS platform.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    });

    const instructor1 = await User.create({
      name: 'Prof. Alex Rivera',
      email: 'instructor@lms.com',
      password: 'Password123!',
      role: 'instructor',
      headline: 'Principal Full-Stack Architect & Distributed Systems Fellow',
      bio: 'Over 14 years building high-throughput systems, cloud-native clusters, and modern web architectures at Fortune 50 firms.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        website: 'https://rivera-tech.io',
      },
    });

    const instructor2 = await User.create({
      name: 'Dr. Elena Vance',
      email: 'elena@lms.com',
      password: 'Password123!',
      role: 'instructor',
      headline: 'Stanford AI Fellow & Quantum Computing Researcher',
      bio: 'Author of leading publications on deep tensor contractions, autonomous agentic architectures, and modern LLM quantization.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
      },
    });

    const instructor3 = await User.create({
      name: 'Marcus Lin, CISSP',
      email: 'marcus@lms.com',
      password: 'Password123!',
      role: 'instructor',
      headline: 'Senior Infosec Director & Threat Intelligence Architect',
      bio: 'Former federal cyber defense contractor specializing in Zero-Trust, cryptographic protocols, and automated adversarial red-teaming.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
      },
    });

    const student = await User.create({
      name: 'Jordan Lee',
      email: 'student@lms.com',
      password: 'Password123!',
      role: 'student',
      headline: 'Software Engineering Scholar & Systems Practitioner',
      bio: 'Pursuing specialization in Agentic AI, Cloud-Native Kubernetes, and Distributed Systems.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    });

    const student2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.student@lms.com',
      password: 'Password123!',
      role: 'student',
      headline: 'Data Engineering & Machine Learning Enthusiast',
      bio: 'Focusing on real-time streaming architectures with Apache Kafka, PySpark, and Vector Stores.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    });

    console.log('[Seed] Core users initialized:');
    console.log(`  Admin:       ${admin.email} / Password123!`);
    console.log(`  Instructor:  ${instructor1.email} / Password123!`);
    console.log(`  Student:     ${student.email} / Password123!`);

    // =========================================================================
    // 38 PRODUCTION-GRADE COURSES ACROSS ALL 10 DOMAINS
    // =========================================================================
    const courseDefinitions = [
      // -----------------------------------------------------------------------
      // DOMAIN 1: AI, GenAI & Large Language Models (5 Courses)
      // -----------------------------------------------------------------------
      {
        title: 'Agentic AI & Multi-Agent Workflows with LangGraph & CrewAI',
        slug: 'agentic-ai-multi-agent-workflows',
        category: 'AI & Machine Learning',
        level: 'Advanced',
        instructor: instructor2._id,
        price: 89,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Architect autonomous multi-agent systems with state persistence, tool calling, and human-in-the-loop validation.',
        description: 'Build production-ready autonomous LLM agent networks using LangGraph, LangChain, and CrewAI. Learn deterministic cyclical state machines, vector memory persistence, dynamic tool dispatching, error self-correction, and enterprise evaluation pipelines.',
        requirements: ['Intermediate Python proficiency', 'Basic familiarity with OpenAI or Anthropic API endpoints'],
        willLearn: [
          'Design cyclic agent graphs with state persistence using LangGraph',
          'Coordinate specialized multi-agent teams with CrewAI roles and tasks',
          'Implement human-in-the-loop approval workflows for critical actions',
          'Deploy and monitor agent workloads with LangSmith observability',
        ],
        tags: ['Agentic AI', 'LangGraph', 'CrewAI', 'LLMs', 'Python'],
        rating: 4.96,
        numReviews: 420,
        enrollmentCount: 3820,
        lessons: [
          {
            section: 'Module 1: Agentic Architecture & Fundamentals',
            title: '1. Anatomy of Autonomous Agents & ReAct Decision Loops',
            duration: 14,
            videoUrl: 'https://www.youtube.com/watch?v=Sal4aA-nJzY',
            description: 'Deconstruct the transition from static LLM prompt chains to autonomous ReAct reasoning and dynamic decision cycles.',
            isFreePreview: true,
          },
          {
            section: 'Module 1: Agentic Architecture & Fundamentals',
            title: '2. State Graphs & Cyclical Routing with LangGraph',
            duration: 18,
            videoUrl: 'https://www.youtube.com/watch?v=5h-JBkySK34',
            description: 'Construct stateful agent graphs, conditional edges, and persistence checkpoints using PostgreSQL memory.',
            isFreePreview: false,
          },
          {
            section: 'Module 2: Multi-Agent Collaboration & Production',
            title: '3. Role Delegation & Hierarchical Teams with CrewAI',
            duration: 22,
            videoUrl: 'https://www.youtube.com/watch?v=sPzc6hMg7So',
            description: 'Configure hierarchical researcher-writer-reviewer crews with shared context and asynchronous execution.',
            isFreePreview: false,
          },
        ],
      },
      {
        title: 'Production RAG Systems & Hybrid Vector Search with Milvus & Pinecone',
        slug: 'production-rag-hybrid-vector-search',
        category: 'AI & Machine Learning',
        level: 'Intermediate',
        instructor: instructor2._id,
        price: 69,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Build high-accuracy retrieval augmented generation pipelines with hybrid dense/sparse search and re-ranking.',
        description: 'Master enterprise-grade RAG architectures. Implement semantic chunking, ColBERT late-interaction embeddings, BM25 hybrid search, Cohere re-ranking, and advanced evaluation metrics with Ragas to eliminate hallucinations.',
        requirements: ['Python fundamentals', 'Basic understanding of vector embeddings'],
        willLearn: [
          'Index millions of documents into Milvus and Pinecone vector stores',
          'Implement reciprocal rank fusion (RRF) for hybrid dense and sparse search',
          'Deploy cross-encoder re-ranking for 95%+ retrieval accuracy',
          'Establish automated hallucination scoring benchmarks with Ragas',
        ],
        tags: ['RAG', 'Vector DB', 'Milvus', 'Pinecone', 'Embeddings'],
        rating: 4.92,
        numReviews: 310,
        enrollmentCount: 2940,
        lessons: [
          {
            section: 'Module 1: Retrieval Foundations',
            title: '1. Advanced Document Chunking & Metadata Extraction',
            duration: 16,
            videoUrl: 'https://www.youtube.com/watch?v=8OJC21T2SL4',
            description: 'Semantic windowing, hierarchical chunking, and metadata enhancement techniques.',
            isFreePreview: true,
          },
          {
            section: 'Module 1: Retrieval Foundations',
            title: '2. Hybrid Search: Dense Vector + BM25 Lexical with RRF',
            duration: 20,
            videoUrl: 'https://www.youtube.com/watch?v=9jR4rQ1tL8E',
            description: 'Combining sparse keyword relevance with dense semantic similarity for zero recall drops.',
            isFreePreview: false,
          },
        ],
      },
      {
        title: 'Large Language Model Fine-Tuning with LoRA, QLoRA & vLLM',
        slug: 'llm-fine-tuning-lora-qlora-vllm',
        category: 'AI & Machine Learning',
        level: 'Advanced',
        instructor: instructor2._id,
        price: 99,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Fine-tune open-weights models like Llama 3 with parameter-efficient techniques and deploy with vLLM.',
        description: 'Comprehensive guide to parameter-efficient fine-tuning (PEFT). Master 4-bit normal float quantization (QLoRA), dataset formatting with SFTTrainer, instruction tuning, DPO alignment, and low-latency serving with PagedAttention on vLLM.',
        requirements: ['PyTorch experience', 'Access to CUDA GPU (Google Colab / RunPod / AWS)'],
        willLearn: [
          'Prepare high-quality instruction and preference datasets for LLM tuning',
          'Train low-rank adapters (LoRA) without catastrophic forgetting',
          'Align models with Direct Preference Optimization (DPO)',
          'Serve fine-tuned models at 1500+ tokens/sec using vLLM and TensorRT-LLM',
        ],
        tags: ['Fine-Tuning', 'LoRA', 'vLLM', 'Llama 3', 'PyTorch'],
        rating: 4.97,
        numReviews: 530,
        enrollmentCount: 4620,
        lessons: [
          {
            section: 'Module 1: Quantization & Parameter-Efficient Fine-Tuning',
            title: '1. LoRA Math & 4-bit QLoRA Quantization Mechanics',
            duration: 18,
            videoUrl: 'https://www.youtube.com/watch?v=XpoKB3usmKc',
            description: 'Low-rank matrix decomposition, adapter freezing, and gradient memory footprint.',
            isFreePreview: true,
          },
        ],
      },
      {
        title: 'Multimodal AI: Vision-Language Models & Audio Diffusion',
        slug: 'multimodal-ai-vlm-audio-diffusion',
        category: 'AI & Machine Learning',
        level: 'Advanced',
        instructor: instructor2._id,
        price: 79,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Build next-gen applications using vision-language models, Whisper audio transcription, and Stable Diffusion 3.',
        description: 'Unify visual, auditory, and textual intelligence. Build zero-shot image classification pipelines with CLIP, fine-tune LLaVA vision assistants, run real-time voice streaming with OpenAI Whisper, and generate photorealistic visual assets with latent diffusion.',
        requirements: ['Python and PyTorch basics', 'Understanding of CNNs and Transformer attention'],
        willLearn: [
          'Deploy LLaVA and Claude 3 vision models for document understanding',
          'Implement streaming speech-to-text with Whisper and WebSockets',
          'Control latent diffusion pipelines using ControlNet and IP-Adapter',
          'Build end-to-end multimodal assistant applications',
        ],
        tags: ['Multimodal', 'Computer Vision', 'Whisper', 'Diffusion', 'LLaVA'],
        rating: 4.88,
        numReviews: 185,
        enrollmentCount: 1680,
      },
      {
        title: 'Deep Learning with PyTorch 2.x & Distributed GPU Training',
        slug: 'deep-learning-pytorch-distributed-training',
        category: 'AI & Machine Learning',
        level: 'Intermediate',
        instructor: instructor2._id,
        price: 59,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Master PyTorch 2.x compiler graph optimizations, torch.compile, and multi-GPU distributed data parallel (DDP).',
        description: 'Modern PyTorch engineering from computational graph construction to multi-node training. Harness torch.compile, TorchDynamo, mixed precision (AMP), and Fully Sharded Data Parallel (FSDP) to train multi-billion parameter architectures efficiently.',
        requirements: ['Python and linear algebra foundations'],
        willLearn: [
          'Accelerate neural network training by up to 2x with torch.compile',
          'Scale training across multi-GPU setups using PyTorch DDP and FSDP',
          'Profile GPU memory bottlenecks with PyTorch Profiler and TensorBoard',
          'Export models to ONNX and TensorRT for production inference',
        ],
        tags: ['PyTorch', 'Deep Learning', 'GPU', 'CUDA', 'Distributed'],
        rating: 4.91,
        numReviews: 290,
        enrollmentCount: 2450,
      },

      // -----------------------------------------------------------------------
      // DOMAIN 2: Cloud Architecture, DevOps & Platform Engineering (5 Courses)
      // -----------------------------------------------------------------------
      {
        title: 'Production Kubernetes & Istio Service Mesh on AWS EKS',
        slug: 'production-kubernetes-istio-service-mesh-eks',
        category: 'Cloud Architecture & DevOps',
        level: 'Advanced',
        instructor: instructor1._id,
        price: 95,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Design, deploy, and secure enterprise Kubernetes clusters on AWS EKS with Istio mTLS and GitOps.',
        description: 'The definitive hands-on masterclass for Kubernetes platform engineers. Set up production AWS EKS clusters with Terraform, implement Istio service mesh for zero-trust mTLS and canary rollouts, automate deployments with ArgoCD GitOps, and configure autoscaling with Karpenter.',
        requirements: ['Linux command line comfort', 'Basic Docker containerization knowledge'],
        willLearn: [
          'Provision enterprise AWS EKS clusters with VPC CNI and IAM Roles for Service Accounts (IRSA)',
          'Configure Istio service mesh for automatic mTLS encryption and traffic splitting',
          'Implement GitOps continuous delivery pipelines using ArgoCD and Helm',
          'Optimize cloud compute costs by 60% with Karpenter dynamic node autoscaling',
        ],
        tags: ['Kubernetes', 'AWS EKS', 'Istio', 'GitOps', 'DevOps'],
        rating: 4.98,
        numReviews: 610,
        enrollmentCount: 5120,
        lessons: [
          {
            section: 'Module 1: Production Cluster Architecture',
            title: '1. Provisioning Hardened AWS EKS with Terraform & VPC CNI',
            duration: 20,
            videoUrl: 'https://www.youtube.com/watch?v=Vqvq6bF8Q_E',
            description: 'Private subnets, control plane logging, and managed node group configurations.',
            isFreePreview: true,
          },
          {
            section: 'Module 2: Service Mesh & Traffic Management',
            title: '2. Istio Envoy Sidecars, Mutual TLS & Traffic Shadowing',
            duration: 25,
            videoUrl: 'https://www.youtube.com/watch?v=16fgzklcF7Y',
            description: 'Configuring VirtualServices, DestinationRules, and strict peer authentication.',
            isFreePreview: false,
          },
        ],
      },
      {
        title: 'Infrastructure as Code with Terraform, OpenTofu & Terragrunt',
        slug: 'iac-terraform-opentofu-terragrunt',
        category: 'Cloud Architecture & DevOps',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 65,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Architect reusable, drift-resistant multi-environment cloud infrastructure across AWS, GCP, and Azure.',
        description: 'Transition from manual console provisioning to professional cloud platform engineering. Master Terraform and OpenTofu modules, remote state locking with S3/DynamoDB, DRY architectures with Terragrunt, policy-as-code with OPA, and automated CI/CD validation.',
        requirements: ['Familiarity with cloud computing concepts (AWS or Azure or GCP)'],
        willLearn: [
          'Author modular, parameter-driven infrastructure code with OpenTofu',
          'Structure multi-account enterprise architectures with Terragrunt',
          'Enforce security and budget guardrails using Sentinel and Open Policy Agent',
          'Automate plan, review, and apply pipelines using GitHub Actions',
        ],
        tags: ['Terraform', 'OpenTofu', 'Terragrunt', 'AWS', 'IaC'],
        rating: 4.93,
        numReviews: 380,
        enrollmentCount: 3290,
      },
      {
        title: 'Cloud-Native Observability with OpenTelemetry, Prometheus & Grafana',
        slug: 'observability-opentelemetry-prometheus-grafana',
        category: 'Cloud Architecture & DevOps',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 55,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Unify distributed tracing, metrics, and logs with OpenTelemetry collector pipelines and Grafana dashboards.',
        description: 'Achieve complete visibility into microservice performance and reliability. Instrument polyglot applications with OpenTelemetry SDKs, configure high-throughput OTel collectors, visualize system latencies in Grafana Tempo, and calculate production SLOs with Prometheus alert rules.',
        requirements: ['Basic backend web development experience'],
        willLearn: [
          'Auto-instrument and manual-instrument Node.js, Python, and Go microservices',
          'Deploy the OpenTelemetry Collector daemonset for trace and metric processing',
          'Create high-fidelity Grafana dashboards with PromQL and LogQL',
          'Define Service Level Objectives (SLOs) and Error Budgets with Alertmanager',
        ],
        tags: ['Observability', 'OpenTelemetry', 'Prometheus', 'Grafana', 'Tracing'],
        rating: 4.89,
        numReviews: 240,
        enrollmentCount: 2150,
      },
      {
        title: 'DevSecOps Pipeline Automation with GitHub Actions & Trivy',
        slug: 'devsecops-pipeline-automation-github-actions-trivy',
        category: 'Cloud Architecture & DevOps',
        level: 'Beginner',
        instructor: instructor3._id,
        price: 49,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Embed automated vulnerability scanning, SBOM generation, and cryptographic container signing into CI/CD.',
        description: 'Shift security left by baking automated static analysis (SAST), software composition analysis (SCA), container vulnerability scanning with Trivy, and artifact signing with Sigstore/Cosign into production GitHub Actions workflows.',
        requirements: ['Basic Git commands and familiarity with GitHub repositories'],
        willLearn: [
          'Build end-to-end CI/CD test, build, and deploy workflows with GitHub Actions',
          'Scan container images and dependencies for CVEs using Trivy and Snyk',
          'Generate Software Bill of Materials (SBOM) compliant with CycloneDX',
          'Sign container images and verify signatures in Kubernetes clusters using Cosign',
        ],
        tags: ['DevSecOps', 'GitHub Actions', 'Trivy', 'CI/CD', 'Security'],
        rating: 4.87,
        numReviews: 195,
        enrollmentCount: 1840,
      },
      {
        title: 'AWS Serverless Architecture with Lambda, EventBridge & DynamoDB',
        slug: 'aws-serverless-lambda-eventbridge-dynamodb',
        category: 'Cloud Architecture & DevOps',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 0,
        isFree: true,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Build zero-idle-cost, globally distributed event-driven applications with AWS serverless services.',
        description: 'Engineer massively scalable, low-latency applications with zero server maintenance. Design single-table DynamoDB schemas, orchestrate complex sagas with AWS Step Functions, route millions of events with Amazon EventBridge, and optimize Lambda cold starts with Rust and LLRT.',
        requirements: ['Basic JavaScript or Python programming', 'Free tier AWS account'],
        willLearn: [
          'Design lightning-fast single-table patterns in Amazon DynamoDB',
          'Build decoupled, asynchronous event buses using Amazon EventBridge',
          'Orchestrate resilient multi-step workflows with AWS Step Functions',
          'Minimize Lambda latency with provisioned concurrency and ARM64 Graviton',
        ],
        tags: ['Serverless', 'AWS Lambda', 'DynamoDB', 'EventBridge', 'Cloud'],
        rating: 4.95,
        numReviews: 440,
        enrollmentCount: 3950,
      },

      // -----------------------------------------------------------------------
      // DOMAIN 3: Modern Full-Stack & Web Development (5 Courses)
      // -----------------------------------------------------------------------
      {
        title: 'Full-Stack Next.js 15 & React 19 with Server Actions & Turbopack',
        slug: 'nextjs-15-react-19-server-actions',
        category: 'Web Development',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 79,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Master React Server Components, server actions, optimistic UI updates, and Turbopack in Next.js 15.',
        description: 'Build bleeding-edge full-stack web applications with Next.js 15 and React 19. Learn React Server Components (RSC), seamless Server Actions data mutations, optimistic state updates with useOptimistic, streaming server-side rendering (SSR), and authentication with NextAuth/Auth.js.',
        requirements: ['Proficiency with JavaScript ES6+ and modern React basics'],
        willLearn: [
          'Leverage React 19 hooks: useActionState, useOptimistic, and use()',
          'Implement type-safe Server Actions with Zod input validation',
          'Deploy edge middleware for geolocation, rate limiting, and route protection',
          'Achieve perfect 100 Core Web Vitals with streaming HTML and Suspense',
        ],
        tags: ['Next.js 15', 'React 19', 'Server Actions', 'Full-Stack', 'Tailwind'],
        rating: 4.99,
        numReviews: 890,
        enrollmentCount: 6840,
        lessons: [
          {
            section: 'Module 1: React 19 & Next.js 15 Paradigm',
            title: '1. React Server Components vs Client Boundaries Demystified',
            duration: 15,
            videoUrl: 'https://www.youtube.com/watch?v=rFP7rUYtOOg',
            description: 'Understanding zero-bundle-size components and data fetching without client useEffect.',
            isFreePreview: true,
          },
          {
            section: 'Module 1: React 19 & Next.js 15 Paradigm',
            title: '2. Server Actions, Form Status & Optimistic Updates',
            duration: 22,
            videoUrl: 'https://www.youtube.com/watch?v=O14B1rI_9pQ',
            description: 'Building instant feedback forms with useOptimistic and progressive enhancement.',
            isFreePreview: false,
          },
        ],
      },
      {
        title: 'High-Performance Go (Golang) Microservices & gRPC',
        slug: 'golang-microservices-grpc',
        category: 'Web Development',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 69,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Build ultra-fast, concurrent microservices using Go, Protocol Buffers 3, and streaming gRPC.',
        description: 'Dive into backend systems engineering with Go. Implement clean hexagonal architecture, master goroutine concurrency patterns, compile Protobuf definitions into streaming gRPC servers, connect distributed PostgreSQL databases with sqlc, and configure distributed tracing.',
        requirements: ['Basic programming experience in any language (JS, Python, Java)'],
        willLearn: [
          'Master Go concurrency with goroutines, channels, and context cancellation',
          'Define type-safe microservice contracts using Protocol Buffers 3',
          'Implement unary, server-streaming, and bidirectional gRPC communication',
          'Execute sub-millisecond database queries with connection pooling and sqlc',
        ],
        tags: ['Golang', 'gRPC', 'Microservices', 'Protobuf', 'Backend'],
        rating: 4.94,
        numReviews: 410,
        enrollmentCount: 3520,
      },
      {
        title: 'Modern TypeScript & Node.js Enterprise Backend Architecture',
        slug: 'typescript-nodejs-enterprise-backend',
        category: 'Web Development',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 59,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Architect clean, testable Node.js enterprise APIs with TypeScript, Prisma ORM, and Redis caching.',
        description: 'Step up from basic Express scripts to scalable enterprise backend systems. Learn Domain-Driven Design (DDD), dependency injection, type-safe database queries with Prisma, distributed session management with Redis, and automated integration testing with Vitest and Supertest.',
        requirements: ['JavaScript knowledge and basic Express.js familiarity'],
        willLearn: [
          'Enforce strict TypeScript compiler types, generics, and branded types',
          'Implement Hexagonal (Ports & Adapters) clean architecture in Node.js',
          'Model and migrate relational schemas with Prisma ORM and PostgreSQL',
          'Implement cache-aside and rate-limiting patterns with Redis clusters',
        ],
        tags: ['TypeScript', 'Node.js', 'Prisma', 'Redis', 'Backend'],
        rating: 4.91,
        numReviews: 325,
        enrollmentCount: 2890,
      },
      {
        title: 'Production FastAPI & Asynchronous Python Web Applications',
        slug: 'fastapi-async-python-web-apps',
        category: 'Web Development',
        level: 'Intermediate',
        instructor: instructor2._id,
        price: 49,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Build blazingly fast asynchronous REST and WebSocket APIs using FastAPI, Pydantic v2, and Celery.',
        description: 'Leverage modern Python 3.12+ async features for web APIs. Master Pydantic v2 validation models, asynchronous database access with asyncpg and SQLAlchemy 2.0, background task processing with Celery and Redis, and real-time live channels via WebSockets.',
        requirements: ['Basic Python programming syntax'],
        willLearn: [
          'Design OpenAPI 3.1 compliant APIs with interactive Swagger documentation',
          'Execute non-blocking async database operations with SQLAlchemy 2.0',
          'Distribute long-running background tasks with Celery and Redis brokers',
          'Implement JWT authentication with secure HttpOnly refresh token rotation',
        ],
        tags: ['FastAPI', 'Python', 'AsyncIO', 'Pydantic', 'WebSockets'],
        rating: 4.88,
        numReviews: 270,
        enrollmentCount: 2310,
      },
      {
        title: 'Full-Stack GraphQL with Apollo Federation & WebSockets',
        slug: 'graphql-apollo-federation-websockets',
        category: 'Web Development',
        level: 'Advanced',
        instructor: instructor1._id,
        price: 69,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Unify multiple microservice APIs into a unified enterprise supergraph using Apollo Federation v2.',
        description: 'Eliminate over-fetching and brittle REST endpoint sprawl. Build federated subgraph services that seamlessly compose into a high-performance supergraph gateway. Implement DataLoader batching to eliminate N+1 query problems and stream live subscription data over WebSockets.',
        requirements: ['Solid understanding of web APIs and JavaScript or TypeScript'],
        willLearn: [
          'Design modular subgraph schemas with Apollo Federation directives',
          'Route client queries through high-throughput Apollo Router gateway written in Rust',
          'Solve N+1 query performance traps using Facebook DataLoader',
          'Stream real-time collaborative updates using GraphQL subscriptions',
        ],
        tags: ['GraphQL', 'Apollo', 'Federation', 'WebSockets', 'API'],
        rating: 4.86,
        numReviews: 180,
        enrollmentCount: 1540,
      },

      // -----------------------------------------------------------------------
      // DOMAIN 4: Cybersecurity & Ethical Hacking (5 Courses)
      // -----------------------------------------------------------------------
      {
        title: 'Zero-Trust Enterprise Security Architecture & SPIFFE/SPIRE',
        slug: 'zero-trust-security-architecture-spiffe-spire',
        category: 'Cybersecurity & Crypto',
        level: 'Advanced',
        instructor: instructor3._id,
        price: 99,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Implement continuous workload identity attestation, mutual TLS, and dynamic micro-segmentation.',
        description: 'Abandon traditional perimeter security and adopt genuine Zero-Trust architecture. Implement cryptographically verified workload identities using SPIFFE/SPIRE, configure fine-grained attribute-based access control (ABAC) with Open Policy Agent, and secure multi-cloud east-west traffic.',
        requirements: ['Understanding of networking fundamentals (TCP/IP, TLS/SSL, DNS)'],
        willLearn: [
          'Issue short-lived cryptographic X.509 SVID credentials with SPIRE agents',
          'Enforce dynamic policy decisions across microservices with OPA Gatekeeper',
          'Configure zero-trust ingress and egress traffic filtering in Kubernetes',
          'Conduct comprehensive threat modeling following NIST SP 800-207 guidelines',
        ],
        tags: ['Zero-Trust', 'SPIFFE', 'SPIRE', 'Cybersecurity', 'Identity'],
        rating: 4.96,
        numReviews: 470,
        enrollmentCount: 3820,
        lessons: [
          {
            section: 'Module 1: Principles of Identity-Based Security',
            title: '1. Beyond the Perimeter: NIST Zero-Trust Core Architecture',
            duration: 16,
            videoUrl: 'https://www.youtube.com/watch?v=w2V0mYqF1zQ',
            description: 'Dissecting continuous authentication and dynamic risk assessment.',
            isFreePreview: true,
          },
        ],
      },
      {
        title: 'Advanced Penetration Testing & Web Exploit Engineering',
        slug: 'penetration-testing-web-exploit-engineering',
        category: 'Cybersecurity & Crypto',
        level: 'Advanced',
        instructor: instructor3._id,
        price: 89,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Master Burp Suite Pro, SSRF, prototype pollution, OAuth vulnerabilities, and memory corruption analysis.',
        description: 'Hands-on adversarial offensive cybersecurity. Learn to discover and responsibly exploit complex vulnerabilities in modern web applications, including Server-Side Request Forgery (SSRF), JWT cryptographic flaws, Prototype Pollution in Node.js, and API business logic bypasses.',
        requirements: ['Web development fundamentals', 'Basic Linux and terminal proficiency'],
        willLearn: [
          'Master Burp Suite Pro extensions, Match & Replace, and Intruder fuzzing',
          'Exploit cloud metadata services via blind and semi-blind SSRF vectors',
          'Analyze and exploit client-side prototype pollution in modern JavaScript',
          'Write professional penetration testing audit reports and CVSS remediation guides',
        ],
        tags: ['Ethical Hacking', 'Penetration Testing', 'Burp Suite', 'OWASP', 'Exploits'],
        rating: 4.98,
        numReviews: 780,
        enrollmentCount: 5940,
      },
      {
        title: 'Cloud Security Posture Management (CSPM) for AWS & Azure',
        slug: 'cloud-security-posture-management-aws-azure',
        category: 'Cybersecurity & Crypto',
        level: 'Intermediate',
        instructor: instructor3._id,
        price: 69,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Harden cloud infrastructures, automate compliance checks, and enforce least-privilege IAM controls.',
        description: 'Protect enterprise infrastructure from catastrophic data breaches. Master AWS IAM permission boundaries, KMS envelope encryption, GuardDuty anomaly detection, Azure Entra ID Conditional Access, and automated compliance auditing against CIS Benchmarks.',
        requirements: ['Familiarity with AWS or Azure cloud consoles'],
        willLearn: [
          'Detect and remediate cloud misconfigurations using open-source CSPM tools (Prowler, ScoutSuite)',
          'Implement least-privilege IAM policies with automated Access Analyzer audits',
          'Secure S3 buckets and Azure Blob storage with client-side KMS envelope keys',
          'Automate SOC 2 Type II and HIPAA compliance telemetry reporting',
        ],
        tags: ['Cloud Security', 'AWS Security', 'Azure', 'IAM', 'Compliance'],
        rating: 4.89,
        numReviews: 260,
        enrollmentCount: 2190,
      },
      {
        title: 'Applied Cryptography & Post-Quantum Encryption Primitives',
        slug: 'applied-cryptography-post-quantum-encryption',
        category: 'Cybersecurity & Crypto',
        level: 'Advanced',
        instructor: instructor3._id,
        price: 85,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Master elliptic curves, ChaCha20-Poly1305, zero-knowledge proofs, and NIST post-quantum algorithms (Kyber/Dilithium).',
        description: 'Explore theoretical and practical cryptography for modern software. Implement symmetric authenticated encryption, master Ed25519 digital signatures, understand zero-knowledge proof primitives, and prepare systems for quantum adversaries with NIST standardized lattice algorithms.',
        requirements: ['Discrete math or modular arithmetic fundamentals', 'Python or Rust programming'],
        willLearn: [
          'Implement secure authenticated encryption with ChaCha20-Poly1305 and AES-GCM',
          'Construct Diffie-Hellman key exchanges over elliptic curve Curve25519',
          'Understand ML-KEM (Kyber) and ML-DSA (Dilithium) post-quantum mechanisms',
          'Avoid dangerous cryptographic implementation flaws like nonce-reuse and timing attacks',
        ],
        tags: ['Cryptography', 'Post-Quantum', 'Encryption', 'Math', 'Security'],
        rating: 4.93,
        numReviews: 210,
        enrollmentCount: 1720,
      },
      {
        title: 'Defensive SIEM Engineering & Threat Hunting with Elastic & Splunk',
        slug: 'siem-engineering-threat-hunting-elastic-splunk',
        category: 'Cybersecurity & Crypto',
        level: 'Intermediate',
        instructor: instructor3._id,
        price: 0,
        isFree: true,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Detect advanced persistent threats (APTs) using Sigma rules, Sysmon event telemetry, and Elastic SIEM.',
        description: 'Become an elite Security Operations Center (SOC) analyst and threat hunter. Collect high-fidelity endpoint telemetry with Windows Sysmon and Linux auditd, author detection logic matching MITRE ATT&CK techniques, and build automated incident response playbooks.',
        requirements: ['Basic networking and operating system concepts'],
        willLearn: [
          'Ingest and parse heterogeneous security logs with Elastic Agent and Logstash',
          'Translate threat intelligence indicators into portable Sigma detection rules',
          'Hunt for lateral movement and credential dumping attacks across active directory',
          'Automate alert triage and containment with webhook incident response triggers',
        ],
        tags: ['SIEM', 'Threat Hunting', 'SOC', 'Splunk', 'Elasticsearch'],
        rating: 4.91,
        numReviews: 330,
        enrollmentCount: 2980,
      },

      // -----------------------------------------------------------------------
      // DOMAIN 5: Data Engineering & Big Data (4 Courses)
      // -----------------------------------------------------------------------
      {
        title: 'Real-Time Stream Processing with Apache Kafka & Apache Flink',
        slug: 'stream-processing-apache-kafka-apache-flink',
        category: 'Data Engineering',
        level: 'Advanced',
        instructor: instructor1._id,
        price: 89,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Build fault-tolerant event streaming pipelines with Kafka partitions, Schema Registry, and stateful Flink windows.',
        description: 'Process millions of events per second with sub-second latency. Master Apache Kafka cluster topography, partition rebalancing, Schema Registry compatibility rules, stateful stream joins, tumbling and sliding event-time windows in Apache Flink, and exactly-once processing guarantees.',
        requirements: ['Java, Python, or Scala programming proficiency', 'Basic distributed systems concepts'],
        willLearn: [
          'Architect high-throughput Kafka producer and consumer groups with backpressure control',
          'Enforce schema evolution and backward compatibility using Confluent Schema Registry',
          'Implement stateful event-time window aggregations and watermarks in Apache Flink',
          'Guarantee end-to-end exactly-once transactional semantics across downstream sinks',
        ],
        tags: ['Kafka', 'Apache Flink', 'Streaming', 'Data Engineering', 'Big Data'],
        rating: 4.97,
        numReviews: 490,
        enrollmentCount: 3870,
        lessons: [
          {
            section: 'Module 1: High-Throughput Event Streaming',
            title: '1. Kafka Internal Storage: Commit Logs, Partitions & Compaction',
            duration: 18,
            videoUrl: 'https://www.youtube.com/watch?v=Ch5VhJzaoaI',
            description: 'Zero-copy OS page caching, disk segment indexes, and replication mechanics.',
            isFreePreview: true,
          },
        ],
      },
      {
        title: 'Modern Data Stack with Snowflake, dbt & Apache Airflow',
        slug: 'modern-data-stack-snowflake-dbt-airflow',
        category: 'Data Engineering',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 69,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Architect modular cloud data warehouses using dbt transformations, Snowflake virtual compute, and Airflow DAGs.',
        description: 'Master modern analytical data engineering. Transition from cumbersome ETL to agile ELT. Model star and snowflake dimensional schemas in dbt, write Jinja macros and schema tests, configure Snowflake micro-partition pruning, and orchestrate automated dependency DAGs in Apache Airflow.',
        requirements: ['Strong SQL querying capabilities', 'Basic command-line familiarity'],
        willLearn: [
          'Design scalable Kimball dimensional models with facts and slowly changing dimensions (SCD)',
          'Write modular, version-controlled transformations, snapshots, and tests with dbt Core',
          'Optimize Snowflake query performance and warehouse auto-suspend compute costs',
          'Schedule production data pipeline DAGs with Apache Airflow and Slack alerts',
        ],
        tags: ['dbt', 'Snowflake', 'Airflow', 'SQL', 'Data Warehouse'],
        rating: 4.92,
        numReviews: 360,
        enrollmentCount: 3120,
      },
      {
        title: 'Distributed Big Data Engineering with PySpark & Delta Lake',
        slug: 'big-data-pyspark-delta-lake',
        category: 'Data Engineering',
        level: 'Intermediate',
        instructor: instructor2._id,
        price: 75,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Process multi-terabyte datasets with PySpark DataFrames, Catalyst query optimization, and Delta Lake ACID transactions.',
        description: 'Learn enterprise big data manipulation on Apache Spark and Databricks. Master Spark Catalyst query optimization, join strategies (broadcast vs shuffle hash), time-travel auditing with Delta Lake Parquet tables, and streaming telemetry ingestion with Structured Streaming.',
        requirements: ['Python programming syntax', 'Basic relational database knowledge'],
        willLearn: [
          'Write scalable DataFrame transformations without memory out-of-bounds errors',
          'Diagnose and tune Spark skew and shuffle partitions using the Spark Web UI',
          'Implement ACID transactions, schema enforcement, and time-travel queries with Delta Lake',
          'Deploy continuous real-time data ingestion using Spark Structured Streaming',
        ],
        tags: ['PySpark', 'Delta Lake', 'Databricks', 'Big Data', 'Python'],
        rating: 4.90,
        numReviews: 280,
        enrollmentCount: 2490,
      },
      {
        title: 'Data Lakehouse Architecture with Apache Iceberg & Trino',
        slug: 'data-lakehouse-apache-iceberg-trino',
        category: 'Data Engineering',
        level: 'Advanced',
        instructor: instructor1._id,
        price: 85,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Build open, vendor-neutral lakehouse tables with Apache Iceberg metadata layout and federated Trino SQL.',
        description: 'Escape proprietary cloud vendor lock-in. Implement open table formats with Apache Iceberg on Amazon S3 or MinIO. Master hidden partitioning, schema evolution, metadata snapshots, and sub-second distributed SQL execution over petabyte-scale datasets with Trino.',
        requirements: ['Experience with cloud object storage and distributed SQL engines'],
        willLearn: [
          'Understand Apache Iceberg metadata manifest files and snapshot isolation',
          'Perform seamless in-place partition and schema evolution without data rewrites',
          'Configure high-concurrency Trino cluster query engines for federated analytics',
          'Integrate Iceberg catalogs with AWS Glue, Nessie, and Apache Polaris',
        ],
        tags: ['Apache Iceberg', 'Trino', 'Lakehouse', 'Data Architecture', 'SQL'],
        rating: 4.94,
        numReviews: 195,
        enrollmentCount: 1650,
      },

      // -----------------------------------------------------------------------
      // DOMAIN 6: Systems Programming, High-Performance & Rust (4 Courses)
      // -----------------------------------------------------------------------
      {
        title: 'Systems Programming with Modern Rust & Memory Safety',
        slug: 'systems-programming-modern-rust',
        category: 'Systems & Rust',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 79,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Master Rust ownership, lifetimes, fearless concurrency, zero-cost abstractions, and asynchronous Tokio runtimes.',
        description: 'Learn why industry giants are rewriting foundational systems in Rust. Master the borrow checker, stack vs heap allocation, trait-based polymorphism, safe concurrency across threads, and build high-performance asynchronous network servers with the Tokio runtime.',
        requirements: ['Experience in C, C++, Go, or intermediate JavaScript/Python'],
        willLearn: [
          'Internalize Rust ownership and borrow semantics to eradicate segmentation faults',
          'Write idiomatic error handling using Result, Option, and the ? try operator',
          'Build concurrent multi-threaded applications using Channels and Arc<Mutex<T>>',
          'Architect high-throughput asynchronous network daemons with Tokio and Axum',
        ],
        tags: ['Rust', 'Systems Programming', 'Tokio', 'Memory Safety', 'Concurrency'],
        rating: 4.99,
        numReviews: 920,
        enrollmentCount: 7150,
        lessons: [
          {
            section: 'Module 1: The Rust Memory Model',
            title: '1. Stack, Heap, Ownership & Borrow Checker Invariants',
            duration: 17,
            videoUrl: 'https://www.youtube.com/watch?v=usJD0NEqKaE',
            description: 'Why Rust needs no garbage collector while guaranteeing memory safety.',
            isFreePreview: true,
          },
        ],
      },
      {
        title: 'High-Performance WebAssembly (Wasm) & WASI Runtimes',
        slug: 'high-performance-webassembly-wasi',
        category: 'Systems & Rust',
        level: 'Advanced',
        instructor: instructor1._id,
        price: 69,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Compile native Rust and C++ modules to WebAssembly for browser sandboxes and edge serverless runtimes.',
        description: 'Take high-performance computing to the web and edge. Compile complex computational algorithms to Wasm bytecode with wasm-pack and wasm-bindgen. Explore the WebAssembly System Interface (WASI) to run secure, sandboxed micro-services with Wasmtime and Cloudflare Workers.',
        requirements: ['Basic familiarity with Rust or C/C++ and web development'],
        willLearn: [
          'Compile Rust algorithms to Wasm and bridge JavaScript linear memory efficiently',
          'Run CPU-intensive image and audio processing tasks in the browser at near-native speed',
          'Deploy ultra-lightweight, millisecond-cold-start edge workers with WASI and Wasmtime',
          'Understand Wasm component models and cross-language interoperability',
        ],
        tags: ['WebAssembly', 'Wasm', 'WASI', 'Rust', 'Edge Computing'],
        rating: 4.91,
        numReviews: 210,
        enrollmentCount: 1790,
      },
      {
        title: 'Linux Kernel Engineering & eBPF Telemetry Development',
        slug: 'linux-kernel-engineering-ebpf-development',
        category: 'Systems & Rust',
        level: 'Advanced',
        instructor: instructor1._id,
        price: 99,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Program the Linux kernel safely with eBPF, XDP network packet processing, and Aya/Cilium tooling.',
        description: 'Revolutionize Linux observability, security, and networking without changing kernel source code or loading unstable modules. Write eBPF kernel bytecode programs attached to kprobes and tracepoints, process packets at wire speed with eXpress Data Path (XDP), and load programs using Rust with Aya.',
        requirements: ['Proficiency with C or Rust and low-level Linux systems programming'],
        willLearn: [
          'Understand eBPF verifier safety guarantees and kernel ring-buffer communication',
          'Attach tracepoints, kprobes, and uprobes to profile live Linux kernel events',
          'Filter and route multi-gigabit network traffic with XDP driver hook points',
          'Write userspace control loaders and metrics exporters using Rust and Aya',
        ],
        tags: ['Linux', 'eBPF', 'Kernel', 'XDP', 'Systems'],
        rating: 4.95,
        numReviews: 340,
        enrollmentCount: 2680,
      },
      {
        title: 'GPU Kernel Programming with Triton & CUDA for AI Acceleration',
        slug: 'gpu-kernel-programming-triton-cuda',
        category: 'Systems & Rust',
        level: 'Advanced',
        instructor: instructor2._id,
        price: 110,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Write ultra-fast custom GPU kernels, SRAM memory tiling, and fused attention operators using OpenAI Triton.',
        description: 'Unlock maximum hardware FLOPS on modern NVIDIA architectures. Learn CUDA thread hierarchy, warp shuffle operations, shared memory bank conflict resolution, and master OpenAI Triton to author custom fused matrix multiplication (GEMM) and FlashAttention kernels in high-level Python.',
        requirements: ['Solid Python/PyTorch background and understanding of matrix mathematics'],
        willLearn: [
          'Understand GPU hardware anatomy: Streaming Multiprocessors (SMs), Tensor Cores, and HBM',
          'Write block-level SRAM memory tiling algorithms using OpenAI Triton',
          'Implement fused layer normalization and FlashAttention kernels with zero VRAM roundtrips',
          'Benchmark and profile GPU kernels with NVIDIA Nsight Compute',
        ],
        tags: ['CUDA', 'Triton', 'GPU', 'AI Acceleration', 'High-Performance'],
        rating: 4.98,
        numReviews: 450,
        enrollmentCount: 3410,
      },

      // -----------------------------------------------------------------------
      // DOMAIN 7: Mobile App Development (4 Courses)
      // -----------------------------------------------------------------------
      {
        title: 'Cross-Platform Mobile Engineering with Flutter & Dart 3',
        slug: 'mobile-engineering-flutter-dart-3',
        category: 'Mobile Development',
        level: 'Beginner',
        instructor: instructor1._id,
        price: 59,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Build beautiful, natively compiled 120fps iOS and Android applications with Flutter and Riverpod.',
        description: 'Complete roadmap to professional multi-platform mobile engineering. Master Dart 3 pattern matching and records, build responsive UI widget hierarchies, manage complex state with Riverpod 2.0, implement offline-first SQLite synchronization, and integrate native device camera and biometric sensors.',
        requirements: ['Basic programming logic in any object-oriented language'],
        willLearn: [
          'Design expressive, pixel-perfect responsive layouts with Flutter widgets',
          'Manage global application state reactively using Riverpod and code generation',
          'Build offline-first data architectures with local SQLite databases and REST sync',
          'Publish apps to Apple App Store and Google Play Store with CI/CD automation',
        ],
        tags: ['Flutter', 'Dart', 'Mobile', 'iOS', 'Android'],
        rating: 4.93,
        numReviews: 540,
        enrollmentCount: 4670,
        lessons: [
          {
            section: 'Module 1: Flutter & Dart Foundations',
            title: '1. Dart 3 Features: Pattern Matching, Records & Sound Null Safety',
            duration: 16,
            videoUrl: 'https://www.youtube.com/watch?v=1ukSR1GRtMU',
            description: 'Modern Dart syntax and build pipeline setup.',
            isFreePreview: true,
          },
        ],
      },
      {
        title: 'React Native 0.76+ & Expo New Architecture Masterclass',
        slug: 'react-native-expo-new-architecture',
        category: 'Mobile Development',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 69,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Harness the React Native New Architecture (Fabric renderer, TurboModules) with Expo Router.',
        description: 'Upgrade your React skills to native iOS and Android apps. Master the React Native New Architecture featuring JSI, TurboModules, and the Fabric concurrent renderer. Build file-based navigation with Expo Router, smooth 60fps gestures with React Native Reanimated 3, and native push notifications.',
        requirements: ['Solid React and JavaScript/TypeScript foundations'],
        willLearn: [
          'Leverage Expo Router for universal file-based deep linking and route protection',
          'Create high-performance fluid gestures and spring physics with Reanimated 3',
          'Communicate directly with native C++ APIs using JSI and TurboModules',
          'Configure OTA (Over-The-Air) instant updates and EAS builds in the cloud',
        ],
        tags: ['React Native', 'Expo', 'Mobile', 'TypeScript', 'Cross-Platform'],
        rating: 4.90,
        numReviews: 380,
        enrollmentCount: 3240,
      },
      {
        title: 'Native iOS 18 Development with Swift 6 & SwiftUI',
        slug: 'native-ios-18-swift-6-swiftui',
        category: 'Mobile Development',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 79,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Build native iOS 18 apps with modern Swift 6 strict concurrency, SwiftData persistence, and interactive widgets.',
        description: 'Craft premium native experiences for iPhone and iPad. Master Swift 6 strict concurrency (actors, tasks, sendable types), declarative SwiftUI animations, Apple SwiftData persistence, interactive Dynamic Island Live Activities, and integration with Apple Intelligence APIs.',
        requirements: ['A Mac computer with Xcode 16+ installed'],
        willLearn: [
          'Write data-race-free concurrent Swift 6 code using structured concurrency and actors',
          'Model relational application schemas with SwiftData and CloudKit synchronization',
          'Build lock-screen Live Activities and interactive home-screen widgets with WidgetKit',
          'Adopt Apple Human Interface Guidelines for iOS 18 spatial glass interfaces',
        ],
        tags: ['iOS 18', 'Swift 6', 'SwiftUI', 'Apple', 'Mobile'],
        rating: 4.96,
        numReviews: 420,
        enrollmentCount: 3580,
      },
      {
        title: 'Modern Android Engineering with Kotlin & Jetpack Compose',
        slug: 'modern-android-kotlin-jetpack-compose',
        category: 'Mobile Development',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 0,
        isFree: true,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1576400883215-7083980b6197?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Build responsive, reactive Android apps using Kotlin coroutines, Jetpack Compose, and Clean Architecture.',
        description: 'The definitive guide to modern Android application engineering. Build declarative UIs with Jetpack Compose, structure scalable projects using Clean Architecture and MVI/MVVM, manage asynchronous streams with Kotlin Coroutines and StateFlow, and inject dependencies with Hilt/Dagger.',
        requirements: ['Basic Java or Kotlin programming knowledge', 'Android Studio installed'],
        willLearn: [
          'Design fluid, material 3 declarative user interfaces with Jetpack Compose',
          'Handle asynchronous reactive state management with Kotlin Coroutines & Flow',
          'Persist local relational data with Android Room database and encryption',
          'Architect enterprise Android apps with Hilt dependency injection',
        ],
        tags: ['Android', 'Kotlin', 'Jetpack Compose', 'Mobile', 'Clean Architecture'],
        rating: 4.91,
        numReviews: 310,
        enrollmentCount: 2790,
      },

      // -----------------------------------------------------------------------
      // DOMAIN 8: Web3, Blockchain & Smart Contracts (2 Courses)
      // -----------------------------------------------------------------------
      {
        title: 'Solidity Smart Contract Security & DeFi Protocol Engineering',
        slug: 'solidity-smart-contract-security-defi',
        category: 'Blockchain & Web3',
        level: 'Advanced',
        instructor: instructor3._id,
        price: 89,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Architect gas-optimized EVM protocols, automated market makers (AMMs), and defend against reentrancy attacks.',
        description: 'Build and audit mission-critical smart contracts on Ethereum and EVM-compatible networks. Learn to build constant product AMM decentralized exchanges, lending pools with flash loans, master Foundry test suites and invariant fuzz testing, and prevent famous exploits like reentrancy and oracle manipulation.',
        requirements: ['Familiarity with programming concepts and basic understanding of blockchain cryptography'],
        willLearn: [
          'Write gas-efficient Solidity code using custom assembly (Yul) and EVM memory layouts',
          'Design automated market maker (AMM) decentralized exchange contracts',
          'Perform rigorous invariant property and fuzz testing with Foundry',
          'Audit and secure contracts against reentrancy, front-running, and flash loan attacks',
        ],
        tags: ['Solidity', 'Ethereum', 'DeFi', 'Smart Contracts', 'Web3'],
        rating: 4.95,
        numReviews: 410,
        enrollmentCount: 3180,
      },
      {
        title: 'Solana Blockchain Development with Rust & Anchor Framework',
        slug: 'solana-development-rust-anchor',
        category: 'Blockchain & Web3',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 79,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Build high-throughput, low-fee decentralized applications on Solana using Rust and the Anchor framework.',
        description: 'Master the high-speed Solana ecosystem. Understand Solana’s unique account model, Program Derived Addresses (PDAs), Cross-Program Invocations (CPI), serialize on-chain state with Borsh, and write declarative on-chain programs using the industry-standard Anchor framework.',
        requirements: ['Basic Rust programming language syntax'],
        willLearn: [
          'Master Solana’s account model, rent exemption, and transaction instruction formatting',
          'Generate deterministic state accounts using Program Derived Addresses (PDAs)',
          'Write secure on-chain programs with Anchor account validation macros',
          'Connect React and Next.js frontends to Solana wallets using @solana/web3.js',
        ],
        tags: ['Solana', 'Rust', 'Anchor', 'Web3', 'Blockchain'],
        rating: 4.89,
        numReviews: 230,
        enrollmentCount: 1940,
      },

      // -----------------------------------------------------------------------
      // DOMAIN 9: UI/UX Design, Design Systems & 3D Interactive (2 Courses)
      // -----------------------------------------------------------------------
      {
        title: 'Enterprise Design Systems with Figma Tokens & Component Variants',
        slug: 'enterprise-design-systems-figma-tokens',
        category: 'UI/UX & Design Systems',
        level: 'All Levels',
        instructor: instructor1._id,
        price: 49,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Architect scalable design systems in Figma with variables, semantic color hierarchies, and GitHub token sync.',
        description: 'Bridge the gap between digital design and front-end code. Create comprehensive design systems in Figma using dynamic variable collections for multi-theme dark/light modes, modular auto-layout components with property variants, WCAG 2.2 accessibility audits, and automated token sync with Style Dictionary.',
        requirements: ['No prior design experience required; curiosity for UI design'],
        willLearn: [
          'Structure multi-tier design tokens (Global, Semantic, Component)',
          'Build resilient, auto-layout responsive components with boolean and variant props',
          'Audit and ensure color contrast compliance with WCAG 2.2 AA and AAA standards',
          'Automate continuous token synchronization between Figma and Tailwind CSS',
        ],
        tags: ['Figma', 'Design Systems', 'UI/UX', 'Tailwind', 'Design Tokens'],
        rating: 4.97,
        numReviews: 610,
        enrollmentCount: 4890,
      },
      {
        title: '3D Web Graphics & Spatial Interactive Experiences with Three.js & WebGL',
        slug: '3d-web-graphics-threejs-webgl',
        category: 'UI/UX & Design Systems',
        level: 'Intermediate',
        instructor: instructor1._id,
        price: 65,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Create immersive 3D web environments, interactive product visualizers, and custom GLSL shaders.',
        description: 'Transform standard flat websites into cutting-edge spatial experiences. Master Three.js scenes, camera optics, PBR lighting, custom vertex and fragment shaders with GLSL, loading optimized GLTF/GLB models, post-processing bloom effects, and physics animations with Rapier.js.',
        requirements: ['Intermediate JavaScript and basic HTML canvas familiarity'],
        willLearn: [
          'Create smooth 60fps 3D scenes with camera controls, orbit controls, and raycasting',
          'Author custom vertex and fragment shader materials with GLSL math',
          'Optimize 3D models with DRACO compression and mipmapped textures',
          'Integrate Three.js canvas components seamlessly into React and Next.js applications',
        ],
        tags: ['Three.js', 'WebGL', '3D Graphics', 'GLSL', 'Creative Coding'],
        rating: 4.93,
        numReviews: 290,
        enrollmentCount: 2310,
      },

      // -----------------------------------------------------------------------
      // DOMAIN 10: Emerging Technologies & Quantum Computing (2 Courses)
      // -----------------------------------------------------------------------
      {
        title: 'Applied Quantum Computing & Algorithms with IBM Qiskit',
        slug: 'applied-quantum-computing-ibm-qiskit',
        category: 'Quantum & Emerging Tech',
        level: 'Advanced',
        instructor: instructor2._id,
        price: 95,
        isFree: false,
        isFeatured: true,
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Simulate qubit superposition, entanglement, Grover search, and Variational Quantum Eigensolver (VQE).',
        description: 'Step into the next computational frontier. Understand the mathematics of qubits, superposition, quantum phase kickback, and Bell state entanglement. Write and simulate quantum circuits using IBM Qiskit, execute quantum teleportation, and run hybrid classical-quantum optimization algorithms (VQE) on real cloud quantum hardware.',
        requirements: ['Basic linear algebra (vectors, matrices) and Python syntax'],
        willLearn: [
          'Manipulate single and multi-qubit gates (Hadamard, CNOT, Phase gates) on the Bloch sphere',
          'Implement quantum teleportation and superdense coding protocols',
          'Build Grover’s quantum search algorithm for quadratic speedup over classical databases',
          'Submit and execute quantum circuits on real IBM Quantum superconducting hardware via cloud APIs',
        ],
        tags: ['Quantum Computing', 'Qiskit', 'IBM Quantum', 'Physics', 'Python'],
        rating: 4.96,
        numReviews: 380,
        enrollmentCount: 2890,
      },
      {
        title: 'Edge AI & Embedded Machine Learning with TinyML & Raspberry Pi',
        slug: 'edge-ai-tinyml-raspberry-pi',
        category: 'Quantum & Emerging Tech',
        level: 'Intermediate',
        instructor: instructor2._id,
        price: 55,
        isFree: false,
        isFeatured: false,
        thumbnail: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&auto=format&fit=crop&q=80',
        shortDescription: 'Deploy neural network inference on milliwatt microcontrollers and edge devices with TensorFlow Lite.',
        description: 'Bring deep learning models to low-power edge hardware. Learn model quantization techniques (FP32 to INT8), pruning, and deploying vision, audio keyword spotting, and anomaly detection neural networks on microcontrollers and embedded Linux single-board computers like Raspberry Pi 5 and ESP32.',
        requirements: ['Basic Python or C++ experience', 'Familiarity with machine learning concepts'],
        willLearn: [
          'Quantize neural networks to 8-bit integers (INT8) with zero significant accuracy degradation',
          'Deploy real-time audio keyword spotting models with TensorFlow Lite for Microcontrollers',
          'Implement low-latency computer vision pipelines on edge Raspberry Pi devices',
          'Measure and optimize milliwatt power consumption for battery-powered IoT nodes',
        ],
        tags: ['TinyML', 'Edge AI', 'IoT', 'Raspberry Pi', 'Embedded'],
        rating: 4.88,
        numReviews: 240,
        enrollmentCount: 1950,
      },
    ];

    console.log(`[Seed] Creating ${courseDefinitions.length} real courses with curriculum...`);
    const createdCourses = [];

    for (const cData of courseDefinitions) {
      const lessonsData = cData.lessons || [
        {
          section: 'Module 1: Foundations & Architecture',
          title: `1. Introduction to ${cData.title.split(':')[0]}`,
          duration: 15,
          videoUrl: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
          description: `Core conceptual foundations and architecture setup for ${cData.title}.`,
          isFreePreview: true,
        },
        {
          section: 'Module 1: Foundations & Architecture',
          title: '2. Deep Dive: Architectural Design & Implementation',
          duration: 22,
          videoUrl: 'https://www.youtube.com/watch?v=SccSCuHhOw0',
          description: 'Hands-on practical walkthrough building the core components.',
          isFreePreview: false,
        },
        {
          section: 'Module 2: Advanced Engineering & Capstone',
          title: '3. Production Best Practices, Security & Deployment',
          duration: 25,
          videoUrl: 'https://www.youtube.com/watch?v=1BfCnjr_Vjg',
          description: 'Production deployment checklist, monitoring, and performance tuning.',
          isFreePreview: false,
        },
      ];

      const course = await Course.create({
        title: cData.title,
        slug: cData.slug,
        description: cData.description,
        shortDescription: cData.shortDescription,
        category: cData.category,
        level: cData.level,
        instructor: cData.instructor,
        thumbnail: cData.thumbnail,
        price: cData.price,
        isFree: cData.isFree,
        isPublished: true,
        published: true,
        isFeatured: cData.isFeatured,
        requirements: cData.requirements,
        willLearn: cData.willLearn,
        tags: cData.tags,
        rating: cData.rating,
        numReviews: cData.numReviews,
        enrollmentCount: cData.enrollmentCount,
      });

      createdCourses.push(course);

      // Create lessons for this course
      const createdLessons = [];
      let orderIndex = 1;
      for (const l of lessonsData) {
        const lesson = await Lesson.create({
          course: course._id,
          section: l.section,
          title: l.title,
          order: orderIndex++,
          duration: l.duration,
          videoUrl: l.videoUrl,
          videoType: 'youtube',
          description: l.description,
          isFreePreview: l.isFreePreview || false,
        });
        createdLessons.push(lesson);
      }

      // Add a quiz to the flagship courses
      if (cData.isFeatured && createdLessons.length > 0) {
        await Quiz.create({
          course: course._id,
          lesson: createdLessons[createdLessons.length - 1]._id,
          title: `${course.title.slice(0, 50)}: Assessment Quiz`,
          description: `Test your mastery of the concepts covered in ${course.title}.`,
          passingScore: 75,
          timeLimitMinutes: 15,
          questions: [
            {
              questionText: `What is the primary architectural principle emphasized in ${course.title}?`,
              options: [
                'Stateless design, clear separation of concerns, and verifiable reliability',
                'Hardcoding configurations directly inside monolithic endpoints',
                'Ignoring error handling in asynchronous workflows',
                'Relying solely on client-side state without persistence',
              ],
              correctAnswer: 0,
              marks: 10,
              explanation: 'Enterprise production systems prioritize clear boundaries, stateless design, and resilient architecture.',
            },
            {
              questionText: 'When deploying this technology to production, what is the best practice for configuration management?',
              options: [
                'Commit API keys into public git repositories',
                'Use environment variables, secrets management vaults, and 12-factor principles',
                'Send unencrypted keys over HTTP query parameters',
                'Disable SSL/TLS encryption to increase throughput',
              ],
              correctAnswer: 1,
              marks: 10,
              explanation: 'Secrets should always be managed securely via environment vaults and strict access control.',
            },
          ],
        });
      }
    }

    console.log(`[Seed] Successfully created ${createdCourses.length} real courses and curricula.`);

    // =========================================================================
    // STUDENT ENROLLMENTS & VERIFIED CREDENTIALS
    // =========================================================================
    console.log('[Seed] Enrolling student Jordan Lee in active courses...');

    // Enroll in the first 4 flagship courses with realistic progress
    const enrolledCourse1 = createdCourses[0]; // Agentic AI
    const enrolledCourse2 = createdCourses[5]; // Kubernetes
    const enrolledCourse3 = createdCourses[10]; // Next.js 15
    const enrolledCourse4 = createdCourses[15]; // Zero-Trust Security

    // 1. Completed course with Certificate (Agentic AI)
    const cert1 = await Certificate.create({
      student: student._id,
      course: enrolledCourse1._id,
      certificateId: 'CERT-LMS-2026-AI01',
      issueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      grade: 'Distinction (98%)',
      instructorName: 'Dr. Elena Vance',
    });

    await Enrollment.create({
      student: student._id,
      course: enrolledCourse1._id,
      completed: true,
      completionPercentage: 100,
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      certificate: cert1._id,
    });

    // Also create demo certificate code for immediate verification testing
    await Certificate.create({
      student: student._id,
      course: enrolledCourse2._id,
      certificateId: 'CERT-LMS-2026-DEMO',
      issueDate: new Date(),
      grade: 'Honors (96%)',
      instructorName: 'Prof. Alex Rivera',
    });

    // 2. In-Progress course (Kubernetes - 65% progress)
    await Enrollment.create({
      student: student._id,
      course: enrolledCourse2._id,
      completed: false,
      completionPercentage: 65,
    });

    // 3. In-Progress course (Next.js 15 - 40% progress)
    await Enrollment.create({
      student: student._id,
      course: enrolledCourse3._id,
      completed: false,
      completionPercentage: 40,
    });

    // 4. Recently enrolled course (Zero-Trust - 15% progress)
    await Enrollment.create({
      student: student._id,
      course: enrolledCourse4._id,
      completed: false,
      completionPercentage: 15,
    });

    // Student 2 enrollment
    await Enrollment.create({
      student: student2._id,
      course: createdCourses[20]._id, // Kafka & Flink
      completed: false,
      completionPercentage: 50,
    });

    // Create notifications for the student
    await Notification.create({
      recipient: student._id,
      title: '🎓 Certificate Issued!',
      message: 'Congratulations! Your official Certificate of Excellence in Agentic AI has been verified and minted.',
      type: 'certificate',
      link: '/student/certificates',
    });

    await Notification.create({
      recipient: student._id,
      title: '🚀 38 New Cutting-Edge Courses Live',
      message: 'Explore courses in AI, Cloud Architecture, Next.js 15, Rust, Cybersecurity, and Quantum Computing.',
      type: 'system',
      link: '/courses',
    });

    console.log('[Seed] Seeding completed successfully!');
    console.log(`[Seed] Total Courses Seeded: ${createdCourses.length}`);
    console.log('[Seed] Real courses now populate the database across all 10 technology domains.');
  } catch (err) {
    console.error('[Seed] Database seeding failed:', err);
    throw err;
  }
};

// If run directly via `node src/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      console.log('[Seed] Finished. Disconnecting...');
      await closeDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed] Fatal error:', err);
      await closeDB();
      process.exit(1);
    });
}
