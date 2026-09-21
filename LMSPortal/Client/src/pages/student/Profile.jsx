import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { updateProfile } from '../../store/slices/authSlice';
import API from '../../services/api';
import { toast } from 'sonner';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Active Tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [competencyFilter, setCompetencyFilter] = useState('');

  // Data state
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State initialized with user data
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Academic Scholar',
    headline: user?.headline || 'Cyber-Academic Engineering & Computer Science Scholar',
    bio:
      user?.bio ||
      'Dedicated scholar exploring modern software engineering, cloud computing, artificial intelligence, and cybersecurity.',
    email: user?.email || 'scholar@consortium.nova.edu',
    affiliation: 'NOVA Institute of Technology',
    location: 'Active Student Node',
    avatar:
      user?.avatar ||
      user?.profileImage ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [enrollRes, certRes] = await Promise.allSettled([
          API.get('/enrollments/my-courses'),
          API.get('/certificates/student/my-certificates'),
        ]);

        if (isMounted) {
          if (enrollRes.status === 'fulfilled') {
            const raw = enrollRes.value.data?.enrollments || [];
            setEnrollments(raw.filter((e) => Boolean(e.course)));
          }
          if (certRes.status === 'fulfilled') {
            setCertificates(certRes.value.data?.certificates || []);
          }
        }
      } catch (err) {
        console.warn('Failed to load profile data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update profile from redux if user changes
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        headline: user.headline || prev.headline,
        bio: user.bio || prev.bio,
        email: user.email || prev.email,
        avatar: user.avatar || user.profileImage || prev.avatar,
      }));
    }
  }, [user]);

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(
        updateProfile({
          name: profileForm.name,
          headline: profileForm.headline,
          bio: profileForm.bio,
          avatar: profileForm.avatar,
        })
      ).unwrap();

      toast.success('Profile updated successfully!');
      setEditModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    toast.success('Profile link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Metrics
  const totalEnrolled = enrollments.length;
  const completedEnrollments = enrollments.filter(
    (e) => e.completed || (e.completionPercentage ?? e.progressPercentage ?? 0) === 100
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

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-16">
      {/* ================= HERO PROFILE BANNER ================= */}
      <section className="relative w-full bg-white border-b border-slate-200/90 shadow-sm overflow-hidden">
        {/* Banner Graphic Header */}
        <div className="relative w-full h-48 md:h-56 bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-4 right-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-mono text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ACTIVE SCHOLAR
            </span>
          </div>
        </div>

        {/* Profile Card Header Info */}
        <div className="relative px-6 sm:px-8 lg:px-10 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Avatar & Names */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-white shadow-xl ring-4 ring-white shrink-0 border border-slate-200">
                  <img
                    className="w-full h-full object-cover"
                    alt={profileForm.name}
                    src={profileForm.avatar}
                  />
                </div>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all"
                  title="Change Avatar"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {profileForm.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/70">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    {user?.role ? user.role.toUpperCase() : 'STUDENT'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-600 max-w-xl">
                  {profileForm.headline}
                </p>
                <span className="text-xs text-slate-400 font-mono">{profileForm.email}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setEditModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                <span>Edit Profile</span>
              </button>
              <button
                onClick={handleShareProfile}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copiedLink ? 'done' : 'share'}
                </span>
                <span>{copiedLink ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Bio statement */}
          <div className="mt-6 max-w-3xl">
            <p className="text-sm text-slate-600 leading-relaxed">{profileForm.bio}</p>
          </div>
        </div>
      </section>

      {/* ================= REAL METRIC STRIP ================= */}
      <section className="px-6 sm:px-8 lg:px-10 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase">Enrolled Courses</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalEnrolled}</p>
            <span className="text-[11px] text-slate-400 font-mono">Curricula registered</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-emerald-600 uppercase">Completed</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{completedEnrollments.length}</p>
            <span className="text-[11px] text-slate-400 font-mono">Programs finished</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-amber-600 uppercase">Certificates</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{certificates.length}</p>
            <span className="text-[11px] text-slate-400 font-mono">Verifiable diplomas</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-indigo-600 uppercase">Avg. Completion</span>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{avgProgress}%</p>
            <span className="text-[11px] text-slate-400 font-mono">Overall curriculum</span>
          </div>
        </div>
      </section>

      {/* ================= TABS ================= */}
      <section className="px-6 sm:px-8 lg:px-10">
        <div className="flex items-center gap-2 border-b border-slate-200/90 pb-3">
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'courses', label: `My Courses (${totalEnrolled})`, icon: 'menu_book' },
            { id: 'certificates', label: `Certificates (${certificates.length})`, icon: 'workspace_premium' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="py-6 flex flex-col gap-8">
            {/* Active Enrolled Courses Showcase */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Current Academic Curricula</h3>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View All ({totalEnrolled}) →
                </button>
              </div>

              {enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {enrollments.slice(0, 3).map((e) => {
                    const course = e.course;
                    const prog = e.completionPercentage ?? e.progressPercentage ?? 0;
                    return (
                      <div
                        key={e._id}
                        className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                      >
                        <div>
                          <span className="text-[10px] font-mono font-semibold uppercase text-blue-600">
                            {course.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-1">{course.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">Instructor: {course.instructor?.name || 'Faculty'}</p>
                        </div>
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Progress</span>
                            <span className="font-mono font-bold text-slate-700">{prog}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${prog}%` }}></div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <Link
                              to={`/student/course/${course._id}/learn`}
                              className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                              Resume Course →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
                  <p className="text-slate-500 text-sm">No courses enrolled yet.</p>
                  <Link to="/student/courses" className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block">
                    Explore Course Catalog →
                  </Link>
                </div>
              )}
            </div>

            {/* Certificates Earned */}
            {certificates.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Verified Credentials</h3>
                  <button
                    onClick={() => setActiveTab('certificates')}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View All ({certificates.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.slice(0, 2).map((cert) => (
                    <div
                      key={cert._id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
                        </div>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                            {cert.course?.title || 'Academic Certification'}
                          </h5>
                          <span className="text-[11px] font-mono text-slate-400">
                            {cert.certificateCode || cert._id}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/student/certificates/${cert._id}`}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all shrink-0"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Courses */}
        {activeTab === 'courses' && (
          <div className="py-6">
            {enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrollments.map((e) => {
                  const course = e.course;
                  const prog = e.completionPercentage ?? e.progressPercentage ?? 0;
                  const isDone = e.completed || prog === 100;
                  return (
                    <div
                      key={e._id}
                      className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative w-full h-40 bg-slate-100">
                        <img
                          className="w-full h-full object-cover"
                          alt={course.title}
                          src={
                            course.thumbnail ||
                            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
                          }
                        />
                        {isDone && (
                          <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold">
                            COMPLETED
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex flex-col justify-between flex-1 gap-3">
                        <div>
                          <span className="text-[10px] font-mono font-semibold uppercase text-blue-600">
                            {course.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-1">{course.title}</h4>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-700">{prog}% Done</span>
                          <Link
                            to={`/student/course/${course._id}/learn`}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all"
                          >
                            {isDone ? 'Review' : 'Continue'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
                <p className="text-slate-500 text-sm">No courses enrolled yet.</p>
                <Link to="/student/courses" className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block">
                  Browse Catalog →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Certificates */}
        {activeTab === 'certificates' && (
          <div className="py-6">
            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {certificates.map((cert) => (
                  <div
                    key={cert._id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        VERIFIED
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                        {cert.course?.title || 'Academic Certification'}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1">{cert.certificateCode || cert._id}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <Link
                        to={`/student/certificates/${cert._id}`}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        View Certificate →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
                <p className="text-slate-500 text-sm">No certificates earned yet.</p>
                <p className="text-xs text-slate-400 mt-1">Complete your enrolled courses to earn verified credentials.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ================= EDIT PROFILE MODAL ================= */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Edit Scholar Profile</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline / Major</label>
                <input
                  type="text"
                  value={profileForm.headline}
                  onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
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

export default Profile;