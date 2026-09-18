import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Eye,
  BookOpen,
  SlidersHorizontal,
  DollarSign,
  Layers,
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'Web Development',
    level: 'Beginner',
    price: 0,
    isFree: false,
    thumbnail: '',
    willLearn: '',
  });

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/courses/instructor/my-courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch instructor courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleTogglePublish = async (courseId) => {
    try {
      const res = await API.patch(`/courses/${courseId}/publish`);
      toast.success(res.data.message);
      const isNowPublished = res.data.isPublished !== undefined ? res.data.isPublished : res.data.course?.published;
      setCourses((prev) =>
        prev.map((c) =>
          c._id === courseId
            ? { ...c, isPublished: isNowPublished, published: isNowPublished }
            : c
        )
      );
    } catch (err) {
      toast.error(err.message || 'Failed to toggle publish status');
    }
  };

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? All associated lessons and student enrollments will be deleted.`)) {
      return;
    }
    try {
      await API.delete(`/courses/${courseId}`);
      toast.success('Course deleted successfully');
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      return toast.error('Please enter a course title');
    }
    if (!formData.description?.trim()) {
      return toast.error('Please enter course description');
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        isFree: Number(formData.price) === 0,
        willLearn: formData.willLearn
          ? formData.willLearn.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        thumbnail:
          formData.thumbnail ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      };

      const res = await API.post('/courses', payload);
      toast.success('Course created! Now you can organize sections and lessons.');
      setShowCreateModal(false);
      setFormData({
        title: '',
        shortDescription: '',
        description: '',
        category: 'Web Development',
        level: 'Beginner',
        price: 0,
        isFree: false,
        thumbnail: '',
        willLearn: '',
      });
      navigate(`/instructor/courses/${res.data.course._id}/editor`);
    } catch (err) {
      toast.error(err.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      shortDescription: course.shortDescription || '',
      description: course.description || '',
      category: course.category || 'Web Development',
      level: course.level || 'Beginner',
      price: course.price || 0,
      isFree: course.isFree || false,
      thumbnail: course.thumbnail || '',
      willLearn: Array.isArray(course.willLearn) ? course.willLearn.join(', ') : '',
    });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      return toast.error('Course title is required');
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        isFree: Number(formData.price) === 0,
        willLearn: formData.willLearn
          ? formData.willLearn.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const res = await API.put(`/courses/${editingCourse._id}`, payload);
      toast.success('Course details updated successfully!');
      setCourses((prev) =>
        prev.map((c) => (c._id === editingCourse._id ? res.data.course : c))
      );
      setEditingCourse(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Curriculum Course Management
          </h1>
          <p className="text-sm text-slate-500">
            Author new learning modules, edit existing syllabi, manage lessons and configure pricing.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: '',
              shortDescription: '',
              description: '',
              category: 'Web Development',
              level: 'Beginner',
              price: 0,
              isFree: false,
              thumbnail: '',
              willLearn: '',
            });
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-102 self-start sm:self-auto text-xs"
        >
          <Plus className="w-4 h-4" /> Create Course
        </button>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 min-h-[300px]">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 mt-3 font-medium">Fetching your courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No courses in your catalog yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Start inspiring students worldwide by drafting and publishing your first program.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md"
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => {
            const isPub = Boolean(c.published || c.isPublished);
            return (
              <div
                key={c._id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm ${
                        isPub
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-900/80 text-slate-200'
                      }`}
                    >
                      {isPub ? 'Published' : 'Draft'}
                    </span>
                    <span className="absolute bottom-3 left-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-white/90 text-slate-800 backdrop-blur-sm">
                      {c.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold">{c.level}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {c.isFree ? 'Free' : `$${c.price}`}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {c.shortDescription || c.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        {c.enrollmentCount || 0} students
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        {c.lessons?.length || 0} lessons
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2 pt-4">
                  {/* Left Action: Toggle Publish */}
                  <button
                    onClick={() => handleTogglePublish(c._id)}
                    title={isPub ? 'Click to unpublish (move to draft)' : 'Click to publish course'}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      isPub
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                        : 'text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {isPub ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Published
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-400" /> Draft
                      </>
                    )}
                  </button>

                  {/* Right Action Icons */}
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/course/${c._id}`}
                      target="_blank"
                      title="Public Course Preview"
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => openEditModal(c)}
                      title="Edit Course Details"
                      className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>

                    <Link
                      to={`/instructor/courses/${c._id}/editor`}
                      title="Curriculum & Quiz Builder"
                      className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDeleteCourse(c._id, c.title)}
                      title="Delete Course"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Course */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Create New Course
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter your course syllabus details. You can add video lessons and quizzes next.
            </p>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Microservices Architecture in Node.js"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
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
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Description *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Comprehensive description of the course content and objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What Will Students Learn? (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Microservices, Docker, Kafka, Resilience patterns"
                  value={formData.willLearn}
                  onChange={(e) => setFormData({ ...formData, willLearn: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Course & Add Lessons'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Course Details */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Edit Course Details
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Update metadata, descriptions, pricing, and outcomes for "{editingCourse.title}".
            </p>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
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
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Description *
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What Will Students Learn? (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.willLearn}
                  onChange={(e) => setFormData({ ...formData, willLearn: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
