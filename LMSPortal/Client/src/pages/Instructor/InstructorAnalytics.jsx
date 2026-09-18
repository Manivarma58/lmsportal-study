import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  Award,
  TrendingUp,
  DollarSign,
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

const InstructorAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get('/analytics/instructor');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(err.message || 'Failed to load enrollment analytics');
        toast.error(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-3 font-medium">Crunching learner analytics...</p>
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
  const enrollments = data?.recentStudentEnrollments || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            Student Enrollment & Progression Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time learner enrollment metrics, syllabus completion trajectories, and revenue performance.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Students
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {s.totalStudentsCount || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Unique enrolled learners</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Enrollments
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {s.totalEnrollments || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Cumulative registrations</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg. Completion
            </p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">
              {s.avgCompletionRate || 0}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {s.totalCompletedCount || 0} completed courses
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Net Earnings
            </p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              ${s.earnings || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">85% instructor payout</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart: Enrolled vs Completed */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Course Enrollment vs Completion Benchmark
          </h2>
          <p className="text-xs text-slate-400">
            Compare student intake with syllabus graduation rates across authored modules.
          </p>
        </div>

        {performance.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No course data available yet to display chart comparisons.
          </div>
        ) : (
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis
                  dataKey="title"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="enrolled" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Enrolled Students" />
                <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Student Enrollment Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              Student Enrollment & Progression Roster
            </h2>
            <p className="text-xs text-slate-500">
              Live tracking of individual learner milestones across your courses
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Enrolled Date</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                    No student enrollments recorded yet.
                  </td>
                </tr>
              ) : (
                enrollments.map((enr) => {
                  const isDone = enr.isCompleted || enr.completed || enr.progressPercentage === 100;
                  return (
                    <tr key={enr._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              enr.student?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                            }
                            alt={enr.student?.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                          />
                          <div>
                            <p className="font-semibold text-xs text-slate-900 dark:text-white">
                              {enr.student?.name || 'Student'}
                            </p>
                            <p className="text-[11px] text-slate-400">{enr.student?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 text-xs max-w-xs truncate">
                        {enr.course?.title}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(enr.createdAt || enr.enrolledAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                isDone ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${enr.progressPercentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {enr.progressPercentage || 0}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        {isDone ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-500/20 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 border border-amber-500/20 flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" /> In Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorAnalytics;
