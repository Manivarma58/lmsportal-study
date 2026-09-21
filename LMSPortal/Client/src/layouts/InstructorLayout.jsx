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
        className={`fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col justify-between shadow-sm border-r border-slate-200/80 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="h-16 px-5 flex items-center justify-between bg-white border-b border-slate-200/80">
            <Link to="/instructor/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  school
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                  StudyPilot
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
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Curriculum Desk
              </div>

              <NavLink
                to="/instructor/dashboard"
                end
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200/80 shadow-sm'
                      : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">grid_view</span>
                  <span>Dashboard</span>
                </div>
                {location.pathname === '/instructor/dashboard' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]"></span>
                )}
              </NavLink>

              <NavLink
                to="/instructor/courses"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200/80 shadow-sm'
                      : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">layers</span>
                <span>Course Management</span>
              </NavLink>

              <NavLink
                to="/instructor/create-course"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200/80 shadow-sm'
                      : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>Create Course</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  New
                </span>
              </NavLink>

              <NavLink
                to="/instructor/analytics"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200/80 shadow-sm'
                      : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">monitoring</span>
                <span>Scholar Analytics</span>
              </NavLink>
            </div>

            {/* Category 2: Communications */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Communications
              </div>

              <NavLink
                to="/instructor/chat"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200/80 shadow-sm'
                      : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">forum</span>
                  <span>Direct Messages</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                  Live
                </span>
              </NavLink>

              <NavLink
                to="/instructor/notifications"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200/80 shadow-sm'
                      : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  <span>Broadcast Alerts</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              </NavLink>
            </div>

            {/* Category 3: System & Account */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Account & Exit
              </div>

              <NavLink
                to="/instructor/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200/80 shadow-sm'
                      : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                <span>Faculty Profile</span>
              </NavLink>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer text-left font-medium"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Status Card */}
        <div className="p-3.5 bg-slate-50 m-3 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              FACULTY SERVER SYNCED
            </span>
          </div>
          <div className="font-mono text-[10px] text-slate-500 leading-tight">
            NODE #FACULTY-01
            <br />
            SOCKETS REALTIME ACTIVE
          </div>
        </div>
      </aside>

      {/* ================= CONTENT CONTAINER WITH HEADER ================= */}
      <div className="pl-0 md:pl-72 flex flex-col min-h-screen">
        {/* Fixed Top Header */}
        <header className="fixed top-0 left-0 md:left-72 right-0 h-16 bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/80 z-40 flex items-center justify-between px-6">
          {/* Left: Mobile Menu & Search Input */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="w-full bg-slate-50 rounded-xl px-3 py-1.5 flex items-center gap-2 transition-all border border-slate-200 focus-within:border-blue-500 focus-within:bg-white shadow-sm">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  placeholder="Search courses, scholars, grading queue, metrics..."
                  type="text"
                />
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-500 font-mono text-[10px]">
                  ⌘K
                </kbd>
              </div>
            </form>
          </div>

          {/* Right: Telemetry Badges & Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-2 font-mono text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/90 shadow-sm text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>US-EAST-01</span>
                <span className="text-blue-600 font-semibold">// 18ms</span>
              </div>
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
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs text-slate-900 font-bold leading-tight">
                  {user?.name || 'Faculty Instructor'}
                </span>
                <span className="text-[10px] text-blue-600 font-mono leading-tight font-medium capitalize">
                  {user?.role || 'Lead Instructor'}
                </span>
              </div>
              <div className="relative flex-shrink-0">
                <img
                  alt={user?.name || 'Instructor Profile'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-400/40 group-hover:ring-blue-600 transition-all shadow-sm"
                  src={
                    user?.avatar ||
                    'https://lh3.googleusercontent.com/aida/AEtjO1XbByWEm7GAGBdpGAqxfzCMFkFqyPMDwXR31XzQcAW_7qE0SHGe5KcOzSHZWxcw0LmYVlhtAk7GuWXJwOamtyOO7hYD8eHnfRtALEC4NQ1hJFLBj_d4fWul7LXFbzSQShCNhrcpZZIXAoIGb-LhcSZTC2vvOtdLVJ1flthUBrMubmy1MxwpgQOLAqaQFAgYcT03ym4nj3WiibxwIVLJYhXutQRm9XkDKIunk7iDXjozViMs0zGMJ1ra'
                  }
                />
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                  title="Active"
                ></span>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="w-full pt-16 bg-transparent min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
