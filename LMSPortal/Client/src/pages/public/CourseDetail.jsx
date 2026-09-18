import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import {
  BookOpen,
  CheckCircle,
  Star,
  Users,
  Clock,
  PlayCircle,
  ShieldCheck,
  Award,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [cRes, lRes] = await Promise.all([
          API.get(`/courses/${id}`),
          API.get(`/lessons/course/${id}`),
        ]);
        setCourse(cRes.data.course);
        setLessons(lRes.data.lessons);

        if (isAuthenticated && user?.role === 'student') {
          const eRes = await API.get(`/enrollments/check/${id}`);
          setIsEnrolled(eRes.data.isEnrolled);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, isAuthenticated, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in or create an account to enroll');
      return navigate('/login');
    }
    if (user.role !== 'student') {
      return toast.error('Only student accounts can enroll in courses');
    }

    try {
      setEnrolling(true);
      await API.post(`/enrollments/${id}`);
      toast.success(`Successfully enrolled in ${course.title}!`);
      navigate(`/student/course/${id}/learn`);
    } catch (err) {
      toast.error(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <Link to="/courses" className="text-indigo-600 mt-2">
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Calculate total duration in hours & mins
  const totalMinutes = lessons.reduce((sum, l) => sum + (l.duration || 10), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 sm:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {course.category}
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
                {course.level}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {course.shortDescription || course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                ★ {course.rating} ({course.numReviews || 12} reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {course.enrollmentCount || 0} enrolled
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {hours > 0 ? `${hours}h ` : ''}{mins}m on-demand video
              </span>
            </div>
          </div>

          {/* Floating Course Action Card */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <img
              src={course.thumbnail}
              alt=""
              className="w-full h-44 object-cover rounded-2xl shadow"
            />

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Tuition</span>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {course.isFree ? 'Free' : `$${course.price}`}
                </p>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                Full Lifetime Access
              </span>
            </div>

            {isEnrolled ? (
              <Link
                to={`/student/course/${course._id}/learn`}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 text-center flex items-center justify-center gap-2 transition-transform hover:scale-102"
              >
                <PlayCircle className="w-5 h-5" /> Continue Learning
              </Link>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/25 transition-all transform hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Full access to all video lessons
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Auto-graded assessments & quizzes
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Verifiable Certificate of Completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Body */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* What You'll Learn */}
          {course.willLearn && course.willLearn.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" /> What You'll Learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                {course.willLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Syllabus Outline */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" /> Course Curriculum ({lessons.length} Lessons)
            </h2>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {lessons.map((l, idx) => (
                <div key={l._id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {l.title}
                      </p>
                      <span className="text-xs text-slate-400">{l.section}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {l.isFreePreview && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 rounded text-[10px] font-bold uppercase">
                        Free Preview
                      </span>
                    )}
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {l.duration}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor Bio */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Instructor
            </h2>
            <div className="flex items-start gap-4">
              <img
                src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={course.instructor?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500"
              />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {course.instructor?.name}
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {course.instructor?.headline || 'Senior Instructor & Practitioner'}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                  {course.instructor?.bio || 'Dedicated educator passionate about teaching modern architectures.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
