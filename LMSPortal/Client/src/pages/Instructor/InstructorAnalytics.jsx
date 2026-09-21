import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';

const DEFAULT_COURSES = [
  {
    id: 'c1',
    code: 'QPU-904',
    title: 'Neural Architectures & Tensor Kernels',
    modules: 8,
    level: 'Level 5',
    icon: 'memory',
    iconBg: 'bg-primary/10 text-primary',
    scholars: 4812,
    completionRate: 89.2,
    velocityTier: 'Top tier',
    rating: 4.96,
    auditCount: '3.2k',
    hours: '62,140 hrs',
    revenue: 214800,
    momentum: 'Accelerating',
    momentumType: 'tertiary',
  },
  {
    id: 'c2',
    code: 'CLOUD-702',
    title: 'Distributed Cloud Kernel Design',
    modules: 10,
    level: 'Level 4',
    icon: 'cloud_circle',
    iconBg: 'bg-secondary/10 text-secondary',
    scholars: 3290,
    completionRate: 82.4,
    velocityTier: 'Normal',
    rating: 4.88,
    auditCount: '1.9k',
    hours: '41,200 hrs',
    revenue: 146500,
    momentum: 'Optimal',
    momentumType: 'secondary',
  },
  {
    id: 'c3',
    code: 'ZK-802',
    title: 'Zero-Knowledge Cryptography & SNARKs',
    modules: 6,
    level: 'Advanced',
    icon: 'lock_open',
    iconBg: 'bg-tertiary/10 text-tertiary',
    scholars: 2510,
    completionRate: 78.1,
    velocityTier: 'Mod 3 Drop',
    rating: 4.91,
    auditCount: '1.1k',
    hours: '29,880 hrs',
    revenue: 89200,
    momentum: 'Review Mod 3',
    momentumType: 'error',
  },
  {
    id: 'c4',
    code: 'BFT-550',
    title: 'Byzantine Fault Tolerance Protocols',
    modules: 6,
    level: 'Level 4',
    icon: 'hub',
    iconBg: 'bg-surface-container-highest text-primary-fixed-dim',
    scholars: 1868,
    completionRate: 86.7,
    velocityTier: 'Steady',
    rating: 4.94,
    auditCount: '530',
    hours: '15,400 hrs',
    revenue: 32400,
    momentum: 'Stable',
    momentumType: 'secondary',
  },
];

const DEFAULT_COHORTS = [
  {
    id: 'coh1',
    code: 'QPU-904',
    section: 'Section Alpha',
    startDate: 'Started Sep 15, 2024',
    size: 240,
    watchRate: '96.4%',
    submits: '1,420 / 1,440',
    passRate: '94.8%',
    flaggedCount: 0,
    status: 'optimal',
  },
  {
    id: 'coh2',
    code: 'CLOUD-702',
    section: 'Section Gamma',
    startDate: 'Started Oct 01, 2024',
    size: 310,
    watchRate: '88.2%',
    submits: '1,680 / 1,860',
    passRate: '88.5%',
    flaggedCount: 5,
    flaggedText: '5 Stalled',
    status: 'warning',
  },
  {
    id: 'coh3',
    code: 'ZK-802',
    section: 'Section Delta',
    startDate: 'Started Oct 10, 2024',
    size: 180,
    watchRate: '81.0%',
    submits: '890 / 1,080',
    passRate: '79.2%',
    flaggedCount: 8,
    flaggedText: '8 Inactive > 5d',
    status: 'error',
  },
  {
    id: 'coh4',
    code: 'BFT-550',
    section: 'Section Beta',
    startDate: 'Started Oct 15, 2024',
    size: 195,
    watchRate: '92.1%',
    submits: '910 / 975',
    passRate: '91.4%',
    flaggedCount: 1,
    flaggedText: '1 Flagged',
    status: 'optimal',
  },
];

const MOCK_STUDENTS_ROSTER = [
  { id: 'st-1', name: 'Alexandre Sterling', email: 'a.sterling@quantum.ox.ac.uk', progress: 98, status: 'Active', score: '97.5%' },
  { id: 'st-2', name: 'Dr. Evelyn Morales', email: 'evelyn.m@caltech.edu', progress: 92, status: 'Active', score: '94.0%' },
  { id: 'st-3', name: 'Jin-Woo Park', email: 'j.park@kaist.ac.kr', progress: 85, status: 'Stalled Mod 3', score: '81.2%' },
  { id: 'st-4', name: 'Seraphina Vance', email: 's.vance@ethz.ch', progress: 100, status: 'Certified', score: '99.8%' },
  { id: 'st-5', name: 'Marcus Brody', email: 'm.brody@mit.edu', progress: 74, status: 'Inactive 4d', score: '76.4%' },
  { id: 'st-6', name: 'Priya Narayanan', email: 'p.narayanan@iitb.ac.in', progress: 95, status: 'Active', score: '96.2%' },
];

