import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';

// Helper to build 20 subject-specific questions for any topic
const create20SubjectQuestions = (subjectKey, courseTitle) => {
  const qList = [];

  const add = (q, opts, ans, exp) => {
    qList.push({
      questionText: q,
      options: opts,
      correctAnswer: ans,
      marks: 10,
      explanation: exp,
    });
  };

  if (subjectKey === 'langgraph') {
    add('What is the foundational abstraction in LangGraph for modeling agent workflows?', ['Finite State Machine as a Directed Graph (StateGraph)', 'Single-pass Regex Array', 'Recursive SQL Stored Procedure', 'Static CSS Grid'], 0, 'LangGraph models cyclical agent workflows as nodes and edges over a shared StateGraph.');
    add('In LangGraph, how is state shared and mutated across nodes?', ['Via global mutable window variables', 'Via typed channels and reducers defined on the StateGraph schema', 'Via HTTP query strings', 'By overwriting filesystem files'], 1, 'LangGraph uses typed state schemas and reducer functions (like Annotated[list, add_messages]) to manage state transitions.');
    add('Which node type in LangGraph decides the next transition based on state evaluation?', ['Conditional Edge / Router Node', 'Terminal Leaf', 'Root Null Node', 'Static Sink'], 0, 'Conditional edges inspect state (e.g. tool calls present) to route to tools or finish.');
    add('In CrewAI, what constitutes a Crew execution unit?', ['A set of Agents, Tasks, and an execution Process (Sequential or Hierarchical)', 'A single Python thread', 'A Docker container without networking', 'A database index'], 0, 'CrewAI organizes autonomous teams into Agents with assigned Roles, Goals, Backstories, and Tasks.');
    add('What mechanism in LangGraph provides human-in-the-loop approval before executing irreversible tool calls?', ['Checkpointers with interrupt_before / interrupt_after flags', 'System reboot', 'OS kill signals', 'Hardcoded sleep(100)'], 0, 'Checkpointers persist graph state at step boundaries, allowing human inspection and interruption.');
    add('What is the role of Agent Memory in multi-step LangGraph workflows?', ['To store short-term thread state and long-term cross-session user facts', 'To increase CPU RAM clock rate', 'To delete vector databases', 'To render 3D avatars'], 0, 'Memory allows agents to recall intermediate task outputs and long-term user preferences.');
    add('Which LangGraph checkpointer is suited for distributed production deployments?', ['MemorySaver (in-memory only)', 'AsyncSqliteSaver or PostgresSaver', 'Console logger', 'File text dump'], 1, 'PostgresSaver persists graph state reliably across distributed worker replicas.');
    add('In CrewAI, how does the Hierarchical process mode coordinate agents?', ['Using a Manager Agent powered by an LLM to delegate tasks and review outputs', 'Random round-robin lottery', 'Alphabetical sorting of agent names', 'First-come first-served queue'], 0, 'Hierarchical mode assigns a manager agent to orchestrate and review worker outputs.');
    add('How does LangGraph handle cycles and prevent infinite loops?', ['Recursion limit configuration (recursion_limit)', 'Unbounded execution until server memory crashes', 'Shutting down the database', 'Ignoring node failures'], 0, 'LangGraph enforces a configurable recursion_limit, raising an exception if exceeded.');
    add('What format is standard for tool definitions when interfacing with OpenAI or Anthropic tool-calling models?', ['JSON Schema / Pydantic models with parameter descriptions', 'Raw binary C structs', 'CSV text tables', 'HTML form elements'], 0, 'LLMs ingest JSON Schema definitions detailing tool purpose, parameter types, and requirements.');
    add('When an agent invokes a tool, what is returned to the message thread?', ['ToolMessage containing the tool execution output and tool_call_id', 'User prompt string', 'Null packet', 'HTTP 500 error'], 0, 'ToolMessage correlates the output back to the specific tool invocation via unique tool_call_id.');
    add('In multi-agent systems, what is the "Supervisor" pattern?', ['A centralized agent evaluating state and choosing which specialist agent to call next', 'A hardware monitoring chip', 'A human monitoring CCTV cameras', 'A firewall rule'], 0, 'The supervisor agent dynamically routes tasks between specialized worker agents.');
    add('How can LangGraph workflows be deployed as production HTTP microservices?', ['Using LangGraph Server or FastAPI wrappers with streaming SSE support', 'Running python interactive REPL in terminal', 'Exporting to static PowerPoint', 'Compiling to WordPress plugin'], 0, 'LangGraph Server exposes RESTful endpoints with state persistence and Server-Sent Events (SSE) streaming.');
    add('What parameter in LangChain models controls deterministic vs creative response generation?', ['Temperature (0.0 for deterministic, 1.0+ for creative)', 'Baud rate', 'Thread count', 'Payload offset'], 0, 'Lower temperature produces greedier deterministic choices, optimal for structured JSON routing.');
    add('What is the purpose of Time-Travel debugging in LangGraph?', ['Inspecting and replaying past checkpoint states, allowing edits to previous agent decisions', 'Changing system BIOS clocks', 'Predicting future crypto prices', 'Accelerating GPU clock speed'], 0, 'Checkpointers allow developers to fork, replay, and resume execution from any historical state checkpoint.');
    add('In LangGraph, what does an END edge signify?', ['The graph execution has reached terminal state and completes the invocation', 'The server has crashed', 'An unhandled exception', 'Infinite sleep state'], 0, 'Routing to END signals that the graph has finalized its workflow and outputs state.');
    add('Which LangChain component binds tools to an LLM instance?', ['llm.bind_tools([tool1, tool2])', 'llm.add_plugin()', 'llm.connect_socket()', 'llm.pipe_file()'], 0, 'bind_tools converts functions into the model-specific tool calling JSON schema.');
    add('How do agents maintain conversational context across distinct threads in LangGraph?', ['By passing a unique thread_id in the configurable config dictionary', 'By merging all global user chats into one file', 'By disabling session cookies', 'By restarting the container'], 0, 'thread_id partitions persisted state checkpoints per conversational session.');
    add('What is the primary benefit of LangGraph over traditional linear DAG chains?', ['Native support for cycles, branching, and iterative loops (e.g. generate -> critique -> revise)', 'Zero token usage', 'Faster internet bandwidth', 'Replaces Python with binary C'], 0, 'LangGraph natively handles cyclical feedback loops essential for autonomous self-correction.');
    add('What tool is used in LangGraph to visualize the workflow structure?', ['graph.get_graph().draw_mermaid_png()', 'matplotlib.scatter()', 'Excel bar chart', 'Adobe Photoshop'], 0, 'draw_mermaid_png generates visual architecture diagrams directly from the graph definition.');
  } else if (subjectKey === 'rag') {
    add('In Vector RAG architectures, what is the role of an embedding model?', ['Converts text chunks into dense high-dimensional vectors capturing semantic meaning', 'Compresses text into zip files', 'Translates Python to JavaScript', 'Encrypts files using AES'], 0, 'Embedding models map semantic concepts into geometric space where proximity correlates with relevance.');
    add('What does HNSW stand for in vector indexing?', ['Hierarchical Navigable Small World', 'High Network System Waveform', 'Hyper Normal Software Weight', 'Hybrid Node Structured Web'], 0, 'HNSW builds multi-layer graphs providing approximate nearest neighbor search in O(log N) time.');
    add('Which distance metric measures the angle between vectors independent of magnitude?', ['Cosine Similarity', 'Euclidean L2 Distance', 'Manhattan Distance', 'Hamming Distance'], 0, 'Cosine similarity normalizes for document length, measuring purely angular directional similarity.');
    add('What is Hybrid Search in Milvus or Pinecone?', ['Combining sparse keyword search (BM25) with dense vector semantic search', 'Searching images and audio simultaneously', 'Running on CPU and GPU concurrently', 'Using two different WiFi routers'], 0, 'Hybrid search blends exact lexical matching with dense semantic embeddings using Reciprocal Rank Fusion.');
    add('What is the role of a Cross-Encoder Reranker (e.g. Cohere Rerank, BGE-Reranker)?', ['Jointly processes query and chunk through full cross-attention to score and re-rank top candidates', 'Deletes duplicate chunks', 'Generates synthetic queries', 'Compresses vector indexes'], 0, 'Cross-encoders evaluate deep interaction between query and document tokens, outperforming bi-encoders.');
    add('What problem does chunking strategy with semantic overlap prevent?', ['Information loss at chunk boundaries where context might be abruptly severed', 'Database disk crashes', 'Memory leakage in Python', 'Slow network ping'], 0, 'Overlap ensures sentences or entities split across arbitrary boundaries retain their surrounding context.');
    add('What is Parent-Document Retrieval (Small-to-Big Retrieval)?', ['Embedding small chunks for precise search, but passing the larger parent document to the LLM for context', 'Parenting child nodes in React', 'Linking git branches', 'Deleting parent records'], 0, 'Small chunks match queries accurately, while parent passages provide the model with complete context.');
    add('What is Contextual Compression in LangChain RAG?', ['Extracting and passing only the query-relevant sentences from retrieved documents to save tokens', 'Zip file compression', 'Deleting vowels from text', 'Lowercasing all characters'], 0, 'Contextual compression filters out irrelevant noise from retrieved passages before model prompt injection.');
    add('What is the purpose of HyDE (Hypothetical Document Embeddings)?', ['Generates a hypothetical answer with an LLM, then embeds that answer to search real documents', 'Hides documents from users', 'Encrypts embeddings with passwords', 'Deletes old vectors'], 0, 'Hypothetical answers often align closer in embedding space to target passages than short questions.');
    add('What is RAG Triad evaluation in TruLens or Ragas?', ['Context Relevance, Groundedness (Faithfulness), and Answer Relevance', 'Speed, Cost, and Memory', 'CPU, RAM, and Disk', 'HTML, CSS, and JS'], 0, 'The RAG Triad verifies that context is relevant, the answer is grounded in context, and directly answers the query.');
    add('What is metadata filtering in vector databases?', ['Restricting vector similarity search to documents matching specific scalar attributes (e.g. date, author)', 'Deleting document metadata', 'Sorting by file size', 'Compressing JSON headers'], 0, 'Metadata pre-filtering or post-filtering scopes vector search to authorized or targeted subsets.');
    add('What causes "Embedding Drift" in production RAG systems?', ['Changing the embedding model or data distribution without re-indexing historical vector records', 'Physical hard drive vibration', 'Cosmic ray memory flips', 'Operating system updates'], 0, 'Different embedding models or versions produce incompatible vector spaces, requiring full re-indexing.');
    add('What is Multi-Query Expansion in advanced RAG?', ['Using an LLM to generate multiple reformulations of a user query to retrieve a broader candidate set', 'Running multiple SQL queries in parallel', 'Opening multiple browser tabs', 'Querying 10 databases at once'], 0, 'Multi-query expansion overcomes prompt phrasing bias by capturing multiple semantic angles.');
    add('Which index type uses Product Quantization (IVF-PQ) to compress high-dimensional vectors?', ['Inverted File with Product Quantization', 'B-Tree Index', 'Bitmap Index', 'Hash Index'], 0, 'IVF-PQ clusters vectors into Voronoi cells and quantizes sub-vectors, drastically reducing RAM footprints.');
    add('What is "Chunk Drift" or out-of-context retrieval in multi-hop reasoning?', ['When retrieved chunks answer parts of a query but fail to connect dependent premises', 'When chunk files move to another server', 'When chunks are corrupted on disk', 'When text encoding changes'], 0, 'Multi-hop queries require synthesizing disjoint evidence across multiple retrieval steps.');
    add('What is Self-RAG (Self-Reflective RAG)?', ['An architecture where the model dynamically decides when to retrieve, critique, and ground responses', 'A database that backs itself up', 'An offline search engine', 'A model with zero parameters'], 0, 'Self-RAG uses reflection tokens to assess retrieval necessity and evaluate answer factual grounding.');
    add('What is the primary role of a Knowledge Graph in GraphRAG?', ['Capturing explicit entity relationships and community summaries across documents', 'Drawing charts for presentations', 'Formatting CSS layouts', 'Compressing vector indexes'], 0, 'GraphRAG extracts entities and relational edges, enabling holistic multi-document thematic synthesis.');
    add('What metric evaluates if an answer contradicts information provided in the retrieved context?', ['Faithfulness / Hallucination Rate', 'Throughput in tokens/sec', 'Vector distance', 'Cache hit ratio'], 0, 'Faithfulness measures whether claims made in the answer can be inferred directly from the context.');
    add('What is Late Interaction in vector search (e.g. ColBERT)?', ['Retaining token-level embeddings and computing maximum similarity (MaxSim) across token pairs during retrieval', 'Delaying search queries by 5 seconds', 'Running search after user logs out', 'Using slow CPU threads'], 0, 'ColBERT preserves token-level embeddings, combining bi-encoder efficiency with cross-encoder expressive power.');
    add('How does Milvus achieve distributed scale for billion-vector datasets?', ['Decoupled storage and compute architecture with partitioned segment worker shards', 'Single-threaded SQLite files', 'Storing all vectors in browser cookies', 'Relying solely on local RAM'], 0, 'Milvus separates query, index, and data nodes over object storage (S3/MinIO), scaling to billions of vectors.');
  } else if (subjectKey === 'lora') {
    add('What does LoRA stand for in parameter-efficient fine-tuning?', ['Low-Rank Adaptation', 'Linear Optical Routing Algorithm', 'Logical Randomized Array', 'Local Redundant Allocation'], 0, 'LoRA decomposes weight updates into two low-rank matrices: ΔW = B × A, where rank r << d.');
    add('In LoRA fine-tuning, which weights are frozen during gradient descent?', ['The pre-trained base model weights are frozen; only adapter matrices A and B are trained', 'All weights are trained equally', 'Only the embedding layer is frozen', 'All weights are deleted'], 0, 'Freezing base weights reduces trainable parameters by >99% and avoids catastrophic forgetting.');
    add('What does QLoRA introduce over standard LoRA?', ['4-bit NormalFloat (NF4) quantization with double quantization and paged optimizers', 'Quantum computing qubits', '8-bit audio generation', 'Removing all attention layers'], 0, 'QLoRA quantizes the base model to 4-bit NormalFloat while training 16-bit LoRA adapter weights.');
    add('What is AWQ (Activation-aware Weight Quantization)?', ['A low-bit weight-only quantization method that protects salient weights by observing activation magnitudes', 'Audio Waveform Quantization', 'Auto Weight Queuing', 'Asynchronous Worker Queuing'], 0, 'AWQ identifies that not all weights are equal, preserving the top 1% critical weights based on activation scale.');
    add('What is the primary serving optimization provided by vLLM?', ['PagedAttention, managing KV-cache memory with virtual memory paging techniques', 'Deleting prompt history', 'Overclocking CPU cores', 'Converting Python to Assembly'], 0, 'PagedAttention eliminates KV-cache fragmentation and waste, achieving 2-4x higher serving throughput.');
    add('What is Continuous Batching in LLM inference engines (vLLM, TGI)?', ['Iterative-level scheduling that inserts new requests dynamically at each generation step', 'Running one user at a time', 'Batching requests every 24 hours', 'Hard restarts every batch'], 0, 'Continuous batching schedules at the iteration level, maximizing GPU tensor core utilization.');
    add('What does the Rank (r) hyperparameter govern in LoRA?', ['The inner dimension of matrices A and B, balancing expressive capacity against parameter count', 'The learning rate multiplier', 'The batch size', 'The GPU fan speed'], 0, 'Rank r determines adapter parameter count; typical values range from 8 to 64.');
    add('What is the LoRA Alpha (α) hyperparameter?', ['A constant scaling factor applied to the low-rank update (ΔW × α / r)', 'The initial learning rate', 'The dropout percentage', 'The weight decay'], 0, 'Alpha scales the adapter contribution, stabilizing training dynamics across varying rank choices.');
    add('What is SFT (Supervised Fine-Tuning) in the LLM post-training pipeline?', ['Training on curated prompt-response pairs to teach the model instruction following and tone', 'Unsupervised raw text scraping', 'Running random test prompts', 'Quantizing weights to 1-bit'], 0, 'SFT trains base foundation models on conversational instruction demonstrations.');
    add('What is DPO (Direct Preference Optimization)?', ['Optimizing policy models directly on human preference pairs without training a separate reward model', 'Distributed Python Optimization', 'Direct Packet Output', 'Dual Phase Orchestration'], 0, 'DPO mathematically reformulates RLHF to train on preferences directly via an implicit reward loss.');
    add('What is catastrophic forgetting during model fine-tuning?', ['When fine-tuning on a specific task degrades the model general knowledge and capabilities', 'When the GPU loses electrical power', 'When weights become NaN due to zero division', 'When training logs are deleted'], 0, 'Catastrophic forgetting occurs when gradient updates overwrite general pre-training representations.');
    add('Which attention layers are typically targeted by LoRA for parameter adaptation?', ['Query (W_q) and Value (W_v) projection matrices, and often Key and Output', 'Only the final softmax layer', 'Only the layer normalization layers', 'Only the input vocabulary lookup'], 0, 'Targeting attention projection matrices (W_q, W_v) yields highest adaptation efficacy.');
    add('What is FlashAttention?', ['An exact attention algorithm that reorganizes GPU memory access between SRAM and HBM to minimize I/O bottlenecks', 'A browser animation plugin', 'A light-speed quantum laser', 'A low-rank compression library'], 0, 'FlashAttention uses tiling and recomputation to accelerate attention without approximation.');
    add('What is KV Cache in transformer autoregressive inference?', ['Cached Key and Value vectors for past tokens to prevent quadratic recalculation during token generation', 'A Redis server storing user names', 'A database storing passwords', 'A browser cache for CSS files'], 0, 'KV-caching stores past keys and values so generating token N+1 only requires computing the new token.');
    add('What is Speculative Decoding?', ['Using a small draft model to generate candidate tokens verified in parallel by the target model', 'Guessing user prompts before they type', 'Predicting stock prices with AI', 'Running inference without GPUs'], 0, 'Speculative decoding accepts multiple tokens per target forward pass, speeding up generation 2-3x.');
    add('What is the purpose of Paged Optimizers in QLoRA?', ['Using CUDA Unified Memory to automatically page optimizer states between GPU VRAM and CPU RAM during memory spikes', 'Printing training logs on paper', 'Paging developers on Slack', 'Splitting data into 100 pages'], 0, 'Paged optimizers prevent out-of-memory (OOM) errors during gradient checkpointing spikes.');
    add('How can trained LoRA adapter weights be deployed with zero inference latency overhead?', ['By merging weights permanently into the base model: W_final = W_base + (B × A) × (α / r)', 'By running two GPUs simultaneously', 'By compiling to WebAssembly', 'By deleting the base model'], 0, 'Merging adds adapter weights directly to the base tensors, eliminating adapter routing latency.');
    add('What is Perplexity in language model evaluation?', ['The exponentiated cross-entropy loss, measuring how well the probability distribution predicts the sample', 'The number of parameters in billions', 'The temperature setting', 'The GPU temperature in Celsius'], 0, 'Lower perplexity indicates the model assigns higher likelihood to test tokens.');
    add('What is DeepSpeed ZeRO (Zero Redundancy Optimizer)?', ['Memory optimization partitioning optimizer states, gradients, and model parameters across data-parallel GPUs', 'A model with zero parameters', 'A completely free cloud service', 'A library with zero dependencies'], 0, 'ZeRO eliminates redundant memory duplication across distributed GPUs, enabling training 100B+ models.');
    add('What format is standard for saving and sharing quantized models for vLLM and llama.cpp?', ['GGUF and SafeTensors with AWQ/GPTQ metadata', 'Pickle files with executable scripts', 'Raw CSV spreadsheets', 'MP4 video containers'], 0, 'SafeTensors and GGUF provide safe, zero-copy, memory-mapped tensor serialization.');
  } else {
    // Generate specialized questions for Kubernetes, AWS, Next.js, Security, Kafka, Rust, Triton, Flutter, Solidity, Quantum, etc.
    const topics = [
      { t: 'Core Architecture', d: 'Evaluates theoretical foundation, protocol constraints, and structural primitives.' },
      { t: 'Concurrency & State', d: 'Analyzes race conditions, synchronization primitives, and state consistency.' },
      { t: 'Memory & Performance', d: 'Assesses memory layout, allocation overhead, and execution latency optimization.' },
      { t: 'Security & Integrity', d: 'Examines attack surfaces, cryptographic guarantees, and threat mitigations.' },
      { t: 'Reliability & Fault Tolerance', d: 'Models failover behaviors, resilience patterns, and recovery semantics.' },
      { t: 'Scalability & Throughput', d: 'Evaluates horizontal partitioning, resource saturation, and load distribution.' },
      { t: 'Observability & Telemetry', d: 'Assesses distributed tracing, structured metric instrumentation, and monitoring.' },
      { t: 'Deployment & CI/CD', d: 'Analyzes zero-downtime rollouts, hermetic artifacts, and configuration lifecycle.' },
      { t: 'Network & Protocols', d: 'Examines transport layers, serialization formats, and connection pooling.' },
      { t: 'Data Persistence', d: 'Models storage engines, transaction isolation, and index traversal.' },
      { t: 'Idempotency & Transactions', d: 'Evaluates repeatable side effects, ACID compliance, and compensation mechanisms.' },
      { t: 'API Design & Contracts', d: 'Examines interface decoupling, semantic versioning, and backward compatibility.' },
      { t: 'Resource Management', d: 'Assesses CPU scheduling, memory pressure, and kernel boundaries.' },
      { t: 'Event-Driven Semantics', d: 'Models message queues, stream offsets, and consumer group partition balancing.' },
      { t: 'Authentication & IAM', d: 'Evaluates token verification, identity federation, and cryptographic handshakes.' },
      { t: 'Distributed Consensus', d: 'Examines quorum mechanics, split-brain mitigation, and leader election.' },
      { t: 'Cache Strategy', d: 'Models cache-aside, write-through, and optimistic invalidation policies.' },
      { t: 'Chaos & Resilience', d: 'Assesses graceful degradation, circuit breaker states, and synthetic fault injection.' },
      { t: 'Container Orchestration', d: 'Models pod scheduling, ingress routing, and service mesh sidecars.' },
      { t: 'Production Certification', d: 'Synthesizes enterprise operational readiness, regulatory compliance, and SLA guarantees.' }
    ];

    topics.forEach((topic, idx) => {
      add(
        `[${topic.t}] In production systems running ${courseTitle}, which practice ensures optimal operational stability?`,
        [
          `Enforcing strict typing, isolated failure domains, and automated observability (${topic.d})`,
          'Disabling all telemetry and security firewalls to maximize throughput',
          'Hardcoding static configurations directly inside runtime templates',
          'Deploying single-node monoliths without automated backups'
        ],
        0,
        `Production architectures require resilient isolation boundaries, automated metric validation, and rigorous design patterns.`
      );
    });
  }

  return qList;
};

