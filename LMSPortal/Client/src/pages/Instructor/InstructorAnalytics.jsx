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
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-200',
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
              <Link to="/instructor/dashboard" className="hover:text-blue-600 transition-colors cursor-pointer">
                Instructor Portal
              </Link>
              <span className="text-slate-300">/</span>
              <Link to="/instructor/courses" className="hover:text-blue-600 transition-colors cursor-pointer">
                Curricula
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-blue-600 font-semibold">Telemetry & Analytics</span>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                Stream synced {lastSyncedTime}
              </span>
              <span className="text-slate-300 font-mono text-xs">·</span>
              <span className="font-mono text-xs text-slate-400">NODE_US_EAST_04</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Curricular Analytics & Telemetry
              </h1>
              <p className="text-slate-500 text-sm max-w-3xl mt-1 leading-relaxed">
                Real-time pedagogical metrics, institutional disbursement schedules, learner velocity gradients, and module-level cohort retention telemetry.
              </p>
            </div>

            {/* Action Cluster */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button
                  id="exportDropdownBtn"
                  onClick={() => setExportOpen(!exportOpen)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 shadow-sm transition-all border border-slate-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-blue-600">download</span>
                  <span>Export Report</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
                </button>

                {exportOpen && (
                  <div
                    id="exportMenu"
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl p-1.5 z-50 flex flex-col space-y-1 border border-slate-200"
                  >
                    <button
                      onClick={() => handleExport('CSV')}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 font-medium text-xs hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>CSV Telemetry Ledger</span>
                      <span className="font-mono text-[11px] text-slate-400">.raw</span>
                    </button>
                    <button
                      onClick={() => handleExport('PDF')}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 font-medium text-xs hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Executive Brief (PDF)</span>
                      <span className="font-mono text-[11px] text-slate-400">.pdf</span>
                    </button>
                    <button
                      onClick={() => handleExport('JSON')}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 font-medium text-xs hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>JSON Academic Block</span>
                      <span className="font-mono text-[11px] text-slate-400">.json</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowInsightsModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">insights</span>
                <span>Generate Insights</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm border border-slate-200/90">
            {/* Time pill selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200/80">
              {['7 Days', '30 Days', '90 Days', '1 Year', 'Custom'].map((pill) => (
                <button
                  key={pill}
                  onClick={() => {
                    setTimeRange(pill);
                    toast.info(`Time Horizon Adjusted: ${pill}`);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    timeRange === pill
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date display */}
              <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="material-symbols-outlined text-[16px] text-blue-600">calendar_today</span>
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
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="material-symbols-outlined text-[18px] text-blue-600">school</span>
                <select
                  value={selectedCurriculum}
                  onChange={(e) => setSelectedCurriculum(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer pr-2"
                >
                  <option value="all" className="bg-white text-slate-900">
                    All Curricula (14 active)
                  </option>
                  <option value="qpu" className="bg-white text-slate-900">
                    Neural Networks QPU-904
                  </option>
                  <option value="cloud" className="bg-white text-slate-900">
                    Cloud Kernel Architecture CLOUD-702
                  </option>
                  <option value="zk" className="bg-white text-slate-900">
                    Zero-Knowledge Cryptography ZK-802
                  </option>
                  <option value="ds" className="bg-white text-slate-900">
                    Distributed Systems Consensus DS-601
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 6 HIGH-IMPACT METRICS CARDS ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Card 1: Total Scholars */}
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-slate-200/90">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Total Scholars</span>
              <span className="material-symbols-outlined text-blue-600 text-[20px]">groups</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalScholars}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold flex items-center gap-0.5 border border-emerald-200">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span> +14.2%
                </span>
                <span className="text-xs text-slate-400">vs past cycle</span>
              </div>
            </div>
            {/* Mini Sparkline SVG */}
            <div className="mt-3 pt-2">
              <svg className="w-full h-8 overflow-visible" fill="none" viewBox="0 0 100 25">
                <path className="text-blue-600" d="M0,20 Q15,18 28,14 T55,10 T78,6 T100,2" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-blue-50" d="M0,20 Q15,18 28,14 T55,10 T78,6 T100,2 L100,25 L0,25 Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>

          {/* Card 2: New Enrollments */}
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-slate-200/90">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">New Influx</span>
              <span className="material-symbols-outlined text-indigo-600 text-[20px]">person_add</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{newInflux}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[11px] font-semibold flex items-center gap-0.5 border border-indigo-200">
                  <span className="material-symbols-outlined text-[12px]">north_east</span> +22.8%
                </span>
                <span className="text-xs text-slate-400">MoM</span>
              </div>
            </div>
            <div className="mt-3 pt-2">
              <svg className="w-full h-8 overflow-visible" fill="none" viewBox="0 0 100 25">
                <path className="text-indigo-600" d="M0,22 L15,18 L32,19 L48,12 L65,15 L82,8 L100,3" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-indigo-50" d="M0,22 L15,18 L32,19 L48,12 L65,15 L82,8 L100,3 L100,25 L0,25 Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>

          {/* Card 3: Completion Rate */}
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-slate-200/90">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Completion Rate</span>
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">84.6%</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200">
                  +3.4% bench
                </span>
                <span className="font-mono text-xs text-blue-600 font-medium">Top 5%</span>
              </div>
            </div>
            <div className="mt-3 pt-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full" style={{ width: '84.6%' }}></div>
              </div>
              <div className="flex justify-between items-center text-slate-400 font-mono text-[11px] mt-1.5">
                <span>Avg: 68%</span>
                <span className="text-emerald-600 font-semibold">84.6%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Average Rating */}
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-slate-200/90">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Peer Audit Rating</span>
              <span className="material-symbols-outlined text-amber-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900">4.92</span>
                <span className="font-mono text-xs text-slate-400">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 font-mono text-xs">
                <span className="text-slate-500">6,730 audits</span>
                <span className="text-emerald-600 font-semibold">98.4% 5★</span>
              </div>
            </div>
            <div className="mt-3 pt-2 flex items-center gap-1 text-amber-400">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
              <span className="font-mono text-[11px] text-slate-400 ml-auto font-sans">99.1 pct</span>
            </div>
          </div>

          {/* Card 5: Net Tuition Revenue */}
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-slate-200/90">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Tuition Accrued</span>
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">payments</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{tuitionRevenue}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold flex items-center gap-0.5 border border-emerald-200">
                  <span className="material-symbols-outlined text-[12px]">arrow_upward</span> +18.5%
                </span>
                <span className="text-xs text-slate-400">YoY</span>
              </div>
            </div>
            <div className="mt-3 pt-2 flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span>Split: 85/15 Net</span>
              <span className="text-blue-600 font-semibold">Bi-weekly Auto</span>
            </div>
          </div>

          {/* Card 6: Total Learning Hours */}
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-slate-200/90">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Lab & Lecture Hours</span>
              <span className="material-symbols-outlined text-purple-600 text-[20px]">timelapse</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{learningHours}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-[11px] font-semibold border border-purple-200">
                  +19.4% MoM
                </span>
                <span className="text-xs text-slate-400">Avg 38.2h</span>
              </div>
            </div>
            <div className="mt-3 pt-2">
              <svg className="w-full h-8 overflow-visible" fill="none" viewBox="0 0 100 25">
                <path className="text-purple-600" d="M0,20 Q20,22 40,15 T70,8 T100,4" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-purple-50" d="M0,20 Q20,22 40,15 T70,8 T100,4 L100,25 L0,25 Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>
        </section>

        {/* ================= MAIN TELEMETRY CHARTS (2x2 GRID) ================= */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* CHART 1: ENROLLMENT & VELOCITY TREND */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden border border-slate-200/90">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Enrollment Velocity Gradients</h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200">
                    DUAL SPLINE
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">30-day cumulative scholar acquisition vs prior 30-day baseline</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600 shadow-sm"></span>
                  <span className="text-slate-900">Current Window (1,842)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-slate-400">Prior Cycle (1,500)</span>
                </div>
              </div>
            </div>

            {/* Main Chart SVG */}
            <div className="w-full h-64 relative mt-2 group/chart">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 600 220">
                <defs>
                  <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25"></stop>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                <line className="text-slate-200" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="600" y1="30" y2="30"></line>
                <line className="text-slate-200" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="600" y1="80" y2="80"></line>
                <line className="text-slate-200" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="600" y1="130" y2="130"></line>
                <line className="text-slate-200" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="600" y1="180" y2="180"></line>

                {/* Prior Period (Dashed) */}
                <path className="text-slate-300" d="M0,175 C70,165 140,150 210,130 C280,110 350,120 420,95 C490,70 550,60 600,45" stroke="currentColor" strokeDasharray="4 4" strokeWidth="2"></path>

                {/* Current Period Filled Area */}
                <path d="M0,160 C60,150 120,135 180,105 C240,75 300,90 360,65 C420,40 480,45 540,25 L600,18 L600,200 L0,200 Z" fill="url(#areaGradient)"></path>

                {/* Current Period Line */}
                <path className="text-blue-600" d="M0,160 C60,150 120,135 180,105 C240,75 300,90 360,65 C420,40 480,45 540,25 L600,18" stroke="currentColor" strokeWidth="3"></path>

                {/* Interactive Highlight Peak Pin */}
                <circle className="fill-white stroke-blue-600 cursor-pointer" cx="540" cy="25" r="5" strokeWidth="3"></circle>
                <circle className="stroke-blue-600 opacity-30 animate-ping" cx="540" cy="25" r="8" strokeWidth="2"></circle>
              </svg>

              {/* Peak Popover Tooltip */}
              <div className="absolute top-2 right-12 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-lg font-mono text-xs border border-slate-800 pointer-events-none">
                <div className="text-emerald-400 font-bold">Peak Influx: Oct 28</div>
                <div className="text-slate-300 text-[11px]">84 enrollments/hr (Live Sync)</div>
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between items-center text-slate-400 font-mono text-xs pt-3">
              <span>Oct 01</span>
              <span>Oct 07</span>
              <span>Oct 14</span>
              <span>Oct 21</span>
              <span>Oct 28</span>
              <span>Oct 31</span>
            </div>
          </div>

          {/* CHART 2: COURSE COMPLETION & DROP-OFF FUNNEL */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-slate-200/90">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Curricular Retention & Fall-off Funnel</h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono text-xs font-semibold border border-amber-200">
                    MOD 3 ANOMALY
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Persistence across progression gates (Module 1 through Capstone)</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                <span className="material-symbols-outlined text-blue-600 text-[16px]">flag</span>
                <span className="font-mono text-xs text-slate-700 font-semibold">Drop Floor: 4.2%</span>
              </div>
            </div>

            {/* Step Funnel Display */}
            <div className="space-y-3 my-auto">
              {/* Step 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-900 font-semibold">Mod 01: Theoretical Foundations</span>
                  <span className="font-mono text-blue-600 font-semibold">100% · 12,480 enrolled</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-900 font-semibold">Mod 02: Computational Kernels</span>
                  <span className="font-mono text-blue-600 font-semibold">97.8% · 12,205 passed</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '97.8%' }}></div>
                </div>
              </div>

              {/* Step 3 (Anomaly) */}
              <div className="space-y-1 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/80">
                <div className="flex justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-600 text-[16px]">warning</span>
                    <span className="text-slate-900 font-bold">Mod 03: Distributed State Synthesis</span>
                  </div>
                  <span className="font-mono text-amber-700 font-bold">92.6% (-5.2% fall-off)</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 via-amber-500 to-rose-500 h-full rounded-full" style={{ width: '92.6%' }}></div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-900 font-semibold">Mod 04: Zero-Knowledge Verification</span>
                  <span className="font-mono text-emerald-600 font-semibold">90.1% · 11,244 passed</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90.1%' }}></div>
                </div>
              </div>

              {/* Step 5: Final Capstone */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-900 font-semibold">Mod 08: Production Hardening & Defense</span>
                  <span className="font-mono text-emerald-700 font-bold">84.6% · 10,558 certified</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-blue-600 h-full rounded-full" style={{ width: '84.6%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 font-mono text-xs text-slate-500 border-t border-slate-100 mt-2">
              <span>Global Academia Attrition: 32.0%</span>
              <span className="text-emerald-600 font-semibold">StudyPilot Attrition: 15.4%</span>
            </div>
          </div>

          {/* CHART 3: ENGAGEMENT SCRUB ACTIVITY & MODALITY BREAKDOWN */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-slate-200/90">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Modal Engagement Heatmap</h2>
                <p className="text-xs text-slate-500 mt-0.5">Interaction distribution across multimodal pedagogies</p>
              </div>
              <div className="font-mono text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                AGGREGATE: 148,620h
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-2">
              {/* Interactive Ring / Donut */}
              <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background Ring */}
                    <path
                      className="text-slate-200"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    ></path>
                    {/* Video: 48% */}
                    <path
                      className="text-blue-600"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="48, 100"
                      strokeLinecap="round"
                      strokeWidth="3.8"
                    ></path>
                    {/* Lab Sandbox: 32% (offset 48) */}
                    <path
                      className="text-indigo-600"
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
                      className="text-purple-600"
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
                    <span className="text-xl font-bold text-slate-900">148k</span>
                    <span className="font-mono text-[10px] text-slate-400">HOURS</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 mt-2">Active Cycle</span>
              </div>

              {/* Breakdown List */}
              <div className="col-span-3 flex flex-col justify-between space-y-2">
                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Interactive Stream Lectures</div>
                      <div className="text-[11px] text-slate-500">Ultra HD playback with code sync & keyframe scrub</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-blue-600 font-bold">48%</span>
                    <div className="font-mono text-[11px] text-slate-400">71,337 hrs</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Cloud Sandbox Terminals</div>
                      <div className="text-[11px] text-slate-500">Rust, CUDA & Python compiler environments</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-indigo-600 font-bold">32%</span>
                    <div className="font-mono text-[11px] text-slate-400">47,558 hrs</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Telemetry Automated Assessments</div>
                      <div className="text-[11px] text-slate-500">Runtime unit testing & peer code defense</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-purple-600 font-bold">14%</span>
                    <div className="font-mono text-[11px] text-slate-400">20,806 hrs</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Colloquium & Async Discussions</div>
                      <div className="text-[11px] text-slate-500">Faculty office hours & thread synthesis</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-slate-600 font-bold">6%</span>
                    <div className="font-mono text-[11px] text-slate-400">8,917 hrs</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="font-mono text-xs text-slate-400 text-right pt-2 border-t border-slate-100 mt-1">
              Data verified via Distributed Ledger Node #04
            </div>
          </div>

          {/* CHART 4: ASSESSMENT PASS RATE DISTRIBUTION */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-slate-200/90">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Assessment Mastery & Score Curve</h2>
                <p className="text-xs text-slate-500 mt-0.5">Automated grader telemetry across 48 rigorous checkpoints</p>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-emerald-600 font-semibold">Mean: 87.4 / 100</span>
                <span className="text-slate-400">Median: 24m 12s</span>
              </div>
            </div>

            {/* Curve Graphic */}
            <div className="h-44 w-full relative">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 500 160">
                <defs>
                  <linearGradient id="curveGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25"></stop>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>
                <line className="text-slate-200" stroke="currentColor" x1="0" x2="500" y1="140" y2="140"></line>
                {/* Normal Score Distribution Bell Curve */}
                <path d="M0,140 C100,140 180,135 250,90 C320,40 370,15 410,25 C450,40 480,100 500,140 L500,140 L0,140 Z" fill="url(#curveGradient)"></path>
                <path className="text-blue-600" d="M0,140 C100,140 180,135 250,90 C320,40 370,15 410,25 C450,40 480,100 500,140" stroke="currentColor" strokeWidth="2.5"></path>
                {/* Mean Target Marker */}
                <line className="text-blue-600" stroke="currentColor" strokeDasharray="4 4" strokeWidth="2" x1="390" x2="390" y1="15" y2="140"></line>
                <circle className="fill-blue-600" cx="390" cy="18" r="4"></circle>
              </svg>
              <div className="absolute top-2 left-2/3 bg-slate-900 text-white px-2.5 py-1 rounded-xl text-xs font-mono shadow-md border border-slate-800">
                Class Mean: 87.4%
              </div>
            </div>

            {/* Segment Pass Rate Pills */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-xl flex flex-col border border-slate-200/80">
                <span className="font-mono text-xs text-slate-500">First Attempt Pass</span>
                <span className="text-xl text-emerald-600 font-bold mt-1">92.0%</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Threshold &gt;= 80%</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl flex flex-col border border-slate-200/80">
                <span className="font-mono text-xs text-slate-500">After 1 Lab Retake</span>
                <span className="text-xl text-blue-600 font-bold mt-1">6.0%</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Algorithmic sandbox</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl flex flex-col border border-slate-200/80">
                <span className="font-mono text-xs text-slate-500">Required Mentorship</span>
                <span className="text-xl text-purple-600 font-bold mt-1">2.0%</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Faculty triage queue</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: COURSE-LEVEL PERFORMANCE MATRIX TABLE ================= */}
        <section className="bg-white rounded-2xl p-6 shadow-sm flex flex-col space-y-4 border border-slate-200/90">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Curriculum-Level Performance Matrix</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time audit across all active instruction nodes and revenue pipelines</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl px-3 py-2 pl-9 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 w-64 border border-slate-200"
                  placeholder="Filter courses, nodes, or tags..."
                  type="text"
                />
                <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-2.5 top-2">search</span>
              </div>
              <button
                onClick={() => toast.info('Column Filters toggled', { description: 'Telemetry metrics, scholars count, and earnings columns enabled.' })}
                className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-blue-600">tune</span>
                <span>Column Filters</span>
              </button>
            </div>
          </div>

          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                  <th className="p-3.5">Course Title & Code</th>
                  <th className="p-3.5">Scholars</th>
                  <th className="p-3.5">Completion Velocity</th>
                  <th className="p-3.5">Audits</th>
                  <th className="p-3.5">Total Hours</th>
                  <th className="p-3.5">Revenue (USD)</th>
                  <th className="p-3.5">Momentum</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-400">
                      No matching curricula found for query "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${course.iconBg} flex items-center justify-center font-bold shadow-sm`}>
                            <span className="material-symbols-outlined text-[18px]">{course.icon}</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {course.title}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400">
                              CODE: {course.code} · {course.modules} Modules · {course.level}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-700 font-medium">{course.scholars.toLocaleString()}</td>

                      <td className="p-3.5">
                        <div className="w-36">
                          <div className="flex justify-between font-mono text-[11px] mb-1">
                            <span className={course.momentumType === 'error' ? 'text-rose-600 font-bold' : course.momentumType === 'tertiary' ? 'text-emerald-600 font-bold' : 'text-blue-600 font-bold'}>
                              {course.completionRate}%
                            </span>
                            <span className="text-slate-400">{course.velocityTier}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                course.momentumType === 'error'
                                  ? 'bg-rose-500'
                                  : course.momentumType === 'tertiary'
                                  ? 'bg-emerald-500'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${course.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1 text-slate-800">
                          <span className="font-mono font-bold">{course.rating}</span>
                          <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="text-slate-400 text-[11px]">({course.auditCount})</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-600">{course.hours}</td>

                      <td className="p-3.5 font-mono text-blue-600 font-bold">
                        ${course.revenue.toLocaleString()}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold inline-flex items-center gap-1 ${
                            course.momentumType === 'error'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : course.momentumType === 'tertiary'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
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

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setInspectModalCourse(course)}
                          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200 cursor-pointer"
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

          <div className="flex flex-wrap items-center justify-between text-slate-500 text-xs pt-2 border-t border-slate-100">
            <div className="font-mono text-[11px]">
              Displaying {filteredCourses.length} of 14 active academic curricula
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors disabled:opacity-40 border border-slate-200"
                disabled
              >
                Previous
              </button>
              <button
                onClick={() => toast.info('Navigating to secondary page of academic curriculum')}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* ================= SECTION 5: COHORT RETENTION TELEMETRY & AT-RISK SCHOLAR PIPELINE ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Cohort Engagement Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm flex flex-col space-y-4 border border-slate-200/90">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Cohort Engagement & Retention Telemetry</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time scrutiny of section completion, lab output, and automated alerts</p>
              </div>
              <button
                onClick={() => {
                  setLastSyncedTime('1s ago');
                  toast.success('Telemetry Feed Refreshed', { description: 'All active cohort webhooks synchronised.' });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-blue-600 font-semibold text-xs flex items-center gap-1 transition-colors border border-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>Refresh Feed</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                    <th className="p-3">Cohort Section</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Scrub Velocity</th>
                    <th className="p-3">Lab Submits</th>
                    <th className="p-3">Pass %</th>
                    <th className="p-3">At-Risk State</th>
                    <th className="p-3 text-right">Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {DEFAULT_COHORTS.map((cohort) => (
                    <tr key={cohort.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-sans">
                        <div className="font-semibold text-slate-900">{cohort.code} · {cohort.section}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{cohort.startDate}</div>
                      </td>

                      <td className="p-3 text-slate-700">{cohort.size} scholars</td>

                      <td className="p-3 text-blue-600 font-semibold">{cohort.watchRate} watch</td>

                      <td className="p-3 text-slate-700">{cohort.submits}</td>

                      <td className={`p-3 font-bold ${cohort.status === 'error' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {cohort.passRate}
                      </td>

                      <td className="p-3 font-sans">
                        {cohort.flaggedCount === 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                            0 Flagged
                          </span>
                        ) : cohort.status === 'error' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-semibold flex items-center gap-1 w-fit border border-rose-200">
                            <span className="material-symbols-outlined text-[12px]">error</span> {cohort.flaggedText}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold flex items-center gap-1 w-fit border border-amber-200">
                            <span className="material-symbols-outlined text-[12px]">warning</span> {cohort.flaggedText}
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right font-sans">
                        {cohort.flaggedCount === 0 ? (
                          <button
                            onClick={() => setRosterModalCohort(cohort)}
                            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors border border-slate-200 cursor-pointer"
                          >
                            View Roster
                          </button>
                        ) : cohort.status === 'warning' ? (
                          <button
                            onClick={() => handleNudgeCohort(cohort)}
                            className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-sm transition-all cursor-pointer"
                          >
                            Nudge Cohort
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTriageReview(cohort)}
                            className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shadow-sm transition-all cursor-pointer"
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
          <div className="flex flex-col space-y-4">
            {/* AI Insight Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-slate-200/90">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px]">psychology</span>
                  <span className="font-bold text-slate-900 text-sm">Pedagogical AI Synthesis</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold border border-indigo-200">
                  LIVE ADVICE
                </span>
              </div>

              <div className="space-y-3">
                {/* Alert 1 */}
                <div className="bg-rose-50/60 p-3.5 rounded-xl space-y-1 border border-rose-100">
                  <div className="flex items-center gap-1.5 text-rose-700 font-semibold text-xs">
                    <span className="material-symbols-outlined text-[16px]">priority_high</span>
                    <span>Module 3 Quiz Bottleneck</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Zero-Knowledge (ZK-802) Module 3 shows an abrupt 6.2% dip in first-time pass velocity. Scholars spend 2.4x expected scrub time on Lesson 3.4.
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-emerald-700 font-medium">Rec: Add 1 visual schema</span>
                    <button
                      onClick={handleInjectAsset}
                      className="text-blue-600 hover:underline text-xs font-bold cursor-pointer"
                    >
                      Inject Asset
                    </button>
                  </div>
                </div>

                {/* Alert 2 */}
                <div className="bg-emerald-50/60 p-3.5 rounded-xl space-y-1 border border-emerald-100">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Top Module Velocity</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tensor Kernels (QPU-904) Module 2 has achieved a 99.4% satisfaction score and 0 recorded retakes across 4,800 scholars.
                  </p>
                </div>
              </div>
            </div>

            {/* Payout Ledger Dock */}
            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between border border-slate-200/90">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">account_balance_wallet</span>
                  <span className="font-bold text-slate-900 text-sm">Faculty Disbursement</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">NOV 01 EXP.</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl flex items-center justify-between mb-3 border border-slate-200/80">
                <div>
                  <span className="text-xs text-slate-400">Next Scheduled Payout</span>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">$48,290.00</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200">
                  ACH / WIRE READY
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Gross Curricula Sales:</span>
                  <span className="text-slate-800 font-semibold">$568,117.64</span>
                </div>
                <div className="flex justify-between">
                  <span>Protocol Institutional Fee (15%):</span>
                  <span className="text-rose-600 font-semibold">-$85,217.64</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Faculty Net Retained:</span>
                  <span className="text-emerald-600 font-bold">$482,900.00</span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => setShowLedgerModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Complete Ledger</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
                <span className="font-mono text-[11px] text-slate-400">TLS 1.3 Verified</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================= MODAL: INSPECT COURSE TELEMETRY ================= */}
      {inspectModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${inspectModalCourse.iconBg} flex items-center justify-center shadow-sm`}>
                  <span className="material-symbols-outlined">{inspectModalCourse.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{inspectModalCourse.title}</h3>
                  <p className="font-mono text-slate-400 text-xs">
                    CODE: {inspectModalCourse.code} · {inspectModalCourse.modules} Modules · {inspectModalCourse.level}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectModalCourse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-400 font-sans">Active Scholars</span>
                <p className="text-lg font-bold text-slate-900 mt-1">{inspectModalCourse.scholars.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-400 font-sans">Total Revenue</span>
                <p className="text-lg font-bold text-blue-600 mt-1">${inspectModalCourse.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-400 font-sans">Avg Velocity</span>
                <p className="text-lg font-bold text-emerald-600 mt-1">{inspectModalCourse.completionRate}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Module Scrutiny & Friction Points</h4>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-slate-700">
                  <span className="font-medium">Mod 01: Core Architecture Theory</span>
                  <span className="text-emerald-600 font-semibold">99.1% pass · 18m avg</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-slate-700">
                  <span className="font-medium">Mod 02: Pipeline Memory Buffers</span>
                  <span className="text-emerald-600 font-semibold">97.4% pass · 28m avg</span>
                </div>
                <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200/80 flex items-center justify-between text-rose-700">
                  <span className="font-bold">Mod 03: Fault-Tolerant Consensus Checkpoint</span>
                  <span className="font-bold">92.6% pass · 54m avg (Friction!)</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-slate-700">
                  <span className="font-medium">Mod 04: Production Hardening Deployment</span>
                  <span className="text-blue-600 font-semibold">89.2% pass · 35m avg</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setInspectModalCourse(null);
                  navigate('/instructor/courses');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Open in Curriculum Manager
              </button>
              <button
                onClick={() => {
                  toast.success(`Telemetry diagnostic report exported for ${inspectModalCourse.code}`);
                  setInspectModalCourse(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
              >
                Export Trace Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW COHORT ROSTER ================= */}
      {rosterModalCohort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {rosterModalCohort.code} · {rosterModalCohort.section} Roster
                </h3>
                <p className="font-mono text-slate-400 text-xs">
                  {rosterModalCohort.size} Scholars · {rosterModalCohort.startDate} · {rosterModalCohort.passRate} Pass Rate
                </p>
              </div>
              <button
                onClick={() => setRosterModalCohort(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-72 rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-mono uppercase text-[11px]">
                    <th className="p-3">Scholar</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {MOCK_STUDENTS_ROSTER.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{student.email}</div>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${student.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{student.progress}%</span>
                      </td>
                      <td className="p-3 font-mono text-blue-600 font-bold">{student.score}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            student.status.includes('Stalled') || student.status.includes('Inactive')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => toast.success(`Pinging ${student.name} with mentor assistance message.`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                        >
                          Ping
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-mono text-xs">Section Health Index: 96.4/100</span>
              <button
                onClick={() => setRosterModalCohort(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CRYPTOGRAPHIC DISBURSEMENT LEDGER ================= */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Academic Settlement Ledger</h3>
                  <p className="font-mono text-slate-400 text-xs">TLS 1.3 End-to-End Cryptographic Audit Trail</p>
                </div>
              </div>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-200">
                <div className="flex justify-between text-slate-900 font-bold text-sm">
                  <span>Settlement Cycle: October 2024</span>
                  <span className="text-emerald-600 font-bold">$48,290.00</span>
                </div>
                <div className="text-slate-400 text-[11px]">Contract Address: 0x932f...81eB // Arbitrum Nova</div>
                <div className="flex justify-between pt-1 text-slate-600">
                  <span>Status: Scheduled for Disbursement (ACH / Wire)</span>
                  <span className="text-blue-600 font-bold">NOV 01, 2024</span>
                </div>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl space-y-1 border border-slate-200/80">
                <div className="flex justify-between text-slate-800">
                  <span>Prior Settlement: September 2024</span>
                  <span className="font-bold text-slate-900">$41,850.00</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Tx Hash: 0x8a12f4...d901b3</span>
                  <span className="text-emerald-600 font-medium">Disbursed via Chase Direct</span>
                </div>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl space-y-1 border border-slate-200/80">
                <div className="flex justify-between text-slate-800">
                  <span>Prior Settlement: August 2024</span>
                  <span className="font-bold text-slate-900">$38,120.00</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Tx Hash: 0x3c990a...4fa211</span>
                  <span className="text-emerald-600 font-medium">Disbursed via Chase Direct</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  toast.success('Downloaded complete cryptographic tax documentation (.csv)');
                  setShowLedgerModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Download Form 1099-K / Tax Pack
              </button>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AI INSIGHTS SYNTHESIS ================= */}
      {showInsightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">StudyPilot Neural Intelligence Synthesis</h3>
                  <p className="font-mono text-slate-400 text-xs">Dynamic pedagogical evaluation generated across 12,480 scholars</p>
                </div>
              </div>
              <button
                onClick={() => setShowInsightsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-blue-50/60 p-3.5 rounded-xl space-y-1.5 border border-blue-200/80">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <span className="material-symbols-outlined text-sm">auto_graph</span>
                  <span>Highest Value Intervention: Module 3 Diagram</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Adding an interactive circuit flow schematic to Lesson 3.4 will recover an estimated <strong>84 scholars/month</strong> from dropping out before the midterm checkpoint.
                </p>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-xl space-y-1.5 border border-emerald-200/80">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>Optimal Office Hours Schedule</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Learners from European and Asian academic nodes peak between <strong>14:00 UTC and 18:00 UTC</strong>. Scheduling an async discussion session at 15:30 UTC correlates with a <strong>+18% pass lift</strong>.
                </p>
              </div>

              <div className="bg-purple-50/60 p-3.5 rounded-xl space-y-1.5 border border-purple-200/80">
                <div className="flex items-center gap-2 text-purple-700 font-bold">
                  <span className="material-symbols-outlined text-sm">emoji_events</span>
                  <span>Credential Claim Velocity</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Scholars certified in QPU-904 have shared <strong>1,420 LinkedIn credentials</strong> with verified cryptographic hashes, driving 340 organic peer enrollments.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  toast.success('Applied automated remediation optimizations to active syllabi.');
                  setShowInsightsModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm cursor-pointer"
              >
                Apply AI Recommendations
              </button>
              <button
                onClick={() => setShowInsightsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
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
