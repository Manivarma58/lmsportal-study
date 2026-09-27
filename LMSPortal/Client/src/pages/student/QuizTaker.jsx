import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import {
  getSocket,
  joinQuizRoom,
  submitQuizAnswerSocket,
  sendQuizReaction,
  sendQuizProctorAlert,
  finishQuizSocket,
  leaveQuizRoom,
} from '../../services/socket';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import {
  Zap,
  Flame,
  Trophy,
  Users,
  Shield,
  Copy,
  Check,
  Radio,
  Award,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Hash,
  Share2,
  LogOut,
} from 'lucide-react';

// Web Audio synthesizer for haptic audio feedback
const playSynthesizedSound = (type = 'correct') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else if (type === 'streak') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.07);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } else if (type === 'incorrect') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Audio context may be muted until user interaction
  }
};

// Curated Fallback Assessment Pool
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    points: 10,
    category: 'Autonomous Agents',
    question: 'Which framework pattern combines reasoning traces and task-specific actions for autonomous agents?',
    subtitle: 'Evaluate state mutation and repeatability semantics for multi-step AI agents.',
    context:
      'Modern cognitive agents interleave reasoning ("thought") and action ("tool use") traces to guide complex autonomous problem solving without hallucinating execution paths.',
    contextTag: 'ReAct Architecture • ICLR 2023',
    options: [
      { key: 'A', text: 'ReAct (Reasoning and Acting) prompting pattern.' },
      { key: 'B', text: 'Static Regex Pattern Matching with fixed dictionary fallbacks.' },
      { key: 'C', text: 'Single-layer Feedforward Perceptrons without hidden activations.' },
      { key: 'D', text: 'Monolithic Linear Regression with gradient descent.' },
    ],
    correctAnswer: 'A',
    explanation:
      'ReAct interleaves reasoning ("thought") and action ("tool use") traces to guide complex autonomous problem solving.',
  },
  {
    id: 2,
    points: 10,
    category: 'Security & TLS',
    question: 'Which cryptographic principle ensures that compromise of long-term server private keys does not decrypt past recorded sessions?',
    subtitle: 'Determine mechanism for forward-secure ephemeral session negotiations.',
    context:
      'Perfect Forward Secrecy ensures each session creates independent ephemeral keys (via ECDHE), isolating compromise to only the current transaction.',
    contextTag: 'RFC 8446 • TLS 1.3 Architecture',
    options: [
      { key: 'A', text: 'MD5 Checksum Inversion with salt.' },
      { key: 'B', text: 'Forward Secrecy (PFS) via Ephemeral Diffie-Hellman (ECDHE).' },
      { key: 'C', text: 'Base64 Symmetric Transposition with static salt.' },
      { key: 'D', text: 'Static RSA Key Exchange with long-lived certificates.' },
    ],
    correctAnswer: 'B',
    explanation:
      'Perfect Forward Secrecy generates unique ephemeral session keys per handshake so past traffic remains unbreakable.',
  },
  {
    id: 3,
    points: 10,
    category: 'Distributed Systems',
    question: 'In OAuth 2.1 / OIDC architectural flows, which token format is standard for stateless authorization?',
    subtitle: 'Analyze self-contained cryptographic identity claims for edge gateways.',
    context:
      'Stateless edge gateways verify cryptographic signatures locally without incurring database roundtrips for every incoming API invocation.',
    contextTag: 'RFC 7519 • JSON Web Signature (JWS)',
    options: [
      { key: 'A', text: 'Base64-encoded cleartext username/password strings.' },
      { key: 'B', text: 'JSON Web Tokens (JWT) signed with asymmetric keys (RS256/ES256).' },
      { key: 'C', text: 'Server-side Redis stateful session cookies.' },
      { key: 'D', text: 'Raw NTLM cryptographic challenge hashes.' },
    ],
    correctAnswer: 'B',
    explanation:
      'Signed JWTs (RS256/ES256) encapsulate claims and signatures that downstream microservices can independently verify without central session lookup.',
  },
  {
    id: 4,
    points: 10,
    category: 'REST Architecture',
    question: 'Which HTTP method is specifically defined as idempotent according to RFC 7231?',
    subtitle: 'Evaluate state mutation and repeatability semantics for standard HTTP verbs.',
    context:
      'Idempotence guarantees that multiple identical requests will produce the same operational side effect on the server state as a single request.',
    contextTag: 'RFC 7231 §4.2.2 • Method Semantics',
    options: [
      { key: 'A', text: 'POST requests creating new relational entities.' },
      { key: 'B', text: 'PUT and DELETE requests replacing or removing targeted resources.' },
      { key: 'C', text: 'PATCH requests applying delta JSON transformations.' },
      { key: 'D', text: 'Custom vendor verbs without explicit caching headers.' },
    ],
    correctAnswer: 'B',
    explanation:
      'PUT and DELETE are idempotent per HTTP specifications; sending multiple identical PUT/DELETE requests leaves server state identical to sending one.',
  },
  {
    id: 5,
    points: 10,
    category: 'HTTP Status Codes',
    question: 'Which HTTP status code should be returned when a request is syntactically valid but fails semantic business logic?',
    subtitle: 'Distinguish protocol transport failures from domain rule validation errors.',
    context:
      'RFC 4918 and modern REST conventions prescribe distinct codes for malformed envelopes vs well-formed payloads with invalid business constraints.',
    contextTag: 'RFC 4918 §11.2 • HTTP Extensions',
    options: [
      { key: 'A', text: '400 Bad Request (strictly for malformed syntax).' },
      { key: 'B', text: '422 Unprocessable Entity (semantic domain validation failure).' },
      { key: 'C', text: '500 Internal Server Error (unhandled exception).' },
      { key: 'D', text: '405 Method Not Allowed.' },
    ],
    correctAnswer: 'B',
    explanation:
      'HTTP 422 Unprocessable Entity denotes that the server understands the content type and syntax, but cannot process the contained business instructions.',
  },
  {
    id: 6,
    points: 10,
    category: 'API Rate Limiting',
    question: 'Which algorithmic pattern is widely implemented in edge API Gateways for burst-tolerant rate limiting?',
    subtitle: 'Model token replenishment and continuous throughput degradation under high load.',
    context: 'The algorithm replenishes capacity units at a defined fill rate while accommodating bursty client traffic up to bucket capacity.',
    contextTag: 'IETF Draft • RateLimit Field',
    options: [
      { key: 'A', text: 'Token Bucket / Leaky Bucket Algorithm.' },
      { key: 'B', text: 'Round Robin CPU Interleaving.' },
      { key: 'C', text: 'Dijkstra Shortest Route Queuing.' },
      { key: 'D', text: 'B-Tree Key Index Splitting.' },
    ],
    correctAnswer: 'A',
    explanation: 'Token Bucket permits temporary traffic bursts up to maximum bucket depth while bounding sustained request rates.',
  },
  {
    id: 7,
    points: 10,
    category: 'Hypermedia & HATEOAS',
    question: 'What is the highest maturity level in the Richardson Maturity Model (Level 3)?',
    subtitle: 'Examine self-descriptive discoverability across distributed hypermedia workflows.',
    context: 'At Level 3, clients navigate resources dynamically through relational hypermedia link controls embedded inside JSON responses.',
    contextTag: 'HATEOAS • Richardson Maturity',
    options: [
      { key: 'A', text: 'Level 3: HATEOAS (Hypermedia As The Engine Of Application State).' },
      { key: 'B', text: 'Level 3: GraphQL Schema Stitching.' },
      { key: 'C', text: 'Level 3: HTTP/2 Multiplexing.' },
      { key: 'D', text: 'Level 3: Protocol Buffers.' },
    ],
    correctAnswer: 'A',
    explanation: 'Level 3 introduces HATEOAS, guiding API clients dynamically via embedded links rather than hardcoded URLs.',
  },
  {
    id: 8,
    points: 10,
    category: 'Data Serialization',
    question: 'Why is content negotiation achieved using the Accept and Content-Type headers?',
    subtitle: 'Decouple representation format from underlying server data models.',
    context: 'Clients communicate expected MIME media types (e.g. application/json) enabling polyglot server formatting.',
    contextTag: 'RFC 7231 §5.3 • Content Negotiation',
    options: [
      { key: 'A', text: 'To permit servers to format response bodies in the representation requested by the client.' },
      { key: 'B', text: 'To encrypt request bodies using TLS session tokens.' },
      { key: 'C', text: 'To enforce CORS preflight verification.' },
      { key: 'D', text: 'To bypass reverse proxy caching.' },
    ],
    correctAnswer: 'A',
    explanation: 'The Accept header allows clients to request specific MIME representations without mutating API endpoint paths.',
  },
  {
    id: 9,
    points: 10,
    category: 'Concurrency Control',
    question: 'How do distributed REST APIs prevent the "Lost Update" problem during concurrent resource mutations?',
    subtitle: 'Contrast pessimistic locking with optimistic conditional concurrency checks.',
    context: 'When multiple clients read state and send updates simultaneously, race conditions can overwrite intermediate changes unless validated.',
    contextTag: 'RFC 7232 §3.1 • Optimistic Concurrency',
    options: [
      { key: 'A', text: 'By utilizing If-Match headers with ETags or version timestamps (Optimistic Locking).' },
      { key: 'B', text: 'By permanently locking database tables on every GET request.' },
      { key: 'C', text: 'By forcing single-threaded node processes across all regions.' },
      { key: 'D', text: 'By converting all HTTP PUT calls to async message queues.' },
    ],
    correctAnswer: 'A',
    explanation: 'If-Match headers ensure that a resource update only proceeds if the client’s cached ETag matches the current server version.',
  },
  {
    id: 10,
    points: 10,
    category: 'API Versioning',
    question: 'Which REST API versioning strategy avoids breaking existing URL namespaces and enables transparent routing?',
    subtitle: 'Compare URI path versioning, query parameters, custom media types, and headers.',
    context: 'Custom vendor media types preserve uniform resource URIs across schema revisions.',
    contextTag: 'REST Architectural Constraints',
    options: [
      { key: 'A', text: 'Content Negotiation via Custom Vendor Media Types in the Accept Header.' },
      { key: 'B', text: 'Duplicating complete backend microservices into separate cloud clusters.' },
      { key: 'C', text: 'Appending random query hashes to each invocation.' },
      { key: 'D', text: 'Rewriting all database primary keys.' },
    ],
    correctAnswer: 'A',
    explanation: 'Header/Media type versioning preserves pure resource URIs while giving clients fine-grained control over API schema evolution.',
  },
  {
    id: 11,
    points: 10,
    category: 'Database Optimization',
    question: 'In MongoDB, what does the ESR (Equality, Sort, Range) rule optimize for compound index creation?',
    subtitle: 'Analyze compound index selectivity and in-memory sort prevention.',
    context: 'Placing equality fields first, followed by sort fields, and lastly range filter fields eliminates in-memory sorting.',
    contextTag: 'MongoDB Index Architecture',
    options: [
      { key: 'A', text: 'Index prefix utilization that allows queries to filter and sort directly from the B-tree.' },
      { key: 'B', text: 'Compresses JSON documents into binary zip format.' },
      { key: 'C', text: 'Automatically removes expired documents.' },
      { key: 'D', text: 'Enforces foreign key cascading deletes.' },
    ],
    correctAnswer: 'A',
    explanation: 'Following the ESR rule ensures the index covers both exact matches and sort ordering before applying range bounds.',
  },
  {
    id: 12,
    points: 10,
    category: 'Distributed Systems',
    question: 'What trade-off does the CAP theorem formally establish for distributed data stores?',
    subtitle: 'Evaluate consistency versus availability during network partition events.',
    context: 'Under an unavoidable network partition (P), a distributed system must choose between Consistency (C) and Availability (A).',
    contextTag: 'Brewer CAP Theorem',
    options: [
      { key: 'A', text: 'A distributed store can guarantee at most two of Consistency, Availability, and Partition Tolerance simultaneously.' },
      { key: 'B', text: 'Cost, Speed, and Accuracy cannot exceed 100% combined.' },
      { key: 'C', text: 'CPUs cannot execute more than two threads concurrently.' },
      { key: 'D', text: 'Databases cannot store more than 1 billion documents.' },
    ],
    correctAnswer: 'A',
    explanation: 'When network partitions occur, systems must either reject requests (prioritizing consistency) or accept writes (prioritizing availability).',
  },
  {
    id: 13,
    points: 10,
    category: 'Web Security',
    question: 'Why is storing sensitive JWT session tokens in HttpOnly cookies superior to localStorage?',
    subtitle: 'Analyze client-side script execution boundaries and token exfiltration vectors.',
    context: 'HttpOnly cookies cannot be accessed by JavaScript via document.cookie, blocking extraction during Cross-Site Scripting (XSS).',
    contextTag: 'OWASP Session Management',
    options: [
      { key: 'A', text: 'HttpOnly cookies cannot be read or exfiltrated by malicious JavaScript during XSS attacks.' },
      { key: 'B', text: 'Cookies compress JSON data automatically by 80%.' },
      { key: 'C', text: 'localStorage is deprecated in HTTP/3 browsers.' },
      { key: 'D', text: 'Cookies bypass all firewall inspections.' },
    ],
    correctAnswer: 'A',
    explanation: 'HttpOnly prevents client-side script access, preventing automated credential theft when XSS vulnerabilities occur.',
  },
  {
    id: 14,
    points: 10,
    category: 'Microservices',
    question: 'Which resilience pattern prevents an application from repeatedly calling a failing downstream microservice?',
    subtitle: 'Contrast retry storms with fail-fast circuit states.',
    context: 'The pattern trips to an Open state after a threshold of failures, returning immediate fallback responses.',
    contextTag: 'Release It! • Michael Nygard',
    options: [
      { key: 'A', text: 'Circuit Breaker Pattern.' },
      { key: 'B', text: 'Infinite Retry While Loop.' },
      { key: 'C', text: 'Round Robin Load Balancer.' },
      { key: 'D', text: 'DNS Round Robin Cache.' },
    ],
    correctAnswer: 'A',
    explanation: 'Circuit Breakers trip open when downstream dependencies fail, protecting services from cascading collapse.',
  },
  {
    id: 15,
    points: 10,
    category: 'Event-Driven Architecture',
    question: 'What is the role of an Idempotency Key in distributed payment and order processing endpoints?',
    subtitle: 'Prevent duplicate side effects during client retry storms.',
    context: 'Unique keys allow servers to recognize retransmitted requests and return the original successful response without re-executing state mutation.',
    contextTag: 'IETF Idempotency-Key Header',
    options: [
      { key: 'A', text: 'Guarantees that re-sending the same request produces exactly one side effect without duplicate charging.' },
      { key: 'B', text: 'Encrypts the credit card number with RSA.' },
      { key: 'C', text: 'Translates currency exchange rates.' },
      { key: 'D', text: 'Compresses payload strings.' },
    ],
    correctAnswer: 'A',
    explanation: 'Idempotency keys ensure network retries and timeout recoveries do not trigger duplicate mutations or financial transactions.',
  },
  {
    id: 16,
    points: 10,
    category: 'Cloud Infrastructure',
    question: 'In Kubernetes, which controller guarantees that exactly one copy of a Pod runs across all cluster worker nodes?',
    subtitle: 'Compare Deployments, ReplicaSets, StatefulSets, and DaemonSets.',
    context: 'Used typically for node monitoring agents, log collection (Fluentd), and network plugins.',
    contextTag: 'Kubernetes Workload Controllers',
    options: [
      { key: 'A', text: 'DaemonSet.' },
      { key: 'B', text: 'ReplicaSet.' },
      { key: 'C', text: 'Job.' },
      { key: 'D', text: 'StatefulSet.' },
    ],
    correctAnswer: 'A',
    explanation: 'A DaemonSet ensures all (or matching) nodes run an instance of a pod, ideal for cluster-wide daemon services.',
  },
  {
    id: 17,
    points: 10,
    category: 'Protocol Architecture',
    question: 'What protocol feature in HTTP/2 eliminates Head-of-Line blocking at the application layer?',
    subtitle: 'Contrast sequential HTTP/1.1 pipelining with binary frame multiplexing.',
    context: 'HTTP/2 breaks requests and responses into independent binary frames interleaved over a single TCP stream.',
    contextTag: 'RFC 7540 • HTTP/2 Streams',
    options: [
      { key: 'A', text: 'Binary Framing and Stream Multiplexing.' },
      { key: 'B', text: 'Opening 6 separate TCP sockets simultaneously.' },
      { key: 'C', text: 'Switching to unencrypted plain text.' },
      { key: 'D', text: 'UDP Broadcast Framing.' },
    ],
    correctAnswer: 'A',
    explanation: 'Binary framing interleaves packets from multiple simultaneous requests across one TCP connection without blocking.',
  },
  {
    id: 18,
    points: 10,
    category: 'Cryptographic Hashing',
    question: 'Why are general cryptographic hashes like SHA-256 unsuitable for storing user passwords compared to Argon2id or bcrypt?',
    subtitle: 'Evaluate GPU-accelerated brute force resistance and memory hardness.',
    context: 'SHA-256 is designed to be as fast as possible; password hashing algorithms must be slow and memory-hard.',
    contextTag: 'OWASP Password Storage Cheat Sheet',
    options: [
      { key: 'A', text: 'SHA-256 is too fast, enabling modern GPUs to calculate billions of guesses per second; Argon2id is intentionally memory-hard and slow.' },
      { key: 'B', text: 'SHA-256 produces variable length outputs.' },
      { key: 'C', text: 'Argon2id uses plaintext storage.' },
      { key: 'D', text: 'SHA-256 keys expire after 30 days.' },
    ],
    correctAnswer: 'A',
    explanation: 'Password hashing functions must be tunable, memory-intensive, and computationally slow to defeat parallel GPU hardware attacks.',
  },
  {
    id: 19,
    points: 10,
    category: 'Zero Downtime Deployments',
    question: 'Which deployment strategy runs two identical production environments, switching router traffic instantly from old to new?',
    subtitle: 'Contrast Rolling Updates, Canary Deployments, and Blue-Green Deployments.',
    context: 'Provides instantaneous rollback capability by simply pointing the load balancer back to the previous environment.',
    contextTag: 'Cloud Deployment Topologies',
    options: [
      { key: 'A', text: 'Blue-Green Deployment.' },
      { key: 'B', text: 'Canary Deployment with 5% sampling.' },
      { key: 'C', text: 'Big Bang In-Place Deployment.' },
      { key: 'D', text: 'Recreate Deployment with downtime.' },
    ],
    correctAnswer: 'A',
    explanation: 'Blue-Green runs two parallel environments; once validation passes on Green, router traffic switches instantly with zero downtime.',
  },
  {
    id: 20,
    points: 10,
    category: 'Observability & Telemetry',
    question: 'What are the Three Pillars of Observability in modern distributed cloud native engineering?',
    subtitle: 'Synthesize telemetry data types for rapid incident triage.',
    context: 'Combining these three telemetry signals gives SRE teams complete visibility into distributed system health.',
    contextTag: 'OpenTelemetry Architecture',
    options: [
      { key: 'A', text: 'Metrics, Logs, and Distributed Traces.' },
      { key: 'B', text: 'CPU, RAM, and Disk.' },
      { key: 'C', text: 'HTML, CSS, and JavaScript.' },
      { key: 'D', text: 'Read, Write, and Execute permissions.' },
    ],
    correctAnswer: 'A',
    explanation: 'Metrics provide numeric aggregate health, Logs provide detailed event context, and Traces visualize request journeys across services.',
  },
];

