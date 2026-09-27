import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import NotificationDrawer from '../components/NotificationDrawer';
import FloatingAIMentor from '../components/FloatingAIMentor';
import ErrorBoundary from '../components/ErrorBoundary';
import { toast } from 'sonner';

const StudentLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student/courses?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const coreNavItems = [
    { to: '/student/dashboard', label: 'Dashboard', icon: 'dashboard', dot: true },
    { to: '/student/progress', label: 'Skills & Progress', icon: 'psychology' },
    { to: '/student/skill-gap', label: 'Skill Gap Analyzer', icon: 'insights' },
    { to: '/student/adaptive-learning', label: 'Adaptive Remediation', icon: 'auto_fix_high' },
    { to: '/student/challenges', label: 'Coding Lab', icon: 'terminal' },
    { to: '/student/projects', label: 'Projects', icon: 'rocket_launch' },
    { to: '/student/simulations', label: 'Job Simulations', icon: 'work' },
    { to: '/student/assignments', label: 'Assignments', icon: 'assignment' },
    { to: '/student/portfolio', label: 'Skill Portfolio', icon: 'badge' },
    { to: '/student/my-courses', label: 'My Enrolled Courses', icon: 'menu_book' },
    { to: '/student/courses', label: 'Course Discovery', icon: 'explore' },
    { to: '/student/quizzes', label: 'Quizzes', icon: 'quiz' },
    { to: '/student/certificates', label: 'Certificates', icon: 'workspace_premium' },
  ];

  const commsNavItems = [
    { to: '/student/chat', label: 'Messages', icon: 'forum', badge: '3', badgeColor: 'bg-secondary-container text-on-secondary-container' },
    {
      to: '/student/notifications',
      label: 'Notifications',
      icon: 'notifications',
      badge: unreadCount > 0 ? String(unreadCount) : null,
      badgeColor: 'bg-tertiary-container text-on-tertiary-container',
    },
  ];

  const systemNavItems = [
    { to: '/student/setting', label: 'Settings', icon: 'settings' },
    { to: '/student/profile', label: 'Profile', icon: 'person' },
  ];

  const renderNavGroup = (items, isMobile = false, onNavigate = null) => {
    return items.map((item) => {
      const isActive = location.pathname === item.to || (item.to !== '/student/dashboard' && location.pathname.startsWith(item.to));
      return (
        <NavLink
          key={item.label}
          to={item.to}
          onClick={onNavigate}
          className={`flex items-center justify-between ${
            isMobile ? 'px-3 py-2 rounded-lg text-sm' : 'px-space-md py-2 rounded-lg'
          } transition-all ${
            isActive
              ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200/80 shadow-sm'
              : 'text-slate-600 font-medium hover:bg-slate-100/80 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isActive && item.dot && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]"></span>
            )}
            {item.badge && !isActive && (
              <span
                className={`font-code-md text-label-sm px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}
              >
                {item.badge}
              </span>
            )}
          </div>
        </NavLink>
      );
    });
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-body-md antialiased min-h-screen blueprint-grid">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 xl:w-72 bg-white z-50 flex-col justify-between border-r border-slate-200/80 shadow-sm transition-all duration-200">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Header */}
          <div className="h-16 px-space-md flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shrink-0">
            <Link to="/student/dashboard" className="flex items-center gap-3 group min-w-0 overflow-hidden">
              <img
                alt="Nova LMS Logo"
                className="h-10 w-10 shrink-0 object-contain group-hover:scale-105 transition-transform"
                src="/nova-icon.png"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/nova-icon.png';
                }}
              />
              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight leading-none font-sans">
                  Nova <span className="text-blue-600">LMS</span>
                </span>
                <div
                  className="overflow-hidden w-full max-w-[190px] mt-1 relative [mask-image:linear-gradient(to_right,black_85%,transparent)]"
                  title="Nova Next-Gen Outcome-based Virtual Academy"
                >
                  <div className="animate-marquee-roll text-[10.5px] text-blue-600 font-semibold tracking-wide whitespace-nowrap">
                    <span>Nova Next-Gen Outcome-based Virtual Academy&nbsp;•&nbsp;</span>
                    <span>Nova Next-Gen Outcome-based Virtual Academy&nbsp;•&nbsp;</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Categorized Navigation List */}
          <nav className="flex-1 overflow-y-auto px-space-sm py-space-sm space-y-space-md">
            {/* Category 1: Core Portal */}
            <div className="space-y-1">
              <div className="px-space-md py-1 font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Core Portal
              </div>
              {renderNavGroup(coreNavItems)}
            </div>

            {/* Category 2: Communications */}
            <div className="space-y-1">
              <div className="px-space-md py-1 font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Communications
              </div>
              {renderNavGroup(commsNavItems)}
            </div>

            {/* Category 3: Identity & System */}
            <div className="space-y-1">
              <div className="px-space-md py-1 font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Identity & System
              </div>
              {renderNavGroup(systemNavItems)}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-space-md py-2 rounded-lg text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-all font-label-lg text-label-lg cursor-pointer text-left group"
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[20px] text-error group-hover:scale-110 transition-transform">logout</span>
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

      </aside>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl p-4 flex flex-col justify-between border-r border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto">
              <div className="h-16 flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img alt="Nova LMS Logo" className="h-8 w-8 object-contain shrink-0" src="/nova-icon.png" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-slate-900 text-base leading-none">Nova <span className="text-blue-600">LMS</span></span>
                    <div className="overflow-hidden w-40 whitespace-nowrap mt-0.5 [mask-image:linear-gradient(to_right,black_85%,transparent)]">
                      <div className="animate-marquee-roll text-[9.5px] text-blue-600 font-semibold">
                        <span>Nova Next-Gen Outcome-based Virtual Academy&nbsp;•&nbsp;</span>
                        <span>Nova Next-Gen Outcome-based Virtual Academy&nbsp;•&nbsp;</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="px-3 py-1 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Core Portal
                  </div>
                  {renderNavGroup(coreNavItems, true, () => setMobileMenuOpen(false))}
                </div>

                <div className="space-y-1">
                  <div className="px-3 py-1 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Communications
                  </div>
                  {renderNavGroup(commsNavItems, true, () => setMobileMenuOpen(false))}
                </div>

                <div className="space-y-1">
                  <div className="px-3 py-1 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Identity & System
                  </div>
                  {renderNavGroup(systemNavItems, true, () => setMobileMenuOpen(false))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOP HEADER ================= */}
      <div className="pl-0 md:pl-64 xl:pl-72 flex flex-col min-h-screen w-full min-w-0 transition-all duration-200">
        <header className="fixed top-0 left-0 md:left-64 xl:left-72 right-0 h-16 bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/80 z-40 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-200">
          {/* Left: Mobile Toggle & Search */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 shrink-0"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="relative w-full min-w-0 flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 h-10 pl-9 pr-12 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 font-body-sm text-xs sm:text-sm focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
                placeholder="Search courses, assignments, labs..."
                type="text"
              />
              <div className="absolute right-2.5 hidden sm:flex items-center">
                <kbd className="font-code-md text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded text-[10px]">
                  ⌘K
                </kbd>
              </div>
            </form>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Notifications Button */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer border border-transparent hover:border-slate-200"
              type="button"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_6px_#2563eb]"></span>
            </button>

            {/* Theme Toggle (Aesthetic) */}
            <button
              onClick={() => toast.info('Light Cyber-Academic Terminal Mode is active.')}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer border border-transparent hover:border-slate-200"
              type="button"
              title="Light Mode Active"
            >
              <span className="material-symbols-outlined text-[20px]">light_mode</span>
            </button>

            {/* Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-space-sm pl-space-sm group cursor-pointer focus:outline-none"
                type="button"
                title="Account Menu"
              >
                <div className="relative">
                  {user?.avatar ? (
                    <img
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover shadow-[0_0_12px_rgba(192,193,255,0.2)] border border-primary/30 group-hover:scale-105 transition-transform"
                      src={user.avatar}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-surface"></span>
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="font-label-lg text-xs font-bold text-on-surface leading-tight">
                    {user?.name || 'Student'}
                  </span>
                  <span className="font-label-sm text-[10px] text-primary capitalize font-medium">
                    {user?.role || 'Student'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-on-surface transition-colors">
                  expand_more
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  ></div>
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user?.name || 'Student Scholar'}
                      </p>
                      <p className="font-mono text-xs text-slate-400 truncate">
                        {user?.email || 'scholar@nova.edu'}
                      </p>
                      <span className="inline-block mt-1 font-mono text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase font-semibold border border-blue-200/60">
                        NODE: {user?.role || 'STUDENT'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/student/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/student/setting"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        <span>Settings</span>
                      </Link>

                      <Link
                        to="/student/notifications"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">notifications</span>
                        <span>Notification Center</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Notification Drawer Component */}
        <NotificationDrawer
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        {/* Content Viewport */}
        <main className="relative pt-16 w-full min-h-screen bg-background min-w-0 flex-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Global Floating AI Mentor Widget */}
        <FloatingAIMentor />
      </div>
    </div>
  );
};

export default StudentLayout;