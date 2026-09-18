import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../utils/hooks/useAuth';

const Forbidden = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const attemptedPath = location.pathname;
  const requiredRole = getRequiredRole(attemptedPath);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-20 h-20 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-6xl font-bold text-red-200">403</div>
          <div className="text-4xl font-bold text-gray-800 mt-4">Access Denied</div>
          <p className="text-gray-600 mt-4 text-lg">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Access Details</h3>
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Attempted Path:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">{attemptedPath}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Your Role:</span>
              <span className="font-medium capitalize">{user?.role || 'Guest'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Required Role:</span>
              <span className="font-medium text-red-600">{requiredRole || 'Higher Privileges'}</span>
            </div>
            {user && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-700 text-sm">
                  You are logged in as <span className="font-semibold">{user.name}</span> ({user.role}).
                  Contact an administrator if you need access to this resource.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-gray-600">
            <p className="mb-4">Here's what you can do:</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    View Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login to Continue
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Go to Homepage
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Need help? Contact{' '}
              <Link to="/contact" className="text-blue-500 hover:underline">
                support
              </Link>{' '}
              or email{' '}
              <a href="mailto:admin@lms.com" className="text-blue-500 hover:underline">
                admin@lms.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const getRequiredRole = (path) => {
  if (path.startsWith('/admin')) return 'Administrator';
  if (path.startsWith('/instructor')) return 'Instructor';
  if (path.startsWith('/student')) return 'Student';
  return 'Authenticated User';
};

export default Forbidden;