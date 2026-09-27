/**
 * Lightweight in-memory and session-backed cache for instant page switching.
 * Eliminates loading delays when navigating between Dashboard, Skills & Progress,
 * Skill Gap Analyzer, and Job Simulations.
 */

const memoryCache = new Map();

export const getCache = (key, fallbackOrMaxAge = null, explicitMaxAge = 120000) => {
  let fallback = null;
  let maxAgeMs = 120000;

  if (typeof fallbackOrMaxAge === 'number') {
    maxAgeMs = fallbackOrMaxAge;
  } else if (fallbackOrMaxAge !== null && fallbackOrMaxAge !== undefined) {
    fallback = fallbackOrMaxAge;
    if (typeof explicitMaxAge === 'number') {
      maxAgeMs = explicitMaxAge;
    }
  }

  try {
    if (!memoryCache.has(key)) {
      const stored = sessionStorage.getItem(`nova_cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < maxAgeMs) {
          memoryCache.set(key, parsed);
          return parsed.data !== undefined && parsed.data !== null ? parsed.data : fallback;
        }
      }
      return fallback;
    }

    const cached = memoryCache.get(key);
    if (Date.now() - cached.timestamp < maxAgeMs) {
      return cached.data !== undefined && cached.data !== null ? cached.data : fallback;
    }
    memoryCache.delete(key);
  } catch {
    // Return fallback on any storage or JSON parsing issue
  }
  return fallback;
};

export const setCache = (key, data) => {
  const payload = { timestamp: Date.now(), data };
  memoryCache.set(key, payload);
  try {
    sessionStorage.setItem(`nova_cache_${key}`, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
};

export const clearCache = (key) => {
  if (key) {
    memoryCache.delete(key);
    try {
      sessionStorage.removeItem(`nova_cache_${key}`);
    } catch {}
  } else {
    memoryCache.clear();
  }
};
