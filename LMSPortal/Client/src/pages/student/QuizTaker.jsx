import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

// Curated 10-Question Cyber-Academic Assessment Pool (RESTful & Distributed Architecture)
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    points: 10,
    category: 'Core Theory',
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
    id: 2,
    points: 10,
    category: 'Cache Invalidation',
    question: 'What is the primary function of the ETag (Entity Tag) HTTP header in REST microservices?',
    subtitle: 'Determine mechanism for optimistic concurrency control and conditional updates.',
    context:
      'ETags act as cryptographic or hash-based fingerprints for specific resource representations, avoiding stale updates across distributed client caches.',
    contextTag: 'HTTP/1.1 Caching • RFC 7232',
    options: [
      { key: 'A', text: 'To encrypt the HTTP payload using TLS session keys.' },
      { key: 'B', text: 'To enable conditional requests via If-Match / If-None-Match headers.' },
      { key: 'C', text: 'To enforce cross-origin resource sharing (CORS) preflights.' },
      { key: 'D', text: 'To specify the maximum packet size for UDP transports.' },
    ],
    correctAnswer: 'B',
    explanation:
      'ETags allow web servers to validate cached resources conditionally via If-Match and If-None-Match headers.',
  },
  {
    id: 3,
    points: 10,
    category: 'Security & Auth',
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
    category: 'Core Theory',
    question: 'What is the primary purpose of a REST API?',
    subtitle: 'Evaluate the architectural constraints and operational rationale governing modern HTTP microservice communications.',
    context:
      'In modern cloud microservices and distributed computing architectures, REST (Representational State Transfer) adheres to stateless communication protocols over HTTP, exposing explicit resource URIs while decoupling the execution context of clients and origin servers.',
    contextTag: 'RFC 7231 Context • Architectural Blueprint',
    options: [
      {
        key: 'A',
        text: 'To provide a stateless, standardized architectural interface for distributed software systems to communicate and exchange representations of resources over HTTP.',
      },
      {
        key: 'B',
        text: 'To execute raw binary SQL transactions directly across cloud storage volumes without database abstraction.',
      },
      {
        key: 'C',
        text: 'To compile frontend client-side TypeScript code into machine bytecode on hardware servers.',
      },
      {
        key: 'D',
        text: 'To establish proprietary real-time hardware clock synchronization between distributed CPU kernels.',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'REST provides a uniform, stateless, resource-oriented interface allowing heterogeneous systems to interoperate reliably over standard HTTP protocols.',
  },
  {
    id: 5,
    points: 10,
    category: 'Status Codes',
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
    question: 'Which algorithmic pattern is widely implemented in edge API Gateways (Envoy, Kong) for burst-tolerant rate limiting?',
    subtitle: 'Model token replenishment and continuous throughput degradation under high load.',
    context:
      'The algorithm continuously replenishes capacity units at a defined fill rate while accommodating bursty client traffic up to bucket capacity.',
    contextTag: 'IETF Draft • RateLimit Header Field',
    options: [
      { key: 'A', text: 'Token Bucket / Leaky Bucket Algorithm.' },
      { key: 'B', text: 'Round Robin CPU Interleaving.' },
      { key: 'C', text: 'Dijkstra Shortest Route Queuing.' },
      { key: 'D', text: 'B-Tree Key Index Splitting.' },
    ],
    correctAnswer: 'A',
    explanation:
      'Token Bucket permits temporary traffic bursts up to maximum bucket depth while bounding sustained request rates to the refill velocity.',
  },
  {
    id: 7,
    points: 10,
    category: 'Hypermedia',
    question: 'What is the highest maturity level in the Richardson Maturity Model (Level 3)?',
    subtitle: 'Examine self-descriptive discoverability across distributed hypermedia workflows.',
    context:
      'At Level 3, clients navigate resources dynamically through relational hypermedia link controls embedded inside JSON responses.',
    contextTag: 'HATEOAS • Richardson Maturity Model',
    options: [
      { key: 'A', text: 'Level 3: HATEOAS (Hypermedia As The Engine Of Application State).' },
      { key: 'B', text: 'Level 3: GraphQL Schema Stitching.' },
      { key: 'C', text: 'Level 3: HTTP/2 Multiplexing.' },
      { key: 'D', text: 'Level 3: gRPC Protocol Buffers.' },
    ],
    correctAnswer: 'A',
    explanation:
      'Level 3 introduces HATEOAS, guiding API clients dynamically via embedded links rather than hardcoded client URIs.',
  },
  {
    id: 8,
    points: 10,
    category: 'Data Serialization',
    question: 'Why is content negotiation achieved using the Accept and Content-Type headers?',
    subtitle: 'Decouple raw representation format from underlying server data models.',
    context:
      'Clients communicate expected MIME media types (e.g. application/json, application/xml) enabling polyglot server formatting.',
    contextTag: 'RFC 7231 §5.3 • Content Negotiation',
    options: [
      { key: 'A', text: 'To permit servers to format response bodies in the representation requested by the client.' },
      { key: 'B', text: 'To encrypt request bodies using TLS session tokens.' },
      { key: 'C', text: 'To enforce CORS preflight verification.' },
      { key: 'D', text: 'To bypass reverse proxy caching.' },
    ],
    correctAnswer: 'A',
    explanation:
      'The Accept header allows clients to request specific MIME representations without mutating API endpoint paths.',
  },
  {
    id: 9,
    points: 10,
    category: 'Concurrency Control',
    question: 'How do REST APIs prevent the "Lost Update" problem during concurrent resource mutations?',
    subtitle: 'Contrast pessimistic locking with optimistic conditional concurrency checks.',
    context:
      'When multiple clients read state and send updates simultaneously, race conditions can overwrite intermediate changes unless validated.',
    contextTag: 'RFC 7232 §3.1 • Optimistic Concurrency',
    options: [
      { key: 'A', text: 'By utilizing If-Match headers with ETags or version timestamps (Optimistic Locking).' },
      { key: 'B', text: 'By permanently locking database tables on every GET request.' },
      { key: 'C', text: 'By forcing single-threaded node processes across all regions.' },
      { key: 'D', text: 'By converting all HTTP PUT calls to async message queues.' },
    ],
    correctAnswer: 'A',
    explanation:
      'If-Match headers ensure that a resource update only proceeds if the client’s cached ETag matches the current server version.',
  },
  {
    id: 10,
    points: 10,
    category: 'API Versioning',
    question: 'Which REST API versioning strategy avoids breaking existing URL namespaces and enables transparent routing?',
    subtitle: 'Compare URI path versioning, query parameters, custom media types, and headers.',
    context:
      'Custom vendor media types (e.g. Accept: application/vnd.company.v2+json) preserve uniform resource URIs across schema revisions.',
    contextTag: 'REST Architectural Constraints',
    options: [
      { key: 'A', text: 'Content Negotiation via Custom Vendor Media Types in the Accept Header.' },
      { key: 'B', text: 'Duplicating complete backend microservices into separate cloud clusters.' },
      { key: 'C', text: 'Appending random query hashes to each invocation.' },
      { key: 'D', text: 'Rewriting all database primary keys.' },
    ],
    correctAnswer: 'A',
    explanation:
      'Header/Media type versioning preserves pure resource URIs while giving clients fine-grained control over API schema evolution.',
  },
];

export default function QuizTaker() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Assessment State
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(3); // Start at Question 4 matching mockup
  const [selectedAnswers, setSelectedAnswers] = useState({
    0: 'B',
    1: 'B',
    2: 'B',
    3: 'A', // Q4 selected option A
  });
  const [flaggedQuestions, setFlaggedQuestions] = useState({
    4: true, // Q5 is flagged matching mockup
  });

  // Navigation View Tab: 'questions', 'review', 'summary'
  const [activeNavTab, setActiveNavTab] = useState('questions');

  // Timers & Stats
  const [timeLeft, setTimeLeft] = useState(1122); // 18:42 in seconds
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [scratchpadNote, setScratchpadNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScorecard, setFinalScorecard] = useState(null);
  const [selectedRemediationIndex, setSelectedRemediationIndex] = useState(5); // Default Q.06 matching design
  const [remediationFilter, setRemediationFilter] = useState('all'); // 'all' | 'incorrect'
  const [copiedHash, setCopiedHash] = useState(false);
  const [retakesRemaining, setRetakesRemaining] = useState(2);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
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
  }, [isSubmitted, timeLeft]);

  // Keyboard navigation [1-4], [A-D], [ArrowLeft], [ArrowRight], [F]
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if typing in scratchpad textarea
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
        return;
      }

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectOption(currentQuestionIndex, key);
      } else if (['1', '2', '3', '4'].includes(key)) {
        const map = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        handleSelectOption(currentQuestionIndex, map[key]);
      } else if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      } else if (key === 'F') {
        toggleFlag(currentQuestionIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, questions.length]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestionIndex] || questions[0];

  // Counts & Progress
  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = Object.keys(flaggedQuestions).filter((k) => flaggedQuestions[k]).length;
  const totalQuestions = questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Toggle option selection
  const handleSelectOption = (qIdx, optionKey) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optionKey,
    }));
  };

  // Toggle flag for review
  const toggleFlag = (qIdx) => {
    setFlaggedQuestions((prev) => {
      const next = { ...prev, [qIdx]: !prev[qIdx] };
      if (next[qIdx]) {
        toast.info(`Question ${qIdx + 1} flagged for review.`);
      } else {
        toast.success(`Question ${qIdx + 1} flag removed.`);
      }
      return next;
    });
  };

  // Final Assessment Submission
  const handleSubmitAssessment = async () => {
    setSubmitModalOpen(false);
    setIsSubmitted(true);

    // Compute score
    let correct = 0;
    let earnedPoints = 0;
    const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);

    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
        earnedPoints += q.points;
      }
    });

    const scorePct = Math.round((earnedPoints / totalPoints) * 100);
    const passed = scorePct >= 70;

    const scorecard = {
      scorePct,
      earnedPoints,
      totalPoints,
      correctCount: correct,
      totalCount: totalQuestions,
      passed,
      timeSpent: 1200 - timeLeft,
      completionTimestamp: new Date().toLocaleTimeString(),
      blockchainProof: '0x79f4...de81a0',
    };

    setFinalScorecard(scorecard);
    setActiveNavTab('summary');

    if (passed) {
      confetti({
        particleCount: 220,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#c0c1ff', '#8083ff', '#4cd7f6', '#d0bcff'],
      });
      toast.success('🎉 Exam Passed with Distinction!', {
        description: `Final Score: ${scorePct}% (${earnedPoints}/${totalPoints} pts). Verified on Ledger.`,
      });
    } else {
      toast.error('Assessment finalized below threshold.', {
        description: `Score: ${scorePct}%. Re-attempt window unlocks in 24 hours.`,
      });
    }
  };

  // Active Scorecard (defaults to the 82% benchmark if opened directly)
  const activeScorecard = useMemo(() => {
    if (finalScorecard) return finalScorecard;
    return {
      scorePct: 82,
      earnedPoints: 80,
      totalPoints: 100,
      correctCount: 8,
      totalCount: 10,
      passed: true,
      timeSpent: 763, // 12:43
      totalTime: 1800, // 30:00
      completionTimestamp: 'October 24, 2025',
      sessionCode: 'SESSION #SP-99428-REST',
      blockchainProof: '0x8f2d...c37e19b',
      missedIndices: [5, 8],
    };
  }, [finalScorecard]);

  // Questions displayed in remediation inspector (filtered by All or Incorrect Only)
  const displayedQuestions = useMemo(() => {
    if (remediationFilter === 'incorrect') {
      return questions
        .map((q, idx) => ({ q, idx }))
        .filter(({ idx }) => activeScorecard.missedIndices?.includes(idx));
    }
    return questions.map((q, idx) => ({ q, idx }));
  }, [remediationFilter, questions, activeScorecard.missedIndices]);

  // Action: Review Question Breakdown (smooth scroll)
  const handleReviewBreakdown = () => {
    const el = document.getElementById('question-inventory-remediation');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Action: Retake Exam
  const handleRetakeExam = () => {
    if (
      window.confirm(
        `You have ${retakesRemaining} attempts remaining for Module 04 Assessment. Retaking will overwrite your latest submission timestamp. Do you want to initialize a new examination workspace?`
      )
    ) {
      setRetakesRemaining((prev) => Math.max(0, prev - 1));
      setSelectedAnswers({});
      setFlaggedQuestions({});
      setCurrentQuestionIndex(0);
      setTimeLeft(1122);
      setIsSubmitted(false);
      setActiveNavTab('questions');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.info('New examination workspace initialized. Good luck!');
    }
  };

  // Action: Copy Cryptographic Proof Hash
  const handleCopyHash = () => {
    navigator.clipboard.writeText('0x8f2d6199a071c37e19b4cd7f90219');
    setCopiedHash(true);
    toast.success('Blockchain Audit Proof copied to clipboard!', {
      description: 'Cryptographic hash: 0x8f2d...c37e19b',
    });
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Action: Download Certificate PDF
  const handleDownloadCertificate = () => {
    toast.success('Downloading Certified Certificate (PDF)...', {
      description: 'Cryptographically signed CEU credential package ready.',
    });
  };

  return (
    <div className="bg-slate-50 font-body-md text-slate-800 antialiased min-h-screen flex flex-col">
      {/* ========================================================================= */}
      {/* FIXED TOP HEADER (h-20, crisp light academic bar)                         */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/90 text-slate-800">
        <div className="h-20 w-full px-6 sm:px-8 lg:px-10 flex items-center justify-between gap-space-md">
          {/* Left Title & Breadcrumbs */}
          <div className="flex items-center gap-space-md min-w-0 flex-1">
            <Link to="/student/dashboard" className="flex items-center gap-space-sm shrink-0 group">
              <img
                alt="Brand logo"
                className="h-8 w-auto object-contain rounded-md group-hover:scale-105 transition-transform"
                src="/assets/nova-logo.png"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://lh3.googleusercontent.com/aida/AEtjO1UgC3VTGpx9ax-r_6UpM35x8ax2iPF16pw-6-9F4A6rxNge9kMA45erC8H2iSBnyIy4xWEYwjhF9kdDro5CqtIjuKgMuwlLKS3cSbv-zeJ8-0U7T1fFSfFwgf7O0zSJfkCvo4x9ljzn45d17ujEfI92ox2cjYqT6y8xAefFjuqQBiOnY0w-EXB5FDtL6-jmJFUZVPigoqkbzdOf6LBjqJLorwHllR2p6rJaisk60SMmxcTsI_chQfBKOA';
                }}
              />
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight hidden sm:inline-block">
                StudyPilot
              </span>
              <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container-high text-primary tracking-widest border border-primary/20">
                NOVA LMS
              </span>
            </Link>

            <div className="h-6 w-px bg-outline-variant/30 hidden md:block shrink-0"></div>

            <div className="flex flex-col min-w-0 hidden md:flex">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm truncate">
                <Link to="/student/courses" className="hover:text-primary transition-colors cursor-pointer">
                  Courses
                </Link>
                <span className="text-outline">/</span>
                <span className="hover:text-primary transition-colors cursor-pointer truncate max-w-[200px] lg:max-w-none">
                  Fullstack Cloud Architecture & APIs
                </span>
                <span className="text-outline">/</span>
                <span className="text-on-surface font-label-md text-label-md truncate max-w-[220px] lg:max-w-none">
                  Module 04 Assessment: RESTful API Principles
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight truncate">
                Module 04: RESTful API Architecture & Design Principles Quiz
              </span>
            </div>
          </div>

          {/* Right Header: Progress, Timer, Navigation Tabs & Actions */}
          <div className="flex items-center gap-space-lg shrink-0">
            {/* Question Counter, Timer & Progress Bar */}
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-space-md">
                <div className="flex items-baseline gap-1">
                  <span className="font-label-md text-label-md text-on-surface-variant">Question</span>
                  <span className="font-headline-sm text-headline-sm text-tertiary">
                    {currentQuestionIndex + 1}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">/ {totalQuestions}</span>
                </div>
                <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-high text-tertiary animate-pulse border border-tertiary/20">
                  <span className="material-symbols-outlined text-[16px]">timer</span>
                  <span className="font-code-md text-code-md tracking-tight font-medium">
                    {formatTime(timeLeft)} remaining
                  </span>
                </div>
              </div>
              <div className="w-48 sm:w-56 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Nav Tabs: Questions | Review Sheet | Summary */}
            <nav className="hidden lg:flex items-center gap-space-sm">
              <button
                onClick={() => setActiveNavTab('questions')}
                className={`font-label-md px-space-sm py-1 rounded transition-colors ${
                  activeNavTab === 'questions'
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Questions
              </button>
              <button
                onClick={() => setActiveNavTab('review')}
                className={`font-label-md px-space-sm py-1 rounded transition-colors ${
                  activeNavTab === 'review'
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Review Sheet
              </button>
              <button
                onClick={() => setActiveNavTab('summary')}
                className={`font-label-md px-space-sm py-1 rounded transition-colors ${
                  activeNavTab === 'summary'
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Summary
              </button>
            </nav>

            {/* Exit & Avatar */}
            <div className="flex items-center gap-space-sm pl-space-xs">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to exit? Responses will be cached locally.')) {
                    navigate('/student/dashboard');
                  }
                }}
                className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-error-container text-on-surface hover:text-on-error-container font-label-md text-label-md transition-all border border-surface-container-highest/50"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="hidden sm:inline">Exit Assessment</span>
              </button>

              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-outline-variant/30"
                src="https://lh3.googleusercontent.com/aida/AEtjO1XbByWEm7GAGBdpGAqxfzCMFkFqyPMDwXR31XzQcAW_7qE0SHGe5KcOzSHZWxcw0LmYVlhtAk7GuWXJwOamtyOO7hYD8eHnfRtALEC4NQ1hJFLBj_d4fWul7LXFbzSQShCNhrcpZZIXAoIGb-LhcSZTC2vvOtdLVJ1flthUBrMubmy1MxwpgQOLAqaQFAgYcT03ym4nj3WiibxwIVLJYhXutQRm9XkDKIunk7iDXjozViMs0zGMJ1ra"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE BODY                                                       */}
      {/* ========================================================================= */}
      <main className="w-full pt-20 flex-1 bg-surface">
        <div className="flex flex-col w-full">
          {/* Ambient Glow Orbs */}
          <div className="relative w-full overflow-hidden">
            <div className="absolute -top-40 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/2 right-10 w-80 h-80 bg-tertiary-container/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full px-margin py-space-lg flex flex-col gap-space-lg max-w-7xl mx-auto">
              {/* Compact Diagnostic Ribbon (Hidden on Summary Scorecard) */}
              {activeNavTab !== 'summary' && (
                <div className="w-full bg-surface-container-low/90 backdrop-blur-md rounded-xl p-space-md shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-surface-container-high/40">
                  <div className="flex items-center gap-space-md flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary shrink-0 shadow-sm border border-tertiary/20">
                      <span className="material-symbols-outlined text-[20px]">terminal</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                        <span className="uppercase tracking-widest text-primary font-semibold">Proctored Session</span>
                        <span className="text-outline">•</span>
                        <span>RESTful Architecture &amp; API Systems</span>
                      </div>
                      <h1 className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                        Module 04 Exam Workspace
                      </h1>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-space-md shrink-0 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm border border-tertiary/20">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                      <span>Cloud Sync Active</span>
                    </div>
                    <div className="flex items-center gap-space-xs text-on-surface-variant font-code-md text-code-md bg-surface-container-highest/60 px-space-sm py-1 rounded border border-white/5">
                      <span className="material-symbols-outlined text-[16px] text-primary">network_ping</span>
                      <span>22ms jitter</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* VIEW 1: QUESTIONS WORKSPACE (Default)                             */}
              {/* ================================================================= */}
              {activeNavTab === 'questions' && (
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                  {/* Left: Question Area (8 cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-space-md">
                    {/* Main Question Card */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/90 relative overflow-hidden flex flex-col gap-6 text-slate-800">
                      {/* Top Accent Line */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>

                      {/* Header: Question Number & Flag Toggle */}
                      <div className="flex items-center justify-between gap-space-md flex-wrap">
                        <div className="flex items-center gap-space-sm">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/70">
                            QUESTION {String(currentQuestionIndex + 1).padStart(2, '0')} • SINGLE CHOICE ({currentQ.points} PTS)
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-xs border border-slate-200">
                            {currentQ.category}
                          </span>
                        </div>

                        {/* Quick Flag Button */}
                        <button
                          onClick={() => toggleFlag(currentQuestionIndex)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all border text-xs font-semibold cursor-pointer ${
                            flaggedQuestions[currentQuestionIndex]
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {flaggedQuestions[currentQuestionIndex] ? 'flag' : 'bookmark_border'}
                          </span>
                          <span>
                            {flaggedQuestions[currentQuestionIndex] ? 'Flagged' : 'Flag for Review'}
                          </span>
                        </button>
                      </div>

                      {/* Question Statement */}
                      <div className="flex flex-col gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                          {currentQ.question}
                        </h2>
                        <p className="text-sm text-slate-600">
                          {currentQ.subtitle}
                        </p>
                      </div>

                      {/* Contextual Architecture Blueprint Box */}
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-slate-800 flex flex-col gap-1.5 font-mono text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                            <span className="material-symbols-outlined text-[15px]">info</span>
                            <span>{currentQ.contextTag}</span>
                          </div>
                          <span className="text-slate-400">spec-ref</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {currentQ.context}
                        </p>
                      </div>

                      {/* Answer Choices List */}
                      <div aria-label="Answer Choices" className="flex flex-col gap-3" role="radiogroup">
                        {currentQ.options.map((opt) => {
                          const isSelected = selectedAnswers[currentQuestionIndex] === opt.key;
                          return (
                            <label
                              key={opt.key}
                              onClick={() => handleSelectOption(currentQuestionIndex, opt.key)}
                              className={`group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                                isSelected
                                  ? 'bg-blue-50/90 shadow-sm border-2 border-blue-600 text-blue-950'
                                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                              }`}
                            >
                              <input
                                checked={isSelected}
                                onChange={() => handleSelectOption(currentQuestionIndex, opt.key)}
                                className="sr-only"
                                name={`quiz_q${currentQuestionIndex}`}
                                type="radio"
                                value={opt.key}
                              />
                              {/* Option Badge */}
                              <div
                                className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-700'
                                }`}
                              >
                                {opt.key}
                              </div>
                              <div className="flex-1 flex flex-col gap-0.5">
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${
                                      isSelected ? 'text-blue-700' : 'text-slate-400'
                                    }`}
                                  >
                                    {isSelected ? 'Selected Option' : 'Alternative Option'}
                                  </span>
                                  {isSelected && (
                                    <span className="material-symbols-outlined text-blue-600 text-[18px]">
                                      check_circle
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm leading-relaxed ${isSelected ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                                  {opt.text}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>


                      {/* Contextual Helper Tip */}
                      <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-space-xs">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-outline">lock</span>
                          Answers are encrypted and cached continuously in browser memory.
                        </span>
                        <span className="font-code-md text-code-md text-outline">Keys [1-4] or [A-D]</span>
                      </div>
                    </div>

                    {/* Bottom Action Ribbon */}
                    <div className="w-full bg-surface-container-low/80 backdrop-blur-md rounded-xl p-space-md flex flex-wrap items-center justify-between gap-space-md shadow-md border border-surface-container-high/40">
                      <button
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all shadow-sm disabled:opacity-40 border border-surface-container-highest"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        <span>Previous Question</span>
                      </button>

                      <button
                        onClick={() => toggleFlag(currentQuestionIndex)}
                        className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-tertiary hover:bg-surface-container-high font-label-md text-label-md transition-all border border-surface-container-high"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px] text-tertiary">
                          {flaggedQuestions[currentQuestionIndex] ? 'flag' : 'outlined_flag'}
                        </span>
                        <span>
                          {flaggedQuestions[currentQuestionIndex] ? 'Question Flagged' : 'Flag Question For Review'}
                        </span>
                      </button>

                      <div className="flex items-center gap-space-sm">
                        <button
                          onClick={() =>
                            setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                          }
                          disabled={currentQuestionIndex === questions.length - 1}
                          className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all shadow-sm disabled:opacity-40 border border-surface-container-highest"
                          type="button"
                        >
                          <span>Next Question</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>

                        <button
                          onClick={() => setSubmitModalOpen(true)}
                          className="flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container hover:brightness-110 text-on-primary font-headline-sm text-headline-sm tracking-normal font-semibold shadow-lg hover:shadow-primary-container/25 transition-all"
                          type="button"
                        >
                          <span>Submit Exam</span>
                          <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Question Navigation Matrix & Session Telemetry (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col gap-space-md">
                    {/* Palette Container Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-6 border border-slate-200/90 text-slate-800">
                      {/* Palette Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] text-blue-600 uppercase tracking-widest font-semibold">
                            Navigation Palette
                          </span>
                          <h3 className="text-base font-bold text-slate-900">
                            Question Overview
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/70">
                          {totalQuestions} Questions
                        </span>
                      </div>

                      {/* Progress Snapshot Donut Ring */}
                      <div className="p-4 rounded-xl bg-slate-50 flex items-center gap-4 border border-slate-200/80">
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-200"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                            ></path>
                            <path
                              className="text-blue-600 transition-all duration-500"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeDasharray={`${progressPercent}, 100`}
                              strokeLinecap="round"
                              strokeWidth="3.5"
                            ></path>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              {progressPercent}%
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-900">
                            Assessment Progress
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {answeredCount} of {totalQuestions} questions answered.
                          </p>
                        </div>
                      </div>

                      {/* Question Jump Matrix */}
                      <div aria-label="Question Jump Matrix" className="grid grid-cols-5 gap-2" role="navigation">
                        {questions.map((q, idx) => {
                          const isAnswered = selectedAnswers[idx] !== undefined;
                          const isCurrent = currentQuestionIndex === idx;
                          const isFlagged = flaggedQuestions[idx];

                          return (
                            <button
                              key={q.id}
                              onClick={() => setCurrentQuestionIndex(idx)}
                              className={`h-11 rounded-xl font-mono text-xs font-semibold flex flex-col items-center justify-center relative transition-all cursor-pointer border ${
                                isCurrent
                                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm scale-105'
                                  : isFlagged
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isAnswered
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                              type="button"
                            >
                              <span>{String(idx + 1).padStart(2, '0')}</span>

                              {isAnswered && !isCurrent && (
                                <span
                                  className="material-symbols-outlined text-[12px] text-blue-600 absolute -top-1 -right-1 bg-white rounded-full shadow-sm"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  check_circle
                                </span>
                              )}

                              {isFlagged && (
                                <span
                                  className="material-symbols-outlined text-[12px] text-rose-500 absolute -top-1 -right-1 bg-white rounded-full shadow-sm"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  flag
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Matrix Legend */}
                      <div className="pt-space-xs flex flex-col gap-space-xs">
                        <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                          Status Indicators
                        </span>
                        <div className="grid grid-cols-2 gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                          <div className="flex items-center gap-space-xs">
                            <span
                              className="material-symbols-outlined text-[14px] text-tertiary"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                            <span>Answered ({answeredCount})</span>
                          </div>
                          <div className="flex items-center gap-space-xs">
                            <div className="w-3 h-3 rounded bg-primary-container"></div>
                            <span className="text-on-surface">Current (1)</span>
                          </div>
                          <div className="flex items-center gap-space-xs">
                            <span
                              className="material-symbols-outlined text-[14px] text-error"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              flag
                            </span>
                            <span>Flagged ({flaggedCount})</span>
                          </div>
                          <div className="flex items-center gap-space-xs">
                            <div className="w-3 h-3 rounded bg-surface-container"></div>
                            <span>Unanswered ({totalQuestions - answeredCount})</span>
                          </div>
                        </div>
                      </div>

                      {/* Proctoring & Rules Sidebar Box */}
                      <div className="mt-space-xs p-space-md rounded-xl bg-surface-container-lowest flex flex-col gap-space-xs border border-surface-container-high/30">
                        <div className="flex items-center gap-space-xs text-on-surface">
                          <span className="material-symbols-outlined text-[16px] text-primary">security</span>
                          <span className="font-label-md text-label-md font-medium">Honor Code & Integrity</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Full-screen assessment lockdown is enforced. Switching tabs or opening dev tools logs an event to the proctor audit stream.
                        </p>
                      </div>
                    </div>

                    {/* Quick Code Scratchpad Card */}
                    <div className="bg-surface-container-low/95 backdrop-blur-xl rounded-xl p-space-md shadow-lg flex items-center justify-between border border-surface-container-high/40">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-primary text-[20px]">code</span>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-medium">Scratchpad Note</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Draft quick notes for question {currentQuestionIndex + 1}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setScratchpadOpen(true)}
                        className="px-space-sm py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm border border-surface-container-highest"
                        type="button"
                      >
                        Open (Alt+N)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* VIEW 2: REVIEW SHEET VIEW                                         */}
              {/* ================================================================= */}
              {activeNavTab === 'review' && (
                <div className="w-full bg-surface-container-low/95 backdrop-blur-xl rounded-xl p-space-lg shadow-xl border border-surface-container-high/40 space-y-6">
                  <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
                    <div>
                      <h2 className="font-headline-md text-xl text-on-surface font-bold">
                        Examination Review Sheet
                      </h2>
                      <p className="font-body-sm text-on-surface-variant">
                        Review all your answered and flagged questions prior to final immutable submission.
                      </p>
                    </div>
                    <button
                      onClick={() => setSubmitModalOpen(true)}
                      className="px-5 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-lg font-semibold shadow-md hover:brightness-110"
                    >
                      Submit Exam Now
                    </button>
                  </div>

                  <div className="space-y-3">
                    {questions.map((q, idx) => {
                      const ans = selectedAnswers[idx];
                      const isFlagged = flaggedQuestions[idx];

                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-code-md text-sm font-bold text-tertiary bg-surface-container-high px-2 py-1 rounded">
                              Q{String(idx + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h4 className="font-headline-sm text-sm text-on-surface font-semibold line-clamp-1">
                                {q.question}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
                                <span>Status: {ans ? <strong className="text-primary">Answered ({ans})</strong> : <span className="text-outline">Unanswered</span>}</span>
                                {isFlagged && <span className="text-error font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">flag</span> Flagged for review</span>}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setCurrentQuestionIndex(idx);
                              setActiveNavTab('questions');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-tertiary self-end sm:self-center shrink-0"
                          >
                            Jump to Question
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* VIEW 3: SUMMARY & SCORECARD VIEW (StudyPilot Cyber-Academic)     */}
              {/* ================================================================= */}
              {activeNavTab === 'summary' && (
                <div className="w-full flex flex-col gap-space-xl animate-in fade-in zoom-in-95 duration-300">
                  {/* Breadcrumbs & Meta Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                    <div className="flex flex-col gap-space-xs min-w-0">
                      <nav className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm truncate">
                        <Link to="/student/courses" className="hover:text-primary transition-colors cursor-pointer">
                          Courses
                        </Link>
                        <span className="text-outline">/</span>
                        <Link
                          to={`/student/course/${courseId || 'fullstack-cloud'}/learn`}
                          className="hover:text-primary transition-colors cursor-pointer truncate max-w-[180px] sm:max-w-none"
                        >
                          Fullstack Cloud Architecture &amp; APIs
                        </Link>
                        <span className="text-outline">/</span>
                        <span className="hover:text-primary transition-colors cursor-pointer">
                          Module 04 Assessment
                        </span>
                        <span className="text-outline">/</span>
                        <span className="text-tertiary font-label-md text-label-md">
                          Examination Results
                        </span>
                      </nav>
                      <div className="flex items-center gap-space-sm flex-wrap pt-1">
                        <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface font-code-md text-code-md tracking-tight border border-surface-container-highest/40">
                          {activeScorecard.sessionCode}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Completed on {activeScorecard.completionTimestamp} • Proctoring Grade: Verified Cryptographic Lock
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-sm shrink-0">
                      <div className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">verified_user</span>
                        <span className="font-label-md text-label-md text-on-surface">
                          Proctor Integrity Score: 100%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hero Assessment Score & Celebration Hub */}
                  <section className="relative w-full rounded-xl bg-surface-container-low p-space-lg md:p-space-xl shadow-xl overflow-hidden border border-surface-container-high/40">
                    {/* Ambient Decorative Vector Burst */}
                    <svg
                      className="absolute -right-16 -top-16 w-96 h-96 opacity-10 pointer-events-none text-primary"
                      fill="currentColor"
                      viewBox="0 0 100 100"
                    >
                      <polygon points="50,0 62,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 38,35" />
                    </svg>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center relative z-10">
                      {/* Left: Radial Dial & Pass Badge */}
                      <div className="lg:col-span-5 flex flex-col items-center justify-center p-space-md rounded-xl bg-surface-container-lowest/70 shadow-md backdrop-blur-md border border-surface-container-high/30">
                        <div className="relative w-56 h-56 flex items-center justify-center">
                          {/* Radial Meter SVG */}
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                            {/* Track */}
                            <circle
                              className="text-surface-variant"
                              cx="80"
                              cy="80"
                              fill="none"
                              r="68"
                              stroke="currentColor"
                              strokeWidth="10"
                            />
                            {/* Gradients */}
                            <defs>
                              <linearGradient id="scoreRingGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                                <stop offset="0%" stopColor="#4cd7f6" />
                                <stop offset="50%" stopColor="#8083ff" />
                                <stop offset="100%" stopColor="#c0c1ff" />
                              </linearGradient>
                            </defs>
                            {/* 82% stroke-dashoffset: 2 * PI * 68 = 427.25. 427.25 * (1 - 0.82) = ~76.9 */}
                            <circle
                              className="transition-all duration-1000 ease-out"
                              cx="80"
                              cy="80"
                              fill="none"
                              r="68"
                              stroke="url(#scoreRingGrad)"
                              strokeDasharray="427.25"
                              strokeDashoffset={427.25 * (1 - activeScorecard.scorePct / 100)}
                              strokeLinecap="round"
                              strokeWidth="12"
                            />
                          </svg>

                          {/* Inner Metric Text */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="font-headline-hero text-headline-hero text-on-surface tracking-tighter leading-none">
                              {activeScorecard.scorePct}
                              <span className="font-headline-sm text-headline-sm text-tertiary">%</span>
                            </span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1">
                              Final Score
                            </span>
                          </div>
                        </div>

                        {/* Passing Status Chip */}
                        <div
                          className={`mt-space-md flex items-center gap-space-xs px-space-md py-1.5 rounded-full ${
                            activeScorecard.passed
                              ? 'bg-tertiary-container/20 text-tertiary border border-tertiary/20'
                              : 'bg-error-container/20 text-error border border-error/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {activeScorecard.passed ? 'verified' : 'cancel'}
                          </span>
                          <span className="font-label-lg text-label-lg font-bold tracking-wide">
                            {activeScorecard.passed ? 'Passed with Distinction' : 'Passing Threshold Unmet'}
                          </span>
                        </div>

                        {/* Passing Threshold Met Note */}
                        <div className="mt-space-sm flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                          <span
                            className={`w-2 h-2 rounded-full ${activeScorecard.passed ? 'bg-tertiary' : 'bg-error'}`}
                          ></span>
                          <span>
                            Required Passing Threshold: <strong>70% (7/10)</strong>
                          </span>
                        </div>
                      </div>

                      {/* Right: Context, Congratulations & Course Action Banner */}
                      <div className="lg:col-span-7 flex flex-col gap-space-md">
                        <div className="flex items-center gap-space-xs text-tertiary font-label-md text-label-md tracking-wider uppercase">
                          <span className="material-symbols-outlined text-[16px]">celebration</span>
                          <span>Curriculum Milestone Completed</span>
                        </div>
                        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                          Module 04: RESTful Architecture &amp; API Systems
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                          {activeScorecard.passed
                            ? 'Outstanding execution. You demonstrated sophisticated comprehension of stateless HTTP verb idempotency, representation payloads, and hypermedia design constraints. Your credential has been appended to the Cohort ledger.'
                            : 'Review the flagged domain areas and examine the remediation breakdown below. You can retake the assessment to meet the curriculum threshold.'}
                        </p>

                        {/* Quick Action Button Bar */}
                        <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
                          <button
                            onClick={handleReviewBreakdown}
                            className="flex items-center gap-space-sm px-space-lg py-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-lg text-label-lg shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                            id="btn-review-questions"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]">fact_check</span>
                            <span>Review Question Breakdown</span>
                          </button>
                          <button
                            onClick={handleRetakeExam}
                            className="flex items-center gap-space-sm px-space-lg py-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg shadow-sm transition-all border border-surface-container-highest/50 cursor-pointer"
                            id="btn-retake-exam"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]">cached</span>
                            <span>Retake Quiz</span>
                            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant">
                              {retakesRemaining}/3 Left
                            </span>
                          </button>
                          <Link
                            to={`/student/course/${courseId || 'fullstack-cloud'}/learn`}
                            className="flex items-center gap-space-xs px-space-md py-3 rounded-xl text-primary hover:text-on-surface hover:bg-surface-container-high font-label-lg text-label-lg transition-all"
                          >
                            <span>Continue to Module 05</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Performance Metrics (4-Card Bento Grid) */}
                  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                    {/* Card 1: Correct Answers */}
                    <div className="flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Correct Answers
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary border border-tertiary/20">
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        </div>
                      </div>
                      <div className="mt-space-md flex items-baseline gap-space-xs">
                        <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                          {activeScorecard.correctCount}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface-variant">
                          / {activeScorecard.totalCount}
                        </span>
                      </div>
                      <div className="mt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                        <span>
                          Points Earned: <strong>{activeScorecard.earnedPoints} / {activeScorecard.totalPoints}</strong>
                        </span>
                        <span className="text-tertiary font-medium">
                          {activeScorecard.scorePct}% Accuracy
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Incorrect Answers */}
                    <div className="flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Incorrect Answers
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-error-container/40 flex items-center justify-center text-error border border-error/20">
                          <span className="material-symbols-outlined text-[20px]">cancel</span>
                        </div>
                      </div>
                      <div className="mt-space-md flex items-baseline gap-space-xs">
                        <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                          {activeScorecard.totalCount - activeScorecard.correctCount}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface-variant">
                          / {activeScorecard.totalCount}
                        </span>
                      </div>
                      <div className="mt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                        <span>
                          Points Missed: <strong>{activeScorecard.totalPoints - activeScorecard.earnedPoints} pts</strong>
                        </span>
                        <span className="text-error font-medium">Q.06, Q.09</span>
                      </div>
                    </div>

                    {/* Card 3: Time Elapsed */}
                    <div className="flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Time Invested
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary border border-primary/20">
                          <span className="material-symbols-outlined text-[20px]">timer</span>
                        </div>
                      </div>
                      <div className="mt-space-md flex items-baseline gap-space-xs">
                        <span className="font-headline-lg text-headline-lg text-on-surface font-bold font-code-md">
                          {formatTime(activeScorecard.timeSpent)}
                        </span>
                        <span className="font-label-md text-label-md text-on-surface-variant font-code-md">
                          / 30:00
                        </span>
                      </div>
                      <div className="mt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                        <span>
                          Remaining: <strong className="text-primary">{formatTime(Math.max(0, 1800 - activeScorecard.timeSpent))}</strong>
                        </span>
                        <span className="text-on-surface-variant">Pace: 1.2m/q</span>
                      </div>
                    </div>

                    {/* Card 4: Percentile Cohort Rank */}
                    <div className="flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          Cohort Percentile
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary border border-secondary/20">
                          <span className="material-symbols-outlined text-[20px]">leaderboard</span>
                        </div>
                      </div>
                      <div className="mt-space-md flex items-baseline gap-space-xs">
                        <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                          Top 14%
                        </span>
                      </div>
                      <div className="mt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                        <span>
                          Pool: <strong>3,420 Engineers</strong>
                        </span>
                        <span className="text-secondary font-medium">Distinction</span>
                      </div>
                    </div>
                  </section>

                  {/* Two-Column Asymmetric Deep Dive Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
                    {/* Left: Domain Mastery Breakdown (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-space-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-primary text-[22px]">hub</span>
                          <h2 className="font-headline-md text-headline-md text-on-surface">
                            Knowledge Domain Competency
                          </h2>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Curriculum Standard 4.1
                        </span>
                      </div>

                      <div className="flex flex-col gap-space-sm">
                        {/* Domain 1 */}
                        <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs shadow-sm border border-surface-container-high/40">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-space-sm">
                              <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                              <span className="font-headline-sm text-headline-sm text-on-surface">
                                Resource Representation &amp; HTTP Verbs
                              </span>
                            </div>
                            <div className="flex items-center gap-space-xs">
                              <span className="font-code-md text-code-md font-bold text-tertiary">100%</span>
                              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary font-semibold">
                                Mastery
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden mt-1">
                            <div className="h-full bg-tertiary rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm pt-1">
                            <span>Evaluated: GET, POST, PUT, PATCH semantics</span>
                            <span>3 of 3 Correct</span>
                          </div>
                        </div>

                        {/* Domain 2 */}
                        <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs shadow-sm border border-surface-container-high/40">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-space-sm">
                              <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                              <span className="font-headline-sm text-headline-sm text-on-surface">
                                Statelessness &amp; Idempotency
                              </span>
                            </div>
                            <div className="flex items-center gap-space-xs">
                              <span className="font-code-md text-code-md font-bold text-tertiary">100%</span>
                              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary font-semibold">
                                Mastery
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden mt-1">
                            <div className="h-full bg-tertiary rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm pt-1">
                            <span>Evaluated: Client session detachment &amp; idempotent operations</span>
                            <span>3 of 3 Correct</span>
                          </div>
                        </div>

                        {/* Domain 3 */}
                        <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs shadow-sm border border-surface-container-high/40">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-space-sm">
                              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                              <span className="font-headline-sm text-headline-sm text-on-surface">
                                Error Handling &amp; Status Codes (4xx / 5xx)
                              </span>
                            </div>
                            <div className="flex items-center gap-space-xs">
                              <span className="font-code-md text-code-md font-bold text-primary">66%</span>
                              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-primary-container/20 text-primary font-semibold">
                                Proficient
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden mt-1">
                            <div className="h-full bg-primary rounded-full" style={{ width: '66%' }}></div>
                          </div>
                          <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm pt-1">
                            <span>Missed: 409 Conflict vs 422 Unprocessable Content distinction</span>
                            <span>2 of 3 Correct</span>
                          </div>
                        </div>

                        {/* Domain 4 */}
                        <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs shadow-sm border border-surface-container-high/40">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-space-sm">
                              <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                              <span className="font-headline-sm text-headline-sm text-on-surface">
                                HATEOAS &amp; Hypermedia Constraints
                              </span>
                            </div>
                            <div className="flex items-center gap-space-xs">
                              <span className="font-code-md text-code-md font-bold text-error">50%</span>
                              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-error-container/30 text-error font-semibold">
                                Needs Review
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden mt-1">
                            <div className="h-full bg-error rounded-full" style={{ width: '50%' }}></div>
                          </div>
                          <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm pt-1">
                            <span>Missed: Richardson Maturity Level 3 URI hyperlinking traversal</span>
                            <span>1 of 2 Correct</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Verified Credential & Cohort Comparison Sandbox (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-space-md">
                      {/* Verified Credential Badge Card */}
                      <div className="relative p-space-lg rounded-xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low shadow-xl overflow-hidden border border-surface-container-high/40">
                        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-space-sm">
                            <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary border border-primary/30">
                              <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                            </div>
                            <div>
                              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                                Verified Academic Credential
                              </span>
                              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                                Cloud Micro-Credential Unlock
                              </h3>
                            </div>
                          </div>
                          <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-highest text-tertiary font-code-md border border-tertiary/20">
                            CEU-1.5
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-space-md leading-relaxed">
                          Congratulations! Passing this proctored checkpoint unlocked{' '}
                          <strong>1.5 Continuing Education Units (CEUs)</strong>. This milestone is permanently notarized in the NOVA decentralized credential ledger.
                        </p>
                        <div className="mt-space-md p-space-sm rounded-lg bg-surface-container-lowest font-code-md text-code-md text-on-surface-variant flex items-center justify-between border border-surface-container-high/30">
                          <div className="truncate max-w-[240px]">
                            <span className="text-outline">Hash: </span>
                            <span className="text-on-surface">0x8f2d...c37e19b</span>
                          </div>
                          <button
                            onClick={handleCopyHash}
                            className="text-primary hover:text-on-surface transition-colors flex items-center gap-1 font-label-sm text-label-sm cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {copiedHash ? 'check' : 'content_copy'}
                            </span>
                            <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="mt-space-lg flex items-center justify-between pt-space-xs">
                          <button
                            onClick={handleDownloadCertificate}
                            className="inline-flex items-center gap-space-xs font-label-md text-label-md text-tertiary hover:underline cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            <span>Download Certified Certificate (PDF)</span>
                          </button>
                          <span className="material-symbols-outlined text-outline text-[18px]">verified</span>
                        </div>
                      </div>

                      {/* Peer Distribution Histogram Card */}
                      <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-sm border border-surface-container-high/40">
                        <div className="flex items-center justify-between">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            Cohort Score Curve
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Mean: 68.4%
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Your score (82%) places you in the upper decile of the Autumn 2025 Global Engineering Cohort.
                        </p>

                        {/* Inline SVG Histogram Chart */}
                        <div className="w-full pt-2">
                          <svg className="w-full h-24 overflow-visible" viewBox="0 0 300 80">
                            {/* Grid guide lines */}
                            <line className="text-surface-variant" stroke="currentColor" strokeWidth="1" x1="0" x2="300" y1="75" y2="75" />
                            <line className="text-surface-variant" stroke="currentColor" strokeDasharray="2 4" strokeWidth="0.5" x1="0" x2="300" y1="40" y2="40" />

                            {/* Histogram Bars */}
                            {/* Bin 0-30% */}
                            <rect className="fill-surface-variant" height="10" rx="3" width="22" x="10" y="65" />
                            {/* Bin 30-50% */}
                            <rect className="fill-surface-variant" height="23" rx="3" width="22" x="40" y="52" />
                            {/* Bin 50-60% */}
                            <rect className="fill-surface-variant" height="37" rx="3" width="22" x="70" y="38" />
                            {/* Bin 60-70% (Passing Threshold) */}
                            <rect className="fill-surface-variant" height="51" rx="3" width="22" x="100" y="24" />
                            {/* Bin 70-80% */}
                            <rect className="fill-surface-bright" height="61" rx="3" width="22" x="130" y="14" />
                            {/* Bin 80-90% (USER IS HERE) */}
                            <rect className="fill-primary" height="67" rx="3" width="22" x="160" y="8" />
                            {/* Bin 90-100% */}
                            <rect className="fill-surface-bright" height="43" rx="3" width="22" x="190" y="32" />
                            {/* Bin Perfect 100% */}
                            <rect className="fill-surface-variant" height="17" rx="3" width="22" x="220" y="58" />

                            {/* User Marker Pin */}
                            <circle className="fill-tertiary" cx="171" cy="4" r="3.5" />
                            <text className="fill-tertiary font-bold" fontSize="8" textAnchor="middle" x="171" y="-3">
                              You (82%)
                            </text>
                          </svg>
                        </div>
                        <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-2">
                          <span>0%</span>
                          <span className="text-error font-medium">70% Pass Cutoff</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question-by-Question Rapid Inspector Tray */}
                  <section
                    id="question-inventory-remediation"
                    className="flex flex-col gap-space-md p-space-lg rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                          Question Inventory &amp; Remediation
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Audit all 10 responses, architectural code solutions, and proctoring logs.
                        </p>
                      </div>
                      <div className="flex items-center gap-space-sm">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Filter:</span>
                        <button
                          onClick={() => setRemediationFilter('all')}
                          className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-colors cursor-pointer ${
                            remediationFilter === 'all'
                              ? 'bg-surface-container-high text-on-surface font-semibold border border-surface-container-highest'
                              : 'text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                          type="button"
                        >
                          All (10)
                        </button>
                        <button
                          onClick={() => setRemediationFilter('incorrect')}
                          className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-colors cursor-pointer ${
                            remediationFilter === 'incorrect'
                              ? 'bg-error-container/30 text-error font-semibold border border-error/30'
                              : 'text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                          type="button"
                        >
                          Incorrect Only (2)
                        </button>
                      </div>
                    </div>

                    {/* 10 Question Tiles Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-space-sm pt-2">
                      {displayedQuestions.map(({ q, idx }) => {
                        const isWrong = activeScorecard.missedIndices?.includes(idx);
                        const isSelected = selectedRemediationIndex === idx;

                        return (
                          <div
                            key={q.id}
                            onClick={() => setSelectedRemediationIndex(idx)}
                            className={`p-space-sm rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border ${
                              isWrong
                                ? 'bg-error-container/20 hover:bg-error-container/30 border-error/30'
                                : 'bg-surface-container hover:bg-surface-container-high border-surface-container-high/40'
                            } ${
                              isSelected
                                ? 'ring-2 ring-primary scale-105 shadow-md'
                                : ''
                            }`}
                          >
                            <span
                              className={`font-label-sm text-label-sm ${
                                isWrong ? 'text-error font-semibold' : 'text-on-surface-variant'
                              }`}
                            >
                              Q.{String(idx + 1).padStart(2, '0')}
                            </span>
                            <span
                              className={`material-symbols-outlined text-[20px] ${
                                isWrong ? 'text-error' : 'text-tertiary'
                              }`}
                            >
                              {isWrong ? 'cancel' : 'check_circle'}
                            </span>
                            <span
                              className={`font-label-sm text-label-sm font-bold ${
                                isWrong ? 'text-error' : 'text-tertiary'
                              }`}
                            >
                              {isWrong ? '0/10' : '10/10'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sample Expanded Remediation Card */}
                    {(() => {
                      const curQ = questions[selectedRemediationIndex] || questions[5];
                      const isWrong = activeScorecard.missedIndices?.includes(selectedRemediationIndex);

                      return (
                        <div className="mt-space-sm p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm border border-surface-container-high/50">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-space-xs">
                              <span
                                className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-bold ${
                                  isWrong
                                    ? 'bg-error-container/30 text-error'
                                    : 'bg-tertiary-container/30 text-tertiary'
                                }`}
                              >
                                Question {String(selectedRemediationIndex + 1).padStart(2, '0')} •{' '}
                                {isWrong ? 'Incorrect' : 'Correct'}
                              </span>
                              <span className="font-label-md text-label-md text-on-surface font-semibold">
                                {selectedRemediationIndex === 5
                                  ? 'HTTP 409 Conflict vs 422 Unprocessable Content'
                                  : selectedRemediationIndex === 8
                                  ? 'Optimistic Locking via ETags & If-Match'
                                  : curQ.subtitle || curQ.category}
                              </span>
                            </div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                              Domain: {curQ.category || 'Error Handling & Status Codes'}
                            </span>
                          </div>

                          <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                            "{curQ.question}"
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm pt-1">
                            <div
                              className={`p-space-sm rounded-lg flex items-start gap-space-xs ${
                                isWrong ? 'bg-error-container/10 border border-error/20' : 'bg-surface-container-high'
                              }`}
                            >
                              <span
                                className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                                  isWrong ? 'text-error' : 'text-tertiary'
                                }`}
                              >
                                {isWrong ? 'close' : 'check'}
                              </span>
                              <div className="flex flex-col">
                                <span
                                  className={`font-label-sm text-label-sm font-bold ${
                                    isWrong ? 'text-error' : 'text-tertiary'
                                  }`}
                                >
                                  Your Response:{' '}
                                  {selectedRemediationIndex === 5
                                    ? '422 Unprocessable Content'
                                    : selectedRemediationIndex === 8
                                    ? 'By permanently locking database tables on every GET request.'
                                    : curQ.options.find((o) => o.key === curQ.correctAnswer)?.text || 'Option Selected'}
                                </span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  {selectedRemediationIndex === 5
                                    ? 'Incorrect because syntax and semantics were valid, but state conflict was present.'
                                    : selectedRemediationIndex === 8
                                    ? 'Pessimistic table locking degrades concurrency and causes cascading timeouts.'
                                    : 'Validated against standard RFC specifications.'}
                                </span>
                              </div>
                            </div>

                            <div className="p-space-sm rounded-lg bg-tertiary-container/10 border border-tertiary/20 flex items-start gap-space-xs">
                              <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">
                                check
                              </span>
                              <div className="flex flex-col">
                                <span className="font-label-sm text-label-sm text-tertiary font-bold">
                                  Correct Response:{' '}
                                  {selectedRemediationIndex === 5
                                    ? '409 Conflict'
                                    : curQ.options.find((o) => o.key === curQ.correctAnswer)?.text || 'Correct Option'}
                                </span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  {selectedRemediationIndex === 5
                                    ? 'RFC 9110 specifies 409 for conflicts with the current state of the target resource.'
                                    : curQ.explanation}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </section>

                  {/* Instructors & Learning Path Recommendations Footer Widget */}
                  <section className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-lg border border-surface-container-high/40">
                    <div className="flex items-center gap-space-md">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shrink-0 border border-primary/20">
                        <span className="material-symbols-outlined text-[28px]">auto_stories</span>
                      </div>
                      <div>
                        <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Ready for Module 05: Microservices &amp; Event-Driven Streaming?
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Prerequisites met. Recommended reading: Kafka partition schemes and gRPC contract proto buffers.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-sm shrink-0 w-full md:w-auto">
                      <Link
                        to={`/student/course/${courseId || 'fullstack-cloud'}/learn`}
                        className="w-full md:w-auto text-center px-space-lg py-2.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:brightness-110 transition-all font-semibold"
                      >
                        Launch Next Module
                      </Link>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* SUBMISSION CONFIRMATION MODAL                                             */}
      {/* ========================================================================= */}
      {submitModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl flex items-center justify-center p-space-md transition-opacity duration-300 animate-in fade-in"
          onClick={() => setSubmitModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl bg-surface-container-low rounded-xl shadow-2xl p-space-xl flex flex-col gap-space-lg border border-surface-container-high transform scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Specular Lighting Bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-tertiary to-secondary rounded-t-xl"></div>

            {/* Icon & Header */}
            <div className="flex items-start gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 shadow-md border border-primary/20">
                <span className="material-symbols-outlined text-[28px]">assignment_turned_in</span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-semibold">
                  Assessment Finalization
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Are you sure you want to submit?
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  You have answered <span className="text-on-surface font-semibold">{answeredCount} of {totalQuestions}</span> questions.
                  {flaggedCount > 0 && (
                    <span className="text-error font-medium"> {flaggedCount} question remains flagged</span>
                  )}{' '}
                  for your review before closing.
                </p>
              </div>
            </div>

            {/* Metric Summary Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/40">
              <div className="flex flex-col items-center justify-center p-space-xs text-center">
                <span className="font-headline-md text-headline-md text-tertiary font-bold">{answeredCount}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Answered</span>
              </div>
              <div className="flex flex-col items-center justify-center p-space-xs text-center">
                <span className="font-headline-md text-headline-md text-error font-bold">{flaggedCount}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Flagged</span>
              </div>
              <div className="flex flex-col items-center justify-center p-space-xs text-center">
                <span className="font-headline-md text-headline-md text-outline font-bold">
                  {totalQuestions - answeredCount}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Unanswered</span>
              </div>
              <div className="flex flex-col items-center justify-center p-space-xs text-center">
                <span className="font-headline-md text-headline-md text-primary font-bold">{formatTime(timeLeft)}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Time Left</span>
              </div>
            </div>

            {/* Warning Disclaimer */}
            <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container text-on-surface-variant border border-surface-container-high/40">
              <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0 mt-0.5">
                verified_user
              </span>
              <span className="font-body-sm text-body-sm">
                Once finalized, your responses will be immutably recorded in the grading database. Scorecard will be immediately available.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-space-sm pt-space-xs">
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="w-full sm:w-auto px-space-lg py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all border border-surface-container-highest"
                type="button"
              >
                Return to Questions
              </button>
              <button
                onClick={handleSubmitAssessment}
                className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-xl py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline-sm text-headline-sm font-semibold shadow-lg hover:brightness-110 transition-all"
                type="button"
              >
                <span>Confirm & Submit Exam</span>
                <span className="material-symbols-outlined text-[18px]">check</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK SCRATCHPAD MODAL                                                    */}
      {/* ========================================================================= */}
      {scratchpadOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setScratchpadOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-surface-container-low border border-surface-container-high rounded-xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <div className="flex items-center gap-2 text-primary font-bold font-code-md">
                <span className="material-symbols-outlined text-[20px]">code</span>
                <span>Question {currentQuestionIndex + 1} Scratchpad</span>
              </div>
              <button
                onClick={() => setScratchpadOpen(false)}
                className="p-1 rounded text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <textarea
              value={scratchpadNote}
              onChange={(e) => setScratchpadNote(e.target.value)}
              placeholder="Jot down notes, formula derivations, or architectural thoughts..."
              rows={6}
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            ></textarea>

            <div className="flex items-center justify-between text-xs text-outline">
              <span>Saved locally in memory.</span>
              <button
                onClick={() => {
                  toast.success('Scratchpad note saved.');
                  setScratchpadOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECURE PROCTOR FOOTER                                                     */}
      {/* ========================================================================= */}
      <footer className="w-full bg-surface-container-lowest/80 py-space-md border-t border-surface-container-high/40">
        <div className="w-full px-margin flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
          <span>NOVA LMS Secure Proctoring Engine • Session Verified</span>
          <span>Auto-saving response cache active • Latency: 14ms</span>
        </div>
      </footer>
    </div>
  );
}
