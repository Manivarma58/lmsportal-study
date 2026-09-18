import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import {
  ArrowLeft,
  Plus,
  Video,
  FileText,
  Trash2,
  Edit2,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  ChevronUp,
  ChevronDown,
  Settings,
  Sparkles,
  Award,
  Save,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const CourseEditor = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum', 'quizzes', 'settings'

  // Lesson Modals State
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    section: 'Module 1: Foundations',
    title: '',
    duration: 10,
    videoUrl: '',
    videoType: 'youtube',
    description: '',
    isFreePreview: false,
  });

  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    passingScore: 70,
    timeLimitMinutes: 10,
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
      },
    ],
  });

  // Course Settings Form
  const [courseSettings, setCourseSettings] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'Web Development',
    level: 'Beginner',
    price: 0,
    thumbnail: '',
    willLearn: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [cRes, lRes, qRes] = await Promise.all([
        API.get(`/courses/${id}`),
        API.get(`/lessons/course/${id}`),
        API.get(`/quizzes/course/${id}`),
      ]);

      const c = cRes.data.course;
      setCourse(c);
      setLessons(lRes.data.lessons || []);
      setQuizzes(qRes.data.quizzes || []);

      setCourseSettings({
        title: c.title || '',
        shortDescription: c.shortDescription || '',
        description: c.description || '',
        category: c.category || 'Web Development',
        level: c.level || 'Beginner',
        price: c.price || 0,
        thumbnail: c.thumbnail || '',
        willLearn: Array.isArray(c.willLearn) ? c.willLearn.join(', ') : '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  /* ================= LESSON ACTIONS ================= */

  const openAddLessonModal = (defaultSection = 'Module 1: Foundations') => {
    setEditingLesson(null);
    setLessonForm({
      section: defaultSection,
      title: '',
      duration: 10,
      videoUrl: '',
      videoType: 'youtube',
      description: '',
      isFreePreview: false,
    });
    setShowLessonModal(true);
  };

  const openEditLessonModal = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      section: lesson.section || 'General',
      title: lesson.title || '',
      duration: lesson.duration || 10,
      videoUrl: lesson.videoUrl || '',
      videoType: lesson.videoType || 'youtube',
      description: lesson.description || '',
      isFreePreview: Boolean(lesson.isFreePreview),
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title?.trim()) {
      return toast.error('Please enter a lesson title');
    }

    try {
      const payload = {
        courseId: id,
        ...lessonForm,
        duration: Number(lessonForm.duration) || 10,
      };

      if (editingLesson) {
        const res = await API.put(`/lessons/${editingLesson._id}`, payload);
        toast.success('Lesson updated successfully!');
        setLessons((prev) =>
          prev.map((l) => (l._id === editingLesson._id ? res.data.lesson : l))
        );
      } else {
        const res = await API.post('/lessons', payload);
        toast.success('Lesson added to curriculum!');
        setLessons((prev) => [...prev, res.data.lesson]);
      }

      setShowLessonModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (lessonId, title) => {
    if (!window.confirm(`Are you sure you want to delete lesson "${title}"?`)) return;
    try {
      await API.delete(`/lessons/${lessonId}`);
      toast.success('Lesson removed');
      setLessons((prev) => prev.filter((l) => l._id !== lessonId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete lesson');
    }
  };

  // Reordering lessons (Move Up / Move Down)
  const handleMoveLesson = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const reordered = [...lessons];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Optimistically update local list
    setLessons(reordered);

    try {
      const lessonOrders = reordered.map((l, i) => ({
        lessonId: l._id,
        order: i + 1,
      }));

      await API.put(`/lessons/course/${id}/reorder`, { lessonOrders });
      toast.success('Curriculum order updated');
    } catch (err) {
      toast.error(err.message || 'Failed to sync lesson order');
      fetchCourseData(); // rollback
    }
  };

  /* ================= QUIZ ACTIONS ================= */

  const openAddQuizModal = () => {
    setEditingQuiz(null);
    setQuizForm({
      title: '',
      description: '',
      passingScore: 70,
      timeLimitMinutes: 10,
      questions: [
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          explanation: '',
        },
      ],
    });
    setShowQuizModal(true);
  };

  const openEditQuizModal = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title || '',
      description: quiz.description || '',
      passingScore: quiz.passingScore || 70,
      timeLimitMinutes: quiz.timeLimitMinutes || 10,
      questions:
        quiz.questions && quiz.questions.length > 0
          ? quiz.questions.map((q) => ({
              questionText: q.questionText || q.question || '',
              options: q.options || ['', '', '', ''],
              correctAnswerIndex:
                q.correctAnswerIndex !== undefined
                  ? q.correctAnswerIndex
                  : q.correctAnswer || 0,
              explanation: q.explanation || '',
            }))
          : [
              {
                questionText: '',
                options: ['', '', '', ''],
                correctAnswerIndex: 0,
                explanation: '',
              },
            ],
    });
    setShowQuizModal(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title?.trim()) {
      return toast.error('Please enter a quiz title');
    }

    // Validate at least one valid question
    const validQuestions = quizForm.questions.filter((q) => q.questionText?.trim());
    if (validQuestions.length === 0) {
      return toast.error('Please specify at least one question with question text');
    }

    try {
      const payload = {
        courseId: id,
        title: quizForm.title,
        description: quizForm.description,
        passingScore: Number(quizForm.passingScore) || 70,
        timeLimitMinutes: Number(quizForm.timeLimitMinutes) || 10,
        questions: validQuestions,
      };

      if (editingQuiz) {
        const res = await API.put(`/quizzes/${editingQuiz._id}`, payload);
        toast.success('Quiz updated successfully!');
        setQuizzes((prev) =>
          prev.map((q) => (q._id === editingQuiz._id ? res.data.quiz : q))
        );
      } else {
        const res = await API.post('/quizzes', payload);
        toast.success('Assessment quiz created!');
        setQuizzes((prev) => [...prev, res.data.quiz]);
      }

      setShowQuizModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save assessment quiz');
    }
  };

  const handleDeleteQuiz = async (quizId, title) => {
    if (!window.confirm(`Are you sure you want to delete quiz "${title}"?`)) return;
    try {
      await API.delete(`/quizzes/${quizId}`);
      toast.success('Quiz deleted successfully');
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete quiz');
    }
  };

  const addQuestionField = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          explanation: '',
        },
      ],
    }));
  };

  const removeQuestionField = (qIdx) => {
    if (quizForm.questions.length <= 1) {
      return toast.error('A quiz must have at least one question');
    }
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIdx),
    }));
  };

  /* ================= COURSE SETTINGS ================= */

  const handleSaveCourseSettings = async (e) => {
    e.preventDefault();
    if (!courseSettings.title?.trim()) {
      return toast.error('Course title is required');
    }

    try {
      setSavingSettings(true);
      const payload = {
        ...courseSettings,
        price: Number(courseSettings.price) || 0,
        isFree: Number(courseSettings.price) === 0,
        willLearn: courseSettings.willLearn
          ? courseSettings.willLearn.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const res = await API.put(`/courses/${id}`, payload);
      toast.success('Course details updated successfully!');
      setCourse(res.data.course);
    } catch (err) {
      toast.error(err.message || 'Failed to update course settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-3 font-medium">Loading course studio...</p>
      </div>
    );
  }

  // Group lessons by section
  const sections = {};
  lessons.forEach((lesson) => {
    const sec = lesson.section || 'General';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(lesson);
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/instructor/courses"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
              {course?.title}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{course?.category}</span>
              <span>•</span>
              <span>{lessons.length} Lessons</span>
              <span>•</span>
              <span>{quizzes.length} Quizzes</span>
              <span>•</span>
              <span
                className={`font-semibold ${
                  course?.published || course?.isPublished
                    ? 'text-emerald-500'
                    : 'text-amber-500'
                }`}
              >
                {course?.published || course?.isPublished ? 'Published' : 'Draft'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/course/${id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Preview Course
          </Link>

          <button
            onClick={() => openAddLessonModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Add Lesson
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'curriculum'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> Curriculum ({lessons.length})
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'quizzes'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Quizzes & Tests ({quizzes.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" /> Course Settings
        </button>
      </div>

      {/* ================= TAB 1: CURRICULUM ================= */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {Object.keys(sections).length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white">Curriculum is Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Organize your course into structured sections and add engaging video lessons.
              </p>
              <button
                onClick={() => openAddLessonModal()}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Add Your First Lesson
              </button>
            </div>
          ) : (
            Object.entries(sections).map(([sectionTitle, secLessons], sIdx) => (
              <div
                key={sectionTitle}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Section Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center">
                      {sIdx + 1}
                    </span>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {sectionTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">
                      {secLessons.length} {secLessons.length === 1 ? 'lesson' : 'lessons'}
                    </span>
                    <button
                      onClick={() => openAddLessonModal(sectionTitle)}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Lesson
                    </button>
                  </div>
                </div>

                {/* Lessons in Section */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {secLessons.map((l) => {
                    const globalIdx = lessons.findIndex((item) => item._id === l._id);
                    return (
                      <div
                        key={l._id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Reorder Arrows */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveLesson(globalIdx, -1)}
                              disabled={globalIdx === 0}
                              title="Move Lesson Up"
                              className="p-1 rounded text-slate-400 hover:text-amber-600 disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveLesson(globalIdx, 1)}
                              disabled={globalIdx === lessons.length - 1}
                              title="Move Lesson Down"
                              className="p-1 rounded text-slate-400 hover:text-amber-600 disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex-shrink-0">
                            <Video className="w-4 h-4 text-indigo-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {l.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {l.duration || 10} mins
                              </span>
                              {l.isFreePreview && (
                                <span className="text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.2 rounded text-[10px]">
                                  Free Preview
                                </span>
                              )}
                              {l.quiz && (
                                <span className="text-indigo-600 font-semibold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.2 rounded text-[10px]">
                                  Quiz Attached
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Lesson Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => openEditLessonModal(l)}
                            title="Edit Lesson Content"
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(l._id, l.title)}
                            title="Delete Lesson"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= TAB 2: QUIZZES ================= */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Course Assessments & Quizzes
              </h2>
              <p className="text-xs text-slate-500">
                Create multiple-choice knowledge checks to evaluate student comprehension.
              </p>
            </div>
            <button
              onClick={openAddQuizModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Create Assessment Quiz
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white">No Quizzes Configured</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Engage students by testing their mastery. Quizzes are auto-graded upon completion.
              </p>
              <button
                onClick={openAddQuizModal}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Build First Quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                        Passing: {quiz.passingScore}%
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {quiz.timeLimitMinutes || 10}m limit
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {quiz.description || 'Comprehensive multiple choice questions pool.'}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                      <strong>{quiz.questions?.length || 0}</strong> Questions in pool
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      to={`/student/course/${id}/quiz/${quiz._id}`}
                      target="_blank"
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Quiz
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditQuizModal(quiz)}
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                        title="Edit Quiz & Questions"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: COURSE SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 max-w-3xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Course Metadata & Publishing Settings
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Changes made here update public course listings and enrollment details.
          </p>

          <form onSubmit={handleSaveCourseSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={courseSettings.title}
                onChange={(e) =>
                  setCourseSettings({ ...courseSettings, title: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={courseSettings.category}
                  onChange={(e) =>
                    setCourseSettings({ ...courseSettings, category: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={courseSettings.level}
                  onChange={(e) =>
                    setCourseSettings({ ...courseSettings, level: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tuition Price ($ USD, 0 for free)
              </label>
              <input
                type="number"
                min="0"
                value={courseSettings.price}
                onChange={(e) =>
                  setCourseSettings({ ...courseSettings, price: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Thumbnail Image URL
              </label>
              <input
                type="url"
                value={courseSettings.thumbnail}
                onChange={(e) =>
                  setCourseSettings({ ...courseSettings, thumbnail: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Description *
              </label>
              <textarea
                rows="4"
                required
                value={courseSettings.description}
                onChange={(e) =>
                  setCourseSettings({ ...courseSettings, description: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                What Will Students Learn? (comma-separated)
              </label>
              <input
                type="text"
                value={courseSettings.willLearn}
                onChange={(e) =>
                  setCourseSettings({ ...courseSettings, willLearn: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT LESSON ================= */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Configure video lessons with duration, video stream URL, and preview access.
            </p>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Section / Module Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 1: Foundations"
                  value={lessonForm.section}
                  onChange={(e) => setLessonForm({ ...lessonForm, section: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Asynchronous Workflows"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Video Type
                  </label>
                  <select
                    value={lessonForm.videoType}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoType: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option value="youtube">YouTube Embed</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="mp4">Direct MP4 URL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Video Stream URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lesson Description / Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Key concepts, commands, and walkthrough notes for students..."
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="previewCheck"
                  checked={lessonForm.isFreePreview}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })
                  }
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="previewCheck" className="text-xs text-slate-700 dark:text-slate-300">
                  Allow Free Preview for prospective non-enrolled students
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md"
                >
                  {editingLesson ? 'Update Lesson' : 'Save Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT QUIZ ================= */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {editingQuiz ? 'Edit Assessment Quiz' : 'Assessment Quiz Builder'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Configure multiple choice question pools with automated grading thresholds.
            </p>

            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 1 Knowledge Check"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Passing Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quizForm.passingScore}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quizForm.timeLimitMinutes}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, timeLimitMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Questions Array */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Questions Pool ({quizForm.questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addQuestionField}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                {quizForm.questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        Question #{qIdx + 1}
                      </span>
                      {quizForm.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestionField(qIdx)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="Enter question statement..."
                      value={q.questionText}
                      onChange={(e) => {
                        const updated = [...quizForm.questions];
                        updated[qIdx].questionText = e.target.value;
                        setQuizForm({ ...quizForm, questions: updated });
                      }}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                    />

                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-400">
                        Select the radio button beside the correct option:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correctAnswerIndex === optIdx}
                              onChange={() => {
                                const updated = [...quizForm.questions];
                                updated[qIdx].correctAnswerIndex = optIdx;
                                setQuizForm({ ...quizForm, questions: updated });
                              }}
                              className="text-amber-500 focus:ring-amber-400 cursor-pointer"
                              title="Set as correct answer"
                            />
                            <input
                              type="text"
                              required
                              placeholder={`Option ${optIdx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...quizForm.questions];
                                updated[qIdx].options[optIdx] = e.target.value;
                                setQuizForm({ ...quizForm, questions: updated });
                              }}
                              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Answer explanation (optional)..."
                      value={q.explanation || ''}
                      onChange={(e) => {
                        const updated = [...quizForm.questions];
                        updated[qIdx].explanation = e.target.value;
                        setQuizForm({ ...quizForm, questions: updated });
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-500"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addQuestionField}
                  className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-600 hover:border-amber-400 rounded-xl text-xs font-bold transition-colors"
                >
                  + Add Another Question to Pool
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md"
                >
                  {editingQuiz ? 'Update Assessment' : 'Save Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEditor;
