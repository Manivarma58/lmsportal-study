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
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen blueprint-grid antialiased selection:bg-blue-100 selection:text-blue-700">
      {/* ================= DESKTOP & MOBILE SIDEBAR ================= */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 xl:w-72 bg-white z-50 flex flex-col justify-between shadow-sm border-r border-slate-200/80 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Header */}
          <div className="p-4 flex flex-col gap-2 border-b border-slate-200/80 bg-white">
            <div className="flex items-center justify-between">
              <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
                <img
                  alt="Nova LMS Logo"
                  className="h-9 w-9 object-contain rounded-md group-hover:scale-105 transition-transform"
                  src="/nova-icon.png"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/nova-icon.png';
                  }}
                />
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                    Nova LMS
                  </span>
                  <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-1">
                    ADMIN CONSOLE
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1 text-slate-400 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                ROOT PRIVILEGES
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                SuperAdmin
              </span>
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            {/* Core Administration */}
            <nav className="space-y-1">
              <div className="px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Core Administration
              </div>
              <NavLink
                to="/admin/dashboard"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                <span>Overview</span>
              </NavLink>

              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span>Users</span>
              </NavLink>

              <NavLink
                to="/admin/students"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">school</span>
                <span>Students</span>
              </NavLink>

              <NavLink
                to="/admin/instructors"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">badge</span>
                <span>Instructors</span>
              </NavLink>
            </nav>

            {/* Academic Catalog */}
            <nav className="space-y-1">
              <div className="px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Academic Catalog
              </div>
              <NavLink
                to="/admin/courses"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">menu_book</span>
                <span>Courses</span>
              </NavLink>

              <NavLink
                to="/admin/courses?filter=categories"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">category</span>
                <span>Categories</span>
              </NavLink>

              <NavLink
                to="/student/quizzes"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">quiz</span>
                <span>Quizzes</span>
              </NavLink>

              <NavLink
                to="/student/certificates"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">verified</span>
                <span>Certificates</span>
              </NavLink>
            </nav>

            {/* Intelligence & Operations */}
            <nav className="space-y-1">
              <div className="px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Intelligence & Operations
              </div>
              <NavLink
                to="/admin/analytics"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">query_stats</span>
                <span>Reports</span>
              </NavLink>

              <NavLink
                to="/admin/notifications"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">campaign</span>
                <span>Broadcasts</span>
              </NavLink>

              <button
                onClick={() => toast.info('System Settings Dialog opened', { description: 'Security policies, cluster keys, and TLS configurations are active.' })}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all text-left"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
                <span>System Settings</span>
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* ================= CONTENT CONTAINER WITH FIXED HEADER ================= */}
      <div className="pl-0 md:pl-64 xl:pl-72 flex flex-col min-h-screen w-full min-w-0 transition-all duration-200">
        {/* Fixed Top Header */}
        <header className="fixed top-0 left-0 md:left-64 xl:left-72 right-0 h-16 bg-white/80 backdrop-blur-xl z-40 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-sm border-b border-slate-200/80 transition-all duration-200">
          {/* Left: Mobile Menu & Search Input */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-2xl min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="w-full min-w-0 relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 h-10 pl-10 pr-12 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Search users, courses, logs... [⌘K]"
                type="text"
              />
              <div className="absolute right-2.5 hidden sm:flex px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono text-[10px] border border-slate-300">
                ⌘K
              </div>
            </form>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 cursor-pointer group"
              >
                <div className="flex flex-col text-right hidden xl:flex">
                  <span className="text-xs font-semibold text-slate-800">
                    {user?.name || 'Dr. Sarah Jenkins'}
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">
                    {user?.role === 'admin' ? 'Global Administrator' : 'Platform Lead'}
                  </span>
                </div>
                <div className="relative flex items-center gap-1">
                  {user?.avatar ? (
                    <img
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                      src={user.avatar}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500 shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                  )}
                  <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-700 transition-colors">
                    expand_more
                  </span>
                </div>
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-semibold text-xs text-slate-900">{user?.name || 'Dr. Sarah Jenkins'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@lms.com'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/users');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                    <span>Admin Directory</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/analytics');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                    <span>System Analytics</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-red-50 text-red-600 flex items-center gap-2 mt-1 border-t border-slate-100 pt-1.5"
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
        <main className="relative pt-20 bg-slate-50 min-h-screen w-full px-4 sm:px-6 pb-12 min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
