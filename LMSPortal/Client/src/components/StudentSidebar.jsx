import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const StudentLayout = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const navItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/student/my-courses', label: 'My Courses', icon: '📚' },
    { path: '/student/assignments', label: 'Assignments', icon: '📝' },
    { path: '/student/profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    if (onLogout && typeof onLogout === 'function') {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-gray-800 flex-col border-r border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">LMS Portal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Student Dashboard</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800 flex items-center justify-center"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-gray-800 shadow-sm p-4" style={{position: 'fixed', top:0, left:0, right:0, zIndex:50}}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileSidebarOpen((s) => !s)} className="p-2 rounded-md bg-gray-100">☰</button>
              <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">LMS Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <aside className="md:hidden bg-white dark:bg-gray-800" style={{position: 'fixed', top: 0, left:0, right:0, bottom:0, zIndex:60, paddingTop: '4.5rem', overflowY: 'auto'}}>
            <div className="p-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-auto" style={{paddingTop: '5.25rem'}}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;