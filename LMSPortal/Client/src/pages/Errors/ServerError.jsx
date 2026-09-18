import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ServerError = () => {
  const [errorDetails, setErrorDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Try to get error details from session storage or URL
    const errorFromStorage = sessionStorage.getItem('lastError');
    if (errorFromStorage) {
      try {
        setErrorDetails(JSON.parse(errorFromStorage));
      } catch (e) {
        setErrorDetails({ message: errorFromStorage });
      }
    }
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearError = () => {
    sessionStorage.removeItem('lastError');
    setErrorDetails(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col justify-center items-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-40 h-40 bg-red-500 rounded-full opacity-20 animate-ping"></div>
              <div className="w-40 h-40 bg-red-500 rounded-full absolute top-0 left-0 flex items-center justify-center">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="text-8xl font-bold text-red-300">500</div>
          <div className="text-4xl font-bold mt-4">Server Error</div>
          <p className="text-gray-300 mt-4 text-lg">
            Something went wrong on our end. Our team has been notified.
          </p>
        </div>

        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4">What happened?</h3>
          <p className="text-gray-300 mb-4">
            The server encountered an internal error or misconfiguration and was unable to complete your request.
          </p>
          
          {errorDetails && (
            <div className="mt-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-300 hover:text-blue-200 flex items-center justify-center mx-auto"
              >
                <svg 
                  className={`w-5 h-5 mr-2 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                {showDetails ? 'Hide Error Details' : 'Show Error Details'}
              </button>
              
              {showDetails && (
                <div className="mt-4 p-4 bg-gray-900 rounded-lg text-left">
                  <pre className="text-sm text-gray-300 overflow-auto max-h-60">
                    {JSON.stringify(errorDetails, null, 2)}
                  </pre>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleClearError}
                      className="text-sm text-red-300 hover:text-red-200"
                    >
                      Clear Error Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="text-gray-300">
            <p className="mb-6">Try these solutions:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleRefresh}
                className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex flex-col items-center"
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-medium">Refresh Page</span>
              </button>
              
              <Link
                to="/"
                className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex flex-col items-center"
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">Go to Homepage</span>
              </Link>
              
              <Link
                to="/contact"
                className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex flex-col items-center"
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Contact Support</span>
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-700">
            <div className="text-gray-400 text-sm space-y-2">
              <p>Our technical team is working to resolve this issue.</p>
              <p>
                Estimated resolution time: <span className="text-yellow-300">15-30 minutes</span>
              </p>
              <p className="mt-4">
                Last system check: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
            
            <div className="mt-6 flex items-center justify-center space-x-4 text-gray-400">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">Database: Operational</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm">API: Degraded</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">CDN: Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerError;