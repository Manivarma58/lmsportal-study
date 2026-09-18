import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  BookOpen,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  AlertTriangle,
  ExternalLink,
  Users,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState([]);
  const [previewCourse, setPreviewCourse] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/courses', {
        params: {
          keyword: keyword.trim() || undefined,
          status: statusFilter !== 'All' ? statusFilter.toLowerCase() : undefined,
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          limit: 100,
          includeUnpublished: true,
        },
      });
      setCourses(res.data.courses || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to fetch catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    const loadCategories = async () => {
      try {
        const res = await API.get('/courses/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        // Optional
      }
    };
    loadCategories();
  }, [statusFilter, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleTogglePublish = async (courseId) => {
    try {
      const res = await API.patch(`/courses/${courseId}/publish`);
      toast.success(res.data.message || 'Course status updated');
      setCourses((prev) =>
        prev.map((c) => {
          if (c._id === courseId) {
            const nextStatus = !(c.published || c.isPublished);
            return { ...c, published: nextStatus, isPublished: nextStatus };
          }
          return c;
        })
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle publication status');
    }
  };

  const confirmDeleteCourse = async () => {
    if (!deleteModal) return;
    try {
      await API.delete(`/courses/${deleteModal._id}`);
      toast.success(`Course "${deleteModal.title}" permanently removed`);
      setCourses((prev) => prev.filter((c) => c._id !== deleteModal._id));
      setDeleteModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-rose-600" />
            Course Moderation & Catalog Control
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Audit platform curriculum, publish/unpublish offerings, and remove inappropriate content. ({courses.length} courses loaded)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by title or tags..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 transition-all text-slate-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft / Unpublished</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={() => { setKeyword(''); setStatusFilter('All'); setCategoryFilter('All'); }}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Course</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Instructor</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs">Loading course catalog...</p>
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No courses match filters</p>
                    <p className="text-xs mt-1">Try relaxing your search terms or status criteria.</p>
                  </td>
                </tr>
              ) : (
                courses.map((c) => {
                  const isPub = Boolean(c.published || c.isPublished);
                  return (
                    <tr
                      key={c._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 max-w-sm">
                          <img
                            src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120'}
                            alt=""
                            className="w-14 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {c.title}
                            </p>
                            <span className="text-xs text-slate-400 capitalize">
                              {c.level || 'All Levels'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {c.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={c.instructor?.avatar || c.instructor?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {c.instructor?.name || 'Instructor'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {c.isFree ? (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs uppercase font-bold">Free</span>
                        ) : (
                          `$${c.price || 0}`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            isPub
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {isPub ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Published
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-amber-500" /> Draft
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewCourse(c)}
                            title="Preview Course Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/course/${c._id}`}
                            target="_blank"
                            title="Open Course Page"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(c._id)}
                            title={isPub ? 'Unpublish Course' : 'Publish Course'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isPub
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            }`}
                          >
                            {isPub ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteModal(c)}
                            title="Delete Inappropriate Course"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Course Inspection
              </h3>
              <button
                onClick={() => setPreviewCourse(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={previewCourse.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
              alt=""
              className="w-full h-44 rounded-xl object-cover"
            />

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                {previewCourse.category}
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {previewCourse.title}
              </h4>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                {previewCourse.description || 'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Instructor:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {previewCourse.instructor?.name || 'Unassigned'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400">Status & Price:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {previewCourse.published || previewCourse.isPublished ? 'Published' : 'Draft'} • {previewCourse.isFree ? 'Free' : `$${previewCourse.price}`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewCourse(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <Link
                to={`/course/${previewCourse._id}`}
                target="_blank"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-colors flex items-center gap-1.5"
              >
                View Public Page <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Inappropriate Course?
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You are about to delete <strong className="text-slate-800 dark:text-slate-200">"{deleteModal.title}"</strong>. This will purge all associated curriculum lessons, student enrollments, and quiz references. This action is immediate and cannot be recovered.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCourse}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