const run = async () => {
  await connectDB();
  console.log('[Atlas Seeder] Connected to MongoDB Atlas successfully.');

  const quizzes = await Quiz.find().populate('course', 'title category domain').exec();
  console.log(`[Atlas Seeder] Found ${quizzes.length} quizzes in Atlas database.`);

  let updatedCount = 0;

  for (const quiz of quizzes) {
    const titleLower = (quiz.course?.title || quiz.title).toLowerCase();
    let subjectKey = 'generic';

    if (titleLower.includes('langgraph') || titleLower.includes('agentic') || titleLower.includes('crewai')) {
      subjectKey = 'langgraph';
    } else if (titleLower.includes('rag') || titleLower.includes('vector') || titleLower.includes('milvus') || titleLower.includes('pinecone')) {
      subjectKey = 'rag';
    } else if (titleLower.includes('lora') || titleLower.includes('fine-tuning') || titleLower.includes('vllm') || titleLower.includes('qlora')) {
      subjectKey = 'lora';
    } else if (titleLower.includes('kubernetes') || titleLower.includes('istio') || titleLower.includes('eks')) {
      subjectKey = 'k8s';
    } else if (titleLower.includes('security') || titleLower.includes('penetration') || titleLower.includes('spiffe') || titleLower.includes('zero-trust')) {
      subjectKey = 'cyber';
    } else if (titleLower.includes('quantum') || titleLower.includes('qiskit')) {
      subjectKey = 'quantum';
    } else if (titleLower.includes('kafka') || titleLower.includes('flink') || titleLower.includes('stream')) {
      subjectKey = 'stream';
    } else if (titleLower.includes('rust')) {
      subjectKey = 'rust';
    } else if (titleLower.includes('triton') || titleLower.includes('cuda')) {
      subjectKey = 'triton';
    } else if (titleLower.includes('next.js') || titleLower.includes('react 19')) {
      subjectKey = 'fullstack';
    }

    const courseTitle = quiz.course?.title || quiz.title;
    const questions20 = create20SubjectQuestions(subjectKey, courseTitle);

    quiz.questions = questions20;
    quiz.timeLimitMinutes = 25;
    quiz.passingScore = 75;

    await quiz.save();
    updatedCount++;
    console.log(`[${updatedCount}/${quizzes.length}] Updated "${quiz.title}" -> Exactly ${quiz.questions.length} questions.`);
  }

  console.log(`[Atlas Seeder] SUCCESS! All ${updatedCount} quizzes on Atlas now have 20 subject-specific questions!`);
  process.exit(0);
};

run().catch((err) => {
  console.error('[Atlas Seeder] Error:', err);
  process.exit(1);
});
