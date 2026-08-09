import axiosInstance from '../api/axios';

export const dashboardService = {
  getStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard');
    return response.data;
  }
};

export default dashboardService;
