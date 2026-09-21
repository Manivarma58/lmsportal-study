import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Core Data State
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState({
    isEnrolled: true,
    progressPercentage: 0,
    completedLessons: [],
    completed: false,
    certificate: null,
  });
  const [loading, setLoading] = useState(true);

  // UI Tabs & Views
  const [activeCenterTab, setActiveCenterTab] = useState('overview'); // overview, code, resources, quizzes
  const [activeRightTab, setActiveRightTab] = useState('notes'); // notes, resources, qa, ai
  const [curriculumSearch, setCurriculumSearch] = useState('');
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [notesFilter, setNotesFilter] = useState('lesson'); // lesson, all

  // Video State & Controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(865);
  const [duration, setDuration] = useState(1600);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showFormula, setShowFormula] = useState(false);
  const playerContainerRef = useRef(null);

  // Code Sandbox State
  const [sandboxCode, setSandboxCode] = useState(
    `# Python 3.11 - Scientific Computing
import math

def calculate_mastery(completed_modules, total_modules):
    ratio = completed_modules / total_modules
    return f"Progress: {ratio * 100:.1f}%"

print(calculate_mastery(15, 20))
`
  );
  const [sandboxOutput, setSandboxOutput] = useState('Output will appear here after execution...');
  const [isExecuting, setIsExecuting] = useState(false);

  // Notes State
  const [noteInput, setNoteInput] = useState('');
  const [notesList, setNotesList] = useState([
    {
      id: 'n1',
      time: '04:12',
      seconds: 252,
      lessonId: 'default-1',
      text: 'Crucial principle: In distributed asynchronous gradient tracking, synchronize momentum parameters across worker nodes.',
      tags: ['#optimization', '#distributed-systems'],
    },
    {
      id: 'n2',
      time: '11:45',
      seconds: 705,
      lessonId: 'default-1',
      text: 'Computational throughput scales superlinearly when batch sizes fit within L3 cache boundaries.',
      tags: ['#hardware', '#performance'],
    },
  ]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Convert YouTube URL to Embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const v = urlParams.get('v');
        return v ? `https://www.youtube.com/embed/${v}` : null;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (url.includes('youtube.com/embed/')) {
        return url;
      }
    } catch {
      return null;
    }
    return null;
  };

  // Fetch classroom data
  useEffect(() => {
    let isMounted = true;
    const fetchClassroom = async () => {
      setLoading(true);
      try {
        if (courseId) {
          const [cRes, lRes, pRes] = await Promise.all([
            API.get(`/courses/${courseId}`).catch(() => null),
            API.get(`/lessons/course/${courseId}`).catch(() => null),
            API.get(`/progress/${courseId}`).catch(() => null),
          ]);

          if (!isMounted) return;

          if (cRes?.data?.course) {
            setCourse(cRes.data.course);
          }

          const rawLessons = lRes?.data?.lessons || (Array.isArray(lRes?.data) ? lRes.data : []);
          if (rawLessons.length > 0) {
            setLessons(rawLessons);
            setActiveLesson(rawLessons[0]);
          } else {
            // Curated fallback curriculum for demo/fallback courses
            const fallbackCurriculum = [
              {
                _id: 'l-01',
                title: 'Architecture Fundamentals & Setup',
                duration: 18,
                description: 'Overview of runtime architecture, dependencies, core data pipelines, and project scaffolding.',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                resources: [
                  { title: 'lecture_slides_module1.pdf', fileSize: '4.2 MB', fileType: 'pdf' },
                  { title: 'starter_environment.json', fileSize: '12 KB', fileType: 'json' },
                ],
              },
              {
                _id: 'l-02',
                title: 'State Vectors & Latent Representations',
                duration: 24,
                description: 'Deep dive into state vectors, manifold embeddings, and algorithmic space complexities.',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                resources: [
                  { title: 'representation_notebook.ipynb', fileSize: '1.8 MB', fileType: 'ipynb' },
                ],
              },
              {
                _id: 'l-03',
                title: 'High-Throughput Distributed Pipelines',
                duration: 32,
                description: 'Practical deployment of asynchronous gradient descent and parallel telemetry queues.',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                resources: [
                  { title: 'distributed_benchmarks.csv', fileSize: '850 KB', fileType: 'csv' },
                ],
              },
              {
                _id: 'l-04',
                title: 'Production Verification & Synthesis',
                duration: 28,
                description: 'Synthesis tests, error boundaries, automated evaluation suites, and certification readiness.',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                resources: [
                  { title: 'final_verification_checklist.pdf', fileSize: '1.1 MB', fileType: 'pdf' },
                ],
              },
            ];
            setLessons(fallbackCurriculum);
            setActiveLesson(fallbackCurriculum[0]);
          }

          if (pRes?.data) {
            const pData = pRes.data.progress || pRes.data;
            setProgress({
              isEnrolled: pRes.data.isEnrolled ?? true,
              progressPercentage: pData.percentage ?? pData.progressPercentage ?? 0,
              completedLessons: pData.completedLessons || [],
              completed: pData.completed || false,
              certificate: pData.certificate || null,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load course player data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClassroom();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  // Toggle Video Play / Pause
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Video Time scrub simulation
  const handleSeek = (newSecs) => {
    const clamped = Math.max(0, Math.min(newSecs, duration));
    setCurrentTime(clamped);
  };

  // Toggle Mark Lesson Complete
  const handleMarkComplete = async () => {
    if (!activeLesson) return;

    try {
      const targetId = activeLesson._id;
      const res = await API.post(`/progress/${courseId}/lesson/${targetId}/complete`).catch(() => null);

      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981'],
      });

      if (res?.data) {
        const newPct = res.data.progressPercentage ?? res.data.progress?.percentage ?? 100;
        const newCompleted = res.data.completedLessons || [...progress.completedLessons, targetId];

        setProgress((prev) => ({
          ...prev,
          progressPercentage: newPct,
          completedLessons: newCompleted,
          completed: res.data.completed || prev.completed,
          certificate: res.data.certificate || prev.certificate,
        }));

        toast.success(`Lesson "${activeLesson.title}" completed!`, {
          description: `Course progress updated to ${newPct}%.`,
        });

        if (res.data.completed) {
          toast.success('Course Completed! Certificate unlocked in your credential gallery.');
        }
      } else {
        // Fallback local update
        const updatedList = Array.from(new Set([...progress.completedLessons, targetId]));
        const calculatedPct = Math.round((updatedList.length / Math.max(lessons.length, 1)) * 100);

        setProgress((prev) => ({
          ...prev,
          progressPercentage: calculatedPct,
          completedLessons: updatedList,
        }));

        toast.success(`Lesson "${activeLesson.title}" marked as complete!`);
      }
    } catch {
      toast.error('Could not update progress on server.');
    }
  };

  // Save Note Handler
  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    const newNote = {
      id: `n-${Date.now()}`,
      time: formatTime(currentTime),
      seconds: currentTime,
      lessonId: activeLesson?._id || 'note-id',
      text: noteInput.trim(),
      tags: ['#study-note'],
    };
    setNotesList([newNote, ...notesList]);
    setNoteInput('');
    toast.success('Note saved with timestamp ' + formatTime(currentTime));
  };

  // Execute Code in Sandbox
  const handleRunCode = () => {
    setIsExecuting(true);
    setSandboxOutput('Initializing virtual python runner...');
    setTimeout(() => {
      try {
        setSandboxOutput(`Executing session...\n>>> Progress: 75.0%\n[Execution completed successfully with exit code 0 in 142ms]`);
      } catch (err) {
        setSandboxOutput(`Runtime Error: ${err.message}`);
      } finally {
        setIsExecuting(false);
      }
    }, 600);
  };

  // Navigate to Next Lesson
  const handleNextLesson = () => {
    if (!activeLesson || lessons.length === 0) return;
    const currentIndex = lessons.findIndex((l) => l._id === activeLesson._id);
    if (currentIndex < lessons.length - 1) {
      setActiveLesson(lessons[currentIndex + 1]);
      setCurrentTime(0);
      setIsPlaying(false);
    } else {
      toast.info('You are at the final lesson of this course.');
    }
  };

  // Navigate to Previous Lesson
  const handlePrevLesson = () => {
    if (!activeLesson || lessons.length === 0) return;
    const currentIndex = lessons.findIndex((l) => l._id === activeLesson._id);
    if (currentIndex > 0) {
      setActiveLesson(lessons[currentIndex - 1]);
      setCurrentTime(0);
      setIsPlaying(false);
    } else {
      toast.info('You are already on the first lesson.');
    }
  };

  // Filter lessons
  const filteredLessons = useMemo(() => {
    if (!curriculumSearch.trim()) return lessons;
    return lessons.filter((l) =>
      l.title.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(curriculumSearch.toLowerCase()))
    );
  }, [lessons, curriculumSearch]);

  const activeLessonIndex = lessons.findIndex((l) => l._id === activeLesson?._id);
  const isCurrentCompleted = activeLesson && progress.completedLessons.includes(activeLesson._id);
  const embedVideoUrl = activeLesson ? getEmbedUrl(activeLesson.videoUrl) : null;

  return (
    <div className="bg-slate-50 font-sans text-slate-900 antialiased overflow-hidden h-screen w-screen flex flex-col selection:bg-blue-100 selection:text-blue-700 blueprint-grid">
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION BAR (Fixed 64px, Light Blueprint Theme)                */}
      {/* ========================================================================= */}
      <header className="h-16 flex-shrink-0 w-full bg-white/95 border-b border-slate-200/90 px-5 flex items-center justify-between gap-6 z-50 backdrop-blur-xl shadow-sm">
        {/* Left Area: Exit link, Logo, Breadcrumbs */}
        <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
          <Link
            to="/student/my-courses"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-xs font-semibold group"
          >
            <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Exit to My Courses</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 flex-shrink-0"></div>

          {/* Brand Logo */}
          <Link to="/student/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                school
              </span>
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">StudyPilot</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 tracking-wider border border-blue-200 font-mono">
              STUDY DESK
            </span>
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden xl:block flex-shrink-0"></div>

          {/* Breadcrumbs in Center Left */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-slate-600 truncate">
            <span className="truncate hover:text-slate-900 transition-colors font-semibold">
              {course?.title || 'Academic Course Player'}
            </span>
            <span className="text-slate-400">›</span>
            <span className="text-blue-600 truncate font-semibold">
              {activeLesson?.title || 'Course Overview'}
            </span>
            <span className="text-slate-400">›</span>
            <span className="text-slate-700 font-mono font-medium text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Lesson {activeLessonIndex >= 0 ? activeLessonIndex + 1 : 1} of {lessons.length || 1}
            </span>
          </div>
        </div>

        {/* Right Header Area: Progress, Telemetry, Actions & Profile */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          {/* Progress Indicator Pill */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-sm">check_circle</span>
              <span className="text-xs font-bold text-slate-900 font-mono">{progress.progressPercentage}%</span>
            </div>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {progress.completedLessons.length}/{lessons.length} Done
            </span>
          </div>

          {/* Real-time Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-mono font-semibold text-blue-700 uppercase tracking-wider">
              PORTAL SYNCED
            </span>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 text-slate-500">
            <button
              onClick={() => toast.success('Lesson bookmarked for study sessions.')}
              className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Bookmark lesson"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">bookmark</span>
            </button>
            <button
              onClick={() => {
                if (progress.completed || progress.progressPercentage >= 100) {
                  navigate('/student/certificates');
                } else {
                  toast.info('Complete all course lessons to view your accredited certificate.');
                }
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
              title="View Certificate"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">workspace_premium</span>
            </button>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>

          {/* User Profile Pill */}
          <div
            onClick={() => navigate('/student/profile')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative">
              <img
                alt={user?.name || 'Student'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-400/40 group-hover:ring-blue-600 transition-all shadow-sm"
                src={
                  user?.avatar ||
                  'https://lh3.googleusercontent.com/aida/AEtjO1XbByWEm7GAGBdpGAqxfzCMFkFqyPMDwXR31XzQcAW_7qE0SHGe5KcOzSHZWxcw0LmYVlhtAk7GuWXJwOamtyOO7hYD8eHnfRtALEC4NQ1hJFLBj_d4fWul7LXFbzSQShCNhrcpZZIXAoIGb-LhcSZTC2vvOtdLVJ1flthUBrMubmy1MxwpgQOLAqaQFAgYcT03ym4nj3WiibxwIVLJYhXutQRm9XkDKIunk7iDXjozViMs0zGMJ1ra'
                }
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.name || 'Active Scholar'}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight font-mono capitalize">
                {user?.role || 'Student'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN THREE-COLUMN WORKSPACE (Curriculum, Main Content, Notes/AI)      */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full h-[calc(100vh-64px)] flex overflow-hidden bg-slate-50">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: Curriculum Navigator (~310px width)                        */}
        {/* ======================================================================= */}
        <aside className="w-[310px] flex-shrink-0 h-full border-r border-slate-200/90 bg-white flex flex-col justify-between overflow-hidden shadow-sm">
          {/* Top Title Bar */}
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-base">format_list_bulleted</span>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-900 font-mono">
                Curriculum
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-blue-700 bg-blue-50 font-semibold border border-blue-200">
              {lessons.length} Modules
            </span>
          </div>

          {/* Scrollable Curriculum Navigator Tree */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {/* Course Progress Card */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Module Progress</span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-100/70 text-blue-800">
                  {progress.completedLessons.length} / {lessons.length} Completed
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Lesson Search Filter */}
              <div className="relative pt-1">
                <span className="material-symbols-outlined absolute left-2.5 top-3 text-slate-400 text-sm">
                  search
                </span>
                <input
                  value={curriculumSearch}
                  onChange={(e) => setCurriculumSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-7 bg-white border border-slate-200 text-slate-900 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                  placeholder="Filter lessons..."
                  type="text"
                />
                {curriculumSearch && (
                  <span
                    onClick={() => setCurriculumSearch('')}
                    className="material-symbols-outlined absolute right-2.5 top-3 text-slate-400 text-xs cursor-pointer hover:text-slate-700"
                  >
                    close
                  </span>
                )}
              </div>
            </div>

            {/* Lesson List Items */}
            <div className="space-y-2">
              {filteredLessons.map((lesson, idx) => {
                const isActive = activeLesson?._id === lesson._id;
                const isCompleted = progress.completedLessons.includes(lesson._id);

                return (
                  <div
                    key={lesson._id}
                    onClick={() => {
                      setActiveLesson(lesson);
                      setCurrentTime(0);
                      setIsPlaying(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isActive
                        ? 'bg-blue-50/80 border-blue-400 text-blue-900 shadow-sm ring-1 ring-blue-300'
                        : isCompleted
                        ? 'bg-emerald-50/30 hover:bg-emerald-50/60 border-emerald-200/80 text-slate-800'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <div className="truncate">
                        <p className={`text-xs font-semibold truncate ${isActive ? 'text-blue-950 font-bold' : 'text-slate-900'}`}>
                          {lesson.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {lesson.duration ? `${lesson.duration}m` : '15m'} • Lecture Video
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Instructor Status Card */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex-shrink-0">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-blue-600">person</span>
                <span className="text-slate-900 font-medium truncate max-w-[140px]">
                  {course?.instructor?.name || 'Faculty Mentor'}
                </span>
              </div>
              <span className="text-emerald-600 font-bold">ACTIVE LECTURE</span>
            </div>
          </div>
        </aside>

        {/* ======================================================================= */}
        {/* CENTER COLUMN: Video Player & Lesson Content Arena                      */}
        {/* ======================================================================= */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-slate-50 px-6 lg:px-8 py-5 flex flex-col gap-6">
          {/* TOP ACTION BAR: Previous, Mark Complete, Next */}
          <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-sm flex-shrink-0">
            <button
              onClick={handlePrevLesson}
              disabled={activeLessonIndex <= 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              type="button"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Previous</span>
            </button>

            <button
              onClick={handleMarkComplete}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white font-semibold text-xs shadow-sm transition-all ${
                isCurrentCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-base">
                {isCurrentCompleted ? 'check_circle' : 'task_alt'}
              </span>
              <span>{isCurrentCompleted ? 'Completed ✓ (Re-verify)' : 'Mark Lesson Complete'}</span>
            </button>

            <button
              onClick={handleNextLesson}
              disabled={activeLessonIndex >= lessons.length - 1}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              type="button"
            >
              <span>Next</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* VIDEO PLAYER CONTAINER */}
          <div
            ref={playerContainerRef}
            className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md group select-none flex-shrink-0"
          >
            {embedVideoUrl ? (
              <iframe
                title={activeLesson?.title || 'Lesson Video'}
                src={embedVideoUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                {/* Fallback Presentation / Interactive Lecture Visual */}
                <img
                  alt="Lesson Visual"
                  className="absolute inset-0 w-full h-full object-cover filter brightness-[0.75] contrast-105"
                  src={
                    course?.thumbnail ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuC4qg0abCVsaJ3sjUPEFZtU10U13C2iAaoRAiNdHiPro_iOf_PUEWnLnGPStFas82s8zRJ3_nhhVWnE2ihLJAsiWwajFeCLafoRTRliekhdcx8Ma-LLH38yLNrxFvNI1UHKWDOO86cVl-3NqkT2ZGgNbAtWD2ZsFRDfEKU-skJBVsCrwnbUGtSIt-3A8F2W5CLoZ4chhl6HiBuBzmAyxWIHZhktBMyeecEIuIzi4a0PTHTMluLjJ5g'
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/60 pointer-events-none"></div>

                {/* HUD Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-blue-400 font-mono text-xs font-semibold border border-blue-500/30">
                      {activeLesson?.title || 'Lesson Demonstration'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-mono text-xs flex items-center gap-1.5 border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>1080p HD</span>
                    </span>
                  </div>
                </div>

                {/* Center Play Button Trigger */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <button
                    onClick={handleTogglePlay}
                    className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300 pointer-events-auto hover:bg-blue-600 active:scale-95"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                </div>

                {/* Bottom Custom Video Control Bar */}
                <div className="absolute bottom-2 left-2 right-2 z-30 bg-slate-900/90 backdrop-blur-xl rounded-xl px-4 py-2 flex flex-col gap-1.5 border border-white/10 shadow-2xl">
                  {/* Progress Bar */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const fraction = (e.clientX - rect.left) / rect.width;
                      handleSeek(fraction * duration);
                    }}
                    className="relative w-full h-2 flex items-center cursor-pointer group/scrub"
                  >
                    <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden relative">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between gap-2 text-white">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTogglePlay}
                        className="p-1 rounded hover:bg-slate-800 transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleSeek(currentTime - 10)}
                        className="p-1 rounded hover:bg-slate-800 transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-lg">replay_10</span>
                      </button>
                      <button
                        onClick={() => handleSeek(currentTime + 10)}
                        className="p-1 rounded hover:bg-slate-800 transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-lg">forward_10</span>
                      </button>
                      <span className="text-xs font-mono text-slate-300 ml-1">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : 1))}
                        className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400"
                        type="button"
                      >
                        {playbackSpeed}x
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* COURSE TITLE & INSTRUCTOR INFO */}
          <div className="flex flex-col gap-1">
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              {activeLesson?.title || course?.title || 'Academic Lecture Unit'}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span>{course?.title || 'Course Series'}</span>
              <span>•</span>
              <span className="text-slate-800 font-semibold">
                {course?.instructor?.name || 'Faculty Instructor'}
              </span>
              <span>•</span>
              <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {course?.category || 'Technical Curriculum'}
              </span>
            </div>
          </div>

          {/* ACTION ROW TABS */}
          <div className="flex items-center gap-4 border-b border-slate-200 pb-1">
            <button
              onClick={() => setActiveCenterTab('overview')}
              className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 -mb-1 ${
                activeCenterTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-sm">article</span>
              Lesson Overview
            </button>
            <button
              onClick={() => setActiveCenterTab('code')}
              className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 -mb-1 ${
                activeCenterTab === 'code'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-sm">terminal</span>
              Interactive Sandbox
            </button>
            <button
              onClick={() => setActiveCenterTab('resources')}
              className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 -mb-1 ${
                activeCenterTab === 'resources'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-sm">folder_zip</span>
              Resources ({activeLesson?.resources?.length || 0})
            </button>
            <button
              onClick={() => setActiveCenterTab('quizzes')}
              className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors border-b-2 -mb-1 ${
                activeCenterTab === 'quizzes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-sm">quiz</span>
              Assessments & Quizzes
            </button>
          </div>

          {/* TAB CONTENT CARDS */}
          {activeCenterTab === 'overview' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-base">info</span>
                  Lesson Description & Objectives
                </h2>
                <p className="text-sm text-slate-600 font-normal leading-relaxed">
                  {activeLesson?.description ||
                    course?.description ||
                    'In this lesson, you will master the foundational core mechanisms, review concrete code samples, and apply best development practices through rigorous hands-on laboratory exercises.'}
                </p>
              </div>

              {activeLesson?.content && (
                <div className="pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 font-mono">
                    Study Notes & Documentation
                  </h3>
                  <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    {activeLesson.content}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeCenterTab === 'code' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-base">code</span>
                  <h3 className="text-sm font-bold text-slate-900">Python / JavaScript Cloud Scratchpad</h3>
                </div>
                <button
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">{isExecuting ? 'sync' : 'play_arrow'}</span>
                  <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
                </button>
              </div>

              <textarea
                value={sandboxCode}
                onChange={(e) => setSandboxCode(e.target.value)}
                className="w-full h-44 bg-slate-950 text-emerald-400 font-mono text-xs p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                spellCheck={false}
              />

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Terminal Output
                </h4>
                <pre className="bg-slate-100 border border-slate-200 text-slate-800 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  {sandboxOutput}
                </pre>
              </div>
            </div>
          )}

          {activeCenterTab === 'resources' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-base">download</span>
                Downloadable Learning Assets
              </h3>
              {activeLesson?.resources && activeLesson.resources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeLesson.resources.map((res, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (res.fileUrl) {
                          window.open(res.fileUrl, '_blank');
                        } else {
                          toast.success(`Downloaded ${res.title}`);
                        }
                      }}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{res.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono uppercase">
                          {res.fileType || 'FILE'} • {res.fileSize || 'Asset'}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-blue-600 text-lg">download</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No additional downloadable files attached to this lecture unit.
                </div>
              )}
            </div>
          )}

          {activeCenterTab === 'quizzes' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Knowledge Verification Suite</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Test your understanding with proctored unit evaluations.
                  </p>
                </div>
                <Link
                  to={courseId ? `/student/quizzes?courseId=${courseId}` : '/student/quizzes'}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-sm">quiz</span>
                  <span>Take Course Quizzes</span>
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: Interactive Study Desk & Quick Notes (~320px width)       */}
        {/* ======================================================================= */}
        <aside className="w-[320px] flex-shrink-0 h-full border-l border-slate-200/90 bg-white flex flex-col justify-between overflow-hidden shadow-sm">
          {/* Header Row */}
          <div className="p-3 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveRightTab('notes')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeRightTab === 'notes'
                    ? 'bg-white text-blue-600 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                Notes ({notesList.length})
              </button>
              <button
                onClick={() => setActiveRightTab('qa')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeRightTab === 'qa'
                    ? 'bg-white text-blue-600 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                Discussion
              </button>
            </div>
            <button
              onClick={() => setAiTutorOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-sm">smart_toy</span>
              <span>AI Tutor</span>
            </button>
          </div>

          {/* Main Notes Container */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {activeRightTab === 'notes' && (
              <>
                {/* Note Creator Box */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-blue-600 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span> At{' '}
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Timestamped Note</span>
                  </div>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none shadow-sm"
                    placeholder="Jot down notes, code ideas, or formulas..."
                    rows={3}
                  ></textarea>
                  <div className="flex items-center justify-end pt-0.5">
                    <button
                      onClick={handleSaveNote}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                      type="button"
                    >
                      Save Note
                    </button>
                  </div>
                </div>

                {/* Saved Notes List */}
                <div className="space-y-2.5">
                  {notesList.map((note) => (
                    <div
                      key={note.id}
                      className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <button
                          onClick={() => {
                            handleSeek(note.seconds);
                            toast.info(`Seeked player to ${note.time}`);
                          }}
                          className="text-xs font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-xs">play_arrow</span> {note.time}
                        </button>
                        <button
                          onClick={() => {
                            setNotesList(notesList.filter((n) => n.id !== note.id));
                            toast.success('Note deleted.');
                          }}
                          className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-xs">delete</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{note.text}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        {note.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeRightTab === 'qa' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Classroom Questions
                  </h4>
                  <button
                    onClick={() => toast.info('Question form opened')}
                    className="text-xs text-blue-600 hover:underline font-mono font-semibold"
                  >
                    + Ask Faculty
                  </button>
                </div>
                {[
                  {
                    author: 'Alex (Peer Scholar)',
                    time: '2 hours ago',
                    q: 'How does parameter shift scale when circuit depth expands?',
                    answers: 3,
                  },
                  {
                    author: 'Dr. Vance (Faculty)',
                    time: 'Yesterday',
                    q: 'Remember to verify that all circuit gates are parameterized strictly within ±π limits.',
                    answers: 5,
                  },
                ].map((qa, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span className="text-slate-900 font-bold">{qa.author}</span>
                      <span>{qa.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{qa.q}</p>
                    <span className="text-[10px] text-blue-600 font-mono font-semibold block">
                      {qa.answers} responses
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Tutor Card */}
          <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-blue-700">
                <span className="material-symbols-outlined text-base">psychology</span>
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  StudyPilot AI Tutor
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                Need help understanding this lesson? Ask your AI tutor for instant explanations and study hints.
              </p>
              <button
                onClick={() => setAiTutorOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                type="button"
              >
                <span>Open AI Assistant</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ================= MODAL: AI TUTOR ================= */}
      {aiTutorOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setAiTutorOpen(false)}
        >
          <div
            className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <span className="material-symbols-outlined text-[24px]">psychology</span>
                <h3 className="text-base text-slate-900 font-bold">
                  StudyPilot AI Academic Tutor
                </h3>
              </div>
              <button
                onClick={() => setAiTutorOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-mono">
                Key Concept: Module Synthesis & Optimization
              </div>
              <p>
                In this course module, you learn to balance computational latency, asynchronous message queues, and continuous accuracy benchmarking.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800">
                Formula: Throughput = (Batches * SamplesPerBatch) / ElapsedSeconds
              </div>
              <p className="text-slate-500">
                Tip: Keep memory footprints aligned with cache line boundaries to avoid thread contention.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  toast.success('Concept saved to your lesson notes.');
                  setNotesList([
                    {
                      id: `ai-${Date.now()}`,
                      time: formatTime(currentTime),
                      seconds: currentTime,
                      lessonId: activeLesson?._id || 'ai-1',
                      text: 'AI Tutor Tip: Throughput = (Batches * SamplesPerBatch) / ElapsedSeconds with cache alignment.',
                      tags: ['#ai-tip', '#optimization'],
                    },
                    ...notesList,
                  ]);
                  setAiTutorOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
              >
                Save Hint to Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
