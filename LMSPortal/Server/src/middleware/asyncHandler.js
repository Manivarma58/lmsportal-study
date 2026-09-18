/**
 * Simple wrapper for asynchronous Express route handlers
 * Catches any rejected promises and forwards them to next(err)
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
