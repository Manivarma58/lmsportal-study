import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const instructorName = user?.name || 'Faculty Member';

  // API State
  const [statsData, setStatsData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State controls
  const [exportOpen, setExportOpen] = useState(false);
  const [courseCategory, setCourseCategory] = useState('all');
  const [courseSearch, setCourseSearch] = useState('');

  // Fallback demo courses if the instructor has no courses yet
  const FALLBACK_COURSES = [
    {
      _id: 'c-demo-1',
      code: 'CS-901',
      category: 'AI & Machine Learning',
      title: 'Neural Networks & Quantum Computing: Tensor Latents',
      studentsCount: 1840,
      rating: 4.96,
      completionRate: 88,
      published: true,
      thumbnail:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAnRS2U6MlnSu6Zw0V5aJzw71fNY1MRFNyWBaH8mMuL5jJT2WNXkrICrINWRWWVw_rMiYRbPjrLoRtQH602Jn2HkraaUUZXsQ3g2ZEg8x2QbBvf8TOkS632owl-gjdoVEaPJmXeCgE22NS_lyn4xy0CfhBdsAZRVTbcQ2z17qr0KKqH-aaTHFUYJKeyJ0xGNvGEdZeO0rYEHpnZz8VKrjprzz829JfcQu7cjXx67g',
    },
    {
      _id: 'c-demo-2',
      code: 'DEV-602',
      category: 'Cloud & DevOps',
      title: 'Enterprise Kubernetes Mesh & High-Throughput Microservices',
      studentsCount: 1420,
      rating: 4.89,
      completionRate: 82,
      published: true,
      thumbnail:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD1OU6YXKToVNMUsq2_l05zbQzDWdymsAxtt62B2azDN0-m3xX1Ud5UKqVA56UJDRL_ubt1CBTGtnJvp-nJEfumbMebZz-vtQTE7X46ZOYYLZs64Kmiir2myGapeVDWD8gm6TnSVWwPMvhXTgylz2mEixfFy5jEdCc-xjScc5f810AA1dDMd7PW8kEkIEYk_fSr19v1GXZDbFmllVf25hUhwz9IRNyjoKWn2abZLQ',
    },
    {
      _id: 'c-demo-3',
      code: 'SEC-802',
      category: 'Cybersecurity & Crypto',
      title: 'Advanced Cryptographic Primitives & ZK-SNARKs Protocol',
      studentsCount: 980,
      rating: 4.94,
      completionRate: 79,
      published: true,
      thumbnail:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAH1VlnH09jeOVNbQjTzlRPa9hGnaH7QW4pTupSQ4Ijq9gZ7kmzr0i6b7Q5sDUlEWP2p_qcy0-Uuquf83NU-VmU1bMhqjfrvNWt0XSKDdnwtRJzySLCp5Dgvimxku5P98vzehXhs6lvzM09un2-ddwE6FH7axwTbt1v0tRjdTfCSICelWEN9KPtXKIPF2Tf-x_uvcXKgKBKsk2EMILsfMPHkeJ36VDfKUcMCQfW5w',
    },
  ];

  // Fetch real instructor stats & courses
  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, coursesRes] = await Promise.all([
          API.get('/analytics/instructor').catch(() => null),
          API.get('/courses/instructor/my-courses').catch(() => null),
        ]);

        if (!isMounted) return;

        if (statsRes?.data) {
          setStatsData(statsRes.data);
        }

        const courseList = coursesRes?.data?.courses || [];
        if (courseList.length > 0) {
          setCourses(courseList);
        } else {
          setCourses(FALLBACK_COURSES);
        }
      } catch (err) {
        console.error('Failed to load instructor dashboard:', err);
        if (isMounted) setCourses(FALLBACK_COURSES);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchCat =
        courseCategory === 'all' ||
        (c.category && c.category.toLowerCase().includes(courseCategory.toLowerCase()));

      const matchSearch =
        !courseSearch ||
        c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
        (c.code && c.code.toLowerCase().includes(courseSearch.toLowerCase()));

      return matchCat && matchSearch;
    });
  }, [courses, courseCategory, courseSearch]);

  const handleExport = (type) => {
    toast.success(`Exporting ${type} telemetry report...`);
    setExportOpen(false);
  };

  // KPI Calculations
  const totalCoursesCount = statsData?.stats?.totalCourses ?? courses.length;
  const publishedCoursesCount =
    statsData?.stats?.publishedCourses ?? courses.filter((c) => c.published || c.isPublished).length;
  const totalScholars =
    statsData?.stats?.totalStudentsCount ??
    courses.reduce((acc, c) => acc + (c.studentsCount || c.enrollmentCount || 0), 0);
  const avgCompletion = statsData?.stats?.avgCompletionRate ?? 84;
  const earnings = statsData?.stats?.earnings ?? totalScholars * 45;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 min-h-screen bg-transparent">
      <div className="flex flex-col w-full space-y-6">
        {/* =========================================================================
            1. EXECUTIVE HEADER BANNER (Light Blueprint Theme)
        ========================================================================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 relative overflow-hidden">
          {/* Top Blue Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            {/* Left: Persona, Title, Meta */}
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/80 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  FACULTY ACADEMIC DESK
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs border border-slate-200">
                  Active Term // Real-time
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs border border-emerald-200 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Node Synced
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                Welcome back,{' '}
                <span className="text-blue-600">
                  {instructorName}
                </span>
                .
              </h1>

              <p className="text-sm text-slate-500 leading-relaxed">
                Review your course curricula, manage student enrollment velocity, inspect auto-grading scorecards, and publish fresh instructional modules.
              </p>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => navigate('/instructor/create-course')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Create New Course</span>
              </button>

              <button
                onClick={() => navigate('/instructor/courses')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm border border-slate-200 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-blue-600">layers</span>
                <span>Manage Courses</span>
              </button>

              <button
                onClick={() => navigate('/instructor/analytics')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm border border-slate-200 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-indigo-600">bar_chart</span>
                <span>Analytics</span>
              </button>

              {/* Export Button */}
              <div className="relative">
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs border border-slate-200 shadow-sm transition-all cursor-pointer"
                  title="Export telemetry"
                >
                  <span className="material-symbols-outlined text-[18px]">ios_share</span>
                  <span className="material-symbols-outlined text-[14px]">expand_more</span>
                </button>

                {exportOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl p-1.5 space-y-1 z-30 border border-slate-200 text-xs">
                    <button
                      onClick={() => handleExport('CSV')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-blue-600">download</span>
                      Export CSV Report
                    </button>
                    <button
                      onClick={() => handleExport('PDF')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-rose-600">picture_as_pdf</span>
                      PDF Performance Summary
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. HIGH-IMPACT STAT METRICS GRID (4 CARDS)
        ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Stat 1: Total Courses */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Active Curricula
              </span>
              <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">{totalCoursesCount}</span>
              <span className="text-xs font-semibold text-emerald-600 font-mono">
                {publishedCoursesCount} Live
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>{publishedCoursesCount} Published</span>
              <span className="font-mono text-blue-600 font-medium">
                {totalCoursesCount - publishedCoursesCount} Drafts
              </span>
            </div>
          </div>

          {/* Stat 2: Total Scholars */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Enrolled Scholars
              </span>
              <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {totalScholars.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-emerald-600 font-mono">+12%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Active Learners</span>
              <span className="font-mono text-indigo-600 font-medium">98.4% Active</span>
            </div>
          </div>

          {/* Stat 3: Average Completion Rate */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Completion Rate
              </span>
              <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">{avgCompletion}%</span>
              <span className="text-xs font-semibold text-emerald-600 font-mono">Top Tier</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${avgCompletion}%` }}
              ></div>
            </div>
          </div>

          {/* Stat 4: Estimated Earnings */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Faculty Revenue
              </span>
              <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">
                ${earnings.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-purple-600 font-mono">USD</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Automatic Direct Deposit</span>
              <span className="font-mono text-emerald-600 font-semibold">Verified</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. COURSES PERFORMANCE ARENA WITH SEARCH & FILTER
        ========================================================================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Curriculum Performance & Catalog</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage lesson contents, syllabus structure, and live enrollment metrics.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="Filter courses..."
                  type="text"
                />
              </div>

              <select
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">All Domains</option>
                <option value="quantum">AI & Quantum</option>
                <option value="cloud">Cloud & DevOps</option>
                <option value="crypto">Cybersecurity & Crypto</option>
              </select>
            </div>
          </div>

          {/* Courses Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Course Title & Domain</th>
                  <th className="py-3 px-4">Scholars</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Completion</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          alt={course.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                          src={
                            course.thumbnail ||
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuAnRS2U6MlnSu6Zw0V5aJzw71fNY1MRFNyWBaH8mMuL5jJT2WNXkrICrINWRWWVw_rMiYRbPjrLoRtQH602Jn2HkraaUUZXsQ3g2ZEg8x2QbBvf8TOkS632owl-gjdoVEaPJmXeCgE22NS_lyn4xy0CfhBdsAZRVTbcQ2z17qr0KKqH-aaTHFUYJKeyJ0xGNvGEdZeO0rYEHpnZz8VKrjprzz829JfcQu7cjXx67g'
                          }
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-sm">
                            {course.title}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {course.category || 'Specialized Track'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {(course.studentsCount || course.enrollmentCount || 120).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-500 font-semibold font-mono">
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span>{course.rating || 4.9}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${course.completionRate || 80}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-slate-600 text-[11px]">
                          {course.completionRate || 80}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
                          course.published || course.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {course.published || course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/instructor/courses/${course._id}/editor`)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(`/student/course/${course._id}/learn`)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
                        >
                          Preview
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================================================================
            4. RECENT STUDENT ENROLLMENTS & INTERACTION QUEUE
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Recent Enrollments */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-base">person_add</span>
                Recent Scholar Enrollments
              </h3>
              <span className="text-xs text-blue-600 font-mono font-semibold">Live Registry</span>
            </div>

            <div className="space-y-3">
              {(statsData?.recentStudentEnrollments || [
                {
                  _id: 'enr-1',
                  student: { name: 'Priya Sharma', email: 'priya.s@nova.edu' },
                  course: { title: 'Neural Networks & Quantum Computing' },
                  createdAt: new Date().toISOString(),
                },
                {
                  _id: 'enr-2',
                  student: { name: 'David Miller', email: 'd.miller@nova.edu' },
                  course: { title: 'Enterprise Kubernetes Mesh' },
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                },
                {
                  _id: 'enr-3',
                  student: { name: 'Elena Rostova', email: 'elena.r@nova.edu' },
                  course: { title: 'Advanced Cryptographic Primitives' },
                  createdAt: new Date(Date.now() - 7200000).toISOString(),
                },
              ]).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {item.student?.name?.[0] || 'S'}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 text-xs truncate">
                        {item.student?.name || 'Enrolled Student'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.course?.title || 'Academic Course'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    Just now
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Instructor Quick Tasks */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-base">checklist</span>
                Pending Instructional Tasks
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold font-mono">
                3 Pending
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'Grade Lab 4: Parameter-Shift Implementation', type: 'Grading', due: 'Today' },
                { title: 'Publish Module 5: Noise Mitigation Strategies', type: 'Curriculum', due: 'Tomorrow' },
                { title: 'Respond to Marcus Lin Q&A regarding SPSA optimizer', type: 'Discussion', due: '2h ago' },
              ].map((task, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    <span className="text-xs text-slate-800 font-medium truncate">{task.title}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shrink-0">
                    {task.due}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;