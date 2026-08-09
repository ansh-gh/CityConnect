import axiosInstance from '../api/axios';

export const authService = {
  login: async ({ email, password }) => {
    const response = await axiosInstance.post('/admin/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post('/admin/auth/logout');
      return response.data;
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/admin/auth/profile');
    return response.data;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await axiosInstance.put('/admin/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};
export default authService;
