import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  BookOpen,
  Award,
  Clock,
  PlayCircle,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Star,
  Activity,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [eRes, cRes, rRes] = await Promise.all([
          API.get('/enrollments/my-courses'),
          API.get('/certificates/student/my-certificates'),
          API.get('/courses?limit=4&sort=popular'),
        ]);

        const myEnrollments = eRes.data.enrollments || [];
        setEnrollments(myEnrollments);
        setCertificates(cRes.data.certificates || []);

        // Filter out courses the student is already enrolled in
        const enrolledIds = new Set(
          myEnrollments.map((e) => e.course?._id || e.course)
        );
        const filteredRecommended = (rRes.data.courses || []).filter(
          (c) => !enrolledIds.has(c._id)
        );
        setRecommendedCourses(filteredRecommended.slice(0, 3));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
        setError(err.message || 'Failed to load dashboard');
        toast.error(err.message || 'Failed to load student dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-3 font-medium">Loading your dashboard...</p>
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

  const inProgressCourses = enrollments.filter((e) => !e.isCompleted);
  const completedCourses = enrollments.filter((e) => e.isCompleted);
  const recentCourse = enrollments[0];

  // Derive recent activities from enrollments & certificates
  const activities = [];

  enrollments.forEach((e) => {
    if (e.createdAt || e.enrolledAt) {
      activities.push({
        id: `enroll-${e._id}`,
        type: 'enrollment',
        title: `Enrolled in ${e.course?.title || 'a new course'}`,
        time: new Date(e.createdAt || e.enrolledAt),
        link: `/student/course/${e.course?._id}/learn`,
        badge: 'Course Started',
        icon: BookOpen,
        color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950',
      });
    }

    if (e.completedLessons && e.completedLessons.length > 0) {
      const latestLesson = e.completedLessons[e.completedLessons.length - 1];
      if (latestLesson?.completedAt) {
        activities.push({
          id: `lesson-${latestLesson._id || latestLesson.lesson}`,
          type: 'lesson',
          title: `Completed lesson in ${e.course?.title || 'course'}`,
          time: new Date(latestLesson.completedAt),
          link: `/student/course/${e.course?._id}/learn`,
          badge: 'Lesson Milestone',
          icon: CheckCircle2,
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950',
        });
      }
    }
  });

  certificates.forEach((c) => {
    activities.push({
      id: `cert-${c._id}`,
      type: 'certificate',
      title: `Earned Certificate for ${c.course?.title || c.courseTitle || 'course completion'}`,
      time: new Date(c.issueDate || c.createdAt),
      link: `/student/certificates/${c._id}`,
      badge: 'Certificate Unlocked',
      icon: Award,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950',
    });
  });

  // Sort activities by most recent
  activities.sort((a, b) => b.time - a.time);
  const recentActivities = activities.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Continue Learning Banner */}
      {recentCourse ? (
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
              Resume Coursework
            </span>
            <h1 className="text-xl sm:text-2xl font-bold">
              {recentCourse.course?.title}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm">
              You are currently at{' '}
              <span className="font-bold text-white">
                {recentCourse.progressPercentage}%
              </span>{' '}
              completion. Keep momentum to earn your certified credential!
            </p>
            <div className="w-full bg-white/20 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${recentCourse.progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <Link
            to={`/student/course/${recentCourse.course?._id}/learn`}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-indigo-50 transition-all transform hover:scale-105 active:scale-95 flex-shrink-0 z-10"
          >
            <PlayCircle className="w-5 h-5" /> Continue Learning
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to your Learning Hub!</h1>
          <p className="text-white/80 text-sm max-w-md mx-auto mb-4">
            You are not currently enrolled in any courses. Explore our rich catalog and pick your first skill today.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-5 py-2.5 rounded-xl text-sm shadow-md"
          >
            <BookOpen className="w-4 h-4" /> Browse Catalog
          </Link>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Enrolled Courses
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {enrollments.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              In Progress
            </p>
            <p className="text-2xl font-bold text-amber-500 mt-1">
              {inProgressCourses.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Completed
            </p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">
              {completedCourses.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Certificates
            </p>
            <p className="text-2xl font-bold text-amber-500 mt-1">
              {certificates.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              My Enrolled Curriculum
            </h2>
            <p className="text-xs text-slate-400">Your registered programs and modules</p>
          </div>
          <Link
            to="/student/my-courses"
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-400 border border-slate-200 dark:border-slate-800">
            <p>No enrolled courses yet. Start your journey by browsing available courses!</p>
            <Link
              to="/courses"
              className="inline-block mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.slice(0, 4).map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {item.course?.category}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {item.progressPercentage}% Complete
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">
                    {item.course?.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Instructor: {item.course?.instructor?.name || 'Instructor'}
                  </p>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        item.isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${item.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {item.isCompleted && item.certificate ? (
                    <Link
                      to={`/student/certificates/${item.certificate}`}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:underline"
                    >
                      <Award className="w-4 h-4" /> View Certificate
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> In Progress
                    </span>
                  )}

                  <Link
                    to={`/student/course/${item.course?._id}/learn`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Go to Class <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid Row: Recent Activity + Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Timeline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Recent Activity
            </h2>
            <Link
              to="/student/progress"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Full Analytics →
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No recent activity recorded yet. Start learning to see your log here!
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <Link
                    key={act.id}
                    to={act.link}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${act.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {act.badge}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {act.time.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {act.title}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Certificates Showcase */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Certificates Earned ({certificates.length})
            </h2>
            <Link
              to="/student/progress"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              View All →
            </Link>
          </div>

          {certificates.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p>No certificates earned yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Complete 100% of any enrolled course to automatically unlock your verified certificate.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.slice(0, 3).map((cert) => (
                <div
                  key={cert._id}
                  className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {cert.course?.title || cert.courseTitle || 'Course Certificate'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Issued: {new Date(cert.issueDate || cert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/student/certificates/${cert._id}`}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-colors flex-shrink-0"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Courses Section */}
      {recommendedCourses.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Recommended Courses For You
              </h2>
              <p className="text-xs text-slate-400">Curated topics to expand your skillset</p>
            </div>
            <Link
              to="/courses"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendedCourses.map((c) => (
              <div
                key={c._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/90 text-slate-900 backdrop-blur-sm">
                      {c.category}
                    </span>
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      {c.level}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        ★ {c.rating || '5.0'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {c.enrollmentCount || 0}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                      {c.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-2 pt-3">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {c.isFree ? 'Free' : `$${c.price}`}
                  </span>

                  <Link
                    to={`/course/${c._id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;