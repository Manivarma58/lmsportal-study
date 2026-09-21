/**
 * In-Memory Sliding Window Rate Limiter Middleware
 * Protects endpoints against brute-force attacks, credential stuffing, and DoS abuse.
 */
class RateLimiter {
  constructor(windowMs, maxRequests, message) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message || 'Too many requests, please try again later.';
    this.hits = new Map(); // ip -> Array of timestamps

    // Periodic garbage collection to prevent memory leaks
    setInterval(() => this.cleanup(), Math.min(windowMs, 60000));
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter((time) => now - time < this.windowMs);
      if (valid.length === 0) {
        this.hits.delete(ip);
      } else {
        this.hits.set(ip, valid);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      // In testing environments, allow bypassing if header is present
      if (req.headers['x-bypass-ratelimit'] === 'true' && process.env.NODE_ENV === 'test') {
        return next();
      }

      const ip =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        '127.0.0.1';

      const now = Date.now();
      let timestamps = this.hits.get(ip) || [];

      // Filter timestamps within the sliding window
      timestamps = timestamps.filter((time) => now - time < this.windowMs);

      const remaining = Math.max(0, this.maxRequests - timestamps.length);
      const resetTimeSeconds = Math.ceil(this.windowMs / 1000);

      res.setHeader('RateLimit-Limit', this.maxRequests);
      res.setHeader('RateLimit-Remaining', remaining);
      res.setHeader('RateLimit-Reset', resetTimeSeconds);

      if (timestamps.length >= this.maxRequests) {
        res.setHeader('Retry-After', resetTimeSeconds);
        return res.status(429).json({
          success: false,
          error: 'Too Many Requests',
          message: this.message,
          retryAfterSeconds: resetTimeSeconds,
        });
      }

      timestamps.push(now);
      this.hits.set(ip, timestamps);
      next();
    };
  }
}

// Rate limiter for authentication routes (login, register, forgot-password)
// 100 requests per 15 minutes in development, 15 in production
const isProduction = process.env.NODE_ENV === 'production';
export const authLimiter = new RateLimiter(
  15 * 60 * 1000,
  15,
  'Too many authentication attempts from this IP address. Please try again in 15 minutes.'
).middleware();

// General API rate limiter
// 1000 in dev, 300 in prod per 15 minutes
export const apiLimiter = new RateLimiter(
  15 * 60 * 1000,
  isProduction ? 300 : 1000,
  'Rate limit exceeded. Please slow down your requests.'
).middleware();

export default {
  authLimiter,
  apiLimiter,
};
