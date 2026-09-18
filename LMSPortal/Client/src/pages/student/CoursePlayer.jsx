import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import confetti from 'canvas-confetti';
import {
  PlayCircle,
  CheckCircle2,
  Circle,
  Award,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Download,
  HelpCircle,
  MessageSquare,
  Clock,
  Layers,
  Sparkles,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState({
    isEnrolled: false,
    progressPercentage: 0,
    completedLessonIds: [],
    certificate: null,
  });
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'resources'

  const handleEnrollNow = async () => {
    try {
      setEnrolling(true);
      await API.post(`/enrollments/${courseId}`);
      toast.success(`Successfully enrolled in ${course?.title || 'course'}!`);
      await fetchCourseClassroom();
    } catch (err) {
      toast.error(err.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const fetchCourseClassroom = async () => {
    try {
      setLoading(true);
      const [cRes, lRes, pRes, qRes] = await Promise.all([
        API.get(`/courses/${courseId}`),
        API.get(`/lessons/course/${courseId}`),
        API.get(`/progress/${courseId}`),
        API.get(`/quizzes/course/${courseId}`),
      ]);

      setCourse(cRes.data.course);
      const lessonList = lRes.data.lessons;
      setLessons(lessonList);
      setProgress(pRes.data);
      setQuizzes(qRes.data.quizzes || []);

      // Default active lesson: last accessed or first lesson
      if (lessonList.length > 0) {
        const lastId = pRes.data.lastAccessedLesson;
        const found = lessonList.find((l) => l._id === lastId);
        setActiveLesson(found || lessonList[0]);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load course player');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseClassroom();
  }, [courseId]);

  const handleToggleComplete = async (lessonId) => {
    try {
      const res = await API.post(`/progress/${courseId}/lesson/${lessonId}`);
      toast.success(res.data.message);

      setProgress((prev) => {
        const ids = prev.completedLessonIds.includes(lessonId)
          ? prev.completedLessonIds.filter((id) => id !== lessonId)
          : [...prev.completedLessonIds, lessonId];

        return {
          ...prev,
          progressPercentage: res.data.progressPercentage,
          isCompleted: res.data.isCompleted,
          completedLessonIds: ids,
          certificate: res.data.certificate || prev.certificate,
        };
      });

      // If just completed 100%, fire celebration confetti!
      if (res.data.progressPercentage === 100 && res.data.certificate) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success('🎓 Course 100% Completed! Your certificate has been unlocked.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update lesson completion');
    }
  };

  // Helper to extract clean embed URL for YouTube
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const vid = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vid}?autoplay=0`;
    }
    if (url.includes('youtu.be/')) {
      const vid = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vid}?autoplay=0`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading virtual classroom...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <Link to="/student/my-courses" className="text-indigo-400 mt-2 text-xs underline">
          Back to My Courses
        </Link>
      </div>
    );
  }

  // Access Protection Guard: Check if student is enrolled
  if (!progress.isEnrolled) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Access Restricted
            </span>
            <h2 className="text-xl font-bold text-white">
              Enrollment Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This course content is protected. You must be enrolled in <strong className="text-slate-200">"{course?.title || 'this course'}"</strong> to access virtual lessons, quizzes, and certificates.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 text-left space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Tuition</span>
              <span className="font-bold text-white">{course?.isFree ? 'Free' : `$${course?.price || 0}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Lessons</span>
              <span className="font-bold text-white">{lessons.length} Modules</span>
            </div>
            <div className="flex justify-between">
              <span>Instructor</span>
              <span className="font-bold text-white">{course?.instructor?.name || 'Lead Instructor'}</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleEnrollNow}
              disabled={enrolling}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              {enrolling ? 'Enrolling...' : 'Enroll in Course Now'}
            </button>
            <Link
              to={`/course/${courseId}`}
              className="block w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              View Full Course Syllabus
            </Link>
            <Link
              to="/student/my-courses"
              className="block text-xs text-slate-500 hover:text-slate-400 pt-1"
            >
              ← Back to My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty Lessons Guard
  if (lessons.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
        <h2 className="text-xl font-bold">No Lessons Available Yet</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          The instructor has not published lessons for this course yet. Please check back soon.
        </p>
        <Link
          to="/student/my-courses"
          className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          Return to My Courses
        </Link>
      </div>
    );
  }

  // Group lessons by section
  const sections = {};
  lessons.forEach((l) => {
    const sec = l.section || 'General';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(l);
  });

  const isCurrentLessonComplete = activeLesson
    ? progress.completedLessonIds.includes(activeLesson._id)
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Top Classroom Bar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/student/my-courses"
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
              {course?.title}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {activeLesson?.title || 'Lesson Player'}
            </p>
          </div>
        </div>

        {/* Progress & Certificate Button */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-indigo-400">
              {progress.progressPercentage}%
            </span>
          </div>

          {progress.certificate && (
            <Link
              to={`/student/certificates/${progress.certificate._id || progress.certificate}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
            >
              <Award className="w-4 h-4" /> Certificate Ready
            </Link>
          )}
        </div>
      </header>

      {/* Classroom Content Grid */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left / Center Video Stage & Lesson Details */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Video Player Container */}
          <div className="bg-black aspect-video w-full flex items-center justify-center relative shadow-2xl">
            {activeLesson?.videoUrl ? (
              <iframe
                src={getEmbedUrl(activeLesson.videoUrl)}
                title={activeLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-center p-8 text-slate-500">
                <PlayCircle className="w-16 h-16 mx-auto mb-2 text-slate-700" />
                <p className="text-sm">Video stream not available for this lesson.</p>
              </div>
            )}
          </div>

          {/* Lesson Action Bar */}
          <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                {activeLesson?.section}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                {activeLesson?.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Mark Complete Toggle */}
              {activeLesson && (
                <button
                  onClick={() => handleToggleComplete(activeLesson._id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrentLessonComplete
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCurrentLessonComplete ? 'Completed ✓' : 'Mark as Complete'}
                </button>
              )}

              {/* Assessment Quiz Launcher if available */}
              {quizzes.length > 0 && (
                <Link
                  to={`/student/course/${courseId}/quiz/${quizzes[0]._id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" /> Take Quiz
                </Link>
              )}
            </div>
          </div>

          {/* Tabbed Info & Resources */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-2 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 transition-colors relative ${
                  activeTab === 'overview'
                    ? 'text-indigo-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lesson Overview
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`pb-2 transition-colors relative ${
                  activeTab === 'resources'
                    ? 'text-indigo-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Downloadable Resources
              </button>
              <Link
                to={`/student/chat`}
                className="pb-2 text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Class Discussion
              </Link>
            </div>

            {activeTab === 'overview' ? (
              <div className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                <p>{activeLesson?.description || course?.description}</p>
                <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2">
                    Learning Outcomes in this Module:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                    {course?.willLearn?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-xl">
                {activeLesson?.resources && activeLesson.resources.length > 0 ? (
                  activeLesson.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between hover:border-indigo-500 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-semibold text-white">{r.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{r.fileType || 'File'}</span>
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">
                    No resource attachments uploaded for this lesson.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Curriculum Playlist Drawer */}
        <aside className="w-full lg:w-96 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col flex-shrink-0 max-h-[500px] lg:max-h-none overflow-y-auto">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Course Curriculum
            </h3>
            <span className="text-xs text-slate-500">
              {progress.completedLessonIds.length}/{lessons.length} Completed
            </span>
          </div>

          <div className="divide-y divide-slate-800/60 flex-1 overflow-y-auto">
            {Object.entries(sections).map(([secTitle, secLessons], sIdx) => (
              <div key={secTitle} className="p-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  {secTitle}
                </p>
                <div className="space-y-1">
                  {secLessons.map((l) => {
                    const isCurrent = activeLesson?._id === l._id;
                    const isDone = progress.completedLessonIds.includes(l._id);

                    return (
                      <div
                        key={l._id}
                        onClick={() => setActiveLesson(l)}
                        className={`p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                            : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(l._id);
                            }}
                            className="flex-shrink-0"
                            title={isDone ? 'Mark Incomplete' : 'Mark Complete'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 hover:text-indigo-400" />
                            )}
                          </button>
                          <span className="text-xs font-medium truncate">
                            {l.title}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-500 flex-shrink-0">
                          {l.duration}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;
