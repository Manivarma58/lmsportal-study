import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * RoleBasedRoute: Enforces role authorization on the frontend
 * Redirects unauthorized users directly to their designated portal dashboard
 */
export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 animate-pulse">
            Checking authorization permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their respective dashboard
    let destination = '/student/dashboard';
    if (user.role === 'admin') {
      destination = '/admin/dashboard';
    } else if (user.role === 'instructor') {
      destination = '/instructor/dashboard';
    }

    return <Navigate to={destination} replace />;
  }

  return children;
};

export default RoleBasedRoute;
