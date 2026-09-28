import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { toast } from 'sonner';

const InstructorLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/instructor/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen blueprint-grid selection:bg-blue-100 selection:text-blue-700">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 xl:w-72 bg-white z-50 flex flex-col justify-between shadow-sm border-r border-slate-200/80 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="h-16 px-5 flex items-center justify-between bg-white border-b border-slate-200/80">
            <Link to="/instructor/dashboard" className="flex items-center gap-2.5 group">
              <img
                src="/nova-icon.png"
                alt="Nova LMS Logo"
                className="h-9 w-9 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                  Nova LMS
                </span>
                <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                  FACULTY PORTAL
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                PRO
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1 text-slate-400 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Navigation Matrix */}
          <nav className="px-3 py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
            {/* Category 1: Teaching & Courses */}
            <div className="space-y-1">
              <div className="px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Curriculum Desk
              </div>

              <NavLink
                to="/instructor/dashboard"
                end
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">grid_view</span>
                  <span>Dashboard</span>
                </div>
                {location.pathname === '/instructor/dashboard' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_6px_#4f46e5]"></span>
                )}
              </NavLink>

              <NavLink
                to="/instructor/courses"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">layers</span>
                <span>Course Management</span>
              </NavLink>

              <NavLink
                to="/instructor/create-course"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>Create Course</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  New
                </span>
              </NavLink>

              <NavLink
                to="/instructor/assignments"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                  <span>Practical Grading</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold font-mono">
                  Rubrics
                </span>
              </NavLink>

              <NavLink
                to="/instructor/analytics"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">monitoring</span>
                <span>Scholar Analytics</span>
              </NavLink>
            </div>

            {/* Category 2: Communications */}
            <div className="space-y-1">
              <div className="px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Communications
              </div>

              <NavLink
                to="/instructor/chat"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">forum</span>
                  <span>Direct Messages</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                  Live
                </span>
              </NavLink>

              <NavLink
                to="/instructor/notifications"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  <span>Broadcast Alerts</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              </NavLink>
            </div>

            {/* Category 3: System & Account */}
            <div className="space-y-1">
              <div className="px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Account & Exit
              </div>

              <NavLink
                to="/instructor/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/40 text-indigo-700 font-semibold border-l-[3.5px] border-indigo-600 shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                <span>Faculty Profile</span>
              </NavLink>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer text-left font-medium"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* ================= CONTENT CONTAINER WITH HEADER ================= */}
      <div className="pl-0 md:pl-64 xl:pl-72 flex flex-col min-h-screen w-full min-w-0 transition-all duration-200">
        {/* Fixed Top Header */}
        <header className="fixed top-0 left-0 md:left-64 xl:left-72 right-0 h-16 bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/80 z-40 flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4 transition-all duration-200">
          {/* Left: Mobile Menu & Search Input */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 shrink-0"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="w-full min-w-0">
              <div className="w-full min-w-0 bg-slate-50 rounded-xl px-3 py-1.5 flex items-center gap-2 transition-all border border-slate-200 focus-within:border-blue-500 focus-within:bg-white shadow-sm">
                <span className="material-symbols-outlined text-slate-400 text-[20px] shrink-0">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  placeholder="Search courses, metrics..."
                  type="text"
                />
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-500 font-mono text-[10px] shrink-0">
                  ⌘K
                </kbd>
              </div>
            </form>
          </div>

          {/* Right: Telemetry Badges & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="hidden xl:flex items-center gap-2 font-mono text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200/80">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>INSTRUCTOR ACTIVE</span>
              </div>
            </div>

            {/* Quick Action Link */}
            <Link
              to="/instructor/notifications"
              aria-label="Notifications"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors relative"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>
            </Link>

            {/* Instructor Profile Pill */}
            <Link
              to="/instructor/profile"
              className="flex items-center gap-2.5 pl-2 cursor-pointer group"
            >
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs text-slate-900 font-bold leading-tight">
                  {user?.name || 'Faculty Instructor'}
                </span>
                <span className="text-[10px] text-blue-600 font-mono leading-tight font-medium capitalize">
                  {user?.role || 'Lead Instructor'}
                </span>
              </div>
              <div className="relative flex-shrink-0">
                {user?.avatar ? (
                  <img
                    alt={user?.name || 'Instructor Profile'}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-400/40 group-hover:ring-blue-600 transition-all shadow-sm"
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
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                  title="Active"
                ></span>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="w-full pt-16 bg-transparent min-h-screen min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
