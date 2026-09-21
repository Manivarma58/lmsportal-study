import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import NotificationDrawer from '../components/NotificationDrawer';

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
    { to: '/student/my-courses', label: 'My Learning', icon: 'menu_book' },
    { to: '/student/courses', label: 'Explore Courses', icon: 'explore' },
    { to: '/student/assignments', label: 'Assignments', icon: 'assignment' },
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
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 bg-white z-50 flex-col justify-between border-r border-slate-200/80 shadow-sm">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Header */}
          <div className="h-16 px-space-md flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shrink-0">
            <Link to="/student/dashboard" className="flex items-center gap-space-sm group">
              <img
                alt="Brand logo"
                className="h-8 w-auto object-contain rounded-md group-hover:scale-105 transition-transform"
                src="/assets/nova-logo.png"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://lh3.googleusercontent.com/aida/AEtjO1UgC3VTGpx9ax-r_6UpM35x8ax2iPF16pw-6-9F4A6rxNge9kMA45erC8H2iSBnyIy4xWEYwjhF9kdDro5CqtIjuKgMuwlLKS3cSbv-zeJ8-0U7T1fFSfFwgf7O0zSJfkCvo4x9ljzn45d17ujEfI92ox2cjYqT6y8xAefFjuqQBiOnY0w-EXB5FDtL6-jmJFUZVPigoqkbzdOf6LBjqJLorwHllR2p6rJaisk60SMmxcTsI_chQfBKOA';
                }}
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">
                  StudyPilot
                </span>
                <span className="font-label-sm text-label-sm text-primary">NOVA LMS</span>
              </div>
            </Link>
            <span className="font-code-md text-label-sm bg-surface-container-high text-tertiary px-space-xs py-0.5 rounded">
              v2.4.8
            </span>
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

        {/* Bottom Ledger State Telemetry Card */}
        <div className="p-space-sm border-t border-surface-container-high/40 bg-surface-container-lowest shrink-0">
          <div className="p-2.5 rounded-xl bg-surface-container-low/60 border border-surface-container-high/40 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
                <span className="font-code-md text-[11px] font-semibold text-on-surface tracking-tight">Ledger Synchronized</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_6px_#4cd7f6]"></span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-code-md text-outline">
              <span>Academic Cluster v4.2.8</span>
              <span className="text-tertiary uppercase">US-EAST-1</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 bg-surface-container-lowest shadow-2xl p-4 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto">
              <div className="h-16 flex items-center justify-between border-b border-surface-container-high/40 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <img alt="Brand logo" className="h-7 w-auto object-contain rounded" src="/assets/nova-logo.png" />
                  <span className="font-headline-sm text-on-surface">StudyPilot</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    Core Portal
                  </div>
                  {renderNavGroup(coreNavItems, true, () => setMobileMenuOpen(false))}
                </div>

                <div className="space-y-1">
                  <div className="px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    Communications
                  </div>
                  {renderNavGroup(commsNavItems, true, () => setMobileMenuOpen(false))}
                </div>

                <div className="space-y-1">
                  <div className="px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    Identity & System
                  </div>
                  {renderNavGroup(systemNavItems, true, () => setMobileMenuOpen(false))}
                </div>
              </div>
            </div>

            <div className="border-t border-surface-container-high/40 pt-3 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-error hover:bg-error-container/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOP HEADER ================= */}
      <div className="pl-0 md:pl-72">
        <header className="fixed top-0 left-0 md:left-72 right-0 h-16 bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/80 z-40 px-space-lg flex items-center justify-between">
          {/* Left: Mobile Toggle & Search */}
          <div className="flex items-center gap-space-md flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-14 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 font-body-sm text-body-sm focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
                placeholder="Search courses, assignments, labs..."
                type="text"
              />
              <div className="absolute right-2.5 flex items-center">
                <kbd className="font-code-md text-label-sm text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                  ⌘K
                </kbd>
              </div>
            </form>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-space-md">
            <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-slate-100 text-slate-700 font-code-md text-label-sm border border-slate-200">
              <span className="material-symbols-outlined text-[16px] text-blue-600">lan</span>
              <span>1,824 Nodes Available</span>
            </div>

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
                  <img
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover shadow-[0_0_12px_rgba(192,193,255,0.2)] border border-primary/30 group-hover:scale-105 transition-transform"
                    src={
                      user?.avatar ||
                      'https://lh3.googleusercontent.com/aida/AEtjO1XbByWEm7GAGBdpGAqxfzCMFkFqyPMDwXR31XzQcAW_7qE0SHGe5KcOzSHZWxcw0LmYVlhtAk7GuWXJwOamtyOO7hYD8eHnfRtALEC4NQ1hJFLBj_d4fWul7LXFbzSQShCNhrcpZZIXAoIGb-LhcSZTC2vvOtdLVJ1flthUBrMubmy1MxwpgQOLAqaQFAgYcT03ym4nj3WiibxwIVLJYhXutQRm9XkDKIunk7iDXjozViMs0zGMJ1ra'
                    }
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-tertiary ring-2 ring-surface"></span>
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-label-lg text-label-lg text-on-surface leading-tight">
                    {user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Dr. Alex R.'}
                  </span>
                  <span className="font-label-sm text-label-sm text-primary capitalize">
                    {user?.role || 'Fellow'}
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
                    className="absolute right-0 mt-2 w-60 rounded-xl bg-surface-container-low border border-surface-container-high/60 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-4 py-2.5 border-b border-surface-container-high/40">
                      <p className="font-label-md font-bold text-on-surface truncate">
                        {user?.name || 'Student Scholar'}
                      </p>
                      <p className="font-code-md text-[11px] text-outline truncate">
                        {user?.email || 'scholar@nova.edu'}
                      </p>
                      <span className="inline-block mt-1 font-code-md text-[10px] px-2 py-0.5 rounded bg-surface-container text-tertiary uppercase">
                        NODE: {user?.role || 'STUDENT'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/student/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/student/setting"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        <span>Settings</span>
                      </Link>

                      <Link
                        to="/student/notifications"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">notifications</span>
                        <span>Notification Center</span>
                      </Link>
                    </div>

                    <div className="border-t border-surface-container-high/40 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-error hover:bg-error-container/20 transition-colors cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span className="font-semibold">Sign Out</span>
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
        <main className="relative pt-16 w-full min-h-screen bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;