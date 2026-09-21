import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { toast } from 'sonner';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.success('Admin session terminated securely');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/users?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-body-md text-body-md min-h-screen blueprint-grid antialiased selection:bg-blue-100 selection:text-blue-700">
      {/* ================= DESKTOP & MOBILE SIDEBAR ================= */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container-high/40 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Header */}
          <div className="p-space-lg flex flex-col gap-space-sm border-b border-surface-container-high/30">
            <div className="flex items-center justify-between">
              <Link to="/admin/dashboard" className="flex items-center gap-space-sm group">
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
                  <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface leading-none">
                    StudyPilot
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-code-md text-code-md uppercase tracking-wider mt-1">
                    NOVA // LMS
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex items-center justify-between mt-space-xs">
              <span className="font-label-sm text-label-sm font-code-md text-code-md px-2 py-0.5 rounded bg-surface-container text-tertiary border border-tertiary/20">
                ADMIN CONSOLE
              </span>
              <span className="font-label-sm text-label-sm font-code-md text-code-md px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">
                SuperAdmin
              </span>
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="flex-1 overflow-y-auto px-space-md py-space-sm space-y-space-lg">
            {/* Core Administration */}
            <nav className="space-y-space-xs">
              <div className="px-space-sm font-label-sm text-label-sm uppercase font-code-md text-code-md text-outline tracking-wider mb-space-xs">
                Core Administration
              </div>
              <NavLink
                to="/admin/dashboard"
                end
                className={({ isActive }) =>
                  `flex items-center gap-space-sm px-space-md py-2 transition-all rounded-lg ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                <span className="font-label-lg text-label-lg">Overview</span>
              </NavLink>

              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-space-sm px-space-md py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span className="font-label-lg text-label-lg">Users</span>
              </NavLink>

              <NavLink
                to="/admin/students"
                className={({ isActive }) =>
                  `flex items-center gap-space-sm px-space-md py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">school</span>
                <span className="font-label-lg text-label-lg">Students</span>
              </NavLink>

              <NavLink
                to="/admin/instructors"
                className={({ isActive }) =>
                  `flex items-center gap-space-sm px-space-md py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">badge</span>
                <span className="font-label-lg text-label-lg">Instructors</span>
              </NavLink>
            </nav>

            {/* Academic Catalog */}
            <nav className="space-y-space-xs">
              <div className="px-space-sm font-label-sm text-label-sm uppercase font-code-md text-code-md text-outline tracking-wider mb-space-xs">
                Academic Catalog
              </div>
              <NavLink
                to="/admin/courses"
                className={({ isActive }) =>
                  `flex items-center gap-space-sm px-space-md py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">menu_book</span>
                <span className="font-label-lg text-label-lg">Courses</span>
              </NavLink>

              <NavLink
                to="/admin/courses?filter=categories"
                className={({ isActive }) =>
                  `flex items-center gap-space-sm px-space-md py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">category</span>
                <span className="font-label-lg text-label-lg">Categories</span>
              </NavLink>

              <NavLink
                to="/student/quizzes"
                className="flex items-center gap-space-sm px-space-md py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">quiz</span>
                <span className="font-label-lg text-label-lg">Quizzes</span>
              </NavLink>

              <NavLink
                to="/student/certificates"
                className="flex items-center gap-space-sm px-space-md py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">verified</span>
                <span className="font-label-lg text-label-lg">Certificates</span>
              </NavLink>
            </nav>

            {/* Intelligence & Operations */}
            <nav className="space-y-space-xs">
              <div className="px-space-sm font-label-sm text-label-sm uppercase font-code-md text-code-md text-outline tracking-wider mb-space-xs">
                Intelligence & Operations
              </div>
              <NavLink
                to="/admin/analytics"
                className={({ isActive }) =>
                  `flex items-center gap-space-sm px-space-md py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">query_stats</span>
                <span className="font-label-lg text-label-lg">Reports</span>
              </NavLink>

              <NavLink
                to="/admin/notifications"
                className={({ isActive }) =>
                  `flex items-center gap-space-sm px-space-md py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">campaign</span>
                <span className="font-label-lg text-label-lg">Broadcasts</span>
              </NavLink>

              <button
                onClick={() => toast.info('System Settings Dialog opened', { description: 'Security policies, cluster keys, and TLS configurations are active.' })}
                className="w-full flex items-center gap-space-sm px-space-md py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all text-left"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
                <span className="font-label-lg text-label-lg">System Settings</span>
              </button>
            </nav>
          </div>

          {/* Cluster Telemetry Bottom Card */}
          <div className="p-space-md m-space-md rounded-xl bg-surface-container-lowest flex flex-col gap-space-xs border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="font-code-md text-code-md font-label-sm text-label-sm text-outline uppercase">
                Cluster Telemetry
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
              </span>
            </div>
            <div className="flex items-center justify-between font-code-md text-code-md text-body-sm">
              <span className="text-on-surface-variant">Uptime</span>
              <span className="text-tertiary font-semibold">99.99%</span>
            </div>
            <div className="flex items-center justify-between font-code-md text-code-md text-body-sm">
              <span className="text-on-surface-variant">Protocol</span>
              <span className="text-on-surface">TLS 1.3 Verified</span>
            </div>
            <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-space-xs">
              <div className="bg-tertiary h-full w-[99.99%]"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= CONTENT CONTAINER WITH FIXED HEADER ================= */}
      <div className="pl-0 md:pl-72 flex flex-col min-h-screen">
        {/* Fixed Top Header */}
        <header className="fixed top-0 left-0 md:left-72 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 px-space-lg flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/40">
          {/* Left: Mobile Menu & Search Input */}
          <div className="flex items-center gap-space-md flex-1 max-w-2xl">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[20px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-12 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container border border-surface-container-high/30 focus:border-primary transition-all"
                placeholder="Search users, courses, audit logs, node metrics... [⌘K]"
                type="text"
              />
              <div className="absolute right-2.5 px-1.5 py-0.5 rounded bg-surface-container text-outline font-code-md text-code-md text-[10px]">
                ⌘K
              </div>
            </form>
          </div>

          {/* Right: Infrastructure Status Badges & Profile */}
          <div className="flex items-center gap-space-md">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-high/30">
              <span className="material-symbols-outlined text-[16px] text-tertiary">dns</span>
              <span className="font-code-md text-code-md font-label-sm text-label-sm text-on-surface-variant">
                PRODUCTION // us-east-core
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high/30">
              <span className="h-2 w-2 rounded-full bg-tertiary"></span>
              <span className="font-label-sm text-label-sm text-on-surface font-medium">All Nodes Nominal</span>
            </div>

            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-surface"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-space-sm pl-space-sm cursor-pointer group"
              >
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {user?.name || 'Dr. Elena Vance'}
                  </span>
                  <span className="font-label-sm text-label-sm text-tertiary">
                    {user?.role === 'admin' ? 'Global Administrator' : 'Platform Lead'}
                  </span>
                </div>
                <div className="relative flex items-center gap-1">
                  <img
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant group-hover:scale-105 transition-transform"
                    src={
                      user?.avatar ||
                      'https://lh3.googleusercontent.com/aida/AEtjO1XbByWEm7GAGBdpGAqxfzCMFkFqyPMDwXR31XzQcAW_7qE0SHGe5KcOzSHZWxcw0LmYVlhtAk7GuWXJwOamtyOO7hYD8eHnfRtALEC4NQ1hJFLBj_d4fWul7LXFbzSQShCNhrcpZZIXAoIGb-LhcSZTC2vvOtdLVJ1flthUBrMubmy1MxwpgQOLAqaQFAgYcT03ym4nj3WiibxwIVLJYhXutQRm9XkDKIunk7iDXjozViMs0zGMJ1ra'
                    }
                  />
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-on-surface transition-colors">
                    expand_more
                  </span>
                </div>
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface-container-high border border-surface-container-highest/60 shadow-xl p-1.5 z-50 backdrop-blur-md">
                  <div className="px-3 py-2 border-b border-surface-container-highest/40 mb-1">
                    <p className="font-semibold text-xs text-on-surface">{user?.name || 'Dr. Elena Vance'}</p>
                    <p className="text-[11px] text-outline truncate">{user?.email || 'admin@studypilot.edu'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/users');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-surface-container-highest text-on-surface flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                    <span>Admin Directory</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/analytics');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-surface-container-highest text-on-surface flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                    <span>System Analytics</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-error-container/20 text-error flex items-center gap-2 mt-1 border-t border-surface-container-highest/40 pt-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Terminate Session</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content View */}
        <main className="relative pt-16 bg-surface min-h-screen w-full px-space-lg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
