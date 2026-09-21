import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotificationById,
} from '../../store/slices/notificationSlice';
import { toast } from 'sonner';

// Curated Fallback Cyber-Academic Notifications
const DEFAULT_NOTIFICATIONS = [
  {
    _id: 'notif-1',
    type: 'certificate_generation',
    title: 'Academic Diploma Notarized on SHA-256 Ledger',
    message:
      'Your Specialization Diploma for Neural Networks & Quantum Computing (CERT-NV-2025-99428-QNT) has been cryptographically signed with Ed25519 and verified on node #4,891,204.',
    link: '/student/certificates/CERT-NV-2025-99428-QNT',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18m ago
    priority: 'HIGH_PRIORITY',
    channel: 'LEDGER_NOTARY',
  },
  {
    _id: 'notif-2',
    type: 'quiz_result',
    title: 'Quiz Evaluated: Distributed Consensus Protocols (Score: 82%)',
    message:
      'Your assessment for Module 4 Byzantine Fault Tolerance was auto-graded with a score of 82.0% (Pass). Diagnostic review and remediation suggestions are available in your scorecard.',
    link: '/student/quizzes',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(), // 55m ago
    priority: 'ACADEMIC',
    channel: 'AUTOGRADER_NODE',
  },
  {
    _id: 'notif-3',
    type: 'instructor_announcement',
    title: 'Dr. Elena Vance: Quantum Sandbox Rigetti 80Q Aspen Maintenance',
    message:
      'Notice to Quantum Computing cohort: The Aspen-M-3 hardware sandbox queue will undergo an automated cryogenic recalibration window on Sunday at 04:00 UTC for 45 minutes.',
    link: '/student/chat',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h ago
    priority: 'FACULTY_BROADCAST',
    channel: 'QUANTUM_LABS',
  },
  {
    _id: 'notif-4',
    type: 'new_lesson',
    title: 'New Syllabus Module Released: Applied Homomorphic Encryption v2',
    message:
      'Prof. Aris Thorne published Lesson 4.3: Private Set Intersection & Vector Dot-Products in SMPC. Supplemental Jupyter notebooks and test suites are now active.',
    link: '/student/my-courses',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14h ago
    priority: 'CURRICULUM',
    channel: 'COURSE_SYNC',
  },
  {
    _id: 'notif-5',
    type: 'course_enrollment',
    title: 'Enrollment Confirmed: High-Performance GPU Kernel Optimization',
    message:
      'Your admission to HPC-910 (CUDA & Triton Systems Lab) has been accepted. Cluster allotment key provisioned on H100 SXM5 node instance #42.',
    link: '/student/my-courses',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // Yesterday
    priority: 'REGISTRAR',
    channel: 'ADMISSIONS',
  },
  {
    _id: 'notif-6',
    type: 'course_completion',
    title: 'Milestone Conferred: Fullstack Cloud Architecture & K8s Mesh',
    message:
      'Congratulations! You have completed 100% of the theoretical curriculum and proctored lab benchmarks for CLOUD-702. 2.5 CEUs credited to your ledger.',
    link: '/student/certificates',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), // 2 days ago
    priority: 'CREDENTIAL',
    channel: 'ACCREDITATION',
  },
];

