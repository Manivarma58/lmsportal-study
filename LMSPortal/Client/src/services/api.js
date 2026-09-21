import axios from 'axios';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      const envUrl = import.meta.env.VITE_API_BASE_URL;
      if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        return envUrl;
      }
      return 'http://localhost:5000/api';
    }
  }

  return (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
      ? 'https://lmsportal-study.onrender.com/api'
      : 'http://localhost:5000/api')
  );
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache & in-flight request tracking maps
const inFlightRequests = new Map();
const responseCache = new Map();
const CACHE_TTL_MS = 20 * 1000; // 20-second short TTL for idempotent reads

const buildRequestKey = (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${method}:${url}?${params}`;
};

// Request interceptor: attach JWT token & check in-flight/cached queries
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Invalidate cache on mutations
    const method = (config.method || 'get').toLowerCase();
    if (method !== 'get') {
      responseCache.clear();
      return config;
    }

    // Check if caching is enabled (defaults to true for categories & featured courses, or if config.cache is set)
    const isCacheable =
      config.cache === true ||
      config.url?.includes('/categories') ||
      config.url?.includes('/featured');

    const key = buildRequestKey(config);

    if (isCacheable && !config.forceRefresh) {
      const cached = responseCache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        config.adapter = () =>
          Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: cached.headers,
            config,
            request: {},
          });
        return config;
      }
    }

    // Deduplicate identical in-flight GET requests
    if (inFlightRequests.has(key) && !config.forceRefresh) {
      const existingPromise = inFlightRequests.get(key);
      config.adapter = () => existingPromise;
      return config;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to store cache and clear in-flight requests
API.interceptors.response.use(
  (response) => {
    const key = buildRequestKey(response.config);
    inFlightRequests.delete(key);

    const isCacheable =
      response.config.cache === true ||
      response.config.url?.includes('/categories') ||
      response.config.url?.includes('/featured');

    if (isCacheable) {
      responseCache.set(key, {
        data: response.data,
        headers: response.headers,
        timestamp: Date.now(),
      });
    }

    return response;
  },
  (error) => {
    if (error.config) {
      const key = buildRequestKey(error.config);
      inFlightRequests.delete(key);
    }
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear token unless on login/register pages
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register')) {
        localStorage.removeItem('token');
      }
    }

    const message =
      error.response?.data?.message ||
      (error.response?.status === 500
        ? 'Internal server error. Please try again later.'
        : error.message || 'An unexpected error occurred');

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;

    return Promise.reject(customError);
  }
);

export default API;
