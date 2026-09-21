import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';

export default function Mycourses() {
  const navigate = useNavigate();

  // State
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // all, in-progress, completed, certificates
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('recent'); // recent, progress-desc, progress-asc, title

  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const [enrollmentRes, certRes, catalogRes] = await Promise.allSettled([
          API.get('/enrollments/my-courses'),
          API.get('/certificates/student/my-certificates'),
          API.get('/courses', { params: { limit: 6 } }),
        ]);

        if (isMounted) {
          if (enrollmentRes.status === 'fulfilled') {
            const raw = enrollmentRes.value.data?.enrollments || [];
            // Filter out any enrollments where course was deleted
            setEnrollments(raw.filter((e) => Boolean(e.course)));
          }
          if (certRes.status === 'fulfilled') {
            setCertificates(certRes.value.data?.certificates || []);
          }
          if (catalogRes.status === 'fulfilled') {
            setCatalogCourses(catalogRes.value.data?.courses || []);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch enrollments:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  // Map enrollments into standardized display objects
  const displayCourses = useMemo(() => {
    return enrollments.map((e) => {
      const course = e.course;
      const progress = e.completionPercentage ?? e.progressPercentage ?? 0;
      const isCompleted = e.completed || progress === 100;
      const cert = certificates.find(
        (c) => c.course?._id === course?._id || c.course === course?._id
      );

      return {
        enrollmentId: e._id,
        id: course?._id,
        title: course?.title || 'Untitled Curriculum',
        description: course?.description || '',
        category: course?.category || 'General Track',
        level: course?.level || 'All Levels',
        thumbnail:
          course?.thumbnail ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        instructor: course?.instructor?.name || 'Lead Academic Faculty',
        instructorAvatar: course?.instructor?.avatar,
        progress,
        isCompleted,
        certificate: cert || e.certificate || null,
        enrolledAt: e.enrolledAt ? new Date(e.enrolledAt) : new Date(e.createdAt || Date.now()),
        updatedAt: e.updatedAt ? new Date(e.updatedAt) : new Date(),
        totalLessons: course?.lessons?.length || 10,
        completedLessons: Math.round(((progress / 100) * (course?.lessons?.length || 10))),
      };
    });
  }, [enrollments, certificates]);

  // Filter & Search Logic
  const filteredCourses = useMemo(() => {
    return displayCourses
      .filter((course) => {
        if (activeFilter === 'in-progress') return !course.isCompleted;
        if (activeFilter === 'completed') return course.isCompleted;
        if (activeFilter === 'certificates') return Boolean(course.certificate);
        return true;
      })
      .filter((course) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          course.title.toLowerCase().includes(q) ||
          course.category.toLowerCase().includes(q) ||
          course.instructor.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'progress-desc') return b.progress - a.progress;
        if (sortBy === 'progress-asc') return a.progress - b.progress;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return b.updatedAt - a.updatedAt; // recent
      });
  }, [displayCourses, activeFilter, searchQuery, sortBy]);

  // Statistics
  const totalCount = displayCourses.length;
  const inProgressCount = displayCourses.filter((c) => !c.isCompleted).length;
  const completedCount = displayCourses.filter((c) => c.isCompleted).length;
  const certificatesCount = displayCourses.filter((c) => Boolean(c.certificate)).length;
  const overallAvg =
    totalCount > 0
      ? Math.round(displayCourses.reduce((acc, c) => acc + c.progress, 0) / totalCount)
      : 0;

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-16 px-6 sm:px-8 lg:px-10 py-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-2 pb-6 border-b border-slate-200/90">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link to="/student/dashboard" className="hover:text-blue-600 transition-colors">
            Student Portal
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">My Learning</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Learning Curricula
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Access your enrolled programs, track real-time unit progress, and review earned certificates.
            </p>
          </div>
          <Link
            to="/student/courses"
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Browse Catalog
          </Link>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Enrolled</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Curricula in ledger</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 uppercase">In Progress</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Active studies</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase">Completed</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Curricula finished</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-indigo-600 uppercase">Avg. Completion</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{overallAvg}%</p>
          <span className="text-[11px] text-slate-400 font-mono">Across all modules</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          {[
            { id: 'all', label: 'All Courses', count: totalCount },
            { id: 'in-progress', label: 'In Progress', count: inProgressCount },
            { id: 'completed', label: 'Completed', count: completedCount },
            { id: 'certificates', label: 'Credentials', count: certificatesCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeFilter === tab.id ? 'bg-blue-50 text-blue-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Layout Actions */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="recent">Recently Active</option>
            <option value="progress-desc">Highest Progress</option>
            <option value="progress-asc">Lowest Progress</option>
            <option value="title">Course Title (A-Z)</option>
          </select>

          {/* Grid / List Layout Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewLayout === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewLayout === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            </button>
          </div>
        </div>
      </div>

      {/* Course Cards Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-mono mt-3">Loading your enrolled curricula...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        viewLayout === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.enrollmentId}
                className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={course.title}
                    src={course.thumbnail}
                  />
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-semibold font-mono text-slate-700 shadow-sm border border-slate-200/70">
                    {course.level.toUpperCase()}
                  </span>
                  {course.isCompleted ? (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      COMPLETED
                    </span>
                  ) : (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">play_circle</span>
                      IN PROGRESS
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono font-semibold uppercase text-blue-600 tracking-wider">
                      {course.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                      {course.description || 'Comprehensive curriculum with laboratory benchmarks.'}
                    </p>
                  </div>

                  {/* Progress info */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Curriculum Units</span>
                      <span className="font-mono font-bold text-slate-700">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          course.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.max(4, course.progress)}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                        <span className="truncate max-w-[130px]">{course.instructor}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {course.certificate && (
                          <Link
                            to={`/student/certificates/${course.certificate._id || course.certificate}`}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                            title="View Verified Certificate"
                          >
                            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                          </Link>
                        )}
                        <Link
                          to={`/student/course/${course.id}/learn`}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1"
                        >
                          <span>{course.isCompleted ? 'Review' : 'Continue'}</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="flex flex-col gap-4">
            {filteredCourses.map((course) => (
              <div
                key={course.enrollmentId}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img className="w-full h-full object-cover" alt={course.title} src={course.thumbnail} />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-semibold uppercase text-blue-600 px-2 py-0.5 rounded bg-blue-50">
                        {course.category}
                      </span>
                      {course.isCompleted && (
                        <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <span className="text-xs text-slate-500">Instructor: {course.instructor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex flex-col w-36">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span className="font-mono font-bold text-slate-700">{course.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${course.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.max(4, course.progress)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {course.certificate && (
                      <Link
                        to={`/student/certificates/${course.certificate._id || course.certificate}`}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                        <span>Cert</span>
                      </Link>
                    )}
                    <Link
                      to={`/student/course/${course.id}/learn`}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm"
                    >
                      {course.isCompleted ? 'Review' : 'Continue'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px]">menu_book</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {searchQuery ? 'No matching curricula found' : 'No Enrolled Courses Found'}
          </h3>
          <p className="text-slate-500 text-sm max-w-md mt-2 leading-relaxed">
            {searchQuery
              ? `No courses matching "${searchQuery}". Try searching by category or clear your search term.`
              : 'You have not enrolled in any academic programs yet. Browse our comprehensive technical catalog to get started.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Clear Search
              </button>
            ) : (
              <Link
                to="/student/courses"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm"
              >
                Explore Available Courses
              </Link>
            )}
          </div>

          {/* Quick Preview of Catalog if 0 courses */}
          {!searchQuery && catalogCourses.length > 0 && (
            <div className="w-full mt-12 pt-8 border-t border-slate-100 text-left">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Available to Enroll Now:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {catalogCourses.slice(0, 3).map((c) => (
                  <div key={c._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase text-blue-600">{c.category}</span>
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1 mt-1">{c.title}</h5>
                    </div>
                    <Link
                      to={`/course/${c._id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}