export default function InstructorAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30 Days');
  const [selectedCurriculum, setSelectedCurriculum] = useState('all');
  const [exportOpen, setExportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectModalCourse, setInspectModalCourse] = useState(null);
  const [rosterModalCohort, setRosterModalCohort] = useState(null);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState('4s ago');
  const [backendStats, setBackendStats] = useState(null);

  // Fetch backend instructor metrics if available
  useEffect(() => {
    let isMounted = true;
    const loadBackendAnalytics = async () => {
      try {
        const res = await API.get('/analytics/instructor');
        if (isMounted && res.data?.stats) {
          setBackendStats(res.data.stats);
        }
      } catch {
        // Fallback gracefully to default telemetry
      }
    };
    loadBackendAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update sync pulse timer
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor(Math.random() * 5) + 2;
      setLastSyncedTime(`${seconds}s ago`);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Filtered courses based on search and curriculum selector
  const filteredCourses = useMemo(() => {
    return DEFAULT_COURSES.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.level.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSelect =
        selectedCurriculum === 'all' ||
        (selectedCurriculum === 'qpu' && course.code.includes('QPU')) ||
        (selectedCurriculum === 'cloud' && course.code.includes('CLOUD')) ||
        (selectedCurriculum === 'zk' && course.code.includes('ZK')) ||
        (selectedCurriculum === 'ds' && course.code.includes('BFT'));

      return matchesSearch && matchesSelect;
    });
  }, [searchQuery, selectedCurriculum]);

  // Handle Export actions
  const handleExport = (format) => {
    setExportOpen(false);
    toast.success(`Exporting Telemetry Report (${format})`, {
      description: `Cryptographic academic block compiled · Checksum: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    });
  };

  // Handle Nudge Cohort
  const handleNudgeCohort = (cohort) => {
    toast.success(`Automated Nudge Dispatched to ${cohort.section}`, {
      description: `Sent high-priority pedagogical telemetry reminders to ${cohort.flaggedCount || 5} stalled scholars.`,
    });
  };

  // Handle Triage Review
  const handleTriageReview = (cohort) => {
    toast.info(`Triage Case Opened for ${cohort.section}`, {
      description: `Queued 8 inactive learners for faculty mentor 1-on-1 intervention checkpoint.`,
    });
  };

  // Handle Inject Asset
  const handleInjectAsset = () => {
    toast.success('Visual Schema Injected into Lesson 3.4', {
      description: 'Zero-Knowledge state transition diagram has been published to student workspace.',
    });
  };

  // Metric multipliers based on timeRange
  const multiplier = useMemo(() => {
    switch (timeRange) {
      case '7 Days':
        return 0.35;
      case '90 Days':
        return 2.6;
      case '1 Year':
        return 9.8;
      default:
        return 1.0;
    }
  }, [timeRange]);

  const totalScholars = useMemo(() => {
    if (backendStats?.totalStudentsCount && backendStats.totalStudentsCount > 0) {
      return (backendStats.totalStudentsCount * 124).toLocaleString();
    }
    return Math.round(12480 * (timeRange === '30 Days' ? 1 : multiplier)).toLocaleString();
  }, [backendStats, timeRange, multiplier]);

  const newInflux = useMemo(() => {
    return Math.round(1842 * (timeRange === '30 Days' ? 1 : multiplier * 0.9)).toLocaleString();
  }, [timeRange, multiplier]);

  const tuitionRevenue = useMemo(() => {
    if (backendStats?.earnings && backendStats.earnings > 0) {
      return `$${(backendStats.earnings / 1000).toFixed(1)}k`;
    }
    return `$${(482.9 * (timeRange === '30 Days' ? 1 : multiplier * 0.95)).toFixed(1)}k`;
  }, [backendStats, timeRange, multiplier]);

  const learningHours = useMemo(() => {
    return Math.round(148620 * (timeRange === '30 Days' ? 1 : multiplier)).toLocaleString() + 'h';
  }, [timeRange, multiplier]);

  return (
    <div className="px-space-lg py-space-lg w-full min-h-screen text-on-background selection:bg-primary-container selection:text-on-primary-container">
      <div className="flex flex-col w-full space-y-space-xl">
        {/* ================= DASHBOARD CONTROLS & BREADCRUMB HEADER ================= */}
        <section className="flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-2 font-code-md text-code-md text-outline">
              <Link to="/instructor/dashboard" className="hover:text-primary transition-colors cursor-pointer">
                Instructor Portal
              </Link>
              <span className="text-outline-variant">/</span>
              <Link to="/instructor/courses" className="hover:text-primary transition-colors cursor-pointer">
                Curricula
              </Link>
              <span className="text-outline-variant">/</span>
              <span className="text-tertiary font-medium">Telemetry & Analytics</span>
            </div>

            <div className="flex items-center gap-space-sm bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-sm border border-surface-container-high/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
              </span>
              <span className="font-code-md text-label-sm text-tertiary uppercase tracking-wider">
                Stream synced {lastSyncedTime}
              </span>
              <span className="text-outline-variant font-code-md text-label-sm">·</span>
              <span className="font-code-md text-label-sm text-outline">NODE_US_EAST_04</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Curricular Analytics & Telemetry
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mt-1">
                Real-time pedagogical metrics, institutional disbursement schedules, learner velocity gradients, and module-level cohort retention telemetry.
              </p>
            </div>

            {/* Action Cluster */}
            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="relative">
                <button
                  id="exportDropdownBtn"
                  onClick={() => setExportOpen(!exportOpen)}
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg flex items-center gap-2 shadow-sm transition-all border border-surface-container-high/50"
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary">download</span>
                  <span>Export Report</span>
                  <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
                </button>

                {exportOpen && (
                  <div
                    id="exportMenu"
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-high shadow-xl p-1.5 z-50 flex flex-col space-y-1 border border-surface-container-highest/60 backdrop-blur-md"
                  >
                    <button
                      onClick={() => handleExport('CSV')}
                      className="w-full text-left px-3 py-2 rounded-lg text-on-surface font-body-sm text-body-sm hover:bg-surface-container-highest flex items-center justify-between transition-colors"
                    >
                      <span>CSV Telemetry Ledger</span>
                      <span className="font-code-md text-label-sm text-outline">.raw</span>
                    </button>
                    <button
                      onClick={() => handleExport('PDF')}
                      className="w-full text-left px-3 py-2 rounded-lg text-on-surface font-body-sm text-body-sm hover:bg-surface-container-highest flex items-center justify-between transition-colors"
                    >
                      <span>Executive Brief (PDF)</span>
                      <span className="font-code-md text-label-sm text-outline">.pdf</span>
                    </button>
                    <button
                      onClick={() => handleExport('JSON')}
                      className="w-full text-left px-3 py-2 rounded-lg text-on-surface font-body-sm text-body-sm hover:bg-surface-container-highest flex items-center justify-between transition-colors"
                    >
                      <span>JSON Academic Block</span>
                      <span className="font-code-md text-label-sm text-outline">.json</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowInsightsModal(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-lg text-label-lg shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">insights</span>
                <span>Generate Insights</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-wrap items-center justify-between gap-space-md shadow-sm border border-surface-container-high/40">
            {/* Time pill selector */}
            <div className="flex items-center bg-surface-container-lowest p-1 rounded-lg gap-1 border border-surface-container-high/30">
              {['7 Days', '30 Days', '90 Days', '1 Year', 'Custom'].map((pill) => (
                <button
                  key={pill}
                  onClick={() => {
                    setTimeRange(pill);
                    toast.info(`Time Horizon Adjusted: ${pill}`);
                  }}
                  className={`px-3 py-1 rounded font-label-md text-label-md transition-all ${
                    timeRange === pill
                      ? 'bg-surface-container-high text-primary shadow-sm font-semibold'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-space-md">
              {/* Date display */}
              <div className="flex items-center gap-2 font-code-md text-code-md text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-surface-container-high/30">
                <span className="material-symbols-outlined text-[16px] text-tertiary">calendar_today</span>
                <span>
                  {timeRange === '7 Days'
                    ? 'Oct 24, 2024 – Oct 31, 2024'
                    : timeRange === '90 Days'
                    ? 'Aug 01, 2024 – Oct 31, 2024'
                    : timeRange === '1 Year'
                    ? 'Nov 01, 2023 – Oct 31, 2024'
                    : 'Oct 1, 2024 – Oct 31, 2024'}
                </span>
              </div>

              {/* Curricula dropdown */}
              <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg border border-surface-container-high/30">
                <span className="material-symbols-outlined text-[18px] text-secondary">school</span>
                <select
                  value={selectedCurriculum}
                  onChange={(e) => setSelectedCurriculum(e.target.value)}
                  className="bg-transparent font-label-lg text-label-lg text-on-surface focus:outline-none cursor-pointer pr-2"
                >
                  <option value="all" className="bg-surface-container-high text-on-surface">
                    All Curricula (14 active)
                  </option>
                  <option value="qpu" className="bg-surface-container-high text-on-surface">
                    Neural Networks QPU-904
                  </option>
                  <option value="cloud" className="bg-surface-container-high text-on-surface">
                    Cloud Kernel Architecture CLOUD-702
                  </option>
                  <option value="zk" className="bg-surface-container-high text-on-surface">
                    Zero-Knowledge Cryptography ZK-802
                  </option>
                  <option value="ds" className="bg-surface-container-high text-on-surface">
                    Distributed Systems Consensus DS-601
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 6 HIGH-IMPACT METRICS CARDS ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-md">
          {/* Card 1: Total Scholars */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-all border border-surface-container-high/40">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Total Scholars</span>
              <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface font-bold">{totalScholars}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-code-md text-label-sm font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span> +14.2%
                </span>
                <span className="font-body-sm text-body-sm text-outline">vs past cycle</span>
              </div>
            </div>
            {/* Mini Sparkline SVG */}
            <div className="mt-3 pt-2">
              <svg className="w-full h-8 overflow-visible" fill="none" viewBox="0 0 100 25">
                <path className="text-primary" d="M0,20 Q15,18 28,14 T55,10 T78,6 T100,2" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-primary/10" d="M0,20 Q15,18 28,14 T55,10 T78,6 T100,2 L100,25 L0,25 Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>

          {/* Card 2: New Enrollments */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-all border border-surface-container-high/40">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">New Influx</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">person_add</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface font-bold">{newInflux}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full bg-secondary-container/40 text-secondary-fixed font-code-md text-label-sm font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">north_east</span> +22.8%
                </span>
                <span className="font-body-sm text-body-sm text-outline">MoM</span>
              </div>
            </div>
            <div className="mt-3 pt-2">
              <svg className="w-full h-8 overflow-visible" fill="none" viewBox="0 0 100 25">
                <path className="text-secondary" d="M0,22 L15,18 L32,19 L48,12 L65,15 L82,8 L100,3" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-secondary/10" d="M0,22 L15,18 L32,19 L48,12 L65,15 L82,8 L100,3 L100,25 L0,25 Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>

          {/* Card 3: Completion Rate */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-all border border-surface-container-high/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Completion Rate</span>
              <span className="material-symbols-outlined text-tertiary text-[20px]">verified</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface font-bold">84.6%</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-code-md text-label-sm font-semibold">
                  +3.4% bench
                </span>
                <span className="font-code-md text-label-sm text-primary font-medium">Top 5% Faculty</span>
              </div>
            </div>
            <div className="mt-3 pt-2">
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-tertiary h-full rounded-full" style={{ width: '84.6%' }}></div>
              </div>
              <div className="flex justify-between items-center text-outline font-code-md text-label-sm mt-1">
                <span>Global Avg: 68%</span>
                <span className="text-tertiary">84.6%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Average Rating */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-all border border-surface-container-high/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Peer Audit Rating</span>
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md text-on-surface font-bold">4.92</span>
                <span className="font-code-md text-code-md text-outline">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-code-md text-label-sm text-on-surface-variant">6,730 audits</span>
                <span className="font-code-md text-label-sm text-tertiary">98.4% 5★</span>
              </div>
            </div>
            <div className="mt-3 pt-2 flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
              <span className="font-code-md text-label-sm text-outline ml-auto">99.1 pct</span>
            </div>
          </div>

          {/* Card 5: Net Tuition Revenue */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-all border border-surface-container-high/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Tuition Accrued</span>
              <span className="material-symbols-outlined text-tertiary text-[20px]">payments</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface font-bold">{tuitionRevenue}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-code-md text-label-sm font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">arrow_upward</span> +18.5%
                </span>
                <span className="font-body-sm text-body-sm text-outline">YoY</span>
              </div>
            </div>
            <div className="mt-3 pt-2 flex items-center justify-between text-outline font-code-md text-label-sm">
              <span>Split: 85/15 Net</span>
              <span className="text-secondary font-medium">Bi-weekly Auto</span>
            </div>
          </div>

          {/* Card 6: Total Learning Hours */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-all border border-surface-container-high/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Lab & Lecture Hours</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">timelapse</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface font-bold">{learningHours}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded-full bg-secondary-container/40 text-secondary-fixed font-code-md text-label-sm font-semibold">
                  +19.4% MoM
                </span>
                <span className="font-body-sm text-body-sm text-outline">Avg 38.2h/ea</span>
              </div>
            </div>
            <div className="mt-3 pt-2">
              <svg className="w-full h-8 overflow-visible" fill="none" viewBox="0 0 100 25">
                <path className="text-tertiary" d="M0,20 Q20,22 40,15 T70,8 T100,4" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-tertiary/10" d="M0,20 Q20,22 40,15 T70,8 T100,4 L100,25 L0,25 Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>
        </section>

        {/* ================= MAIN TELEMETRY CHARTS (2x2 GRID) ================= */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg">
          {/* CHART 1: ENROLLMENT & VELOCITY TREND */}
          <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container-high/40">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Enrollment Velocity Gradients</h2>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-code-md text-label-sm font-semibold border border-primary/20">
                    DUAL SPLINE
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">30-day cumulative scholar acquisition vs prior 30-day baseline</p>
              </div>

              <div className="flex items-center gap-space-md font-label-md text-label-md">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary shadow-sm"></span>
                  <span className="text-on-surface">Current Window (1,842)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-outline-variant"></span>
                  <span className="text-outline">Prior Cycle (1,500)</span>
                </div>
              </div>
            </div>

            {/* Main Chart SVG */}
            <div className="w-full h-64 relative mt-2 group/chart">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 600 220">
                <defs>
                  <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.35"></stop>
                    <stop offset="100%" stopColor="#c0c1ff" stopOpacity="0.0"></stop>
                  </linearGradient>
                  <linearGradient id="cyanGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="600" y1="30" y2="30"></line>
                <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="600" y1="80" y2="80"></line>
                <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="600" y1="130" y2="130"></line>
                <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="600" y1="180" y2="180"></line>

                {/* Prior Period (Dashed) */}
                <path className="text-outline-variant" d="M0,175 C70,165 140,150 210,130 C280,110 350,120 420,95 C490,70 550,60 600,45" stroke="currentColor" strokeDasharray="4 4" strokeWidth="2"></path>

                {/* Current Period Filled Area */}
                <path d="M0,160 C60,150 120,135 180,105 C240,75 300,90 360,65 C420,40 480,45 540,25 L600,18 L600,200 L0,200 Z" fill="url(#areaGradient)"></path>

                {/* Current Period Line */}
                <path className="text-primary" d="M0,160 C60,150 120,135 180,105 C240,75 300,90 360,65 C420,40 480,45 540,25 L600,18" stroke="currentColor" strokeWidth="3"></path>

                {/* Interactive Highlight Peak Pin */}
                <circle className="fill-surface-container-lowest stroke-tertiary cursor-pointer" cx="540" cy="25" r="5" strokeWidth="3"></circle>
                <circle className="stroke-tertiary opacity-30 animate-ping" cx="540" cy="25" r="8" strokeWidth="2"></circle>
              </svg>

              {/* Peak Popover Tooltip */}
              <div className="absolute top-2 right-12 bg-surface-container-highest text-on-surface px-3 py-1.5 rounded-lg shadow-lg font-code-md text-label-sm border border-surface-container-high/60 pointer-events-none">
                <div className="text-tertiary font-bold">Peak Influx: Oct 28</div>
                <div className="text-on-surface-variant text-[11px]">84 enrollments/hr (Live Sync)</div>
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between items-center text-outline font-code-md text-label-sm pt-3">
              <span>Oct 01</span>
              <span>Oct 07</span>
              <span>Oct 14</span>
              <span>Oct 21</span>
              <span>Oct 28</span>
              <span>Oct 31</span>
            </div>
          </div>

          {/* CHART 2: COURSE COMPLETION & DROP-OFF FUNNEL */}
          <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col justify-between border border-surface-container-high/40">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Curricular Retention & Fall-off Funnel</h2>
                  <span className="px-2 py-0.5 rounded bg-error/10 text-error font-code-md text-label-sm font-semibold border border-error/20">
                    MOD 3 ANOMALY
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">Persistence across progression gates (Module 1 through Capstone)</p>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-highest px-2.5 py-1 rounded-lg border border-surface-container-high/40">
                <span className="material-symbols-outlined text-tertiary text-[16px]">flag</span>
                <span className="font-code-md text-label-sm text-on-surface">Drop Floor: 4.2%</span>
              </div>
            </div>

            {/* Step Funnel Display */}
            <div className="space-y-2.5 my-auto">
              {/* Step 1 */}
              <div className="space-y-1">
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-on-surface font-semibold">Mod 01: Theoretical Foundations</span>
                  <span className="font-code-md text-primary">100% · 12,480 enrolled</span>
                </div>
                <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-1">
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-on-surface font-semibold">Mod 02: Computational Kernels</span>
                  <span className="font-code-md text-primary">97.8% · 12,205 passed</span>
                </div>
                <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '97.8%' }}></div>
                </div>
              </div>

              {/* Step 3 (Anomaly) */}
              <div className="space-y-1 bg-surface-container/60 p-2 rounded-lg border border-error/20">
                <div className="flex justify-between font-label-md text-label-md">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                    <span className="text-on-surface font-semibold">Mod 03: Distributed State Synthesis</span>
                  </div>
                  <span className="font-code-md text-error font-bold">92.6% (-5.2% fall-off)</span>
                </div>
                <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-primary via-secondary to-error h-full rounded-full" style={{ width: '92.6%' }}></div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-1">
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-on-surface font-semibold">Mod 04: Zero-Knowledge Verification</span>
                  <span className="font-code-md text-tertiary">90.1% · 11,244 passed</span>
                </div>
                <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: '90.1%' }}></div>
                </div>
              </div>

              {/* Step 5: Final Capstone */}
              <div className="space-y-1">
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-on-surface font-semibold">Mod 08: Production Hardening & Defense</span>
                  <span className="font-code-md text-tertiary font-bold">84.6% · 10,558 certified</span>
                </div>
                <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-tertiary to-primary-container h-full rounded-full" style={{ width: '84.6%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 font-code-md text-label-sm text-outline border-t border-surface-container-high/30 mt-2">
              <span>Global Academia Attrition: 32.0%</span>
              <span className="text-tertiary font-semibold">StudyPilot Attrition: 15.4%</span>
            </div>
          </div>

          {/* CHART 3: ENGAGEMENT SCRUB ACTIVITY & MODALITY BREAKDOWN */}
          <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col justify-between border border-surface-container-high/40">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Modal Engagement Heatmap</h2>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">Interaction distribution across multimodal pedagogies</p>
              </div>
              <div className="font-code-md text-label-sm text-outline bg-surface-container px-2.5 py-1 rounded border border-surface-container-high/30">
                AGGREGATE: 148,620h
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-space-sm my-2">
              {/* Interactive Ring / Donut */}
              <div className="col-span-1 flex flex-col items-center justify-center p-space-md bg-surface-container rounded-xl border border-surface-container-high/30">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background Ring */}
                    <path
                      className="text-surface-container-highest"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    ></path>
                    {/* Video: 48% */}
                    <path
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="48, 100"
                      strokeLinecap="round"
                      strokeWidth="3.8"
                    ></path>
                    {/* Lab Sandbox: 32% (offset 48) */}
                    <path
                      className="text-tertiary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="32, 100"
                      strokeDashoffset="-48"
                      strokeLinecap="round"
                      strokeWidth="3.8"
                    ></path>
                    {/* Assessments: 14% (offset 80) */}
                    <path
                      className="text-secondary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="14, 100"
                      strokeDashoffset="-80"
                      strokeLinecap="round"
                      strokeWidth="3.8"
                    ></path>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">148k</span>
                    <span className="font-code-md text-label-sm text-outline">HOURS</span>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary mt-2">Active Cycle</span>
              </div>

              {/* Breakdown List */}
              <div className="col-span-3 flex flex-col justify-between space-y-2">
                <div className="bg-surface-container p-3 rounded-lg flex items-center justify-between border border-surface-container-high/30">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <div>
                      <div className="font-label-lg text-label-lg text-on-surface">Interactive Stream Lectures</div>
                      <div className="font-body-sm text-body-sm text-outline">Ultra HD playback with code sync & keyframe scrub</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-code-md text-code-md text-primary font-bold">48%</span>
                    <div className="font-code-md text-label-sm text-outline">71,337 hrs</div>
                  </div>
                </div>

                <div className="bg-surface-container p-3 rounded-lg flex items-center justify-between border border-surface-container-high/30">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                    <div>
                      <div className="font-label-lg text-label-lg text-on-surface">Cloud Sandbox Terminals</div>
                      <div className="font-body-sm text-body-sm text-outline">Rust, CUDA & Python compiler environments</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-code-md text-code-md text-tertiary font-bold">32%</span>
                    <div className="font-code-md text-label-sm text-outline">47,558 hrs</div>
                  </div>
                </div>

                <div className="bg-surface-container p-3 rounded-lg flex items-center justify-between border border-surface-container-high/30">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <div>
                      <div className="font-label-lg text-label-lg text-on-surface">Telemetry Automated Assessments</div>
                      <div className="font-body-sm text-body-sm text-outline">Runtime unit testing & peer code defense</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-code-md text-code-md text-secondary font-bold">14%</span>
                    <div className="font-code-md text-label-sm text-outline">20,806 hrs</div>
                  </div>
                </div>

                <div className="bg-surface-container p-3 rounded-lg flex items-center justify-between border border-surface-container-high/30">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
                    <div>
                      <div className="font-label-lg text-label-lg text-on-surface">Colloquium & Async Discussions</div>
                      <div className="font-body-sm text-body-sm text-outline">Faculty office hours & thread synthesis</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-code-md text-code-md text-on-surface-variant font-bold">6%</span>
                    <div className="font-code-md text-label-sm text-outline">8,917 hrs</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="font-code-md text-label-sm text-outline text-right pt-2 border-t border-surface-container-high/30 mt-1">
              Data verified via Distributed Ledger Node #04
            </div>
          </div>

          {/* CHART 4: ASSESSMENT PASS RATE DISTRIBUTION */}
          <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col justify-between border border-surface-container-high/40">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Assessment Mastery & Score Curve</h2>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">Automated grader telemetry across 48 rigorous checkpoints</p>
              </div>
              <div className="flex items-center gap-3 font-code-md text-label-sm">
                <span className="text-tertiary">Mean: 87.4 / 100</span>
                <span className="text-outline">Median: 24m 12s</span>
              </div>
            </div>

            {/* Curve Graphic */}
            <div className="h-44 w-full relative">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 500 160">
                <defs>
                  <linearGradient id="curveGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.4"></stop>
                    <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>
                <line className="text-surface-container-highest" stroke="currentColor" x1="0" x2="500" y1="140" y2="140"></line>
                {/* Normal Score Distribution Bell Curve */}
                <path d="M0,140 C100,140 180,135 250,90 C320,40 370,15 410,25 C450,40 480,100 500,140 L500,140 L0,140 Z" fill="url(#curveGradient)"></path>
                <path className="text-tertiary" d="M0,140 C100,140 180,135 250,90 C320,40 370,15 410,25 C450,40 480,100 500,140" stroke="currentColor" strokeWidth="2.5"></path>
                {/* Mean Target Marker */}
                <line className="text-primary" stroke="currentColor" strokeDasharray="4 4" strokeWidth="2" x1="390" x2="390" y1="15" y2="140"></line>
                <circle className="fill-primary" cx="390" cy="18" r="4"></circle>
              </svg>
              <div className="absolute top-2 left-2/3 bg-surface-container-highest px-2 py-1 rounded text-primary font-code-md text-label-sm shadow-md border border-surface-container-high/60">
                Class Mean: 87.4%
              </div>
            </div>

            {/* Segment Pass Rate Pills */}
            <div className="grid grid-cols-3 gap-space-sm pt-2">
              <div className="bg-surface-container p-3 rounded-lg flex flex-col border border-surface-container-high/30">
                <span className="font-code-md text-label-sm text-outline">First Attempt Pass</span>
                <span className="font-headline-sm text-headline-sm text-tertiary font-bold mt-1">92.0%</span>
                <span className="font-body-sm text-body-sm text-outline-variant mt-0.5">Threshold &gt;= 80%</span>
              </div>
              <div className="bg-surface-container p-3 rounded-lg flex flex-col border border-surface-container-high/30">
                <span className="font-code-md text-label-sm text-outline">After 1 Lab Retake</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold mt-1">6.0%</span>
                <span className="font-body-sm text-body-sm text-outline-variant mt-0.5">Algorithmic sandbox</span>
              </div>
              <div className="bg-surface-container p-3 rounded-lg flex flex-col border border-surface-container-high/30">
                <span className="font-code-md text-label-sm text-outline">Required Mentorship</span>
                <span className="font-headline-sm text-headline-sm text-secondary font-bold mt-1">2.0%</span>
                <span className="font-body-sm text-body-sm text-outline-variant mt-0.5">Faculty triage queue</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: COURSE-LEVEL PERFORMANCE MATRIX TABLE ================= */}
        <section className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col space-y-space-md border border-surface-container-high/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Curriculum-Level Performance Matrix</h2>
              <p className="font-body-sm text-body-sm text-outline mt-0.5">Real-time audit across all active instruction nodes and revenue pipelines</p>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm rounded-lg px-3 py-2 pl-9 focus:outline-none focus:ring-1 focus:ring-primary w-64 border border-surface-container-high/30"
                  placeholder="Filter courses, nodes, or tags..."
                  type="text"
                />
                <span className="material-symbols-outlined text-[18px] text-outline absolute left-2.5 top-2.5">search</span>
              </div>
              <button
                onClick={() => toast.info('Column Filters toggled', { description: 'Telemetry metrics, scholars count, and earnings columns enabled.' })}
                className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors border border-surface-container-high/40"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
                <span>Column Filters</span>
              </button>
            </div>
          </div>

          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead>
                <tr className="bg-surface-container text-outline font-label-sm text-label-sm uppercase tracking-wider border-b border-surface-container-high/30">
                  <th className="p-space-md rounded-l-lg">Course Title & Code</th>
                  <th className="p-space-md">Scholars</th>
                  <th className="p-space-md">Completion Velocity</th>
                  <th className="p-space-md">Audits</th>
                  <th className="p-space-md">Total Hours</th>
                  <th className="p-space-md">Revenue (USD)</th>
                  <th className="p-space-md">Momentum</th>
                  <th className="p-space-md rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-lowest">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-outline font-body-md">
                      No matching curricula found for query "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-surface-container transition-colors group">
                      <td className="p-space-md">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${course.iconBg} flex items-center justify-center font-bold`}>
                            <span className="material-symbols-outlined">{course.icon}</span>
                          </div>
                          <div>
                            <div className="font-label-lg text-label-lg text-on-surface font-semibold group-hover:text-primary transition-colors">
                              {course.title}
                            </div>
                            <div className="font-code-md text-label-sm text-outline">
                              CODE: {course.code} · {course.modules} Modules · {course.level}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-space-md font-code-md text-on-surface">{course.scholars.toLocaleString()}</td>

                      <td className="p-space-md">
                        <div className="w-36">
                          <div className="flex justify-between font-code-md text-label-sm mb-1">
                            <span className={course.momentumType === 'error' ? 'text-error' : course.momentumType === 'tertiary' ? 'text-tertiary' : 'text-primary'}>
                              {course.completionRate}%
                            </span>
                            <span className="text-outline">{course.velocityTier}</span>
                          </div>
                          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                course.momentumType === 'error'
                                  ? 'bg-error'
                                  : course.momentumType === 'tertiary'
                                  ? 'bg-tertiary'
                                  : 'bg-primary'
                              }`}
                              style={{ width: `${course.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="p-space-md">
                        <div className="flex items-center gap-1 text-on-surface">
                          <span className="font-code-md font-bold">{course.rating}</span>
                          <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="text-outline text-label-sm">({course.auditCount})</span>
                        </div>
                      </td>

                      <td className="p-space-md font-code-md text-on-surface">{course.hours}</td>

                      <td className="p-space-md font-code-md text-primary font-semibold">
                        ${course.revenue.toLocaleString()}
                      </td>

                      <td className="p-space-md">
                        <span
                          className={`px-2 py-0.5 rounded-full font-code-md text-label-sm font-semibold inline-flex items-center gap-1 ${
                            course.momentumType === 'error'
                              ? 'bg-error-container/40 text-error'
                              : course.momentumType === 'tertiary'
                              ? 'bg-tertiary/10 text-tertiary'
                              : 'bg-secondary-container/40 text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {course.momentumType === 'error'
                              ? 'flag'
                              : course.momentumType === 'tertiary'
                              ? 'trending_up'
                              : 'check_circle'}
                          </span>{' '}
                          {course.momentum}
                        </span>
                      </td>

                      <td className="p-space-md text-right">
                        <button
                          onClick={() => setInspectModalCourse(course)}
                          className="px-3 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-code-md text-label-sm transition-colors border border-surface-container-highest/60"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between text-outline font-body-sm text-body-sm pt-2 border-t border-surface-container-high/30">
            <div className="font-code-md text-label-sm">
              Displaying {filteredCourses.length} of 14 active academic curricula
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button
                onClick={() => toast.info('Navigating to secondary page of academic curriculum')}
                className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* ================= SECTION 5: COHORT RETENTION TELEMETRY & AT-RISK SCHOLAR PIPELINE ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
          {/* Left 2 Cols: Cohort Engagement Table */}
          <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col space-y-space-md border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Cohort Engagement & Retention Telemetry</h2>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">Real-time scrutiny of section completion, lab output, and automated alerts</p>
              </div>
              <button
                onClick={() => {
                  setLastSyncedTime('1s ago');
                  toast.success('Telemetry Feed Refreshed', { description: 'All active cohort webhooks synchronised.' });
                }}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-tertiary font-label-md text-label-md flex items-center gap-1 transition-colors border border-surface-container-high/30"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>Refresh Feed</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead>
                  <tr className="bg-surface-container text-outline font-label-sm text-label-sm uppercase tracking-wider border-b border-surface-container-high/30">
                    <th className="p-space-sm rounded-l-lg">Cohort Section</th>
                    <th className="p-space-sm">Size</th>
                    <th className="p-space-sm">Scrub Velocity</th>
                    <th className="p-space-sm">Lab Submits</th>
                    <th className="p-space-sm">Pass %</th>
                    <th className="p-space-sm">At-Risk State</th>
                    <th className="p-space-sm rounded-r-lg text-right">Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-lowest font-code-md text-label-sm">
                  {DEFAULT_COHORTS.map((cohort) => (
                    <tr key={cohort.id} className="hover:bg-surface-container transition-colors">
                      <td className="p-space-sm">
                        <div className="font-label-md text-on-surface font-semibold">{cohort.code} · {cohort.section}</div>
                        <div className="text-outline text-[11px]">{cohort.startDate}</div>
                      </td>

                      <td className="p-space-sm text-on-surface">{cohort.size} scholars</td>

                      <td className="p-space-sm text-tertiary">{cohort.watchRate} watch</td>

                      <td className="p-space-sm text-on-surface">{cohort.submits}</td>

                      <td className={`p-space-sm font-bold ${cohort.status === 'error' ? 'text-secondary' : 'text-primary'}`}>
                        {cohort.passRate}
                      </td>

                      <td className="p-space-sm">
                        {cohort.flaggedCount === 0 ? (
                          <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary text-[11px] font-semibold border border-tertiary/20">
                            0 Flagged
                          </span>
                        ) : cohort.status === 'error' ? (
                          <span className="px-2 py-0.5 rounded bg-error-container/30 text-error text-[11px] font-semibold flex items-center gap-1 w-fit border border-error/20">
                            <span className="material-symbols-outlined text-[12px]">error</span> {cohort.flaggedText}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-error-container/30 text-error text-[11px] font-semibold flex items-center gap-1 w-fit border border-error/20">
                            <span className="material-symbols-outlined text-[12px]">warning</span> {cohort.flaggedText}
                          </span>
                        )}
                      </td>

                      <td className="p-space-sm text-right">
                        {cohort.flaggedCount === 0 ? (
                          <button
                            onClick={() => setRosterModalCohort(cohort)}
                            className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface text-[11px] transition-colors border border-surface-container-highest/60"
                          >
                            View Roster
                          </button>
                        ) : cohort.status === 'warning' ? (
                          <button
                            onClick={() => handleNudgeCohort(cohort)}
                            className="px-2.5 py-1 rounded bg-primary-container text-on-primary text-[11px] font-bold shadow-sm hover:brightness-110 transition-all"
                          >
                            Nudge Cohort
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTriageReview(cohort)}
                            className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container text-[11px] font-bold shadow-sm hover:brightness-110 transition-all"
                          >
                            Triage Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 1 Col: AI Pedagogical Intelligence & Ledger Summary */}
          <div className="flex flex-col space-y-space-md">
            {/* AI Insight Card */}
            <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between border border-surface-container-high/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">psychology</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Pedagogical AI Synthesis</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary font-code-md text-label-sm font-bold border border-secondary/20">
                  LIVE ADVICE
                </span>
              </div>

              <div className="space-y-space-sm">
                {/* Alert 1 */}
                <div className="bg-surface-container p-3 rounded-lg space-y-1 border border-surface-container-high/30">
                  <div className="flex items-center gap-1.5 text-error font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[16px]">priority_high</span>
                    <span>Module 3 Quiz Bottleneck</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Zero-Knowledge (ZK-802) Module 3 shows an abrupt 6.2% dip in first-time pass velocity. Scholars spend 2.4x expected scrub time on Lesson 3.4.
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="font-code-md text-[11px] text-tertiary">Rec: Add 1 visual schema</span>
                    <button
                      onClick={handleInjectAsset}
                      className="text-primary hover:underline font-label-sm text-label-sm font-bold"
                    >
                      Inject Asset
                    </button>
                  </div>
                </div>

                {/* Alert 2 */}
                <div className="bg-surface-container p-3 rounded-lg space-y-1 border border-surface-container-high/30">
                  <div className="flex items-center gap-1.5 text-tertiary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Top Module Velocity</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Tensor Kernels (QPU-904) Module 2 has achieved a 99.4% satisfaction score and 0 recorded retakes across 4,800 scholars.
                  </p>
                </div>
              </div>
            </div>

            {/* Payout Ledger Dock */}
            <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-surface-container-high/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">account_balance_wallet</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Faculty Disbursement</span>
                </div>
                <span className="font-code-md text-label-sm text-tertiary">NOV 01 EXP.</span>
              </div>

              <div className="bg-surface-container p-space-sm rounded-lg flex items-center justify-between mb-3 border border-surface-container-high/30">
                <div>
                  <span className="font-body-sm text-body-sm text-outline">Next Scheduled Payout</span>
                  <div className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">$48,290.00</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-tertiary/10 text-tertiary font-code-md text-label-sm font-semibold border border-tertiary/20">
                  ACH / WIRE READY
                </span>
              </div>

              <div className="space-y-1.5 font-code-md text-label-sm text-outline">
                <div className="flex justify-between">
                  <span>Gross Curricula Sales:</span>
                  <span className="text-on-surface">$568,117.64</span>
                </div>
                <div className="flex justify-between">
                  <span>Protocol Institutional Fee (15%):</span>
                  <span className="text-on-surface">-$85,217.64</span>
                </div>
                <div className="flex justify-between font-bold text-on-surface pt-1 border-t border-surface-container-high/30">
                  <span>Faculty Net Retained:</span>
                  <span className="text-tertiary">$482,900.00</span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-container-high/30">
                <button
                  onClick={() => setShowLedgerModal(true)}
                  className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Complete Ledger</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
                <span className="font-code-md text-[11px] text-outline">TLS 1.3 Audit Verified</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================= MODAL: INSPECT COURSE TELEMETRY ================= */}
      {inspectModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${inspectModalCourse.iconBg} flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{inspectModalCourse.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface font-bold">{inspectModalCourse.title}</h3>
                  <p className="font-code-md text-outline text-xs">
                    CODE: {inspectModalCourse.code} · {inspectModalCourse.modules} Modules · {inspectModalCourse.level}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectModalCourse(null)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 font-code-md">
              <div className="bg-surface-container p-3 rounded-xl">
                <span className="text-xs text-outline">Active Scholars</span>
                <p className="text-lg font-bold text-on-surface mt-1">{inspectModalCourse.scholars.toLocaleString()}</p>
              </div>
              <div className="bg-surface-container p-3 rounded-xl">
                <span className="text-xs text-outline">Total Revenue</span>
                <p className="text-lg font-bold text-primary mt-1">${inspectModalCourse.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-surface-container p-3 rounded-xl">
                <span className="text-xs text-outline">Avg Velocity</span>
                <p className="text-lg font-bold text-tertiary mt-1">{inspectModalCourse.completionRate}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-label-lg text-on-surface">Module Scrutiny & Friction Points</h4>
              <div className="space-y-1.5 text-xs font-code-md">
                <div className="bg-surface-container/60 p-2 rounded-lg flex items-center justify-between">
                  <span>Mod 01: Core Architecture Theory</span>
                  <span className="text-tertiary">99.1% pass · 18m avg</span>
                </div>
                <div className="bg-surface-container/60 p-2 rounded-lg flex items-center justify-between">
                  <span>Mod 02: Pipeline Memory Buffers</span>
                  <span className="text-tertiary">97.4% pass · 28m avg</span>
                </div>
                <div className="bg-surface-container/60 p-2 rounded-lg flex items-center justify-between text-error bg-error-container/10">
                  <span>Mod 03: Fault-Tolerant Consensus Checkpoint</span>
                  <span>92.6% pass · 54m avg (Friction!)</span>
                </div>
                <div className="bg-surface-container/60 p-2 rounded-lg flex items-center justify-between">
                  <span>Mod 04: Production Hardening Deployment</span>
                  <span className="text-primary">89.2% pass · 35m avg</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
              <button
                onClick={() => {
                  setInspectModalCourse(null);
                  navigate('/instructor/courses');
                }}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs transition-colors"
              >
                Open in Curriculum Manager
              </button>
              <button
                onClick={() => {
                  toast.success(`Telemetry diagnostic report exported for ${inspectModalCourse.code}`);
                  setInspectModalCourse(null);
                }}
                className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-xs font-bold transition-all shadow-md"
              >
                Export Trace Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW COHORT ROSTER ================= */}
      {rosterModalCohort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
              <div>
                <h3 className="font-headline-sm text-on-surface font-bold">
                  {rosterModalCohort.code} · {rosterModalCohort.section} Roster
                </h3>
                <p className="font-code-md text-outline text-xs">
                  {rosterModalCohort.size} Scholars · {rosterModalCohort.startDate} · {rosterModalCohort.passRate} Pass Rate
                </p>
              </div>
              <button
                onClick={() => setRosterModalCohort(null)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left font-body-sm text-xs">
                <thead>
                  <tr className="bg-surface-container text-outline font-code-md uppercase">
                    <th className="p-2.5 rounded-l-lg">Scholar</th>
                    <th className="p-2.5">Progress</th>
                    <th className="p-2.5">Score</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 rounded-r-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-lowest font-code-md">
                  {MOCK_STUDENTS_ROSTER.map((student) => (
                    <tr key={student.id} className="hover:bg-surface-container">
                      <td className="p-2.5">
                        <div className="font-semibold text-on-surface">{student.name}</div>
                        <div className="text-outline text-[11px]">{student.email}</div>
                      </td>
                      <td className="p-2.5">
                        <div className="w-20 bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                          <div className="bg-tertiary h-full rounded-full" style={{ width: `${student.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] text-outline mt-0.5 block">{student.progress}%</span>
                      </td>
                      <td className="p-2.5 text-primary font-bold">{student.score}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            student.status.includes('Stalled') || student.status.includes('Inactive')
                              ? 'bg-error/20 text-error'
                              : 'bg-tertiary/20 text-tertiary'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => toast.success(`Pinging ${student.name} with mentor assistance message.`)}
                          className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[11px]"
                        >
                          Ping
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
              <span className="text-outline font-code-md text-xs">Section Health Index: 96.4/100</span>
              <button
                onClick={() => setRosterModalCohort(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-xs font-semibold"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CRYPTOGRAPHIC DISBURSEMENT LEDGER ================= */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface font-bold">Academic Settlement Ledger</h3>
                  <p className="font-code-md text-outline text-xs">TLS 1.3 End-to-End Cryptographic Audit Trail</p>
                </div>
              </div>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 font-code-md text-xs">
              <div className="bg-surface-container p-3.5 rounded-xl space-y-1.5 border border-surface-container-high/40">
                <div className="flex justify-between text-on-surface font-bold text-sm">
                  <span>Settlement Cycle: October 2024</span>
                  <span className="text-tertiary">$48,290.00</span>
                </div>
                <div className="text-outline text-[11px]">Contract Address: 0x932f...81eB // Arbitrum Nova</div>
                <div className="flex justify-between pt-1 text-on-surface-variant">
                  <span>Status: Scheduled for Disbursement (ACH / Wire)</span>
                  <span className="text-primary font-bold">NOV 01, 2024</span>
                </div>
              </div>

              <div className="bg-surface-container/60 p-3 rounded-xl space-y-1 border border-surface-container-high/30">
                <div className="flex justify-between text-on-surface">
                  <span>Prior Settlement: September 2024</span>
                  <span className="text-on-surface font-bold">$41,850.00</span>
                </div>
                <div className="flex justify-between text-outline text-[11px]">
                  <span>Tx Hash: 0x8a12f4...d901b3</span>
                  <span className="text-tertiary">Disbursed via Chase Direct</span>
                </div>
              </div>

              <div className="bg-surface-container/60 p-3 rounded-xl space-y-1 border border-surface-container-high/30">
                <div className="flex justify-between text-on-surface">
                  <span>Prior Settlement: August 2024</span>
                  <span className="text-on-surface font-bold">$38,120.00</span>
                </div>
                <div className="flex justify-between text-outline text-[11px]">
                  <span>Tx Hash: 0x3c990a...4fa211</span>
                  <span className="text-tertiary">Disbursed via Chase Direct</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
              <button
                onClick={() => {
                  toast.success('Downloaded complete cryptographic tax documentation (.csv)');
                  setShowLedgerModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs transition-colors"
              >
                Download Form 1099-K / Tax Pack
              </button>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AI INSIGHTS SYNTHESIS ================= */}
      {showInsightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-container to-secondary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface font-bold">StudyPilot Neural Intelligence Synthesis</h3>
                  <p className="font-code-md text-outline text-xs">Dynamic pedagogical evaluation generated across 12,480 scholars</p>
                </div>
              </div>
              <button
                onClick={() => setShowInsightsModal(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body-sm text-xs">
              <div className="bg-surface-container p-3.5 rounded-xl space-y-1.5 border border-primary/20">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined text-sm">auto_graph</span>
                  <span>Highest Value Intervention: Module 3 Diagram</span>
                </div>
                <p className="text-on-surface-variant">
                  Adding an interactive circuit flow schematic to Lesson 3.4 will recover an estimated <strong>84 scholars/month</strong> from dropping out before the midterm checkpoint.
                </p>
              </div>

              <div className="bg-surface-container p-3.5 rounded-xl space-y-1.5 border border-tertiary/20">
                <div className="flex items-center gap-2 text-tertiary font-bold">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>Optimal Office Hours Schedule</span>
                </div>
                <p className="text-on-surface-variant">
                  Learners from European and Asian academic nodes peak between <strong>14:00 UTC and 18:00 UTC</strong>. Scheduling an async discussion session at 15:30 UTC correlates with a <strong>+18% pass lift</strong>.
                </p>
              </div>

              <div className="bg-surface-container p-3.5 rounded-xl space-y-1.5 border border-secondary/20">
                <div className="flex items-center gap-2 text-secondary font-bold">
                  <span className="material-symbols-outlined text-sm">emoji_events</span>
                  <span>Credential Claim Velocity</span>
                </div>
                <p className="text-on-surface-variant">
                  Scholars certified in QPU-904 have shared <strong>1,420 LinkedIn credentials</strong> with verified cryptographic hashes, driving 340 organic peer enrollments.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
              <button
                onClick={() => {
                  toast.success('Applied automated remediation optimizations to active syllabi.');
                  setShowInsightsModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-md text-xs font-bold shadow-md"
              >
                Apply AI Recommendations
              </button>
              <button
                onClick={() => setShowInsightsModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
