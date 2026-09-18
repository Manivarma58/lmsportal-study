import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Award,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Bell,
  BarChart3,
  Sparkles,
  Layers,
  BookCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await API.get('/analytics/admin');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const chartData = data?.chartData || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const recentUsers = data?.recentUsers || [];
  const recentEnrollments = data?.recentEnrollments || [];

  // 7 Explicit Metrics required by PROMPT 9:
  // 1. total users
  // 2. total students
  // 3. total instructors
  // 4. total courses
  // 5. published courses
  // 6. enrollments
  // 7. completion statistics
  const kpiCards = [
    {
      id: 'kpi-users',
      title: 'Total Users',
      value: stats.totalUsers || 0,
      sub: 'All registered platform accounts',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Platform Wide',
    },
    {
      id: 'kpi-students',
      title: 'Total Students',
      value: stats.totalStudents || 0,
      sub: `${Math.round(((stats.totalStudents || 0) / (stats.totalUsers || 1)) * 100)}% of total user base`,
      icon: GraduationCap,
      color: 'from-sky-500 to-blue-600',
      badge: 'Learners',
    },
    {
      id: 'kpi-instructors',
      title: 'Total Instructors',
      value: stats.totalInstructors || 0,
      sub: 'Verified course educators',
      icon: UserCheck,
      color: 'from-amber-500 to-orange-600',
      badge: 'Educators',
    },
    {
      id: 'kpi-courses',
      title: 'Total Courses',
      value: stats.totalCourses || 0,
      sub: 'Catalog curriculum items',
      icon: BookOpen,
      color: 'from-purple-600 to-violet-700',
      badge: 'Curriculum',
    },
    {
      id: 'kpi-published-courses',
      title: 'Published Courses',
      value: stats.publishedCourses || 0,
      sub: `${stats.totalCourses ? Math.round(((stats.publishedCourses || 0) / stats.totalCourses) * 100) : 0}% live in catalog`,
      icon: BookCheck,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Active Live',
    },
    {
      id: 'kpi-enrollments',
      title: 'Enrollments',
      value: stats.totalEnrollments || 0,
      sub: 'Total student registrations',
      icon: Layers,
      color: 'from-rose-500 to-pink-600',
      badge: 'Engagement',
    },
    {
      id: 'kpi-completion-stats',
      title: 'Completion Statistics',
      value: `${stats.completionRate || 0}%`,
      sub: `${stats.totalCompletedEnrollments || 0} completed • ${stats.totalCertificates || 0} certs`,
      icon: Award,
      color: 'from-emerald-600 to-green-700',
      badge: 'Success Rate',
    },
  ];

  const quickNav = [
    { label: 'Manage Users', to: '/admin/users', icon: Users, desc: 'Roles, status & moderation' },
    { label: 'Moderate Courses', to: '/admin/courses', icon: BookOpen, desc: 'Review & publish catalog' },
    { label: 'Instructors Roster', to: '/admin/instructors', icon: UserCheck, desc: 'Teaching staff overview' },
    { label: 'Student Directory', to: '/admin/students', icon: GraduationCap, desc: 'Learner profiles & progress' },
    { label: 'Platform Analytics', to: '/admin/analytics', icon: BarChart3, desc: 'Revenue & growth reports' },
    { label: 'Broadcast Alerts', to: '/admin/notifications', icon: Bell, desc: 'Send announcements' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-3 border border-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5" /> Administrative Master Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admin Platform Dashboard
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Monitor key metrics, moderate curriculum, manage instructors and students, track platform health, and broadcast system notifications.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/notifications"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/30 transition-all"
            >
              <Bell className="w-4 h-4" />
              Broadcast Notification
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold backdrop-blur-sm border border-white/10 transition-all"
            >
              <Users className="w-4 h-4" />
              Manage Users
            </Link>
          </div>
        </div>
      </div>

      {/* 7 Required Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-600" /> Platform Key Indicators
            </h2>
            <p className="text-xs text-slate-500">Live operational data synced across all modules</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Updated just now</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                id={c.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {c.title}
                    </span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {c.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {c.sub}
                    </p>
                  </div>
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${c.color} text-white flex items-center justify-center shadow-lg shadow-black/10 flex-shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Revenue Additional Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Gross Platform Revenue
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  ${stats.totalRevenue || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Total student enrollments value
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-black/10 flex-shrink-0 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Action Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Admin Control Center & Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickNav.map((m, idx) => {
            const Icon = m.icon;
            return (
              <Link
                key={idx}
                to={m.to}
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-rose-500/40 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-rose-600 group-hover:text-white text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-center justify-between">
                    {m.label}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {m.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Analytics Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Enrollment & Trajectory Trends
              </h2>
              <p className="text-xs text-slate-500">Trailing multi-month student acquisition</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" /> +28% vs previous period
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#e11d48"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnroll)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Curriculum Category Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Curriculum Categories
            </h2>
            <p className="text-xs text-slate-500">Distribution of courses across topics</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-3.5">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No categories mapped.</p>
            ) : (
              categoryBreakdown.slice(0, 5).map((cat, i) => {
                const pct = stats.totalCourses
                  ? Math.round((cat.value / stats.totalCourses) * 100)
                  : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{cat.name || 'General'}</span>
                      <span className="text-slate-400">{cat.value} courses ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-600 to-indigo-600 rounded-full"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Users & Recent Enrollments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent User Registrations
            </h2>
            <Link to="/admin/users" className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline">
              View All Users
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No recent users found.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : u.role === 'instructor'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {u.role}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        u.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      title={u.isActive !== false ? 'Active' : 'Suspended'}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Live Student Enrollments
            </h2>
            <Link to="/admin/students" className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline">
              View Students
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentEnrollments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No recent enrollments recorded.</p>
            ) : (
              recentEnrollments.map((e) => (
                <div key={e._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={e.student?.avatar || e.student?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {e.student?.name || 'Student'}
                      </p>
                      <p className="text-xs text-rose-600 dark:text-rose-400 truncate">
                        {e.course?.title || 'Course'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
