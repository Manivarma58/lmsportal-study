import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import NeuralBackground from '../../components/NeuralBackground';

const FLAGSHIP_COURSES = [
  {
    dbSlug: 'neural-networks-quantum-computing',
    title: 'Neural Networks & Quantum Computing',
    description: 'Architect qubit entanglement algorithms, tensor contractions, and deep quantum neural models.',
    category: 'AI & Machine Learning',
    quickTag: 'Quantum Computing',
    badge: 'QUANTUM AI',
    badgeColor: 'text-tertiary',
    dotColor: 'bg-tertiary',
    level: 'Advanced Masterclass',
    levelPill: 'ADVANCED',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Dr. Elena Vance',
    role: 'Stanford AI Fellow',
    avatar: '/assets/instructor-elena.jpg',
    rating: '4.9',
    reviews: '1.8k',
    duration: '8 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '36 Modules',
    students: '14.2k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: '/assets/course-quantum.jpg',
  },
  {
    dbSlug: 'cyber-defense-cryptographic-security',
    title: 'Cyber Defense & Cryptographic Security',
    description: 'Elliptic curve primitives, zero-trust perimeter telemetry, and live red/blue offensive simulations.',
    category: 'Cybersecurity & Crypto',
    quickTag: 'Cryptographic Security',
    badge: 'CYBER DEFENSE',
    badgeColor: 'text-secondary',
    dotColor: 'bg-secondary',
    level: 'Intermediate Specialist',
    levelPill: 'INTERMEDIATE',
    levelBg: 'bg-tertiary-container/90 text-on-tertiary',
    instructor: 'Marcus Lin, CISSP',
    role: 'Senior Infosec Director',
    initials: 'ML',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    rating: '4.8',
    reviews: '2.4k',
    duration: '6 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '28 Modules',
    students: '18.9k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: '/assets/course-cyber.jpg',
  },
  {
    dbSlug: 'cloud-architecture-kubernetes-clusters',
    title: 'Cloud Architecture & Kubernetes Clusters',
    description: 'Multi-cloud mesh routing, eBPF telemetry, GitOps pipelines with ArgoCD and Helm.',
    category: 'Cloud Architecture & DevOps',
    quickTag: 'Cloud & K8s',
    badge: 'CLOUD & K8S',
    badgeColor: 'text-primary',
    dotColor: 'bg-primary',
    level: 'Advanced Masterclass',
    levelPill: 'EXPERT LEVEL',
    levelBg: 'bg-primary-container text-on-primary-container',
    instructor: 'Sora Takahashi',
    role: 'Cloud Native Architect',
    initials: 'ST',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    rating: '4.95',
    reviews: '3.1k',
    duration: '10 Weeks',
    durationGroup: '8–12 Weeks',
    modules: '42 Modules',
    students: '22.7k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: '/assets/course-cloud.jpg',
  },
  {
    dbSlug: 'zero-knowledge-proofs-rust',
    title: 'Zero-Knowledge Proofs in Rust',
    description: 'Build zk-SNARKs and Plonk verifiers from mathematical scratch using Rust memory safety.',
    category: 'Systems & Rust',
    quickTag: 'Rust Systems',
    badge: 'RUST & ZK',
    badgeColor: 'text-primary-container',
    dotColor: 'bg-primary-container',
    level: 'Research Fellow Cohort',
    levelPill: 'FELLOW',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Dr. Aris Thorne',
    role: 'Cryptography Lead',
    initials: 'AT',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    rating: '4.88',
    reviews: '920',
    duration: '8 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '32 Modules',
    students: '6.4k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    dbSlug: 'autonomous-vector-databases-rag',
    title: 'Autonomous Vector Databases & RAG',
    description: 'HNSW indexing, sparse-dense hybrid search algorithms, and high-throughput embedding stores.',
    category: 'Data Engineering',
    quickTag: 'Neural Networks',
    badge: 'DATA PIPELINES',
    badgeColor: 'text-tertiary',
    dotColor: 'bg-tertiary',
    level: 'Intermediate Specialist',
    levelPill: 'INTERMEDIATE',
    levelBg: 'bg-surface-container-high text-on-surface',
    instructor: 'Dr. Elena Vance',
    role: 'Stanford AI Fellow',
    avatar: '/assets/instructor-elena.jpg',
    rating: '4.92',
    reviews: '1.1k',
    duration: '5 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '24 Modules',
    students: '11.5k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&auto=format&fit=crop&q=80',
  },
  {
    dbSlug: 'deep-reinforcement-learning-robotics',
    title: 'Deep Reinforcement Learning in Robotics',
    description: 'PPO, SAC policies, and Isaac Sim physics rendering for sim-to-real robotic control systems.',
    category: 'Autonomous Robotics',
    quickTag: 'Neural Networks',
    badge: 'ROBOTICS & RL',
    badgeColor: 'text-secondary',
    dotColor: 'bg-secondary',
    level: 'Advanced Masterclass',
    levelPill: 'ADVANCED',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Prof. Kimberly Chen',
    role: 'Robotics Lab Chair',
    initials: 'KC',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    rating: '4.89',
    reviews: '780',
    duration: '12 Weeks',
    durationGroup: '12+ Weeks',
    modules: '48 Modules',
    students: '8.2k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
  },
  {
    dbSlug: 'distributed-systems-consensus',
    title: 'Distributed Systems & Consensus',
    description: 'Raft consensus, Paxos protocol mechanics, gossip replication, and split-brain recovery techniques.',
    category: 'Cloud Architecture & DevOps',
    quickTag: 'Cloud & K8s',
    badge: 'SYSTEMS',
    badgeColor: 'text-primary',
    dotColor: 'bg-primary',
    level: 'Advanced Masterclass',
    levelPill: 'ADVANCED',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Sora Takahashi',
    role: 'Distributed Engines',
    initials: 'ST',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    rating: '4.94',
    reviews: '1.5k',
    duration: '7 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '30 Modules',
    students: '13.8k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  },
  {
    dbSlug: 'applied-homomorphic-encryption',
    title: 'Applied Homomorphic Encryption',
    description: 'Execute computation over ciphertext with CKKS and BGV schemes for privacy-preserving AI inference.',
    category: 'Cybersecurity & Crypto',
    quickTag: 'Cryptographic Security',
    badge: 'ENCRYPTION',
    badgeColor: 'text-secondary',
    dotColor: 'bg-secondary',
    level: 'Research Fellow Cohort',
    levelPill: 'FELLOW',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Dr. Aris Thorne',
    role: 'Cryptography Lead',
    initials: 'AT',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    rating: '4.87',
    reviews: '640',
    duration: '6 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '26 Modules',
    students: '4.1k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  },
  {
    dbSlug: 'gpu-kernel-dev-triton-cuda',
    title: 'GPU Kernel Dev with Triton & CUDA',
    description: 'Master block-level SRAM memory tiling, fused matrix multiplications, and custom FlashAttention kernels.',
    category: 'Systems & Rust',
    quickTag: 'Rust Systems',
    badge: 'GPU SYSTEMS',
    badgeColor: 'text-primary',
    dotColor: 'bg-primary',
    level: 'Advanced Masterclass',
    levelPill: 'ADVANCED',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Dr. Elena Vance',
    role: 'Hardware Acceleration',
    avatar: '/assets/instructor-elena.jpg',
    rating: '4.97',
    reviews: '2.1k',
    duration: '9 Weeks',
    durationGroup: '8–12 Weeks',
    modules: '38 Modules',
    students: '16.3k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
  },
  {
    dbSlug: 'ebpf-linux-observability-telemetry',
    title: 'eBPF Linux Observability & Telemetry',
    description: 'Build kernel-space tracepoints, packet filtering with XDP, and zero-overhead observability daemons.',
    category: 'Cloud Architecture & DevOps',
    quickTag: 'Cloud & K8s',
    badge: 'KERNEL OPS',
    badgeColor: 'text-tertiary',
    dotColor: 'bg-tertiary',
    level: 'Intermediate Specialist',
    levelPill: 'INTERMEDIATE',
    levelBg: 'bg-tertiary-container/90 text-on-tertiary',
    instructor: 'Sora Takahashi',
    role: 'Linux Kernel Engineer',
    initials: 'ST',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    rating: '4.86',
    reviews: '1.3k',
    duration: '6 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '25 Modules',
    students: '10.1k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80',
  },
  {
    dbSlug: 'llm-fine-tuning-lora-awq',
    title: 'LLM Fine-Tuning, LoRA & AWQ',
    description: 'Parameter-efficient fine-tuning with QLoRA, 4-bit AWQ weight quantization, and vLLM serving.',
    category: 'AI & Machine Learning',
    quickTag: 'Neural Networks',
    badge: 'LLM ENG',
    badgeColor: 'text-secondary',
    dotColor: 'bg-secondary',
    level: 'Advanced Masterclass',
    levelPill: 'ADVANCED',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Dr. Elena Vance',
    role: 'Stanford AI Fellow',
    avatar: '/assets/instructor-elena.jpg',
    rating: '4.96',
    reviews: '3.8k',
    duration: '7 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '34 Modules',
    students: '28.4k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
  },
  {
    dbSlug: 'zero-trust-identity-spiffe-spire',
    title: 'Zero-Trust Identity & SPIFFE/SPIRE',
    description: 'Continuous cryptographic attestation, mutual TLS, OIDC federations and dynamic microsegmentation.',
    category: 'Cybersecurity & Crypto',
    quickTag: 'Cryptographic Security',
    badge: 'IDENTITY & SEC',
    badgeColor: 'text-primary-container',
    dotColor: 'bg-primary-container',
    level: 'Intermediate Specialist',
    levelPill: 'INTERMEDIATE',
    levelBg: 'bg-primary-container text-on-primary-container',
    instructor: 'Marcus Lin, CISSP',
    role: 'Senior Infosec Director',
    initials: 'ML',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    rating: '4.84',
    reviews: '1.7k',
    duration: '5 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '22 Modules',
    students: '12.3k',
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  },
];

const ALL_DOMAINS = [
  'AI & Machine Learning',
  'Cloud Architecture & DevOps',
  'Web Development',
  'Cybersecurity & Crypto',
  'Data Engineering',
  'Systems & Rust',
  'Mobile Development',
  'Blockchain & Web3',
  'UI/UX & Design Systems',
  'Quantum & Emerging Tech',
];

const DIFFICULTY_LEVELS = [
  { name: 'All Levels', key: 'All Levels' },
  { name: 'Beginner', key: 'Beginner' },
  { name: 'Intermediate', key: 'Intermediate' },
  { name: 'Advanced', key: 'Advanced' },
];

const DURATION_OPTIONS = [
  { label: '< 4 Weeks', key: '< 4 Weeks' },
  { label: '4–8 Weeks', key: '4–8 Weeks' },
  { label: '8–12 Weeks', key: '8–12 Weeks' },
  { label: '12+ Weeks', key: '12+ Weeks' },
];

const QUICK_SELECT_OPTIONS = [
  { label: 'All Courses', value: 'All' },
  { label: 'AI & LLMs', value: 'AI & Machine Learning' },
  { label: 'Cloud & K8s', value: 'Cloud Architecture & DevOps' },
  { label: 'Web Dev & React', value: 'Web Development' },
  { label: 'Cyber Defense', value: 'Cybersecurity & Crypto' },
  { label: 'Data & Streaming', value: 'Data Engineering' },
  { label: 'Rust & Systems', value: 'Systems & Rust' },
  { label: 'Mobile Apps', value: 'Mobile Development' },
  { label: 'Web3 & Crypto', value: 'Blockchain & Web3' },
  { label: 'Quantum Tech', value: 'Quantum & Emerging Tech' },
];

const COURSE_FALLBACK_THUMBNAILS = {
  'neural-networks-quantum-computing': '/assets/course-quantum.jpg',
  'cyber-defense-cryptographic-security': '/assets/course-cyber.jpg',
  'cloud-architecture-kubernetes-clusters': '/assets/course-cloud.jpg',
  'zero-knowledge-proofs-rust': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  'autonomous-vector-databases-rag': 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&auto=format&fit=crop&q=80',
  'deep-reinforcement-learning-robotics': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
  'distributed-systems-consensus': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  'applied-homomorphic-encryption': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  'gpu-kernel-dev-triton-cuda': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
  'ebpf-linux-observability-telemetry': 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80',
  'llm-fine-tuning-lora-awq': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
  'zero-trust-identity-spiffe-spire': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
};

const mapDbCourseToCard = (course) => {
  const domainColors = {
    'AI & Machine Learning': { badge: 'AI & LLMs', badgeColor: 'text-purple-400', dotColor: 'bg-purple-400', tag: 'AI & Machine Learning' },
    'Cloud Architecture & DevOps': { badge: 'Cloud & K8s', badgeColor: 'text-blue-400', dotColor: 'bg-blue-400', tag: 'Cloud Architecture & DevOps' },
    'Web Development': { badge: 'Full-Stack Web', badgeColor: 'text-emerald-400', dotColor: 'bg-emerald-400', tag: 'Web Development' },
    'Cybersecurity & Crypto': { badge: 'Cyber Defense', badgeColor: 'text-rose-400', dotColor: 'bg-rose-400', tag: 'Cybersecurity & Crypto' },
    'Data Engineering': { badge: 'Data & Kafka', badgeColor: 'text-amber-400', dotColor: 'bg-amber-400', tag: 'Data Engineering' },
    'Systems & Rust': { badge: 'Rust Systems', badgeColor: 'text-orange-400', dotColor: 'bg-orange-400', tag: 'Systems & Rust' },
    'Mobile Development': { badge: 'Mobile Apps', badgeColor: 'text-cyan-400', dotColor: 'bg-cyan-400', tag: 'Mobile Development' },
    'Blockchain & Web3': { badge: 'Web3 & Crypto', badgeColor: 'text-indigo-400', dotColor: 'bg-indigo-400', tag: 'Blockchain & Web3' },
    'UI/UX & Design Systems': { badge: 'Design Systems', badgeColor: 'text-pink-400', dotColor: 'bg-pink-400', tag: 'UI/UX & Design Systems' },
    'Quantum & Emerging Tech': { badge: 'Quantum Tech', badgeColor: 'text-teal-400', dotColor: 'bg-teal-400', tag: 'Quantum & Emerging Tech' },
  };

  const meta = domainColors[course.category] || {
    badge: course.category || 'Tech',
    badgeColor: 'text-primary',
    dotColor: 'bg-primary',
    tag: course.category || 'Tech',
  };

  const durationGroup =
    course.level === 'Beginner' ? '< 4 Weeks' :
    course.level === 'Intermediate' ? '4–8 Weeks' :
    course.level === 'Advanced' ? '8–12 Weeks' : '4–8 Weeks';

  const instructorName = course.instructor?.name || (typeof course.instructor === 'string' ? course.instructor : 'Prof. Alex Rivera');
  const instructorRole = course.instructor?.headline || 'Senior Fellow & Lead Architect';
  
  const rawAvatar = course.avatar || course.instructor?.avatar || course.instructorAvatar;
  const validAvatar = (!rawAvatar || rawAvatar.includes('googleusercontent.com'))
    ? (instructorName?.includes('Elena')
        ? '/assets/instructor-elena.jpg'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80')
    : rawAvatar;

  const slug = course.slug || course.dbSlug;
  const rawThumb = course.thumbnail;
  const validThumb = (!rawThumb || rawThumb.includes('googleusercontent.com'))
    ? (COURSE_FALLBACK_THUMBNAILS[slug] || '/assets/course-cloud.jpg')
    : rawThumb;

  const numRating = Number(course.rating) || 4.9;
  const ratingStr = !isNaN(numRating) ? numRating.toFixed(1) : '4.9';

  return {
    _id: course._id,
    id: course._id,
    dbSlug: slug,
    title: course.title,
    description: course.shortDescription || course.description,
    category: course.category,
    quickTag: course.quickTag || meta.tag,
    badge: course.badge || meta.badge.toUpperCase(),
    badgeColor: course.badgeColor || meta.badgeColor,
    dotColor: course.dotColor || meta.dotColor,
    level: course.level || 'Intermediate',
    levelPill: course.levelPill || (course.level || 'Intermediate').toUpperCase(),
    levelBg: course.levelBg || 'bg-primary-container text-on-primary-container',
    instructor: instructorName,
    role: course.role || instructorRole,
    avatar: validAvatar,
    initials: course.initials || (instructorName ? instructorName.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'FE'),
    rating: ratingStr,
    reviews: course.numReviews ? `${course.numReviews}` : (course.reviews || '180'),
    duration: course.duration || (course.level === 'Advanced' ? '8–10 Weeks' : '6–8 Weeks'),
    durationGroup: course.durationGroup || durationGroup,
    modules: course.modules || `${course.lessons?.length || 18} Modules`,
    students: course.students || (course.enrollmentCount ? `${(course.enrollmentCount / 1000).toFixed(1)}k` : '2.4k'),
    price: 0,
    priceNote: '100% Free Open Access',
    thumbnail: validThumb,
    tags: course.tags || [],
  };
};

const CourseCatalog = ({ embedded = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isEmbedded = embedded || location.pathname.startsWith('/student');

  // States
  const [activeState, setActiveState] = useState('catalog'); // 'catalog', 'skeleton', 'empty', 'error'
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid' or 'list'
  const [dbCourseMap, setDbCourseMap] = useState({});
  const [allCourses, setAllCourses] = useState(() => FLAGSHIP_COURSES.map(mapDbCourseToCard));
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Filter criteria
  const initialCategoryParam = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');
  const [selectedQuickTag, setSelectedQuickTag] = useState(initialCategoryParam || 'All');
  const [selectedCategories, setSelectedCategories] = useState(initialCategoryParam ? [initialCategoryParam] : []);
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [maxPrice, setMaxPrice] = useState(800);
  const [pricingAccess, setPricingAccess] = useState(['free', 'pro', 'enterprise']);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [sortBy, setSortBy] = useState('Most Popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Fetch real database courses
  useEffect(() => {
    let isMounted = true;
    setLoadingCourses(true);
    API.get('/courses', { params: { limit: 100 } })
      .then((res) => {
        if (!isMounted) return;
        const list = res.data.courses || [];
        if (list.length > 0) {
          const mapped = list.map(mapDbCourseToCard);
          setAllCourses(mapped);

          const map = {};
          list.forEach((c) => {
            if (c.slug) map[c.slug] = c._id;
            if (c.title) map[c.title.toLowerCase().trim()] = c._id;
          });
          setDbCourseMap(map);
        }
      })
      .catch((err) => {
        console.warn('Using seeded catalog courses fallback:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoadingCourses(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('course-search-input');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamic category counts from current course dataset
  const CATEGORIES = useMemo(() => {
    return ALL_DOMAINS.map((catName) => {
      const count = allCourses.filter((c) => c.category === catName).length;
      return { name: catName, count };
    });
  }, [allCourses]);

  // Dynamic instructors list from current course dataset
  const INSTRUCTORS = useMemo(() => {
    const instructorMap = {};
    allCourses.forEach((c) => {
      const name = c.instructor;
      if (!name) return;
      if (!instructorMap[name]) {
        instructorMap[name] = {
          name,
          count: 0,
          avatar: c.avatar,
          initials: c.initials,
        };
      }
      instructorMap[name].count += 1;
    });
    return Object.values(instructorMap);
  }, [allCourses]);

  // Toggle category
  const toggleCategory = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  // Toggle instructor
  const toggleInstructor = (instName) => {
    setSelectedInstructors((prev) =>
      prev.includes(instName) ? prev.filter((i) => i !== instName) : [...prev, instName]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedLevel('All Levels');
    setSelectedDuration('');
    setSelectedInstructors([]);
    setSelectedQuickTag('All');
    setSearchQuery('');
    setMaxPrice(800);
  };

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let list = [...allCourses];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.badge.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Quick tag
    if (selectedQuickTag !== 'All') {
      list = list.filter(
        (c) =>
          c.category.toLowerCase() === selectedQuickTag.toLowerCase() ||
          c.quickTag.toLowerCase().includes(selectedQuickTag.toLowerCase())
      );
    }

    // Categories
    if (selectedCategories.length > 0) {
      list = list.filter((c) => selectedCategories.includes(c.category));
    }

    // Level
    if (selectedLevel && selectedLevel !== 'All Levels') {
      list = list.filter((c) => c.level === selectedLevel || c.levelPill === selectedLevel);
    }

    // Duration
    if (selectedDuration) {
      list = list.filter((c) => c.durationGroup === selectedDuration);
    }

    // Instructors
    if (selectedInstructors.length > 0) {
      list = list.filter((c) => selectedInstructors.includes(c.instructor));
    }

    // Price
    list = list.filter((c) => c.price <= maxPrice);

    // Sorting
    if (sortBy === 'Most Popular') {
      list.sort((a, b) => parseFloat(b.students) - parseFloat(a.students));
    } else if (sortBy === 'Highest Rated') {
      list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (sortBy === 'Title A–Z') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'Shortest Duration') {
      list.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    }

    return list;
  }, [
    allCourses,
    searchQuery,
    selectedQuickTag,
    selectedCategories,
    selectedLevel,
    selectedDuration,
    selectedInstructors,
    maxPrice,
    sortBy,
  ]);

  const activeFiltersCount =
    selectedCategories.length +
    (selectedLevel !== 'All Levels' ? 1 : 0) +
    (selectedDuration ? 1 : 0) +
    selectedInstructors.length +
    (searchQuery.trim() ? 1 : 0);

  // Helper to resolve link
  const getCourseDetailPath = (course) => {
    if (course._id) return `/course/${course._id}`;
    if (course.id) return `/course/${course.id}`;
    const idFromSlug = course.dbSlug ? dbCourseMap[course.dbSlug] : null;
    const idFromTitle = course.title ? dbCourseMap[course.title.toLowerCase().trim()] : null;
    const validId = idFromSlug || idFromTitle || Object.values(dbCourseMap)[0];
    return validId ? `/course/${validId}` : `/courses`;
  };

  const dashboardPath = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'instructor'
    ? '/instructor/dashboard'
    : '/student/dashboard';

  return (
    <div className={`bg-transparent text-slate-900 antialiased min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-800 ${isEmbedded ? 'w-full' : ''}`}>
      {/* ================= FIXED TOP HEADER ================= */}
      {!isEmbedded && (
        <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_1px_16px_rgba(0,0,0,0.4)]">
        <div className="h-16 w-full px-gutter flex items-center justify-between gap-space-md">
          {/* Brand Logo & Version */}
          <div className="flex items-center gap-space-lg shrink-0">
            <Link to="/" className="flex items-center gap-space-sm group">
              <img
                alt="Nova LMS Logo"
                className="h-8 w-8 object-contain rounded-md group-hover:scale-105 transition-transform"
                src="/nova-icon.png"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/nova-icon.png';
                }}
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface leading-none">
                  Nova <span className="text-primary font-code-md text-body-sm font-semibold">LMS</span>
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-space-xs p-1 rounded-xl bg-surface-container-low">
              <Link
                to="/courses"
                className="px-space-md py-1.5 transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-[0_0_16px_rgba(128,131,255,0.3)]"
              >
                Courses
              </Link>
              <a
                href="#categories"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('catalog-sidebar')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-space-md py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md transition-colors hover:text-on-surface hover:bg-surface-container-high"
              >
                Categories
              </a>
              <Link
                to="/courses"
                className="px-space-md py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md transition-colors hover:text-on-surface hover:bg-surface-container-high"
              >
                Learning Paths
              </Link>
              <Link
                to={isAuthenticated ? dashboardPath : '/login'}
                className="px-space-md py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md transition-colors hover:text-on-surface hover:bg-surface-container-high"
              >
                Dashboard
              </Link>
              <Link
                to="/about"
                className="px-space-md py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md transition-colors hover:text-on-surface hover:bg-surface-container-high"
              >
                Docs
              </Link>
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-space-md shrink-0">
            {/* Search Box Trigger */}
            <div
              onClick={() => document.getElementById('course-search-input')?.focus()}
              className="hidden md:flex items-center bg-surface-container-low rounded-lg px-space-sm py-1.5 gap-space-sm w-56 lg:w-72 shadow-inner cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-base">search</span>
              <span className="text-on-surface-variant font-body-sm text-body-sm flex-1 truncate">
                {searchQuery || 'Search modules, syntax...'}
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest font-code-md text-label-sm text-on-surface-variant uppercase">
                ⌘K
              </kbd>
            </div>

            {/* Notification Bell */}
            <div className="relative flex items-center justify-center">
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
              </Link>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#4cd7f6]"></span>
            </div>

            {/* Profile Avatar / Login */}
            {isAuthenticated && user ? (
              <Link to={dashboardPath} className="flex items-center gap-space-sm pl-space-xs">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="font-label-md text-label-md text-on-surface leading-tight">{user.name}</span>
                  <span className="font-label-sm text-label-sm text-secondary font-medium tracking-wide capitalize">
                    {user.role || 'Fellow'}
                  </span>
                </div>
                {user.avatar ? (
                  <img
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover shadow-[0_0_12px_rgba(192,193,255,0.2)] border border-primary/30"
                    src={user.avatar}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500 shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </div>
                )}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md hover:text-on-surface transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-md hover:bg-primary hover:text-on-primary transition-all"
                >
                  Join Fellow
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className={`w-full ${isEmbedded ? 'bg-transparent pt-0' : 'bg-slate-50 pt-16'} min-h-screen flex-1`}>
        <div className="flex flex-col w-full text-slate-800">
          {/* Ambient Glow Orbs & 3D Neural Synapse Graph (Public view only) */}
          {!isEmbedded && (
            <div className="relative w-full overflow-hidden">
              <NeuralBackground
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                opacity={0.45}
                nodeCount={45}
                maxLines={110}
                sphereRadius={9}
              />
              <div className="absolute -top-32 left-1/4 w-[600px] h-[350px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none"></div>
              <div className="absolute -top-24 right-1/4 w-[450px] h-[300px] bg-cyan-100/50 rounded-full blur-[100px] pointer-events-none"></div>
            </div>
          )}

          {/* PAGE HEADER SECTION */}
          <div className={`relative z-10 w-full ${isEmbedded ? 'px-6 sm:px-8 lg:px-10 pt-4 pb-6' : 'px-gutter pt-8 pb-6 max-w-[1680px] mx-auto'} flex flex-col gap-6`}>
            {isEmbedded ? (
              /* Embedded Student Portal Header */
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Link to="/student/dashboard" className="text-blue-600 hover:underline">
                    Student Portal
                  </Link>
                  <span>/</span>
                  <span className="text-slate-800 font-semibold">Explore Courses</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      Explore Courses
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                      Build practical, battle-tested skills from expert-led courses engineered with live cloud environments and hands-on sandboxes.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/80">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      {filteredCourses.length} Courses Available
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      100% Free Open Access
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Public Header */
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <Link to="/" className="text-blue-600 hover:underline cursor-pointer">
                      ACADEMY
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-semibold">EXPLORE COURSES</span>
                    <span>/</span>
                    <span className="text-cyan-600">CATALOG DISCOVERY</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>248 Verified Courses</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span>18 Specialization Tracks</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>100% Free Access</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                      Explore Courses
                    </h1>
                    <p className="mt-2 text-base text-slate-500 max-w-2xl">
                      Build practical, battle-tested skills from expert-led courses engineered with live cloud environments and zero-trust sandboxes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Clean Modern Search Field & Instant Filter Tag Pills */}
            <div className="w-full rounded-2xl bg-white border border-slate-200/90 p-4 shadow-sm flex flex-col gap-3">
              <div className="relative flex items-center w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <span className="material-symbols-outlined text-slate-400 text-xl mr-3">search</span>
                <input
                  id="course-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, skills, or instructors..."
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                <div className="flex items-center gap-2 ml-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-300 transition-colors"
                    >
                      CLEAR
                    </button>
                  )}
                  <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-mono text-xs border border-slate-300">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Instant Filter Tag Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 px-1 scrollbar-none">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
                  Quick Select:
                </span>
                {QUICK_SELECT_OPTIONS.map((opt) => {
                  const isSelected = selectedQuickTag === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedQuickTag(opt.value);
                        if (opt.value === 'All') {
                          setSelectedCategories([]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MAIN 2-COLUMN DISCOVERY WORKSPACE */}
          <div className={`w-full ${isEmbedded ? 'px-6 sm:px-8 lg:px-10 pb-16' : 'px-gutter max-w-[1680px] mx-auto pb-16'}`}>
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* ================= LEFT COLUMN: FILTER SIDEBAR ================= */}
              <aside id="catalog-sidebar" className="w-full lg:w-72 shrink-0 lg:sticky lg:top-20 z-10 flex flex-col gap-5">
                <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col gap-6">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-xl">tune</span>
                      <span className="font-bold text-slate-900 text-base">Filter Criteria</span>
                    </div>
                    {activeFiltersCount > 0 && (
                      <button onClick={clearAllFilters} className="text-xs font-semibold text-blue-600 hover:underline">
                        Clear All ({activeFiltersCount})
                      </button>
                    )}
                  </div>

                  {/* Filter Group 1: Category */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-slate-600">
                      {CATEGORIES.map((cat) => {
                        const isChecked = selectedCategories.includes(cat.name);
                        return (
                          <label
                            key={cat.name}
                            onClick={() => toggleCategory(cat.name)}
                            className="flex items-center justify-between cursor-pointer group select-none py-0.5"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 bg-white group-hover:border-blue-400'
                                }`}
                              >
                                {isChecked && <span className="material-symbols-outlined text-xs font-bold leading-none">check</span>}
                              </div>
                              <span
                                className={`text-sm transition-colors ${
                                  isChecked ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-slate-900'
                                }`}
                              >
                                {cat.name}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                              {cat.count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-slate-200"></div>

                  {/* Filter Group 2: Difficulty Level */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Difficulty Level
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-slate-600">
                      {DIFFICULTY_LEVELS.map((lvl) => {
                        const isChecked = selectedLevel === lvl.name;
                        return (
                          <label
                            key={lvl.name}
                            onClick={() => setSelectedLevel(lvl.name)}
                            className="flex items-center justify-between cursor-pointer group select-none py-0.5"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 bg-white group-hover:border-blue-400'
                                }`}
                              >
                                {isChecked && <span className="material-symbols-outlined text-xs font-bold leading-none">check</span>}
                              </div>
                              <span
                                className={`text-sm transition-colors ${
                                  isChecked ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-slate-900'
                                }`}
                              >
                                {lvl.name}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                              {lvl.count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-slate-200"></div>

                  {/* Filter Group 3: Duration */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Duration</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {DURATION_OPTIONS.map((d) => {
                        const isActive = selectedDuration === d.key;
                        return (
                          <div
                            key={d.key}
                            onClick={() => setSelectedDuration(isActive ? '' : d.key)}
                            className={`p-2.5 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center text-xs ${
                              isActive
                                ? 'bg-blue-50 border-2 border-blue-600 text-blue-700 font-bold shadow-sm'
                                : 'bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <span className="font-semibold">{d.label}</span>
                            <span className={`text-[10px] ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                              {d.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-slate-200"></div>

                  {/* Filter Group 4: Pricing & Access */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Tuition &amp; Access
                      </span>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        100% FREE
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-800 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0 mt-0.5">verified</span>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold">Zero Tuition Policy</span>
                        <p className="text-[11px] text-emerald-700 leading-relaxed">
                          All engineering curricula, interactive labs, and completion certificates are completely free open access.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-slate-200"></div>

                  {/* Filter Group 5: Lead Instructors */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Instructors
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-slate-600">
                      {INSTRUCTORS.map((inst) => {
                        const isChecked = selectedInstructors.includes(inst.name);
                        return (
                          <label
                            key={inst.name}
                            onClick={() => toggleInstructor(inst.name)}
                            className="flex items-center justify-between cursor-pointer group select-none py-0.5"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 bg-white group-hover:border-blue-400'
                                }`}
                              >
                                {isChecked && <span className="material-symbols-outlined text-xs font-bold leading-none">check</span>}
                              </div>
                              <span
                                className={`text-sm transition-colors ${
                                  isChecked ? 'text-blue-600 font-semibold' : 'text-slate-600 group-hover:text-slate-900'
                                }`}
                              >
                                {inst.name}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                              {inst.count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </aside>

              {/* ================= RIGHT COLUMN: MAIN COURSE BROWSER ================= */}
              <div className="flex-1 min-w-0 flex flex-col gap-6">

                {/* TOOLBAR: Results Count, Active Tags, Sort & View Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
                  {/* Left: Count & Active Badges */}
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        Showing 1–{Math.min(filteredCourses.length, itemsPerPage)}
                      </span>
                      <span className="text-slate-500 text-sm">
                        of {filteredCourses.length} matching courses
                      </span>
                    </div>

                    {/* Active Filter Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {selectedLevel && selectedLevel !== 'All Levels' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold">
                          {selectedLevel}
                          <span
                            onClick={() => setSelectedLevel('All Levels')}
                            className="material-symbols-outlined text-xs cursor-pointer hover:text-blue-900"
                          >
                            close
                          </span>
                        </span>
                      )}
                      {selectedCategories.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold"
                        >
                          {c}
                          <span
                            onClick={() => toggleCategory(c)}
                            className="material-symbols-outlined text-xs cursor-pointer hover:text-blue-900"
                          >
                            close
                          </span>
                        </span>
                      ))}
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                          Query: "{searchQuery}"
                          <span
                            onClick={() => setSearchQuery('')}
                            className="material-symbols-outlined text-xs cursor-pointer hover:text-slate-900"
                          >
                            close
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Sort Dropdown & Layout Buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Sort dropdown */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                      <span className="text-xs font-medium text-slate-400">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="Most Popular">Most Popular</option>
                        <option value="Newest Release">Newest Release</option>
                        <option value="Highest Rated">Highest Rated</option>
                        <option value="Shortest Duration">Shortest Duration</option>
                        <option value="Title A–Z">Title A–Z</option>
                      </select>
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-sm">
                      <button
                        onClick={() => setViewLayout('grid')}
                        className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                          viewLayout === 'grid'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                        }`}
                        title="4-Column Grid"
                      >
                        <span className="material-symbols-outlined text-lg">grid_view</span>
                      </button>
                      <button
                        onClick={() => setViewLayout('list')}
                        className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                          viewLayout === 'list'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                        }`}
                        title="List View"
                      >
                        <span className="material-symbols-outlined text-lg">view_list</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ================= VIEW 1: LIVE 4-COLUMN CATALOG ================= */}
                {activeState === 'catalog' && (
                  <div id="view-catalog" className="w-full">
                    {filteredCourses.length === 0 ? (
                      /* Fallback to Empty State if filters yield 0 results */
                      <div className="w-full rounded-2xl bg-white border border-slate-200/90 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                          <span className="material-symbols-outlined text-4xl">search_off</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">No matching courses found</h3>
                        <p className="mt-1.5 text-sm text-slate-500 max-w-md">
                          We couldn’t find any academic curriculum matching your criteria. Try adjusting your filters or search keywords.
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                          <button
                            onClick={clearAllFilters}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      </div>
                    ) : viewLayout === 'grid' ? (
                      /* 4-Column Grid */
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((c, idx) => (
                          <div
                            key={c.title + idx}
                            className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all duration-300 flex flex-col"
                          >
                            {/* Thumbnail Banner */}
                            <Link to={getCourseDetailPath(c)} className="relative h-44 w-full overflow-hidden bg-slate-100 block cursor-pointer">
                              <img
                                alt={c.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={c.thumbnail}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/assets/course-cloud.jpg';
                                }}
                                loading="lazy"
                                decoding="async"
                              />

                              {/* Category Badge */}
                              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 flex items-center gap-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                                <span className={`w-1.5 h-1.5 rounded-full ${c.dotColor || 'bg-blue-600'}`}></span>
                                <span>{c.badge}</span>
                              </div>

                              {/* Difficulty Pill */}
                              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white font-medium text-xs backdrop-blur-md shadow-sm">
                                {c.levelPill}
                              </div>
                            </Link>

                            {/* Content Body */}
                            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                              <div>
                                <Link to={getCourseDetailPath(c)}>
                                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 cursor-pointer">
                                    {c.title}
                                  </h3>
                                </Link>
                                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {c.description}
                                </p>
                              </div>

                              {/* Instructor info */}
                              <div className="flex items-center gap-2 pt-1">
                                {c.avatar ? (
                                  <img
                                    alt={c.instructor}
                                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                                    src={c.avatar}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = '/assets/instructor-elena.jpg';
                                    }}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-mono text-xs font-bold">
                                    {c.initials || 'ST'}
                                  </div>
                                )}
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-semibold text-slate-800 truncate">
                                    {c.instructor}
                                  </span>
                                  <span className="text-[11px] text-slate-400 truncate">{c.role}</span>
                                </div>
                              </div>

                              {/* Course Stats Grid */}
                              <div className="grid grid-cols-2 gap-2 pt-2 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm text-amber-500">star</span>
                                  <span className="text-slate-900 font-semibold">{c.rating}</span>
                                  <span className="text-slate-400">({c.reviews})</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm text-blue-500">schedule</span>
                                  <span>{c.duration}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm text-indigo-500">menu_book</span>
                                  <span>{c.modules}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm text-slate-400">group</span>
                                  <span>{c.students}</span>
                                </div>
                              </div>

                              {/* Pricing & Action Row */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <div>
                                  <span className="text-base text-emerald-600 font-bold block">
                                    Free
                                  </span>
                                  <span className="text-[11px] text-emerald-600/80 font-medium block leading-none">
                                    100% Free Access
                                  </span>
                                </div>
                                <Link
                                  to={getCourseDetailPath(c)}
                                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1"
                                >
                                  <span>Enroll Free</span>
                                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* List View */
                      <div className="flex flex-col gap-4">
                        {filteredCourses.map((c, idx) => (
                          <div
                            key={c.title + idx}
                            className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all duration-300 flex flex-col md:flex-row items-stretch"
                          >
                            <Link to={getCourseDetailPath(c)} className="relative md:w-64 shrink-0 h-48 md:h-auto overflow-hidden bg-slate-100 block cursor-pointer">
                              <img
                                alt={c.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={c.thumbnail}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/assets/course-cloud.jpg';
                                }}
                                loading="lazy"
                              />
                              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 flex items-center gap-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                                <span className={`w-1.5 h-1.5 rounded-full ${c.dotColor || 'bg-blue-600'}`}></span>
                                <span>{c.badge}</span>
                              </div>
                            </Link>
                            <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                <div>
                                  <Link to={getCourseDetailPath(c)}>
                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">
                                      {c.title}
                                    </h3>
                                  </Link>
                                  <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                                    {c.description}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-base text-emerald-600 font-bold block">
                                    Free
                                  </span>
                                  <span className="text-xs text-emerald-600/80 font-medium">
                                    100% Free Access
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm text-amber-500">star</span>
                                    <strong className="text-slate-800">{c.rating}</strong> ({c.reviews})
                                  </span>
                                  <span>•</span>
                                  <span>{c.duration}</span>
                                  <span>•</span>
                                  <span>{c.modules}</span>
                                  <span>•</span>
                                  <span>{c.students} Students</span>
                                </div>
                                <Link
                                  to={getCourseDetailPath(c)}
                                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                                >
                                  <span>Enroll Free</span>
                                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ================= VIEW 2: SKELETON LOADING STATE ================= */}
                {activeState === 'skeleton' && (
                  <div id="view-skeleton" className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden p-4 flex flex-col gap-4 animate-pulse shadow-sm"
                        >
                          <div className="w-full h-44 rounded-xl bg-slate-100"></div>
                          <div className="h-6 w-3/4 rounded bg-slate-100"></div>
                          <div className="h-4 w-full rounded bg-slate-100"></div>
                          <div className="h-4 w-2/3 rounded bg-slate-100"></div>
                          <div className="flex items-center gap-3 pt-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                            <div className="flex-1 flex flex-col gap-1.5">
                              <div className="h-3 w-1/2 rounded bg-slate-100"></div>
                              <div className="h-2.5 w-1/3 rounded bg-slate-100"></div>
                            </div>
                          </div>
                          <div className="h-14 w-full rounded-xl bg-slate-100"></div>
                          <div className="flex justify-between items-center pt-2">
                            <div className="h-6 w-16 rounded bg-slate-100"></div>
                            <div className="h-9 w-24 rounded-xl bg-slate-100"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ================= VIEW 3: EMPTY / NO RESULTS STATE ================= */}
                {activeState === 'empty' && (
                  <div id="view-empty" className="w-full">
                    <div className="w-full rounded-2xl bg-white border border-slate-200/90 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                        <span className="material-symbols-outlined text-4xl">search_off</span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900">No matching courses found</h3>
                      <p className="mt-1.5 text-sm text-slate-500 max-w-md">
                        We couldn’t find any academic curriculum matching your criteria. Try adjusting your filters or search keywords like "Quantum", "Security", or "Cloud".
                      </p>
                      <div className="flex items-center gap-3 mt-6">
                        <button
                          onClick={() => {
                            clearAllFilters();
                            setActiveState('catalog');
                          }}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm"
                        >
                          Reset All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= VIEW 4: ERROR / RECONNECT STATE ================= */}
                {activeState === 'error' && (
                  <div id="view-error" className="w-full">
                    <div className="w-full rounded-2xl bg-white border border-red-200 p-8 shadow-sm flex flex-col gap-6">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-red-50 text-red-700">
                        <span className="material-symbols-outlined text-3xl text-red-600">wifi_off</span>
                        <div className="flex-1 flex flex-col gap-1">
                          <span className="font-bold text-red-900 text-base">
                            Index Connection Unavailable
                          </span>
                          <p className="text-sm text-red-700">
                            Course index service is temporarily degraded. Please try refreshing.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <button
                          onClick={() => setActiveState('catalog')}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">refresh</span>
                          <span>Retry Index Connection</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= PAGINATION CONTROLS ================= */}
                <div className="w-full rounded-2xl bg-white border border-slate-200/90 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">
                    Showing <span className="font-bold text-slate-800">1</span> to{' '}
                    <span className="font-bold text-slate-800">{Math.min(filteredCourses.length, itemsPerPage)}</span>{' '}
                    of <span className="font-bold text-slate-800">{filteredCourses.length}</span> items
                  </div>

                  {/* Page buttons */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <button
                      aria-label="Previous Page"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all ${
                        currentPage === 1
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      1
                    </button>
                    {filteredCourses.length > itemsPerPage && (
                      <button
                        onClick={() => setCurrentPage(2)}
                        className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all ${
                          currentPage === 2
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        2
                      </button>
                    )}
                    <button
                      aria-label="Next Page"
                      onClick={() => setCurrentPage((p) => Math.min(2, p + 1))}
                      className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>

                  {/* Per-page selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Items per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="12">12</option>
                      <option value="24">24</option>
                      <option value="48">48</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      {!isEmbedded && (
        <footer className="w-full bg-surface-container-lowest py-space-xl shadow-[0_-1px_16px_rgba(0,0,0,0.5)] border-t border-surface-container-high/40">
          <div className="w-full px-gutter max-w-[1680px] mx-auto flex flex-col gap-space-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-space-lg">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">
                    Nova <span className="text-primary font-code-md text-body-sm font-semibold">LMS</span>
                  </span>
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-tertiary font-code-md text-label-sm">
                    TLS 1.3 VERIFIED
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">
                  Autonomous cyber-academic workspace and high-throughput interactive learning catalog engineered for research fellows and technical engineers.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-space-md font-label-md text-label-md text-on-surface-variant">
                <Link to="/courses" className="hover:text-on-surface transition-colors">
                  Curriculum
                </Link>
                <a
                  href="#catalog-sidebar"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('catalog-sidebar')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-on-surface transition-colors"
                >
                  Disciplines
                </a>
                <Link to="/courses" className="hover:text-on-surface transition-colors">
                  Pathways
                </Link>
                <Link to="/about" className="hover:text-on-surface transition-colors">
                  API Engine
                </Link>
                <Link to="/contact" className="hover:text-on-surface transition-colors">
                  Academic Integrity
                </Link>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-space-sm pt-space-md bg-surface-container-low/40 rounded-xl px-space-md py-space-sm">
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                © 2025 Nova LMS Virtual Academy. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default CourseCatalog;
