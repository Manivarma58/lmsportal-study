import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateProfile } from '../../store/slices/authSlice';
import API from '../../services/api';
import { toast } from 'sonner';

const COURSE_FALLBACKS = [
  '/assets/course-cloud.jpg',
  '/assets/course-cyber.jpg',
  '/assets/course-quantum.jpg',
];

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Active Tab state
  const [activeTab, setActiveTab] = useState('overview');

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
    headline: user?.headline || 'Computer Science & Engineering Scholar',
    bio:
      user?.bio ||
      'Dedicated scholar exploring modern software engineering, cloud architecture, artificial intelligence, and cybersecurity.',
    email: user?.email || 'scholar@novalms.io',
    affiliation: 'NOVA Institute of Technology',
    location: 'Active Student',
    avatar: user?.avatar || user?.profileImage || '',
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

  // Initials for clean placeholder
  const userInitials = useMemo(() => {
    if (!profileForm.name) return 'ST';
    const parts = profileForm.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return profileForm.name.slice(0, 2).toUpperCase();
  }, [profileForm.name]);

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
    <div className="flex flex-col w-full text-slate-800 antialiased pb-16 px-6 sm:px-8 lg:px-10 py-6 gap-6">
      {/* ================= BREADCRUMBS & TOP HEADER ================= */}
      <div className="flex flex-col gap-2 pb-6 border-b border-slate-200/90">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link to="/student/dashboard" className="hover:text-blue-600 transition-colors">
            Student Portal
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Student Profile</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Profile &amp; Academic Identity
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage your personal student identity, track active coursework, and review verified credentials.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </button>
            <button
              onClick={handleShareProfile}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                {copiedLink ? 'done' : 'share'}
              </span>
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= HERO PROFILE CARD ================= */}
      <section className="relative w-full rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8">
        {/* Top accent gradient bar matching student dashboard */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
          {/* Left: Avatar + Identity Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Clean empty/image avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-200/90 shadow-sm flex items-center justify-center overflow-hidden">
                {profileForm.avatar ? (
                  <img
                    className="w-full h-full object-cover"
                    alt={profileForm.name}
                    src={profileForm.avatar}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-wider text-slate-600 font-mono">
                      {userInitials}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setEditModalOpen(true)}
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all cursor-pointer hover:scale-105"
                title="Update Avatar"
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              </button>
            </div>

            {/* User Info Details */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {profileForm.name}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/80">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  {user?.role ? user.role.toUpperCase() : 'STUDENT'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200/70">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ENROLLED
                </span>
              </div>

              <p className="text-sm font-medium text-slate-600 max-w-xl">
                {profileForm.headline}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
                  <span className="font-mono text-slate-600">{profileForm.email}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">school</span>
                  <span>NOVA Engineering Institute</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                  <span>Enrolled 2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Academic Status Badge */}
          <div className="hidden lg:flex flex-col items-end gap-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400">Student ID</span>
            <span className="text-sm font-mono font-bold text-slate-800">
              {user?._id ? `STU-${user._id.slice(-8).toUpperCase()}` : 'STU-0091'}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Status: Active Student
            </span>
          </div>
        </div>

        {/* Bio statement */}
        <div className="mt-6 pt-5 border-t border-slate-100 max-w-4xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Statement of Intent / Bio
          </span>
          <p className="text-sm text-slate-600 leading-relaxed mt-1">
            {profileForm.bio}
          </p>
        </div>
      </section>

      {/* ================= STAT CARDS (4-Column Grid, Matched with Dashboard) ================= */}
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
              {totalEnrolled - completedEnrollments.length} in progress
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
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
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

        {/* Card 3: Certificates */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certificates</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{certificates.length}</span>
            <span className="text-xs font-semibold text-amber-600 font-mono">
              {certificates.length > 0 ? 'Verified' : 'In Progress'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Diplomas</span>
            <span className="font-semibold text-slate-700">
              {certificates.length > 0 ? 'Verifiable online' : '0 unlocked'}
            </span>
          </div>
        </div>

        {/* Card 4: Average Progress */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. Completion</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">trending_up</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{avgProgress}%</span>
            <span className="text-xs font-semibold text-indigo-600 font-mono">Curriculum avg</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Pace</span>
            <span className="font-semibold text-slate-700">
              {avgProgress >= 50 ? 'Ahead of Schedule' : 'Normal Pace'}
            </span>
          </div>
        </div>
      </section>

      {/* ================= TABS NAVIGATION (Matched with My Learning / Settings) ================= */}
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
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Active Enrolled Courses Showcase */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Current Academic Curricula</h3>
              <button
                onClick={() => setActiveTab('courses')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                View All ({totalEnrolled}) →
              </button>
            </div>

            {enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrollments.slice(0, 3).map((e, idx) => {
                  const course = e.course;
                  const prog = e.completionPercentage ?? e.progressPercentage ?? 0;
                  const thumb = course.thumbnail || COURSE_FALLBACKS[idx % COURSE_FALLBACKS.length];
                  return (
                    <div
                      key={e._id}
                      className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
                        <img
                          className="w-full h-full object-cover"
                          alt={course.title}
                          src={thumb}
                          onError={(ev) => {
                            ev.currentTarget.onerror = null;
                            ev.currentTarget.src = COURSE_FALLBACKS[idx % COURSE_FALLBACKS.length];
                          }}
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-mono text-[10px] font-semibold uppercase">
                          {course.category || 'Engineering'}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{course.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Instructor: {course.instructor?.name || 'Lead Faculty'}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Progress</span>
                            <span className="font-mono font-bold text-slate-700">{prog}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${prog}%` }}></div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <Link
                              to={`/student/course/${course._id}/learn`}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              Resume Course
                              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
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
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">school</span>
                <p className="text-slate-600 text-sm font-medium">No courses enrolled yet.</p>
                <Link
                  to="/student/courses"
                  className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-flex items-center gap-1"
                >
                  Explore Course Catalog →
                </Link>
              </div>
            )}
          </div>

          {/* Certificates Showcase */}
          {certificates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Verified Credentials &amp; Diplomas</h3>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  View All ({certificates.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.slice(0, 2).map((cert) => (
                  <div
                    key={cert._id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                        <span className="material-symbols-outlined text-[26px]">workspace_premium</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {cert.course?.title || 'Academic Certification'}
                        </h5>
                        <span className="text-[11px] font-mono text-slate-500">
                          ID: {cert.certificateCode || cert._id?.slice(-8)?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/student/certificates/${cert._id}`}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all shrink-0 border border-blue-200/80"
                    >
                      View Certificate
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MY COURSES ================= */}
      {activeTab === 'courses' && (
        <div>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrollments.map((e, idx) => {
                const course = e.course;
                const prog = e.completionPercentage ?? e.progressPercentage ?? 0;
                const isDone = e.completed || prog === 100;
                const thumb = course.thumbnail || COURSE_FALLBACKS[idx % COURSE_FALLBACKS.length];
                return (
                  <div
                    key={e._id}
                    className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        alt={course.title}
                        src={thumb}
                        onError={(ev) => {
                          ev.currentTarget.onerror = null;
                          ev.currentTarget.src = COURSE_FALLBACKS[idx % COURSE_FALLBACKS.length];
                        }}
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-mono text-[10px] font-semibold uppercase">
                        {course.category || 'Course'}
                      </span>
                      {isDone && (
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-sm">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col justify-between flex-1 gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{course.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Instructor: {course.instructor?.name || 'Lead Faculty'}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Progress</span>
                          <span className="font-mono font-bold text-slate-700">{prog}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${prog}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-mono text-slate-400">
                            {isDone ? 'Finished' : 'In Progress'}
                          </span>
                          <Link
                            to={`/student/course/${course._id}/learn`}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm"
                          >
                            {isDone ? 'Review Course' : 'Continue'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">menu_book</span>
              <p className="text-slate-600 text-sm font-medium">No courses found in your curriculum record.</p>
              <Link
                to="/student/courses"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Browse Course Catalog
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: CERTIFICATES ================= */}
      {activeTab === 'certificates' && (
        <div>
          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {certificates.map((cert) => (
                <div
                  key={cert._id}
                  className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shrink-0">
                      <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200/70">
                      VERIFIED
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2">
                      {cert.course?.title || 'Academic Certification'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Issued by Nova LMS Academic Consortium</p>
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 font-mono text-[11px] text-slate-600">
                      Code: {cert.certificateCode || cert._id?.slice(-8)?.toUpperCase()}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'Issued 2025'}
                    </span>
                    <Link
                      to={`/student/certificates/${cert._id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      View Diploma
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
              <span className="material-symbols-outlined text-4xl text-amber-500 mb-2">workspace_premium</span>
              <p className="text-slate-600 text-sm font-medium">No certificates unlocked yet.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Complete all course modules and pass associated assessments with a score of 80% or higher to earn verifiable certifications.
              </p>
              <button
                onClick={() => setActiveTab('courses')}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Go to Active Courses
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= EDIT PROFILE MODAL ================= */}
      {editModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 flex flex-col gap-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">Edit Scholar Profile</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline / Academic Focus</label>
                <input
                  type="text"
                  value={profileForm.headline}
                  onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Statement of Intent / Bio</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://... (Leave empty for default avatar)"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">Leave empty to keep clean default initials.</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
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