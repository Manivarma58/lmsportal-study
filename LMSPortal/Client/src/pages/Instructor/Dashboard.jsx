import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  BookOpen,
  Users,
  Award,
  DollarSign,
  PlusCircle,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

const InstructorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructorStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get('/analytics/instructor');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching instructor stats:', err);
        setError(err.message || 'Failed to load instructor analytics');
        toast.error(err.message || 'Failed to load instructor stats');
      } finally {
        setLoading(false);
      }
    };
    fetchInstructorStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-3 font-medium">Loading instructor metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 text-center text-rose-600 dark:text-rose-400">
        <p className="font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const s = data?.stats || {};
  const performance = data?.coursePerformance || [];
  const recentEnrollments = data?.recentStudentEnrollments || [];

  const kpis = [
    {
      title: 'Total Courses',
      value: s.totalCourses || 0,
      sub: `${s.publishedCourses || 0} currently live`,
      icon: BookOpen,
      badge: `${s.totalCourses - (s.publishedCourses || 0)} in draft`,
      color: 'bg-amber-500/10 text-amber-500 dark:bg-amber-950/40 border border-amber-500/20',
    },
    {
      title: 'Published Courses',
      value: s.publishedCourses || 0,
      sub: 'Publicly discoverable',
      icon: CheckCircle2,
      badge: 'Active Catalogs',
      color: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-950/40 border border-emerald-500/20',
    },
    {
      title: 'Total Students',
      value: s.totalStudentsCount || 0,
      sub: 'Unique active learners',
      icon: Users,
      badge: 'Learner Base',
      color: 'bg-blue-500/10 text-blue-500 dark:bg-blue-950/40 border border-blue-500/20',
    },
    {
      title: 'Total Enrollments',
      value: s.totalEnrollments || 0,
      sub: 'Course registrations',
      icon: Layers,
      badge: 'Enrolled Seats',
      color: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-950/40 border border-indigo-500/20',
    },
    {
      title: 'Avg. Completion Rate',
      value: `${s.avgCompletionRate || 0}%`,
      sub: `${s.totalCompletedCount || 0} courses completed`,
      icon: TrendingUp,
      badge: 'Student Success',
      color: 'bg-purple-500/10 text-purple-500 dark:bg-purple-950/40 border border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
            Instructor Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Author, Manage & Scale Your Curriculum
          </h1>
          <p className="text-white/90 text-xs sm:text-sm">
            Track student enrollment progress, create interactive video lessons and quizzes, and manage verified credential issuing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Link
            to="/instructor/courses"
            className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold px-5 py-3 rounded-2xl shadow-lg hover:bg-amber-50 transition-all transform hover:scale-105 active:scale-95 text-xs flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Create Course
          </Link>
          <Link
            to="/instructor/analytics"
            className="inline-flex items-center gap-2 bg-amber-700/60 hover:bg-amber-700 text-white font-bold px-4 py-3 rounded-2xl transition-colors text-xs flex-shrink-0"
          >
            <BarChart3 className="w-4 h-4" /> View Analytics
          </Link>
        </div>
      </div>

      {/* 5 Core KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {c.title}
                </span>
                <div className={`p-2 rounded-xl ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {c.value}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{c.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Completion Statistics & Performance Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Course Completion Statistics & Retention
            </h2>
            <p className="text-xs text-slate-500">
              Live progression and milestone completion rates across your courses
            </p>
          </div>
          <Link
            to="/instructor/courses"
            className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Manage Curriculum <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Enrolled</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4">Completion Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {performance.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                    No authored courses found yet. Click "Create Course" to publish your first program!
                  </td>
                </tr>
              ) : (
                performance.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-white max-w-xs truncate">
                      <Link
                        to={`/instructor/courses/${item.id}/editor`}
                        className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {item.isPublished ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-500/20">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 border border-slate-700/20">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{item.category}</td>
                    <td className="py-3.5 px-4 text-amber-500 font-bold text-xs">★ {item.rating}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {item.enrolled}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600 text-xs">
                      {item.completed}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: item.completionRate }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {item.completionRate}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Recent Student Enrollments & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enrollments Stream */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Recent Student Enrollments
            </h2>
            <Link
              to="/instructor/analytics"
              className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
            >
              Full Roster →
            </Link>
          </div>

          {recentEnrollments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No student enrollments recorded yet. Once students join your classes, their activity will appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentEnrollments.slice(0, 5).map((enr) => (
                <div key={enr._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={enr.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt={enr.student?.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {enr.student?.name || 'Student'}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        Enrolled in <span className="font-semibold text-slate-300">{enr.course?.title}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {enr.progressPercentage || 0}%
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {new Date(enr.createdAt || enr.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launchpad Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Quick Launchpad
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Rapid access to course creation tools, interactive quiz builders, and student discussions.
            </p>

            <div className="space-y-2.5">
              <Link
                to="/instructor/courses"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-amber-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  Manage Curriculum Courses
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/instructor/analytics"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-amber-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  Learner Progress Analytics
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/instructor/chat"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-amber-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  Student Q&A & Messages
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Authoring Tip: Adding auto-graded quizzes increases course completion rates by over 40%.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;