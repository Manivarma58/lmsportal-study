import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Wed');
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [enrollmentRes, certRes, courseRes] = await Promise.allSettled([
          API.get('/enrollments/my-courses'),
          API.get('/certificates/student/my-certificates'),
          API.get('/courses', { params: { limit: 6 } }),
        ]);

        if (isMounted) {
          if (enrollmentRes.status === 'fulfilled') {
            const rawEnrollments = enrollmentRes.value.data?.enrollments || [];
            // Filter out any enrollments with deleted/null course references
            setEnrollments(rawEnrollments.filter((e) => Boolean(e.course)));
          }
          if (certRes.status === 'fulfilled') {
            setCertificates(certRes.value.data?.certificates || []);
          }
          if (courseRes.status === 'fulfilled') {
            setRecommendedCourses(courseRes.value.data?.courses || []);
          }
        }
      } catch (err) {
        console.warn('Dashboard data fetch warning:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live metrics
  const totalEnrolled = enrollments.length;
  const completedEnrollments = enrollments.filter(
    (e) => e.completed || (e.completionPercentage ?? e.progressPercentage ?? 0) === 100
  );
  const inProgressEnrollments = enrollments.filter(
    (e) => !e.completed && (e.completionPercentage ?? e.progressPercentage ?? 0) < 100
  );
  const avgProgress =
    totalEnrolled > 0
      ? Math.round(
          enrollments.reduce(
            (sum, e) => sum + (e.completionPercentage ?? e.progressPercentage ?? 0),
            0
          ) / totalEnrolled
        )
      : 0;

  // Active course for "Continue Learning"
  const activeEnrollment = inProgressEnrollments[0] || enrollments[0] || null;
  const activeCourse = activeEnrollment?.course || null;
  const activeCourseProgress =
    activeEnrollment?.completionPercentage ?? activeEnrollment?.progressPercentage ?? 0;

  // Student greeting name
  const studentName = user?.name || 'Scholar';

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-12">
      {/* Top Ambient Glow & Breadcrumbs */}
      <div className="relative w-full px-6 sm:px-8 lg:px-10 py-6 flex flex-col gap-8">
        
        {/* 1. WELCOME BANNER SECTION */}
        <section className="relative w-full rounded-2xl bg-white/95 backdrop-blur-xl shadow-sm border border-slate-200/90 p-6 lg:p-8 overflow-hidden">
          {/* Subtle blueprint accent line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left Greeting & Telemetry Badges */}
            <div className="flex flex-col gap-4 max-w-2xl min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/70">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  ACADEMIC SESSION ACTIVE
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200/70">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                  STUDENT LEDGER VERIFIED
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-xs">
                  ROLE: {user?.role ? user.role.toUpperCase() : 'STUDENT'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    {studentName}
                  </span>
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Track your curriculum milestones, access interactive laboratories, and accelerate your engineering competencies.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">terminal</span>
                  <span>
                    Environment: <strong className="text-slate-700 font-medium">Node.js + Python 3.11 Kernel</strong>
                  </span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-indigo-600 text-[18px]">cloud_done</span>
                  <span>
                    Status: <strong className="text-emerald-600 font-medium">Synced with Cloud Engine</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Quick Action Portal */}
            <div className="relative w-full lg:w-72 rounded-xl bg-slate-50 border border-slate-200/80 p-4 shrink-0 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quick Portal</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex flex-col gap-2 py-3">
                <Link
                  to="/student/courses"
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">explore</span>
                    Course Catalog
                  </span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
                <Link
                  to="/student/certificates"
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-[18px]">workspace_premium</span>
                    My Certificates ({certificates.length})
                  </span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
              <div className="text-[11px] font-mono text-slate-400 text-center">
                STUDENT ID: {user?._id ? user._id.slice(-8).toUpperCase() : 'STU-0091'}
              </div>
            </div>
          </div>
        </section>

        {/* 2. REAL STAT CARDS (4-Column Grid) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Enrolled Courses */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses Enrolled</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">laptop_chromebook</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalEnrolled}</span>
              <span className="text-xs font-semibold text-blue-600 font-mono">
                {inProgressEnrollments.length} active
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Current Status</span>
              <span className="font-semibold text-slate-700">
                {totalEnrolled > 0 ? 'Enrolled & Studying' : 'No active courses'}
              </span>
            </div>
          </div>

          {/* Card 2: Completed Courses */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses Completed</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{completedEnrollments.length}</span>
              <span className="text-xs font-semibold text-emerald-600 font-mono">
                {totalEnrolled > 0
                  ? `${Math.round((completedEnrollments.length / totalEnrolled) * 100)}% finished`
                  : '0%'}
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Goal Target</span>
              <span className="font-semibold text-slate-700">100% Mastery</span>
            </div>
          </div>

          {/* Card 3: Average Progress */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Progress</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">donut_large</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{avgProgress}%</span>
              <span className="text-xs font-semibold text-indigo-600 font-mono">Curriculum Avg</span>
            </div>
            <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Pacing</span>
              <span className="font-semibold text-slate-700">Self-paced schedule</span>
            </div>
          </div>

          {/* Card 4: Verified Certificates */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certificates</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{certificates.length}</span>
              <span className="text-xs font-semibold text-amber-600 font-mono">Issued</span>
            </div>
            <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Verification</span>
              <span className="font-semibold text-slate-700">Directly shareable</span>
            </div>
          </div>
        </section>

        {/* 3. CONTINUE LEARNING HERO SECTION */}
        {activeCourse ? (
          <section className="relative w-full rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden p-6 lg:p-8">
            <div className="flex flex-col xl:flex-row items-stretch gap-6">
              {/* Course Thumbnail */}
              <div className="relative w-full xl:w-80 h-52 xl:h-auto rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 group">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={activeCourse.title}
                  src={
                    activeCourse.thumbnail ||
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
                  }
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-blue-700 font-mono text-xs font-semibold border border-blue-200/70">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  IN PROGRESS
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-slate-900/80 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <span>{activeCourse.category || 'Engineering'}</span>
                  <span>{activeCourse.level || 'Intermediate'}</span>
                </div>
              </div>

              {/* Course Details & Actions */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">
                      RESUME YOUR CURRICULUM
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                      Instructor: {activeCourse.instructor?.name || 'Lead Instructor'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {activeCourse.title}
                  </h2>
                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                    {activeCourse.description ||
                      'Master foundational and advanced concepts through structured lessons, hands-on laboratories, and comprehensive evaluations.'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Course Progress</span>
                    <span className="font-mono text-blue-600">{activeCourseProgress}% Completed</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                      style={{ width: `${Math.max(5, activeCourseProgress)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    to={`/student/course/${activeCourse._id}/learn`}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-semibold text-sm flex items-center gap-2 shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                    <span>Continue Learning</span>
                  </Link>
                  <Link
                    to={`/course/${activeCourse._id}`}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center gap-2 border border-slate-200/90 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    <span>View Syllabus</span>
                  </Link>
                  <Link
                    to="/student/my-courses"
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                  >
                    All My Courses ({totalEnrolled}) →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* Empty State if student has 0 enrollments */
          <section className="relative w-full rounded-2xl bg-white border border-slate-200/90 shadow-sm p-8 sm:p-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm border border-blue-100">
              <span className="material-symbols-outlined text-[32px]">school</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Start Your Engineering Journey</h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-lg mt-2 leading-relaxed">
              You are not currently enrolled in any courses. Explore our curated curricula across fullstack architecture, AI engineering, cyber defense, and quantum algorithms.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/student/courses"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
                Browse Available Courses
              </Link>
              <Link
                to="/courses"
                className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                Public Course Catalog
              </Link>
            </div>
          </section>
        )}

        {/* 4. REAL ENROLLED COURSES SECTION */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Active Enrolled Curricula</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
                {totalEnrolled} Courses
              </span>
            </div>
            <Link
              to="/student/my-courses"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrollments.slice(0, 6).map((enrollment) => {
                const course = enrollment.course;
                const progress = enrollment.completionPercentage ?? enrollment.progressPercentage ?? 0;
                const isDone = enrollment.completed || progress === 100;

                return (
                  <div
                    key={enrollment._id}
                    className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                  >
                    <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={course.title}
                        src={
                          course.thumbnail ||
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
                        }
                      />
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-semibold font-mono text-slate-700 shadow-sm border border-slate-200/70">
                        {course.level ? course.level.toUpperCase() : 'ALL LEVELS'}
                      </span>
                      {isDone && (
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          COMPLETED
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-mono font-semibold uppercase text-blue-600 tracking-wider">
                          {course.category || 'General Track'}
                        </span>
                        <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                          {course.description || 'Hands-on curriculum modules and practical software benchmarks.'}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Syllabus Progress</span>
                          <span className="font-mono font-bold text-slate-700">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isDone ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.max(4, progress)}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                            <span className="truncate max-w-[120px]">{course.instructor?.name || 'Faculty'}</span>
                          </div>
                          <Link
                            to={`/student/course/${course._id}/learn`}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                          >
                            {isDone ? 'Review' : 'Continue'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
              <p className="text-slate-500 text-sm">No courses currently in progress.</p>
              <Link
                to="/student/courses"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline mt-2"
              >
                Explore Course Catalog →
              </Link>
            </div>
          )}
        </section>

        {/* 5. VERIFIED CERTIFICATES SHOWCASE */}
        {certificates.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Verified Credentials &amp; Diplomas</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono text-xs font-semibold border border-amber-200/60">
                  {certificates.length} Verified
                </span>
              </div>
              <Link
                to="/student/certificates"
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>View Gallery</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.slice(0, 3).map((cert) => (
                <div
                  key={cert._id}
                  className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200/60">
                      VERIFIED ON-CHAIN
                    </span>
                  </div>

                  <div className="my-3">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{cert.course?.title || 'Academic Certification'}</h4>
                    <p className="text-xs text-slate-500 mt-1 font-mono">Code: {cert.certificateCode || cert._id}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Issued: {new Date(cert.issueDate || cert.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Student: {studentName}</span>
                    <Link
                      to={`/student/certificates/${cert._id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View Credential →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. RECOMMENDED FOR YOU (Curricula from Platform) */}
        {recommendedCourses.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Explore Recommended Curricula</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold">
                  Platform Catalog
                </span>
              </div>
              <Link
                to="/student/courses"
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>Full Catalog</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recommendedCourses.slice(0, 3).map((course) => {
                const isAlreadyEnrolled = enrollments.some((e) => e.course?._id === course._id);

                return (
                  <div
                    key={course._id}
                    className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-100">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={course.title}
                          src={
                            course.thumbnail ||
                            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
                          }
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-700 font-mono">
                          {course.category || 'Engineering'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h4>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                          {course.description || 'Comprehensive curriculum with hands-on practice.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-500 font-mono">
                        {course.price ? `$${course.price}` : 'Free'}
                      </div>
                      {isAlreadyEnrolled ? (
                        <Link
                          to={`/student/course/${course._id}/learn`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          Enrolled • Learn
                        </Link>
                      ) : (
                        <Link
                          to={`/course/${course._id}`}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm"
                        >
                          View Syllabus
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;