import axiosInstance from '../api/axios';

export const userService = {
  getUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axiosInstance.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  updateUserStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  }
};

export default userService;
