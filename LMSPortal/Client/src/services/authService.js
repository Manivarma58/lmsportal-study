import API from './api';

export const authService = {
  register: async (userData) => {
    const res = await API.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await API.post('/auth/login', credentials);
    return res.data;
  },

  logout: async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    }
  },

  getCurrentUser: async () => {
    const res = await API.get('/auth/me');
    return res.data.user;
  },

  updateProfile: async (profileData) => {
    const res = await API.put('/auth/profile', profileData);
    return res.data.user;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const res = await API.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await API.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async ({ resetToken, newPassword }) => {
    const res = await API.post('/auth/reset-password', {
      resetToken,
      newPassword,
    });
    return res.data;
  },
};

export default authService;
