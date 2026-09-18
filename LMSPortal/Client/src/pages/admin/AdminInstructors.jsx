import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import {
  UserCheck,
  Search,
  BookOpen,
  Users,
  UserX,
  Trash2,
  Filter,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

const AdminInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users/instructors', {
        params: {
          keyword: keyword.trim() || undefined,
          status: statusFilter !== 'All' ? statusFilter.toLowerCase() : undefined,
          page,
          limit: 15,
        },
      });
      setInstructors(res.data.instructors || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to fetch instructors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, [statusFilter, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInstructors();
  };

  const handleToggleStatus = async (instructorId) => {
    try {
      const res = await API.patch(`/users/${instructorId}/status`);
      toast.success(res.data.message);
      setInstructors((prev) =>
        prev.map((inst) =>
          inst._id === instructorId ? { ...inst, isActive: res.data.isActive } : inst
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleRoleChange = async (instructorId, newRole) => {
    try {
      await API.patch(`/users/${instructorId}/role`, { role: newRole });
      toast.success(`Instructor role changed to ${newRole}`);
      // Remove from instructor list if changed to non-instructor
      if (newRole !== 'instructor') {
        setInstructors((prev) => prev.filter((inst) => inst._id !== instructorId));
        setTotalCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteInstructor = async (instructorId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete instructor "${name}"?`)) return;
    try {
      await API.delete(`/users/${instructorId}`);
      toast.success('Instructor deleted successfully');
      setInstructors((prev) => prev.filter((inst) => inst._id !== instructorId));
      setTotalCount((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete instructor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-500" />
            Instructor Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor educator roster, verify teaching credentials, track course authoring volume, and moderate instructor accounts. ({totalCount} instructors registered)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search instructor name or email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <button
            onClick={() => { setKeyword(''); setStatusFilter('All'); setPage(1); }}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Instructors Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Instructor</th>
                <th className="py-3.5 px-4 font-semibold">Courses Authored</th>
                <th className="py-3.5 px-4 font-semibold">Student Reach</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs">Loading instructors roster...</p>
                  </td>
                </tr>
              ) : instructors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No instructors found</p>
                    <p className="text-xs mt-1">Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : (
                instructors.map((inst) => {
                  const isActive = inst.isActive !== false;
                  return (
                    <tr
                      key={inst._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={inst.avatar || inst.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {inst.name}
                            </p>
                            <p className="text-xs text-slate-400">{inst.email}</p>
                            {inst.headline && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {inst.headline}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          <BookOpen className="w-4 h-4 text-purple-500" />
                          <span>{inst.coursesCount || 0}</span>
                          <span className="text-xs text-slate-400 font-normal">
                            ({inst.publishedCoursesCount || 0} live)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          <Users className="w-4 h-4 text-sky-500" />
                          <span>{inst.studentsCount || 0}</span>
                          <span className="text-xs text-slate-400 font-normal">
                            ({inst.enrollmentsCount || 0} enrollments)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(inst.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={inst.role}
                            onChange={(e) => handleRoleChange(inst._id, e.target.value)}
                            className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none outline-none cursor-pointer"
                          >
                            <option value="instructor">Instructor</option>
                            <option value="student">Demote to Student</option>
                            <option value="admin">Promote to Admin</option>
                          </select>
                          <button
                            onClick={() => handleToggleStatus(inst._id)}
                            title={isActive ? 'Suspend Instructor' : 'Activate Instructor'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            }`}
                          >
                            {isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteInstructor(inst._id, inst.name)}
                            title="Delete Account"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages} ({totalCount} instructors total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInstructors;
