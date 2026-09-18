/**
 * Standardized API Response Utilities
 */

export const sendResponse = (res, statusCode, success, message, data = {}) => {
  return res.status(statusCode).json({
    success,
    message,
    ...data,
  });
};

export const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

export const sendError = (res, statusCode = 500, message = 'Error occurred') => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default {
  sendResponse,
  sendSuccess,
  sendError,
};
