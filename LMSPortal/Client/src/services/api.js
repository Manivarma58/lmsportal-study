import axios from 'axios';

const ensureApiSuffix = (url) => {
  if (!url) return 'https://lmsportal-study.onrender.com/api';
  const clean = url.trim().replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
    if (isLocal) {
      // Use Vite's native proxy '/api' locally to eliminate CORS preflight OPTIONS latency
      return '/api';
    }

    // When running on a deployed domain (Vercel, Render, etc.):
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return ensureApiSuffix(envUrl);
    }
    return 'https://lmsportal-study.onrender.com/api';
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return ensureApiSuffix(envUrl);
  }

  return import.meta.env.PROD
    ? 'https://lmsportal-study.onrender.com/api'
    : '/api';
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Cache & in-flight request tracking maps
const inFlightRequests = new Map();
const responseCache = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30-second TTL for idempotent reads for instantaneous snappy navigation

const buildRequestKey = (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${method}:${url}?${params}`;
};

export const clearApiCache = () => {
  responseCache.clear();
};

const isSafeReadRequest = (config) => {
  const method = (config.method || 'get').toLowerCase();
  if (method !== 'get') return false;
  if (config.forceRefresh || config.cache === false) return false;

  const url = config.url || '';
  if (url.includes('/auth/verify') || url.includes('/auth/logout')) return false;

  return (
    config.cache === true ||
    url.includes('/enrollments') ||
    url.includes('/certificates') ||
    url.includes('/courses') ||
    url.includes('/skills') ||
    url.includes('/challenges') ||
    url.includes('/projects') ||
    url.includes('/recommendations') ||
    url.includes('/target-roles') ||
    url.includes('/categories') ||
    url.includes('/featured') ||
    url.includes('/assignments') ||
    url.includes('/schedules')
  );
};

// Wrap API.request for deduplicating simultaneous in-flight GET requests
const rawRequest = API.request.bind(API);
API.request = function (config) {
  const method = (config.method || 'get').toLowerCase();
  if (method === 'get') {
    const key = buildRequestKey(config);
    if (inFlightRequests.has(key) && !config.forceRefresh) {
      return inFlightRequests.get(key);
    }
    const promise = rawRequest(config).finally(() => {
      inFlightRequests.delete(key);
    });
    inFlightRequests.set(key, promise);
    return promise;
  }
  return rawRequest(config);
};

// Request interceptor: attach JWT token & check in-memory cache
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Invalidate cache immediately on mutations (POST, PUT, DELETE, PATCH)
    const method = (config.method || 'get').toLowerCase();
    if (method !== 'get') {
      responseCache.clear();
      return config;
    }

    // Check if valid cached response exists
    if (isSafeReadRequest(config)) {
      const key = buildRequestKey(config);
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

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to store cache and clear in-flight requests
API.interceptors.response.use(
  (response) => {
    const key = buildRequestKey(response.config);
    inFlightRequests.delete(key);

    if (isSafeReadRequest(response.config)) {
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

// Non-blocking early wake-up ping for deployed Render servers
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  setTimeout(() => {
    fetch('https://lmsportal-study.onrender.com/api/health', { method: 'GET', mode: 'no-cors' }).catch(() => {});
  }, 1000);
}

export default API;