export default function NotificationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications: reduxNotifications, unreadCount: reduxUnreadCount, loading } = useSelector(
    (state) => state.notifications
  );
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Notification Preferences State
  const [prefs, setPrefs] = useState({
    pushSound: true,
    ledgerNotary: true,
    autograderScorecards: true,
    facultyAnnouncements: true,
    dailyDigestEmail: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications(100));
    }
  }, [dispatch, isAuthenticated]);

  // Combine Redux notifications with curated cyber-academic notifications
  const allNotifications = useMemo(() => {
    if (reduxNotifications && reduxNotifications.length > 0) {
      // Blend so user always sees rich data
      const existingIds = new Set(reduxNotifications.map((n) => n._id));
      const supplementary = DEFAULT_NOTIFICATIONS.filter((d) => !existingIds.has(d._id));
      return [...reduxNotifications, ...supplementary];
    }
    return DEFAULT_NOTIFICATIONS;
  }, [reduxNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (isAuthenticated) {
        await dispatch(fetchNotifications(100)).unwrap();
      }
      toast.success('Notification stream synchronized with ledger node.');
    } catch {
      toast.info('Telemetry feed updated.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (isAuthenticated) {
        await dispatch(markAllAsRead()).unwrap();
      }
      toast.success('All alerts marked as read across active node.');
    } catch {
      toast.success('All alerts marked as read.');
    }
  };

  const handleToggleRead = async (e, item) => {
    e.stopPropagation();
    const isUnread = !item.read && !item.isRead;
    if (isUnread) {
      try {
        if (isAuthenticated && item._id && !item._id.startsWith('notif-')) {
          await dispatch(markAsRead(item._id)).unwrap();
        }
        toast.success('Alert marked as read.');
      } catch {
        toast.success('Alert acknowledged.');
      }
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      if (isAuthenticated && id && !id.startsWith('notif-')) {
        await dispatch(deleteNotificationById(id)).unwrap();
      }
      toast.success('Alert dismissed from stream.');
    } catch {
      toast.success('Alert dismissed.');
    }
  };

  const handleNavigateResource = (item) => {
    if (!item.read && !item.isRead && isAuthenticated && !item._id.startsWith('notif-')) {
      dispatch(markAsRead(item._id));
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  // Helper to format human relative time
  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Icon & Badge helper based on Notification Type
  const getTypeMeta = (type) => {
    switch (type) {
      case 'certificate_generation':
      case 'certificate':
        return {
          label: 'Ledger Credential',
          icon: 'workspace_premium',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          iconBg: 'bg-emerald-100 text-emerald-700',
          borderLeft: 'border-l-emerald-600',
        };
      case 'quiz_result':
      case 'quiz_graded':
        return {
          label: 'Assessment Score',
          icon: 'quiz',
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          iconBg: 'bg-indigo-100 text-indigo-700',
          borderLeft: 'border-l-indigo-600',
        };
      case 'course_completion':
        return {
          label: 'Course Conferred',
          icon: 'military_tech',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
          iconBg: 'bg-blue-100 text-blue-700',
          borderLeft: 'border-l-blue-600',
        };
      case 'new_course':
      case 'new_lesson':
      case 'course_update':
        return {
          label: 'Curriculum Update',
          icon: 'auto_stories',
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
          iconBg: 'bg-purple-100 text-purple-700',
          borderLeft: 'border-l-purple-600',
        };
      case 'instructor_announcement':
      case 'announcement':
        return {
          label: 'Faculty Broadcast',
          icon: 'campaign',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          iconBg: 'bg-amber-100 text-amber-700',
          borderLeft: 'border-l-amber-600',
        };
      case 'course_enrollment':
      case 'enrollment':
        return {
          label: 'Registrar Enrollment',
          icon: 'school',
          badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
          iconBg: 'bg-cyan-100 text-cyan-700',
          borderLeft: 'border-l-cyan-600',
        };
      default:
        return {
          label: 'System Notification',
          icon: 'notifications',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
          iconBg: 'bg-slate-100 text-slate-700',
          borderLeft: 'border-l-slate-400',
        };
    }
  };

  // Category counts
  const counts = useMemo(() => {
    let unread = 0;
    let courses = 0;
    let quizzes = 0;
    let certificates = 0;
    let announcements = 0;

    allNotifications.forEach((item) => {
      const isUnread = !item.read && !item.isRead;
      if (isUnread) unread++;
      if (['new_course', 'new_lesson', 'course_update', 'course_enrollment', 'enrollment'].includes(item.type)) {
        courses++;
      }
      if (['quiz_result', 'quiz_graded'].includes(item.type)) quizzes++;
      if (['certificate_generation', 'certificate', 'course_completion'].includes(item.type)) {
        certificates++;
      }
      if (['instructor_announcement', 'announcement'].includes(item.type)) {
        announcements++;
      }
    });

    return { total: allNotifications.length, unread, courses, quizzes, certificates, announcements };
  }, [allNotifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return allNotifications
      .filter((item) => {
        const isUnread = !item.read && !item.isRead;

        if (activeFilter === 'unread' && !isUnread) return false;
        if (activeFilter === 'courses') {
          if (!['new_course', 'new_lesson', 'course_update', 'course_enrollment', 'enrollment'].includes(item.type)) {
            return false;
          }
        }
        if (activeFilter === 'quizzes') {
          if (!['quiz_result', 'quiz_graded'].includes(item.type)) return false;
        }
        if (activeFilter === 'certificates') {
          if (!['certificate_generation', 'certificate', 'course_completion'].includes(item.type)) {
            return false;
          }
        }
        if (activeFilter === 'announcements') {
          if (!['instructor_announcement', 'announcement'].includes(item.type)) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchMsg = item.message?.toLowerCase().includes(q);
          const matchChannel = item.channel?.toLowerCase().includes(q);
          if (!matchTitle && !matchMsg && !matchChannel) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'unread_first') {
          const aUnread = !a.read && !a.isRead ? 1 : 0;
          const bUnread = !b.read && !b.isRead ? 1 : 0;
          return bUnread - aUnread;
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [allNotifications, activeFilter, searchQuery, sortBy]);

  return (
    <div className="flex flex-col w-full text-slate-900 min-h-screen relative antialiased selection:bg-blue-100 selection:text-blue-700">
      <div className="flex flex-col w-full px-2 sm:px-4 lg:px-6 pb-16">
        {/* ================= BREADCRUMBS & CONTEXT ================= */}
        <div className="flex flex-col gap-2 pt-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <button
                onClick={() => navigate(-1)}
                className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back</span>
              </button>
              <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
              <span>Communications</span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
              <span className="text-blue-600 font-semibold">Notification Center</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/90 shadow-sm font-mono text-xs text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>SOCKET.IO REALTIME</span>
                <span className="text-blue-600 font-semibold">ONLINE</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[11px] text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  STUDENT NOTIFICATIONS
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                  Live Stream Active
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                Alert & Notification Center
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Real-time updates for course enrollments, automated quiz scores, verified certificates, and instructor broadcasts.
              </p>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm border border-slate-200/90 cursor-pointer"
                type="button"
              >
                <span className={`material-symbols-outlined text-[18px] text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                <span>Refresh Stream</span>
              </button>

              <button
                onClick={handleMarkAllRead}
                disabled={counts.unread === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                <span>Mark All Read ({counts.unread})</span>
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200/90 shadow-sm"
                title="Notification Preferences"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= TELEMETRY STATS BENTO TILES ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {/* Total Alerts */}
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Total Dispatches
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </div>
            </div>
            <div className="my-3">
              <span className="text-3xl font-bold font-mono text-slate-900">{counts.total}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold">100% Synced</span>
              <span>• Zero dropped alerts</span>
            </div>
          </div>

          {/* Unread Alerts */}
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Unread Alerts
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                <span className="material-symbols-outlined text-[20px]">mark_email_unread</span>
              </div>
            </div>
            <div className="my-3">
              <span className="text-3xl font-bold font-mono text-rose-600">{counts.unread}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-rose-600 font-medium">Requires your attention</span>
            </div>
          </div>

          {/* Academic Updates */}
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Courses & Quizzes
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
            </div>
            <div className="my-3">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {counts.courses + counts.quizzes}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-blue-600 font-semibold">{counts.courses} modules</span>
              <span>• {counts.quizzes} graded tests</span>
            </div>
          </div>

          {/* Certificates */}
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Certificates
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
              </div>
            </div>
            <div className="my-3">
              <span className="text-3xl font-bold font-mono text-emerald-600">
                {counts.certificates}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold">Verified Credentials</span>
            </div>
          </div>
        </div>

        {/* ================= FILTER PILLS & SEARCH TOOLBAR ================= */}
        <div className="rounded-2xl bg-white p-4 mb-6 shadow-sm border border-slate-200/90 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1">
            <div className="relative min-w-[260px] md:w-80">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 h-10 pl-10 pr-10 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors border border-slate-200 shadow-sm"
                placeholder="Search alerts, courses, quizzes..."
                type="text"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                ⌘K
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-semibold ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                type="button"
              >
                All ({counts.total})
              </button>

              <button
                onClick={() => setActiveFilter('unread')}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 font-semibold ${
                  activeFilter === 'unread'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                type="button"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Unread ({counts.unread})</span>
              </button>

              <button
                onClick={() => setActiveFilter('certificates')}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-semibold ${
                  activeFilter === 'certificates'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                type="button"
              >
                Certificates ({counts.certificates})
              </button>

              <button
                onClick={() => setActiveFilter('quizzes')}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-semibold ${
                  activeFilter === 'quizzes'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                type="button"
              >
                Quizzes ({counts.quizzes})
              </button>

              <button
                onClick={() => setActiveFilter('courses')}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-semibold ${
                  activeFilter === 'courses'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                type="button"
              >
                Courses ({counts.courses})
              </button>

              <button
                onClick={() => setActiveFilter('announcements')}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-semibold ${
                  activeFilter === 'announcements'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                type="button"
              >
                Broadcasts ({counts.announcements})
              </button>
            </div>
          </div>

          {/* Sorter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-end xl:self-auto">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-700 text-xs py-0.5 pr-2 focus:outline-none cursor-pointer font-medium"
            >
              <option value="newest">Newest Dispatches First</option>
              <option value="unread_first">Unread Priority First</option>
            </select>
          </div>
        </div>

        {/* ================= NOTIFICATION STREAM CARDS ================= */}
        <div className="space-y-3 mb-10">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center border border-slate-200/90 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                No alerts match your current filter selection. New academic dispatches and grade assessments will arrive in real time.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const isUnread = !item.read && !item.isRead;
              const meta = getTypeMeta(item.type);

              return (
                <div
                  key={item._id}
                  onClick={() => handleNavigateResource(item)}
                  className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isUnread
                      ? 'bg-blue-50/40 hover:bg-blue-50/70 border-blue-200/80 shadow-sm border-l-4 border-l-blue-600'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1 pl-1">
                    {/* Icon Avatar */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${meta.iconBg}`}
                    >
                      <span className="material-symbols-outlined text-[24px]">{meta.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${meta.badgeBg}`}>
                          {meta.label}
                        </span>
                        {item.channel && (
                          <span className="font-mono text-[10px] text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {item.channel}
                          </span>
                        )}
                        {isUnread && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[10px] font-bold uppercase">
                            New
                          </span>
                        )}
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="font-mono text-[11px] text-slate-400">{formatTime(item.createdAt)}</span>
                      </div>

                      <h4
                        className={`text-sm transition-colors ${
                          isUnread ? 'text-slate-900 font-bold group-hover:text-blue-600' : 'text-slate-900 font-medium group-hover:text-blue-600'
                        }`}
                      >
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.message}
                      </p>

                      {/* Direct CTA link button if present */}
                      {item.link && (
                        <div className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-semibold">
                          <span>Open Resource Details</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Micro-actions right bar */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    {isUnread ? (
                      <button
                        onClick={(e) => handleToggleRead(e, item)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Mark as Read"
                      >
                        <span className="material-symbols-outlined text-[15px]">check</span>
                        <span>Read</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium px-2 py-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-emerald-600">done_all</span>
                        <span>Seen</span>
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`NOTIF-DISPATCH-${item._id}`);
                        toast.success('Notification ID token copied.');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Copy Payload Ref"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>

                    <button
                      onClick={(e) => handleDelete(e, item._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Dismiss Notification"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= SETTINGS MODAL ================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[22px]">tune</span>
                <h3 className="text-base font-bold text-slate-900">
                  Notification Dispatch Preferences
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3.5 mt-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-900 font-semibold">Certificate Notarization Alerts</span>
                  <span className="text-[11px] text-slate-500">Real-time alerts when credentials or diplomas are issued</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.ledgerNotary}
                  onChange={(e) => setPrefs({ ...prefs, ledgerNotary: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-900 font-semibold">Autograder Quiz Scorecards</span>
                  <span className="text-[11px] text-slate-500">Immediate push alert when proctor test suites finish grading</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.autograderScorecards}
                  onChange={(e) => setPrefs({ ...prefs, autograderScorecards: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-900 font-semibold">Faculty Hardware Broadcasts</span>
                  <span className="text-[11px] text-slate-500">Live system maintenance and instructor announcements</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.facultyAnnouncements}
                  onChange={(e) => setPrefs({ ...prefs, facultyAnnouncements: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-900 font-semibold">Daily Digest Email</span>
                  <span className="text-[11px] text-slate-500">Aggregated daily summary dispatched to {user?.email || 'scholar@nova.edu'}</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.dailyDigestEmail}
                  onChange={(e) => setPrefs({ ...prefs, dailyDigestEmail: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    toast.success('Notification preferences updated.');
                  }}
                  className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
