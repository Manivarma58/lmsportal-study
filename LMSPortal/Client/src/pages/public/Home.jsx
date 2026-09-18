import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFeaturedCourses, fetchCategories } from '../../store/slices/courseSlice';
import { toast } from 'sonner';
import {
  Sparkles,
  BookOpen,
  Award,
  Users,
  PlayCircle,
  Star,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  ChevronRight,
  Menu,
  X,
  Send,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Flame,
  Check,
  ArrowUpRight,
} from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featuredCourses } = useSelector((state) => state.courses);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    dispatch(fetchFeaturedCourses());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Subtle interactive 3D perspective mouse response
  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Subscribed to the Cyber-Academic Dispatch!');
    setNewsletterEmail('');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  // Curated masterclasses with user's verified assets
  const masterclasses = [
    {
      id: 'quantum-ai-track',
      title: 'Neural Networks & Quantum Computing',
      instructor: 'Dr. Elena Vance',
      role: 'Lead Quantum Systems Architect',
      rating: '4.95',
      reviews: '1,840',
      enrolled: '14,200',
      duration: '10 Weeks',
      level: 'Advanced',
      category: 'AI & Quantum',
      activeTag: 'Active Lab',
      thumbnail:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBm6ifaJrJMZTDM6tCauls-FGLzLwGe0PkeBn43_YfN7IQO_1cExUE5BU7junXstZEw-QgaoqnqidZmHOUjzgSVZp0yFWzX_r0rBUfaWIEHPqlqED_Dcy8wXzQBoAr8Qiens_PsLcKtN5jrbVnGkiLnDK-6BLqJw0cRf0SEUFCXHrzksBkafWMQA-CQbUV7ohuKMKdJKFDpcNY_ZnVYO1cFDkmDwyxu0-MizWtpWEvdJ2PdjImZGl8',
      desc: 'Synthesize hybrid tensor networks, implement parameterized quantum circuits (PQC), and benchmark against Noisy Intermediate-Scale Quantum hardware.',
      progress: 68,
      cta: 'Resume Learning',
    },
    {
      id: 'cyber-security-track',
      title: 'Cyber Defense & Cryptographic Security',
      instructor: 'Marcus Lin, CISSP',
      role: 'Red/Blue Ops Director',
      rating: '4.92',
      reviews: '920',
      enrolled: '8,400',
      duration: '8 Weeks',
      level: 'Mastery',
      category: 'Cybersecurity',
      activeTag: 'Red/Blue Ops',
      thumbnail:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC-Vp4K5qAKFj31RHw6C-UAkZkJTkjYwzzxvBA_EY7S_aF8L_IGPtLQPjylE0e8I8mrtkBtZy25buNu4Y1Asmi0uA7-SL92Ej5jKr7vh_EJACxEKwgzz2JVdPJDG52_9eMH9Ai5jNj44Hz24jSIw9I0K2NImznCZXEyZ_TbE_AVphKLcz0BKp-I7i6NlN7VF_ePxj2pLTB0SBAsmJo5hzyQKVf1Bzef16elIQF9UI2-NfZnZVPvLag',
      desc: 'Post-quantum lattice cryptography, live penetration sandbox environments, zero-trust perimeter deployment, and memory exploit mitigation.',
      prerequisite: 'OS Internals & C/Rust',
      cta: 'Enroll Now',
    },
    {
      id: 'cloud-k8s-track',
      title: 'Fullstack Cloud Architecture & Kubernetes Clusters',
      instructor: 'Sora Takahashi',
      role: 'Principal Cloud Engineer',
      rating: '4.89',
      reviews: '1,150',
      enrolled: '11,900',
      duration: '12 Weeks',
      level: 'Intermediate',
      category: 'Cloud Systems',
      activeTag: 'K8s Cluster',
      thumbnail:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCobS6zbr1uvGr_5w_xy-n0b0f5NKOSnOrr8Z3Q4lbf1wXCyb0z0OMTDJfAwrYZcKfMwGIvlzUz30etbn6najKFIAluhUIbWUgxSAiYqanDC9tjv4XbUCBsu5B37nyi-pS9i05wLAkq_gHTs8asR3E1RvV8XTf41nIIvhk1-I0nhret6FAoRRjAaIDdSN9bYxfrXqpfKnv62m5wHCHTw_QsieAjcxR6Teh6IGIId-oxS3DLx3xKVJU',
      desc: 'Architect distributed microservices, multi-region failovers, service meshes (Istio/eBPF), and automated GitOps CI/CD delivery at hyper-scale.',
      prerequisite: 'Dedicated K8s Nodes Included',
      cta: 'Enroll Now',
    },
  ];

  // Technical Domain Categories
  const domainCategories = [
    {
      title: 'Development',
      desc: 'Modern systems programming, Rust, Go, & low-latency WebAssembly.',
      count: 84,
      icon: Code2,
      categorySlug: 'Development',
    },
    {
      title: 'Data Science',
      desc: 'Distributed analytics, vector datastores, and probabilistic modeling.',
      count: 52,
      icon: Layers,
      categorySlug: 'Data Science',
    },
    {
      title: 'AI & Machine Learning',
      desc: 'LLM fine-tuning, diffusion architectures, neural graph compilation.',
      count: 67,
      icon: Cpu,
      categorySlug: 'AI & Machine Learning',
    },
    {
      title: 'Cloud Computing',
      desc: 'Kubernetes topologies, multi-cloud ingress, automated mesh.',
      count: 41,
      icon: PlayCircle,
      categorySlug: 'Cloud Computing',
    },
    {
      title: 'Cybersecurity',
      desc: 'Binary exploitation, lattice crypto, kernel security, and pentesting.',
      count: 39,
      icon: ShieldCheck,
      categorySlug: 'Cybersecurity',
    },
    {
      title: 'Business & Product',
      desc: 'AI product management, technical venture modeling, roadmap strategy.',
      count: 28,
      icon: TrendingUp,
      categorySlug: 'Business',
    },
    {
      title: 'Systems Design & UX',
      desc: 'High-throughput architectures, micro-frontends, state machine interfaces, and human-computer design.',
      count: 34,
      icon: Terminal,
      categorySlug: 'Design',
      spanCol: true,
    },
  ];

  // Why NOVA LMS Pillars
  const pillars = [
    {
      title: 'Learn At Your Own Pace',
      desc: 'Nonlinear modular learning paths equipped with adaptive cognitive engines that tailor pacing to your personal code velocity.',
      icon: PlayCircle,
      color: 'text-sky-400',
      borderHover: 'hover:border-sky-500/40',
    },
    {
      title: 'World-Class Instructors',
      desc: 'Curated by active PhD researchers, FAANG principal staff architects, and pioneers with field-proven industry tenure.',
      icon: Award,
      color: 'text-indigo-400',
      borderHover: 'hover:border-indigo-500/40',
    },
    {
      title: 'Practical Sandboxes',
      desc: 'In-browser GPU clusters and multi-node Kubernetes sandboxes. Write, build, and deploy without configuring local dependencies.',
      icon: Terminal,
      color: 'text-purple-400',
      borderHover: 'hover:border-purple-500/40',
    },
    {
      title: 'Autonomous Progress Tracking',
      desc: 'Deep code telemetry, cognitive memory heatmaps, and continuous mastery graphs to benchmark precise skill acquisition.',
      icon: TrendingUp,
      color: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/40',
    },
    {
      title: 'Continuous Assessments',
      desc: 'Automated unit tests, linting checkers, algorithmic complexity evaluations, and micro-challenge validation in real-time.',
      icon: CheckCircle,
      color: 'text-amber-400',
      borderHover: 'hover:border-amber-500/40',
    },
    {
      title: 'Verifiable On-Chain Credentials',
      desc: 'Tamper-proof, cryptographically signed completion diplomas directly exportable to employer verification databases.',
      icon: ShieldCheck,
      color: 'text-cyan-400',
      borderHover: 'hover:border-cyan-500/40',
    },
  ];

  // How it works timeline
  const timelineSteps = [
    { num: '01', title: 'Choose Course', desc: 'Select targeted track matching career ambitions.' },
    { num: '02', title: 'Instant Enrollment', desc: 'Immediate credentials & cloud sandbox provisioning.' },
    { num: '03', title: 'Interactive Stream', desc: 'High-fidelity theory synchronized with dynamic notebooks.' },
    { num: '04', title: 'Hands-on Sandbox', desc: 'Execute code on live distributed GPU infrastructure.' },
    { num: '05', title: 'Capstone Review', desc: 'Peer audit & automated AI performance benchmark.' },
    { num: '06', title: 'Verified Credential', desc: 'Claim on-chain diploma & share with recruiter network.' },
  ];

  return (
    <div className="bg-[#070A11] text-slate-100 font-sans antialiased min-h-screen overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* ============================================================ */}
      {/* NAVIGATION HEADER */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#070A11]/85 border-b border-white/[0.08] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & StudyPilot Badge */}
          <div className="flex items-center gap-3.5">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <img
                  alt="NOVA LMS Logo"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1VX6glAMDScckxdKvqNz-7dYuwBY8E1qNHKiqF8f9XsnXa2KyPDDte-ReFj61F05cry7ULTsTTCECOGge9SfpX02PUqVF_tUdcpiBfYMLiHwNzQceC78AYMy1QK4W4pkALbNHNU6YVsPzh_5AfQdeJ22UIKok4NPRMO4HT9NbJ4CflT_mgfcaccLXCiaxgyp-5T0_OSu3CZO-gmnd8VBuBrDKYuyjZVL73Eaj8CGHw104BeAA77RHiLWw"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white font-sans">
                    NOVA<span className="text-sky-400">.LMS</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-950/60 text-sky-400 border border-indigo-500/40">
                    StudyPilot
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Cyber-Academic Core
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#courses" className="hover:text-sky-400 transition-colors duration-200">
              Courses
            </a>
            <a href="#instructors" className="hover:text-sky-400 transition-colors duration-200">
              Instructors
            </a>
            <a href="#categories" className="hover:text-sky-400 transition-colors duration-200">
              Categories
            </a>
            <a href="#why-nova" className="hover:text-sky-400 transition-colors duration-200">
              Pillars
            </a>
            <a href="#timeline" className="hover:text-sky-400 transition-colors duration-200">
              Methodology
            </a>
            <a href="#pricing" className="hover:text-sky-400 transition-colors duration-200">
              Pricing
            </a>
          </nav>

          {/* Right Action CTA Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            {isAuthenticated && user ? (
              <Link
                to={getDashboardPath()}
                className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-sm shadow-glow-indigo transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500"></span>
                <span className="relative flex items-center gap-2 px-5 py-2.5 rounded-[11px] bg-[#070A11] text-white transition-all group-hover:bg-opacity-80">
                  <span>Dashboard ({user.role})</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-sm shadow-glow-indigo transition-all duration-300 hover:scale-[1.02]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative block px-5 py-2.5 rounded-[11px] bg-[#070A11] text-white transition-all group-hover:bg-opacity-80">
                    Get Started
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl glass-panel text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-[#070A11] px-4 py-6 space-y-4">
            <nav className="flex flex-col gap-3 text-sm font-medium text-slate-300">
              <a
                href="#courses"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400 py-1"
              >
                Courses
              </a>
              <a
                href="#instructors"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400 py-1"
              >
                Instructors
              </a>
              <a
                href="#categories"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400 py-1"
              >
                Categories
              </a>
              <a
                href="#why-nova"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400 py-1"
              >
                Pillars
              </a>
              <a
                href="#timeline"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400 py-1"
              >
                Methodology
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400 py-1"
              >
                Pricing
              </a>
            </nav>
            <div className="pt-4 border-t border-white/[0.08] flex items-center gap-3">
              {isAuthenticated && user ? (
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold bg-indigo-600 rounded-xl text-white"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-1/2 py-2.5 text-center text-sm font-semibold rounded-xl glass-panel text-slate-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-1/2 py-2.5 text-center text-sm font-semibold rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ============================================================ */}
        {/* HERO SECTION WITH 3D INTERACTIVE CENTERPIECE */}
        {/* ============================================================ */}
        <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
          {/* Background Ambient Glow Sprays */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-sky-400/20 blur-[130px] -z-10 pointer-events-none"></div>
          <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-sky-400/15 blur-[120px] -z-10 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Header Copy */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel text-xs font-mono font-medium text-sky-400 mb-6 border border-sky-400/30 shadow-sm shadow-sky-400/10">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
                </span>
                <span>⚡ Next-Gen Cyber-Academic Learning Platform • v2.4 Live</span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
                Learn Skills That <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
                  Move You Forward.
                </span>
              </h1>

              {/* Hero Supporting Paragraph */}
              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8">
                NOVA LMS delivers hyper-structured academic engineering curricula, AI-guided mentorship, verified laboratory sandboxes, and accelerated career paths for modern technologists.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-base shadow-glow-indigo hover:brightness-110 hover:scale-[1.02] transition-all"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl glass-panel text-slate-200 font-semibold text-base hover:text-white hover:border-sky-400/50 hover:bg-white/[0.04] transition-all"
                >
                  <PlayCircle className="w-5 h-5 text-sky-400" />
                  <span>Start Learning Demo</span>
                </Link>
              </div>

              {/* Trust Rating Indicators */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium">
                <div className="flex -space-x-2">
                  <span className="inline-block h-7 w-7 rounded-full ring-2 ring-[#070A11] bg-slate-700 text-center font-bold leading-7 text-xs text-sky-400">
                    MK
                  </span>
                  <span className="inline-block h-7 w-7 rounded-full ring-2 ring-[#070A11] bg-indigo-800 text-center font-bold leading-7 text-xs text-white">
                    EV
                  </span>
                  <span className="inline-block h-7 w-7 rounded-full ring-2 ring-[#070A11] bg-cyan-800 text-center font-bold leading-7 text-xs text-white">
                    DR
                  </span>
                  <span className="inline-block h-7 w-7 rounded-full ring-2 ring-[#070A11] bg-purple-900 text-center font-bold leading-7 text-xs text-white">
                    +8k
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span>★★★★★</span>
                  <span className="text-slate-300 font-semibold">4.96/5</span>
                </div>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">Trusted by 10,000+ engineers & researchers worldwide</span>
              </div>
            </div>

            {/* 3D Interactive Centerpiece Visual with Mouse Parallax Tilt */}
            <div
              className="relative max-w-5xl mx-auto perspective-canvas"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="relative rounded-2xl p-2 sm:p-3 bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/10 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out"
                style={{
                  transform: `rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`,
                }}
              >
                {/* Central Image Banner Frame */}
                <div className="relative rounded-xl overflow-hidden bg-[#0B0F19] aspect-[16/9] border border-white/5">
                  <img
                    alt="Futuristic sleek dark UI 3D educational concept banner with glowing laptop and zero gravity cards"
                    className="w-full h-full object-cover object-center transform hover:scale-[1.01] transition-transform duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkAFRsgNSpZ2K9I4Bfw7XInaMiP8FGLVL7ajvMJsO2FwzBUR_EVsOBJBbeLeO5Px1jX_OUwTfhsCi0tQmWpZlJXUNzELk9PXI9b413YIxfzHwx7WiYxO3sP3zHorAcSf5LnhRPnil2x5X2-1JnFxxnOpVoWve6luHND19LkhdIzZZsE99TPtpvd6ZeWf2J7nLS75XkG27Mraz2KBRf7CN0B6bInpc_Dp6NvPexAug_bJfMzERr--A"
                  />
                  {/* Glass Sheen Layer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070A11] via-transparent to-transparent opacity-80"></div>
                </div>

                {/* Floating Overlay Card 1: Live AI Mentor (Top Left) */}
                <div className="absolute -top-4 -left-3 sm:top-6 sm:-left-8 glass-panel p-3 sm:p-4 rounded-xl shadow-glow-cyan border border-sky-400/40 animate-float-slow max-w-[210px] sm:max-w-[250px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-semibold">
                        Live AI Mentor
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">v3.2</span>
                  </div>
                  <p className="font-mono text-[11px] text-sky-400/90 leading-tight bg-[#070A11]/80 p-2 rounded-lg border border-sky-400/20">
                    &gt; compile_kernel(weights)
                    <br />
                    <span className="text-emerald-400">✓ Graph validated (0.04ms)</span>
                  </p>
                </div>

                {/* Floating Overlay Card 2: Quantum ML Track (Top Right) */}
                <div className="absolute -top-6 -right-3 sm:top-8 sm:-right-8 glass-panel p-3 sm:p-4 rounded-xl shadow-glow-indigo border border-indigo-500/40 animate-float-lag max-w-[190px] sm:max-w-[230px]">
                  <div className="flex items-center gap-3">
                    {/* Mini SVG Progress Ring */}
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-800"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                        ></path>
                        <path
                          className="text-sky-400"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray="94, 100"
                          strokeLinecap="round"
                          strokeWidth="3.5"
                        ></path>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold text-white">
                        94%
                      </span>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400">Curriculum</div>
                      <div className="text-xs font-semibold text-white">Quantum ML Track</div>
                      <div className="text-[10px] text-emerald-400 font-mono">Top 2% Pass Rate</div>
                    </div>
                  </div>
                </div>

                {/* Floating Overlay Card 3: Cryptographic Seal Badge (Bottom Left) */}
                <div className="absolute -bottom-5 -left-2 sm:bottom-8 sm:-left-6 glass-panel px-4 py-3 rounded-xl border border-white/10 shadow-lg animate-float-lag flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white text-sm shadow-md">
                    🛡️
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Verified Micro-Credential</div>
                    <div className="text-[10px] font-mono text-slate-400">On-Chain Proof #88241F</div>
                  </div>
                </div>

                {/* Floating Overlay Card 4: Telemetry Streak (Bottom Right) */}
                <div className="absolute -bottom-5 -right-2 sm:bottom-6 sm:-right-6 glass-panel px-4 py-3 rounded-xl border border-purple-500/40 shadow-glow-violet animate-float-slow flex items-center gap-3">
                  <div className="text-2xl">🔥</div>
                  <div>
                    <div className="text-xs font-bold text-white">24 Days Streak!</div>
                    <div className="text-[10px] font-mono text-sky-400">+250 XP Telemetry Sync</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* ACADEMIC PARTNERS SECTION */}
        {/* ============================================================ */}
        <section className="py-12 border-y border-white/[0.06] bg-[#0B0F19]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-mono tracking-widest uppercase text-slate-400 mb-8">
              Benchmarked alongside researchers from industry-grade laboratories & hubs
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-items-center opacity-75">
              <div className="flex items-center gap-2 font-mono text-sm tracking-tight text-slate-300 font-bold hover:text-sky-400 transition-colors">
                <span className="text-sky-400">❖</span> Stanford Cyber Labs
              </div>
              <div className="flex items-center gap-2 font-mono text-sm tracking-tight text-slate-300 font-bold hover:text-sky-400 transition-colors">
                <span className="text-indigo-400">◈</span> MIT Cognitive Lab
              </div>
              <div className="flex items-center gap-2 font-mono text-sm tracking-tight text-slate-300 font-bold hover:text-sky-400 transition-colors">
                <span className="text-purple-400">▲</span> DeepMind Scholars
              </div>
              <div className="flex items-center gap-2 font-mono text-sm tracking-tight text-slate-300 font-bold hover:text-sky-400 transition-colors">
                <span className="text-emerald-400">✦</span> OpenAI Fellows
              </div>
              <div className="flex items-center gap-2 font-mono text-sm tracking-tight text-slate-300 font-bold hover:text-sky-400 transition-colors col-span-2 md:col-span-1">
                <span className="text-sky-400">◎</span> ETH Zurich Quantum
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CURATED MASTERCLASSES (COURSE PREVIEW) */}
        {/* ============================================================ */}
        <section className="py-24 relative" id="courses">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
              <div>
                <div className="text-xs uppercase font-mono tracking-widest text-sky-400 mb-2 font-semibold">
                  Specialized Curricula
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Curated Masterclasses
                </h2>
                <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
                  Immersive, lab-heavy tracks designed by principal engineers and theoretical computer scientists.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/courses"
                  className="px-4 py-2 rounded-lg glass-panel text-xs font-mono text-slate-300 hover:text-white hover:border-white/20 transition-all"
                >
                  All Levels
                </Link>
                <Link
                  to="/courses"
                  className="px-4 py-2 rounded-lg bg-[#111726] border border-indigo-500/40 text-xs font-mono text-sky-400 transition-all"
                >
                  Engineering Tracks →
                </Link>
              </div>
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {masterclasses.map((c) => (
                <article
                  key={c.id}
                  className="glass-card-interactive rounded-2xl overflow-hidden flex flex-col border border-white/[0.08]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#070A11]">
                    <img
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      src={c.thumbnail}
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#070A11]/85 border border-indigo-500/50 text-indigo-300">
                      {c.category}
                    </span>
                    <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {c.activeTag}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                        <span>{c.instructor}</span>
                        <span className="text-amber-400 flex items-center gap-1">
                          ★ {c.rating} <span className="text-slate-500">({c.reviews})</span>
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{c.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {c.desc}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mb-6">
                        <span>⏱ {c.duration}</span>
                        <span>•</span>
                        <span>👨🎓 {c.enrolled}</span>
                        <span>•</span>
                        <span className="text-sky-400">{c.level}</span>
                      </div>
                    </div>

                    <div>
                      {c.progress ? (
                        <div className="mb-4">
                          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                            <span>Enrolled Progress</span>
                            <span className="text-sky-400 font-bold">{c.progress}% Completed</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                              style={{ width: `${c.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-[#070A11]/60 border border-white/5 mb-4 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                          <span>Sandbox:</span>
                          <span className="text-slate-200">{c.prerequisite}</span>
                        </div>
                      )}

                      <Link
                        to="/courses"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/30"
                      >
                        <span>{c.cta}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* EXPLORE BY TECHNICAL DOMAIN (CATEGORIES) */}
        {/* ============================================================ */}
        <section className="py-20 bg-[#0B0F19]/60 border-t border-white/[0.06]" id="categories">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs uppercase font-mono tracking-widest text-sky-400 mb-2 font-semibold">
                Specialized Academies
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Explore by Technical Domain
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2">
                Structured skill trees spanning infrastructure, machine intelligence, and systems security.
              </p>
            </div>

            {/* 7 Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {domainCategories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => navigate(`/courses?category=${encodeURIComponent(cat.categorySlug)}`)}
                    className={`glass-card-interactive p-6 rounded-2xl cursor-pointer group ${
                      cat.spanCol ? 'sm:col-span-2 md:col-span-3 lg:col-span-2' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Icon className="w-6 h-6 text-sky-400 group-hover:text-white" />
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 mb-3">{cat.desc}</p>
                      </div>
                      <div className="text-right whitespace-nowrap self-end sm:self-center">
                        <div className="text-xs font-mono font-bold text-sky-400">
                          {cat.count} Courses
                        </div>
                        <div className="text-[11px] text-slate-400 group-hover:translate-x-1 transition-transform">
                          Explore →
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* WHY ENGINEERS CHOOSE NOVA LMS (PILLARS) */}
        {/* ============================================================ */}
        <section className="py-24 relative" id="why-nova">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-xs uppercase font-mono tracking-widest text-purple-400 mb-2 font-semibold">
                Engineered For Mastery
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Why Engineers Choose NOVA LMS
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-3">
                Traditional tutorials teach syntax. NOVA LMS instills first-principles systems engineering with automated feedback loops.
              </p>
            </div>

            {/* 6 Pillar Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pillars.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className={`glass-panel p-8 rounded-2xl border border-white/[0.07] relative group ${p.borderHover} transition-colors`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${p.color} mb-5`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* THE LEARNING PIPELINE (HOW IT WORKS TIMELINE) */}
        {/* ============================================================ */}
        <section className="py-24 bg-[#0B0F19]/40 border-t border-white/[0.06] relative" id="timeline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <div className="text-xs uppercase font-mono tracking-widest text-sky-400 mb-2 font-semibold">
                The Learning Pipeline
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                How NOVA LMS Accelerates You
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                From foundational conceptualization to deployment-ready capstones in 6 rigorous steps.
              </p>
            </div>

            {/* Connected Step Timeline Grid */}
            <div className="relative">
              {/* Central Connecting Line (Desktop) */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 -translate-y-1/2 opacity-30 z-0"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
                {timelineSteps.map((s, idx) => (
                  <div
                    key={idx}
                    className="glass-panel p-5 rounded-xl border border-white/[0.08] flex flex-col items-center text-center relative group hover:border-sky-400/50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#111726] border-2 border-sky-400 flex items-center justify-center font-mono font-bold text-sm text-sky-400 mb-4 shadow-glow-cyan">
                      {s.num}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{s.title}</h3>
                    <p className="text-xs text-slate-400 leading-normal">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* INSTRUCTOR RECRUITMENT SECTION */}
        {/* ============================================================ */}
        <section className="py-24 relative overflow-hidden" id="instructors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Featured Instructor Portrait */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0B0F19]">
                  <img
                    alt="Dr. Elena Vance, Lead Quantum Architect"
                    className="w-full h-auto object-cover filter brightness-[0.97]"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1U0Y8GHASjRLILDOPsbzRty3_DOeEwcjTW8g5fliWmmwBk752Vj1HxKcLTgA_JEqM-4E1qpkmvy3D_amFbhKK6MooS7X5LmgpfiE6Xm7uGY9asNXeROTJDNJVHTbWwtCKQD0z4UCyR1Fzbvgox_ky5f7x_uXssSLFc_b4pzsthX9BuGoEQIEy3hDR7eD4GaEhQfoo7uxRsLpNrAyapRLN-WnJIf2jsBcWkeIrUyoHxEmMDoeznzb4vR"
                  />
                  {/* Glass Meta Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 glass-panel p-4 rounded-xl border border-white/15">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-white text-base">Dr. Elena Vance</div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        98.4% Pass Rate
                      </span>
                    </div>
                    <div className="text-xs font-mono text-sky-400">Lead Quantum Systems Architect</div>
                    <p className="text-[11px] text-slate-300 mt-1">Former Oxford Postdoc & Senior Hardware Fellow</p>
                  </div>
                </div>
                {/* Behind accent blur */}
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-indigo-600/30 blur-3xl -z-10"></div>
              </div>

              {/* Right Column: Recruitment Details */}
              <div className="lg:col-span-7">
                <div className="text-xs uppercase font-mono tracking-widest text-sky-400 mb-2 font-semibold">
                  Join The Faculty
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
                  Share What You Know. Teach the Next Generation of Pioneers.
                </h2>
                <p className="text-base text-slate-300 leading-relaxed mb-8">
                  At NOVA LMS, instructors don’t just record video lessons. You build interactive virtual laboratories, mentor world-class talent, and publish cutting-edge engineering specializations.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-sky-400 mt-0.5 font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Up to 80% Revenue Sharing</h4>
                      <p className="text-xs text-slate-400">
                        Industry-leading compensation structure with recurring institutional cohort licensing.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-sky-400 mt-0.5 font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Dedicated Curriculum Studio Support</h4>
                      <p className="text-xs text-slate-400">
                        Professional technical writers, video editors, and lab sandbox architects assist your rollout.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-sky-400 mt-0.5 font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Automated Grading Infrastructure</h4>
                      <p className="text-xs text-slate-400">
                        Deploy custom unit test suites and containerized challenge validation pipelines automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/register?role=instructor"
                    className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 text-white font-semibold text-sm shadow-glow-cyan hover:brightness-110 transition-all"
                  >
                    Become an Instructor
                  </Link>
                  <Link
                    to="/about"
                    className="px-6 py-3.5 rounded-xl glass-panel text-slate-300 font-semibold text-sm hover:text-white hover:border-white/20 transition-all"
                  >
                    Read Faculty Guide
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* LEARNER TESTIMONIALS */}
        {/* ============================================================ */}
        <section className="py-24 bg-[#0B0F19]/60 border-y border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs uppercase font-mono tracking-widest text-purple-400 mb-2 font-semibold">
                Verified Feedback
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Learner Testimonials
              </h2>
              <p className="text-slate-400 text-sm mt-2">Hear directly from engineers who elevated their technical careers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="glass-panel p-7 rounded-2xl border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">★★★★★</div>
                  <p className="text-sm text-slate-300 italic leading-relaxed mb-6">
                    "The quantum computing module gave me immediate leverage on our tensor pipelines. Unrivaled depth that goes way past theoretical hand-waving."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-sky-400/40 flex items-center justify-center font-bold text-sky-400 text-sm">
                    MK
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Mikhail K.</div>
                    <div className="text-xs text-slate-400 font-mono">Staff Engineer @ Databricks</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="glass-panel p-7 rounded-2xl border border-indigo-500/30 shadow-glow-indigo/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">★★★★★</div>
                  <p className="text-sm text-slate-300 italic leading-relaxed mb-6">
                    "Far beyond video tutorials. The live GPU sandboxes and instant telemetry grading feel like magic. You know immediately when your model converges."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-sm">
                    SJ
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Sarah Jenkins</div>
                    <div className="text-xs text-slate-400 font-mono">AI Fellow, Oxford</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="glass-panel p-7 rounded-2xl border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">★★★★★</div>
                  <p className="text-sm text-slate-300 italic leading-relaxed mb-6">
                    "Completed the cryptographic defense sprint and landed a senior role within 3 weeks. Essential training for modern security architects."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 text-sm">
                    DR
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Devon Ramirez</div>
                    <div className="text-xs text-slate-400 font-mono">Cybersecurity Analyst</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PRICING / CONVERSION CTA SECTION */}
        {/* ============================================================ */}
        <section className="py-24 relative overflow-hidden" id="pricing">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-600/10 to-sky-400/5 pointer-events-none"></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="rounded-3xl glass-panel-elevated p-8 sm:p-14 text-center border border-indigo-500/40 shadow-glow-indigo">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-400/10 border border-sky-400/30 text-xs font-mono text-sky-400 mb-6">
                <span>Enterprise & Academic Cohorts Now Open</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Your Next Skill Starts Here.
              </h2>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Join 10,000+ ambitious learners leveling up with NOVA LMS. Gain immediate access to all verified courses, sandboxes, and mentor sessions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white font-bold text-base shadow-glow-indigo hover:brightness-110 hover:scale-[1.02] transition-all"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/courses"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-white font-semibold text-base hover:bg-white/10 transition-all"
                >
                  Explore All Courses
                </Link>
              </div>

              {/* Assurance Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✔</span>
                  <span>14-Day Refund Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sky-400">✔</span>
                  <span>Cancel Anytime</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-400">✔</span>
                  <span>Academic Credit Transfer Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* SITE FOOTER */}
      {/* ============================================================ */}
      <footer className="bg-[#05070D] border-t border-white/[0.08] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            {/* Column 1: Brand Info */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md">
                  <img
                    alt="StudyPilot NOVA LMS Logo"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1VX6glAMDScckxdKvqNz-7dYuwBY8E1qNHKiqF8f9XsnXa2KyPDDte-ReFj61F05cry7ULTsTTCECOGge9SfpX02PUqVF_tUdcpiBfYMLiHwNzQceC78AYMy1QK4W4pkALbNHNU6YVsPzh_5AfQdeJ22UIKok4NPRMO4HT9NbJ4CflT_mgfcaccLXCiaxgyp-5T0_OSu3CZO-gmnd8VBuBrDKYuyjZVL73Eaj8CGHw104BeAA77RHiLWw"
                  />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  NOVA LMS <span className="text-sky-400 font-mono text-xs">by StudyPilot</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mb-6">
                The next-generation cyber-academic platform for serious computer scientists and infrastructure engineers.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3">
                <a
                  aria-label="GitHub"
                  className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-400/40 transition-colors"
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Code2 className="w-4 h-4" />
                </a>
                <a
                  aria-label="Discord"
                  className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-400/40 transition-colors"
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Users className="w-4 h-4" />
                </a>
                <a
                  aria-label="Twitter"
                  className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center text-slate-400 hover:text-white hover:border-sky-400/40 transition-colors"
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <TrendingUp className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Product */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-4">
                Product
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                <li>
                  <Link to="/courses" className="hover:text-sky-400 transition-colors">
                    Mastery Tracks
                  </Link>
                </li>
                <li>
                  <a href="#timeline" className="hover:text-sky-400 transition-colors">
                    GPU Sandboxes
                  </a>
                </li>
                <li>
                  <a href="#why-nova" className="hover:text-sky-400 transition-colors">
                    Enterprise Labs
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-sky-400 transition-colors">
                    Cohort Pricing
                  </a>
                </li>
                <li>
                  <span className="text-slate-500">Changelog v2.4</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                <li>
                  <Link to="/about" className="hover:text-sky-400 transition-colors">
                    About StudyPilot
                  </Link>
                </li>
                <li>
                  <a href="#instructors" className="hover:text-sky-400 transition-colors">
                    Faculty Leadership
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-sky-400 transition-colors">
                    Careers <span className="text-[10px] text-sky-400 font-mono bg-sky-400/10 px-1 py-0.5 rounded">HIRING</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-sky-400 transition-colors">
                    Press Kit
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources & Legal */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                <li>
                  <Link to="/courses" className="hover:text-sky-400 transition-colors">
                    Curriculum Docs
                  </Link>
                </li>
                <li>
                  <Link to="/verify/demo" className="hover:text-sky-400 transition-colors">
                    Certificate Verify
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-sky-400 transition-colors">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-sky-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Banner */}
          <div className="border-t border-white/[0.06] pt-10 pb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h5 className="text-sm font-bold text-white mb-1">
                Subscribe to the Cyber-Academic Dispatch
              </h5>
              <p className="text-xs text-slate-400">
                Weekly quantum proofs, systems whitepapers, and curriculum updates.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto gap-2">
              <input
                className="bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 w-full sm:w-64"
                placeholder="engineer@domain.com"
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold whitespace-nowrap transition-colors shadow-md"
                type="submit"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-4">
            <div>© 2025 StudyPilot Inc. All rights reserved. NOVA LMS is an academic trademark.</div>
            <div className="flex items-center gap-6">
              <a className="hover:text-slate-300" href="#terms">
                Terms of Service
              </a>
              <a className="hover:text-slate-300" href="#security">
                Security Disclosures
              </a>
              <a className="hover:text-slate-300" href="#cookies">
                Cookie Preferences
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;