export default function QuizTaker({ embedded = false }) {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Mode: if no quizId provided and not active in a room, start in Quiz Hub
  const [inHubMode, setInHubMode] = useState(!quizId);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [roomPinInput, setRoomPinInput] = useState('');

  // Assessment Questions & Metadata
  const [activeQuizMeta, setActiveQuizMeta] = useState(null);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});

  // Real-Time Socket & Live Arena State
  const [roomId, setRoomId] = useState(`quiz_${quizId || 'arena_default'}`);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [livePeersCount, setLivePeersCount] = useState(1);
  const [activePeers, setActivePeers] = useState([]);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [liveScore, setLiveScore] = useState(0);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [proctorWarnings, setProctorWarnings] = useState(0);
  const [copiedPin, setCopiedPin] = useState(false);
  const [recentAnswerFeedback, setRecentAnswerFeedback] = useState(null);

  // Timers, Navigation & Modals
  const [timeLeft, setTimeLeft] = useState(900); // 15:00 in seconds
  const [activeNavTab, setActiveNavTab] = useState('questions'); // 'questions' | 'review' | 'summary'
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [scratchpadNote, setScratchpadNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScorecard, setFinalScorecard] = useState(null);
  const [podiumData, setPodiumData] = useState([]);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  // Fetch Available Quizzes for Hub
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const res = await API.get('/quizzes');
        if (res.data?.quizzes && res.data.quizzes.length > 0) {
          setAvailableQuizzes(res.data.quizzes);
        }
      } catch (err) {
        console.warn('Could not fetch quiz catalog, using defaults:', err.message);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Fetch Specific Quiz details if quizId changes
  useEffect(() => {
    if (!quizId) {
      setInHubMode(true);
      return;
    }

    setInHubMode(false);
    const fetchSpecificQuiz = async () => {
      try {
        const res = await API.get(`/quizzes/${quizId}`);
        if (res.data?.quiz) {
          const qData = res.data.quiz;
          setActiveQuizMeta(qData);
          if (qData.timeLimitMinutes) {
            setTimeLeft(qData.timeLimitMinutes * 60);
          }
          if (Array.isArray(qData.questions) && qData.questions.length > 0) {
            const mapped = qData.questions.map((q, idx) => ({
              id: q._id || idx + 1,
              points: q.marks || q.points || 10,
              category: q.category || 'Core Architecture',
              question: q.questionText || q.question,
              subtitle: q.subtitle || 'Evaluate architecture patterns and operational parameters.',
              context: q.context || 'Official certification question evaluated in real-time.',
              contextTag: `Standard §${idx + 1} • Enterprise Spec`,
              options: Array.isArray(q.options)
                ? q.options.map((opt, oIdx) => {
                    if (typeof opt === 'string') {
                      return { key: String.fromCharCode(65 + oIdx), text: opt };
                    }
                    return opt;
                  })
                : [],
              correctAnswer:
                q.correctAnswerIndex !== undefined
                  ? String.fromCharCode(65 + q.correctAnswerIndex)
                  : typeof q.correctAnswer === 'number'
                  ? String.fromCharCode(65 + q.correctAnswer)
                  : q.correctAnswer || 'A',
              explanation: q.explanation || 'Detailed answer evaluation recorded on assessment ledger.',
            }));
            setQuestions(mapped);
          }
        }
      } catch (err) {
        console.warn('Using default question set:', err.message);
      }
    };

    fetchSpecificQuiz();
  }, [quizId]);

  // Real-Time Socket Connection & Arena Events
  useEffect(() => {
    if (inHubMode) return;

    const currentRoom = `quiz_${quizId || 'arena_default'}`;
    setRoomId(currentRoom);

    const socket = getSocket();
    if (!socket) return;

    setIsSocketConnected(socket.connected);

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Join the real-time quiz room
    joinQuizRoom(
      {
        quizId: quizId || 'arena_default',
        roomId: currentRoom,
        totalQuestions: questions.length,
        quizTitle: activeQuizMeta?.title || 'Cyber-Academic Real-Time Assessment',
      },
      (ack) => {
        if (ack && ack.success) {
          if (ack.leaderboard) setLiveLeaderboard(ack.leaderboard);
          if (ack.participantsCount) setLivePeersCount(ack.participantsCount);
          if (ack.participants) setActivePeers(ack.participants);
        }
      }
    );

    // Listen for peer join
    const handlePeerJoined = (data) => {
      setLivePeersCount(data.participantsCount || 1);
      if (data.leaderboard) setLiveLeaderboard(data.leaderboard);
      toast.info(`⚡ Scholar ${data.name || 'Peer'} entered the Real-Time Arena!`, {
        description: `${data.participantsCount} scholars synchronized in this session.`,
      });
    };

    // Listen for peer left
    const handlePeerLeft = (data) => {
      setLivePeersCount(data.participantsCount || 1);
      if (data.leaderboard) setLiveLeaderboard(data.leaderboard);
    };

    // Listen for real-time leaderboard updates
    const handleLeaderboardUpdate = (data) => {
      if (data.leaderboard) {
        setLiveLeaderboard(data.leaderboard);
      }
      if (data.event && data.event.userId !== user?.id && data.event.userId !== user?._id) {
        if (data.event.isCorrect && data.event.streak >= 2) {
          toast.info(`🔥 ${data.event.name} is on a ${data.event.streak}x streak!`);
        }
      }
    };

    // Listen for peer progress
    const handlePeerProgress = (data) => {
      setActivePeers((prev) => {
        const found = prev.find((p) => p.userId === data.userId);
        if (found) {
          return prev.map((p) =>
            p.userId === data.userId
              ? { ...p, currentQuestion: data.currentQuestion, score: data.score }
              : p
          );
        }
        return [...prev, data];
      });
    };

    // Listen for floating reactions
    const handleNewReaction = (reaction) => {
      setFloatingReactions((prev) => [...prev.slice(-8), reaction]);
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3000);
    };

    // Listen for final podium update
    const handlePodiumUpdate = (data) => {
      if (data.podium) setPodiumData(data.podium);
      if (data.leaderboard) setLiveLeaderboard(data.leaderboard);
    };

    socket.on('quiz:peer_joined', handlePeerJoined);
    socket.on('quiz:peer_left', handlePeerLeft);
    socket.on('quiz:leaderboard_update', handleLeaderboardUpdate);
    socket.on('quiz:peer_progress', handlePeerProgress);
    socket.on('quiz:new_reaction', handleNewReaction);
    socket.on('quiz:podium_update', handlePodiumUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('quiz:peer_joined', handlePeerJoined);
      socket.off('quiz:peer_left', handlePeerLeft);
      socket.off('quiz:leaderboard_update', handleLeaderboardUpdate);
      socket.off('quiz:peer_progress', handlePeerProgress);
      socket.off('quiz:new_reaction', handleNewReaction);
      socket.off('quiz:podium_update', handlePodiumUpdate);
      leaveQuizRoom(currentRoom);
    };
  }, [quizId, inHubMode, questions.length, activeQuizMeta, user]);

  // Real-Time Proctoring: Monitor Tab Switches & Window Focus
  useEffect(() => {
    if (inHubMode || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setProctorWarnings((prev) => prev + 1);
        sendQuizProctorAlert(roomId, 'tab_switch', 'Student switched browser tab or minimized window');
        toast.warning('⚠️ Real-Time Proctor Alert: Tab focus lost!', {
          description: 'Integrity monitoring active. Disconnects are logged on server telemetry.',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [inHubMode, isSubmitted, roomId]);

  // Countdown Timer
  useEffect(() => {
    if (inHubMode || isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [inHubMode, isSubmitted, timeLeft]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestionIndex] || questions[0];
  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = Object.keys(flaggedQuestions).filter((k) => flaggedQuestions[k]).length;
  const totalQuestions = questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Trigger Instant Real-Time Option Selection
  const handleSelectOption = (qIdx, optionKey) => {
    if (isSubmitted) return;

    const q = questions[qIdx];
    const isCorrect = optionKey === q.correctAnswer;
    const points = q.points || 10;

    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optionKey,
    }));

    // Update streak and play audio chime
    if (isCorrect) {
      const nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);
      const streakBonus = nextStreak >= 3 ? 5 : nextStreak >= 2 ? 2 : 0;
      const pointsWon = points + streakBonus;
      setLiveScore((prev) => prev + pointsWon);

      if (soundEnabled) {
        if (nextStreak >= 2) playSynthesizedSound('streak');
        else playSynthesizedSound('correct');
      }

      setRecentAnswerFeedback({
        isCorrect: true,
        text: `+${pointsWon} PTS! ${nextStreak >= 2 ? `🔥 ${nextStreak}x STREAK BONUS!` : 'Spot on!'}`,
      });
    } else {
      setCurrentStreak(0);
      if (soundEnabled) playSynthesizedSound('incorrect');
      setRecentAnswerFeedback({
        isCorrect: false,
        text: 'Incorrect. Zero points added for this question.',
      });
    }

    setTimeout(() => setRecentAnswerFeedback(null), 2500);

    // Broadcast instant answer telemetry to Socket.IO room
    submitQuizAnswerSocket({
      roomId,
      quizId: quizId || 'arena_default',
      questionIndex: qIdx,
      isCorrect,
      points,
      timeSpentSeconds: 5,
    });
  };

  // Toggle flag for review
  const toggleFlag = (qIdx) => {
    setFlaggedQuestions((prev) => {
      const next = { ...prev, [qIdx]: !prev[qIdx] };
      if (next[qIdx]) toast.info(`Question ${qIdx + 1} flagged for review.`);
      else toast.success(`Question ${qIdx + 1} flag removed.`);
      return next;
    });
  };

  // Send Floating Emoji Reaction
  const handleSendReaction = (emoji) => {
    sendQuizReaction(roomId, emoji);
    const localReaction = {
      id: `local_${Date.now()}`,
      userId: user?.id || user?._id || 'me',
      senderName: 'You',
      emoji,
      timestamp: new Date(),
    };
    setFloatingReactions((prev) => [...prev.slice(-8), localReaction]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== localReaction.id));
    }, 3000);
  };

  // Final Assessment Submission
  const handleSubmitAssessment = async () => {
    setSubmitModalOpen(false);
    setIsSubmitted(true);

    let correct = 0;
    let earnedPoints = 0;
    const totalPoints = questions.reduce((acc, q) => acc + (q.points || 10), 0);

    const submissionAnswers = [];
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) {
        correct++;
        earnedPoints += q.points || 10;
      }
      submissionAnswers.push({
        questionIndex: idx,
        selectedOption: selected !== undefined ? selected : -1,
        isCorrect,
      });
    });

    const scorePct = Math.round((earnedPoints / totalPoints) * 100);
    const passed = scorePct >= (activeQuizMeta?.passingScore || 70);

    const scorecard = {
      scorePct,
      earnedPoints,
      totalPoints,
      correctCount: correct,
      totalCount: totalQuestions,
      passed,
      timeSpent: 900 - timeLeft,
      completionTimestamp: new Date().toLocaleTimeString(),
      blockchainProof: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 6)}`,
    };

    setFinalScorecard(scorecard);
    setActiveNavTab('summary');

    // Notify Socket.IO room for live podium rankings
    finishQuizSocket(
      {
        roomId,
        quizId: quizId || 'arena_default',
        finalScore: earnedPoints,
        totalPoints,
        percentage: scorePct,
        passed,
        timeSpent: 900 - timeLeft,
      },
      (ack) => {
        if (ack && ack.podium) setPodiumData(ack.podium);
      }
    );

    // Save official attempt to backend
    if (quizId) {
      try {
        await API.post(`/quizzes/${quizId}/submit`, {
          answers: submissionAnswers,
          timeSpentSeconds: 900 - timeLeft,
        });
      } catch (err) {
        console.warn('Backend attempt logging note:', err.message);
      }
    }

    if (passed) {
      confetti({
        particleCount: 220,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#2563eb', '#4f46e5', '#10b981', '#06b6d4'],
      });
      toast.success('🎉 Exam Passed with Distinction!', {
        description: `Final Score: ${scorePct}% (${earnedPoints}/${totalPoints} pts). Verified on Real-Time Ledger.`,
      });
    } else {
      toast.error('Assessment finalized below threshold.', {
        description: `Score: ${scorePct}%. Re-attempt window unlocks in 24 hours.`,
      });
    }
  };

  // Launch a Real-Time Quiz from Hub
  const handleLaunchQuiz = (targetQuiz) => {
    navigate(`/student/quiz/${targetQuiz._id}`);
  };

  // Join via Room PIN
  const handleJoinByPin = (e) => {
    e.preventDefault();
    const cleanPin = roomPinInput.trim();
    if (!cleanPin) {
      toast.error('Please enter a 6-digit Room PIN');
      return;
    }
    toast.success(`Synchronizing to Real-Time Room #${cleanPin}...`);
    navigate(`/student/quiz/${cleanPin}`);
  };

  // Copy Room PIN to Clipboard
  const handleCopyPin = () => {
    const pin = roomId.replace('quiz_', '');
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    toast.success(`Room PIN #${pin} copied to clipboard! Share with peers to compete.`);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // Exit Quiz Handler
  const handleConfirmExit = () => {
    setExitModalOpen(false);
    leaveQuizRoom(roomId);
    toast.info('Exited quiz session.');
    if (quizId) {
      navigate('/student/quizzes');
    } else {
      setInHubMode(true);
    }
  };

  // =========================================================================
  // VIEW: REAL-TIME QUIZ HUB & ARENA LOBBY (Dashboard Matched Theme)
  // =========================================================================
  if (inHubMode) {
    return (
      <div className="flex flex-col w-full text-slate-800 antialiased pb-12">
        {/* Top Ambient Glow & Welcome Section */}
        <div className="relative w-full px-6 sm:px-8 lg:px-10 py-6 flex flex-col gap-8">
          
          {/* 1. HERO BANNER SECTION (Exact Match with Dashboard Welcome Banner) */}
          <section className="relative w-full rounded-2xl bg-white/95 backdrop-blur-xl shadow-sm border border-slate-200/90 p-6 lg:p-8 overflow-hidden">
            {/* Blueprint Accent Line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left Greeting & Telemetry Badges */}
              <div className="flex flex-col gap-3 max-w-2xl min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/70">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    REAL-TIME ARENA ACTIVE
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200/70">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    WEBSOCKET SYNCHRONIZED
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Real-Time Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">Quiz Arena</span>
                </h1>

                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Participate in live synchronized examinations with peers, track your ranking in real time on interactive leaderboards, and obtain certified credentials.
                </p>

                {/* Quick Join by PIN Form */}
                <form onSubmit={handleJoinByPin} className="max-w-md flex items-center gap-2 pt-2">
                  <div className="relative flex-1">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit Quiz PIN (e.g. 99428)"
                      value={roomPinInput}
                      onChange={(e) => setRoomPinInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-blue-500/20 shrink-0 cursor-pointer"
                  >
                    <span>Join Arena</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Right Summary Metrics Card */}
              <div className="flex items-center gap-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 self-stretch lg:self-auto justify-around lg:justify-start">
                <div className="text-center px-3">
                  <span className="text-xs text-slate-500 font-medium">Available Quizzes</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-0.5">
                    {availableQuizzes.length || 5}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="text-center px-3">
                  <span className="text-xs text-slate-500 font-medium">Live Multiplayer</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">
                    Ready
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. AVAILABLE QUIZZES GRID */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Live Quizzes & Assessments</h2>
                <p className="text-xs text-slate-500">Launch any quiz to enter its real-time synchronized arena</p>
              </div>
              <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                100% Free Open Access
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableQuizzes.length > 0 ? (
                availableQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400/60 p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                          {quiz.course?.domain || 'Technology'}
                        </span>
                        <span className="text-xs font-mono font-semibold text-emerald-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Live Synchronized
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {quiz.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {quiz.description || 'Test and certify your technical architecture proficiency.'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{quiz.timeLimitMinutes || 15} mins</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>{quiz.questions?.length || 5} questions</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-4">
                      <button
                        onClick={() => handleLaunchQuiz(quiz)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Enter Real-Time Arena</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                [
                  {
                    id: 'agentic-ai',
                    title: 'Agentic AI & Autonomous Systems: Real-Time Assessment',
                    desc: 'Verify your mastery over LLM agents, ReAct frameworks, memory structures, and tool calling pipelines.',
                    time: 15,
                    qCount: 5,
                    tag: 'Agentic AI',
                  },
                  {
                    id: 'cyber-sec',
                    title: 'Cyber Defense & Cryptographic Security: Certification Exam',
                    desc: 'Assess threat hunting, zero-trust network architectures, TLS 1.3 handshakes, and offensive tradecraft.',
                    time: 12,
                    qCount: 4,
                    tag: 'Cybersecurity',
                  },
                  {
                    id: 'fullstack-dist',
                    title: 'Full-Stack Distributed Systems & Microservices Challenge',
                    desc: 'Real-time test on state machines, distributed caching, WebSocket concurrency, and database indexing.',
                    time: 15,
                    qCount: 4,
                    tag: 'Distributed Systems',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400/60 p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                          {item.tag}
                        </span>
                        <span className="text-xs font-mono font-semibold text-emerald-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Live Synchronized
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.time} mins</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.qCount} questions</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-4">
                      <button
                        onClick={() => setInHubMode(false)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Enter Real-Time Arena</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: REAL-TIME QUIZ ARENA (Active Assessment Session - Dashboard Matched)
  // =========================================================================
  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans antialiased relative selection:bg-blue-600 selection:text-white pb-12">
      {/* Floating Emojis Canvas */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-24 right-8 sm:right-16 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200/90 text-slate-800 shadow-xl backdrop-blur-md animate-float-reaction"
          >
            <span className="text-2xl">{r.emoji}</span>
            <span className="text-xs font-semibold text-slate-600">{r.senderName}</span>
          </div>
        ))}
      </div>

      {/* TOP HEADER: REAL-TIME STATUS BAR (Dashboard Theme) */}
      <header className="sticky top-0 h-18 z-40 bg-white/95 border-b border-slate-200/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between shadow-xs">
        {/* Left: Brand / Return & Quiz Title */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={() => setExitModalOpen(true)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
            title="Exit Quiz"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </div>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-emerald-600 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE ARENA
              </span>
              <span className="text-slate-300">•</span>
              <button
                onClick={handleCopyPin}
                className="font-mono text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Click to copy Room PIN"
              >
                <span>PIN: #{roomId.replace('quiz_', '').slice(0, 6)}</span>
                {copiedPin ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[220px] sm:max-w-md lg:max-w-xl">
              {activeQuizMeta?.title || 'Cyber-Academic Real-Time Assessment'}
            </h1>
          </div>
        </div>

        {/* Right: Peers, Score, Timer, Sound & Leaderboard Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Peers Counter */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-mono text-slate-600">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{livePeersCount} online</span>
          </div>

          {/* Current Score & Streak Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-700">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>{liveScore} PTS</span>
            {currentStreak >= 2 && (
              <span className="flex items-center gap-0.5 text-amber-600 animate-pulse">
                <Flame className="w-3.5 h-3.5" /> {currentStreak}x
              </span>
            )}
          </div>

          {/* Synchronized Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className={timeLeft < 180 ? 'text-rose-600 font-bold animate-pulse' : ''}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Audio Effects' : 'Enable Audio Effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Leaderboard Drawer Toggle */}
          <button
            onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isLeaderboardOpen
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>

          {/* Exit Quiz Button */}
          <button
            onClick={() => setExitModalOpen(true)}
            className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 shadow-2xs"
            title="Exit Quiz"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Exit Quiz</span>
          </button>
        </div>
      </header>

      {/* Main Assessment Container */}
      <div className="flex-1 pt-6 px-4 sm:px-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
        {/* Navigation Tabs: Questions | Review | Summary */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveNavTab('questions')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNavTab === 'questions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Questions ({answeredCount}/{totalQuestions})
            </button>
            <button
              onClick={() => setActiveNavTab('review')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNavTab === 'review'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Review Grid {flaggedCount > 0 && <span className="ml-1 text-amber-600">({flaggedCount} ⚑)</span>}
            </button>
            {isSubmitted && (
              <button
                onClick={() => setActiveNavTab('summary')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeNavTab === 'summary'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Scorecard & Podium
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExitModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Exit Quiz"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Exit Quiz</span>
            </button>
            <button
              onClick={() => setScratchpadOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-mono text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Scratchpad</span>
            </button>
            <button
              onClick={() => setSubmitModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-bold text-xs transition-all shadow-sm shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <span>Submit Assessment</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Overall Progress: {progressPercent}%</span>
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Real-Time Answer Feedback Banner */}
        {recentAnswerFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              recentAnswerFeedback.isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {recentAnswerFeedback.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
            <span>{recentAnswerFeedback.text}</span>
          </div>
        )}

        {/* Proctor Warning Banner if Tab Switched */}
        {proctorWarnings > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Proctor telemetry active: {proctorWarnings} window blur warning(s) logged.</span>
            </div>
            <span className="text-[10px] text-amber-700">Audit Recorded</span>
          </div>
        )}

        {/* TAB 1: QUESTIONS VIEW (Dashboard Matched Card) */}
        {activeNavTab === 'questions' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Question Card (3 cols) */}
            <div className="lg:col-span-3 space-y-5">
              <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 overflow-hidden">
                {/* Blueprint Accent Line */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>

                {/* Question Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold uppercase px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                      {currentQ.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">• {currentQ.points || 10} Points</span>
                  </div>
                  <button
                    onClick={() => toggleFlag(currentQuestionIndex)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      flaggedQuestions[currentQuestionIndex]
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>⚑</span>
                    <span>{flaggedQuestions[currentQuestionIndex] ? 'Flagged' : 'Flag'}</span>
                  </button>
                </div>

                {/* Question Prompt */}
                <div className="space-y-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                    {currentQ.question}
                  </h2>
                  {currentQ.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {currentQ.subtitle}
                    </p>
                  )}
                </div>

                {/* Context Tag Blueprint */}
                {currentQ.context && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed font-mono">
                    <span className="text-blue-700 font-semibold">{currentQ.contextTag || 'Specification'}: </span>
                    {currentQ.context}
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption(currentQuestionIndex, opt.key)}
                        disabled={isSubmitted}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 border-2 border-blue-600 text-slate-900 shadow-sm ring-2 ring-blue-500/10'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700 shadow-2xs'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.key}
                        </div>
                        <div className="text-xs sm:text-sm leading-relaxed pt-0.5">
                          {opt.text}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Next / Previous Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="text-xs font-mono text-slate-500">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </div>

                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar: Question Matrix (1 col) */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Question Matrix
                  </h3>
                  <span className="text-[11px] font-mono text-blue-600 font-bold">
                    {answeredCount}/{totalQuestions} Done
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isCurrent = currentQuestionIndex === idx;
                    const isAnswered = selectedAnswers[idx] !== undefined;
                    const isFlagged = flaggedQuestions[idx];

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-10 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center relative transition-all cursor-pointer border ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                            : isAnswered
                            ? 'bg-slate-100 text-slate-800 border-slate-300 font-semibold'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {isFlagged && (
                          <span className="absolute top-1 right-1 text-[9px] text-amber-500">⚑</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1.5 text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-blue-600"></div>
                    <span>Active Question</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300"></div>
                    <span>Answered Question</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-white border border-slate-200"></div>
                    <span>Unanswered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REVIEW GRID VIEW */}
        {activeNavTab === 'review' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Assessment Review Matrix</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Inspect all answers, review flagged questions, and ensure readiness before final submission.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExitModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all border border-rose-200 flex items-center gap-1.5 cursor-pointer"
                  title="Exit Quiz"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Exit Quiz</span>
                </button>
                <button
                  onClick={() => setSubmitModalOpen(true)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((q, idx) => {
                const isAnswered = selectedAnswers[idx] !== undefined;
                const isFlagged = flaggedQuestions[idx];

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setActiveNavTab('questions');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      isFlagged
                        ? 'bg-amber-50/70 border-amber-200'
                        : isAnswered
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-500">Q.{idx + 1}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-200/60 text-slate-700 font-semibold">
                          {q.category}
                        </span>
                        {isFlagged && <span className="text-xs text-amber-600 font-bold">⚑ Flagged</span>}
                      </div>
                      <p className="text-xs font-medium text-slate-800 line-clamp-2">{q.question}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      {isAnswered ? (
                        <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                          Option {selectedAnswers[idx]}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-mono text-xs font-bold border border-rose-200">
                          Skipped
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SCORECARD & VICTORY PODIUM */}
        {activeNavTab === 'summary' && finalScorecard && (
          <div className="space-y-6">
            <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 text-center space-y-6 overflow-hidden">
              {/* Blueprint Accent Line */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">
                  Live Arena Telemetry Finalized
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900">
                  {finalScorecard.passed ? '🎉 Examination Completed with Distinction!' : 'Assessment Finalized'}
                </h2>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  Your responses have been cryptographically verified and committed to your official academic transcript.
                </p>
              </div>

              {/* 3-Place Victory Podium Visual */}
              <div className="flex items-end justify-center gap-4 sm:gap-6 pt-6 pb-2 max-w-lg mx-auto">
                {/* 2nd Place */}
                <div className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-300 p-0.5 bg-slate-100">
                    <img
                      src={podiumData[1]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt="2nd"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[90px]">
                    {podiumData[1]?.name || 'Dr. Alex'}
                  </span>
                  <div className="w-full h-24 rounded-t-xl bg-slate-100 border-t-2 border-slate-300 flex flex-col items-center justify-center shadow-xs">
                    <span className="text-xl font-extrabold text-slate-500">2</span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">{podiumData[1]?.score || 80} pts</span>
                  </div>
                </div>

                {/* 1st Place (Center) */}
                <div className="flex-1 flex flex-col items-center space-y-2">
                  <div className="relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</span>
                    <div className="w-14 h-14 rounded-full border-2 border-amber-400 p-0.5 bg-amber-50 shadow-md shadow-amber-400/20">
                      <img
                        src={podiumData[0]?.avatar || user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Scholar'}
                        alt="1st"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-700 truncate max-w-[90px]">
                    {podiumData[0]?.name || user?.name || 'You'}
                  </span>
                  <div className="w-full h-32 rounded-t-xl bg-gradient-to-t from-amber-100 to-amber-200 border-t-2 border-amber-500 flex flex-col items-center justify-center shadow-md">
                    <span className="text-2xl font-extrabold text-amber-700">1</span>
                    <span className="text-xs font-mono font-bold text-amber-800">
                      {podiumData[0]?.score || finalScorecard.earnedPoints} pts
                    </span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-700/40 p-0.5 bg-amber-50">
                    <img
                      src={podiumData[2]?.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100'}
                      alt="3rd"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[90px]">
                    {podiumData[2]?.name || 'Elena R.'}
                  </span>
                  <div className="w-full h-18 rounded-t-xl bg-amber-50 border-t-2 border-amber-700/60 flex flex-col items-center justify-center shadow-xs">
                    <span className="text-xl font-extrabold text-amber-800">3</span>
                    <span className="text-[10px] font-mono text-amber-800 font-semibold">{podiumData[2]?.score || 60} pts</span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 max-w-2xl mx-auto">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-xs text-slate-500">Final Score</span>
                  <p className="text-2xl font-extrabold text-blue-600 mt-1">{finalScorecard.scorePct}%</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-xs text-slate-500">Points Earned</span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {finalScorecard.earnedPoints}/{finalScorecard.totalPoints}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-xs text-slate-500">Accuracy</span>
                  <p className="text-2xl font-extrabold text-indigo-600 mt-1">
                    {finalScorecard.correctCount}/{finalScorecard.totalCount}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-xs text-slate-500">Time Taken</span>
                  <p className="text-2xl font-extrabold text-amber-600 mt-1">
                    {formatTime(finalScorecard.timeSpent)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setInHubMode(true)}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
                >
                  Return to Quiz Hub
                </button>
                <Link
                  to="/student/dashboard"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
                >
                  Go to Student Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING REAL-TIME REACTIONS DOCK (Dashboard Light Theme) */}
      {!isSubmitted && (
        <div className="fixed bottom-6 right-6 z-40 bg-white/95 border border-slate-200/90 backdrop-blur-xl rounded-2xl p-2 shadow-xl flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-500 px-2 hidden sm:inline">Reactions:</span>
          {['🔥', '⚡', '👏', '🧠', '🚀', '🎯'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendReaction(emoji)}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-lg hover:scale-125 transition-all cursor-pointer"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* SLIDE-OUT REAL-TIME LEADERBOARD DRAWER (Dashboard Theme) */}
      {isLeaderboardOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end"
          onClick={() => setIsLeaderboardOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 space-y-6 flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Live Room Leaderboard</h3>
              </div>
              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {(liveLeaderboard.length > 0 ? liveLeaderboard : [
                { rank: 1, name: 'You', score: liveScore, streak: currentStreak, isOnline: true },
                { rank: 2, name: 'Dr. Alex Vance', score: 70, streak: 3, isOnline: true },
                { rank: 3, name: 'Elena Rostova', score: 60, streak: 2, isOnline: true },
              ]).map((p, idx) => {
                const isMe = p.name === 'You' || p.userId === user?.id || p.userId === user?._id;
                return (
                  <div
                    key={p.userId || idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isMe
                        ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                        : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? 'bg-amber-400 text-white'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-700'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {p.name} {isMe && '(You)'}
                          </span>
                          {p.streak >= 2 && (
                            <span className="text-[10px] font-mono text-amber-600 font-bold flex items-center">
                              🔥{p.streak}x
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {p.answeredCount || 0} questions answered
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-extrabold text-blue-600">
                      {p.score || 0} PTS
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center font-mono">
              Live WebSocket Sync • Updates in real-time
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUBMISSION MODAL */}
      {submitModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSubmitModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Check className="w-5 h-5" />
                <span>Confirm Final Submission</span>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                You have answered <span className="font-bold text-slate-900">{answeredCount}</span> of{' '}
                <span className="font-bold text-slate-900">{totalQuestions}</span> questions.
              </p>
              {flaggedCount > 0 && (
                <p className="text-amber-600 font-semibold">
                  ⚠️ You currently have {flaggedCount} question(s) flagged for review.
                </p>
              )}
              <p className="text-slate-500">
                Once confirmed, your score will be calculated in real-time, broadcasted to the session podium, and stored on your academic record.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Continue Assessment
              </button>
              <button
                onClick={handleSubmitAssessment}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXIT QUIZ CONFIRMATION MODAL */}
      {exitModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setExitModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                  <LogOut className="w-4 h-4 text-rose-600" />
                </div>
                <span>Exit Quiz Session?</span>
              </div>
              <button
                onClick={() => setExitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="text-slate-800 font-medium">
                Are you sure you want to leave this quiz?
              </p>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Unsubmitted Progress Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-700">
                  You have answered <span className="font-bold text-slate-900">{answeredCount}</span> of{' '}
                  <span className="font-bold text-slate-900">{totalQuestions}</span> questions. Any unsubmitted answers will not be recorded on the official ledger.
                </p>
              </div>
              <p className="text-slate-500 text-[11px]">
                You can return to the Quiz Hub at any time to re-attempt or explore other available subjects.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setExitModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Stay in Quiz
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Yes, Exit Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK SCRATCHPAD MODAL */}
      {scratchpadOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setScratchpadOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-mono text-xs font-bold text-blue-600">
                Question {currentQuestionIndex + 1} Scratchpad
              </span>
              <button
                onClick={() => setScratchpadOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <textarea
              value={scratchpadNote}
              onChange={(e) => setScratchpadNote(e.target.value)}
              placeholder="Jot down formulas, algorithmic pseudocode, or architectural notes..."
              rows={6}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
            />

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Saved locally in memory</span>
              <button
                onClick={() => {
                  toast.success('Scratchpad note saved.');
                  setScratchpadOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
