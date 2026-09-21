import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels = {
  student: 'Student Portal',
  instructor: 'Instructor Portal',
  admin: 'Admin Portal',
  dashboard: 'Dashboard',
  'my-courses': 'My Courses',
  courses: 'Course Management',
  progress: 'Learning Progress',
  chat: 'Discussions & Chat',
  profile: 'Profile Settings',
  analytics: 'Analytics',
  users: 'User Management',
  instructors: 'Instructor Management',
  students: 'Student Management',
  notifications: 'Notifications',
  assignments: 'Assignments',
  resources: 'Resources',
  schedule: 'Schedule',
  setting: 'Settings',
  editor: 'Course Editor',
  learn: 'Classroom',
  quiz: 'Assessment',
  certificates: 'Certificates',
};

export const Breadcrumbs = ({ items = null, className = '' }) => {
  const location = useLocation();

  // If items not provided, parse path segments
  const breadcrumbItems = React.useMemo(() => {
    if (items && Array.isArray(items)) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const result = [{ label: 'Home', to: '/' }];

    let accumulatedPath = '';
    pathSegments.forEach((segment, index) => {
      accumulatedPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Handle ObjectIds / dynamic parameters (strings > 16 chars or numbers)
      const isParam = segment.length >= 16 || /^[0-9a-fA-F]{24}$/.test(segment);
      const label = isParam
        ? 'Details'
        : routeLabels[segment.toLowerCase()] ||
          segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());

      result.push({
        label,
        to: isLast ? null : accumulatedPath,
      });
    });

    return result;
  }, [items, location.pathname]);

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 overflow-x-auto py-2 mb-4 scrollbar-none ${className}`}
    >
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        {breadcrumbItems.map((item, idx) => {
          const isLast = idx === breadcrumbItems.length - 1;
          const isFirst = idx === 0;

          return (
            <li key={idx} className="flex items-center gap-1.5">
              {idx > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
              )}
              {isLast || !item.to ? (
                <span
                  aria-current="page"
                  className="font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
                >
                  {isFirst && <Home className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
