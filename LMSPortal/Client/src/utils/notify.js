import { toast } from 'sonner';

/**
 * Reusable Unified Notification & Toast Manager for NOVA LMS
 */
export const notify = {
  success: (title, description = null, options = {}) => {
    return toast.success(title, {
      description,
      duration: 3500,
      ...options,
    });
  },

  error: (title, description = null, options = {}) => {
    return toast.error(title, {
      description,
      duration: 4500,
      ...options,
    });
  },

  info: (title, description = null, options = {}) => {
    return toast.info(title, {
      description,
      duration: 3500,
      ...options,
    });
  },

  warning: (title, description = null, options = {}) => {
    return toast.warning(title, {
      description,
      duration: 4000,
      ...options,
    });
  },

  /**
   * Automatically handles promise resolution and rejection with toasts
   */
  promise: (promise, { loading = 'Processing request...', success = 'Action completed successfully!', error = 'Operation failed. Please try again.' } = {}) => {
    return toast.promise(promise, {
      loading,
      success: (data) => (typeof success === 'function' ? success(data) : success),
      error: (err) => (typeof error === 'function' ? error(err) : err?.message || error),
    });
  },

  dismiss: (id) => {
    toast.dismiss(id);
  },
};

export default notify;
