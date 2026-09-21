/**
 * NoSQL & MongoDB Injection Sanitization Middleware
 * Recursively removes any object keys starting with '$' or containing '.'
 * from req.body, req.query, and req.params.
 */
function sanitize(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item));
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Drop keys that contain MongoDB operator prefix '$' or dot '.'
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }

  return clean;
}

export const mongoSanitize = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  next();
};

export default mongoSanitize;
