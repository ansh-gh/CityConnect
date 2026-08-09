import axiosClient from '../../../api/axiosClient';

export const authApi = {
    register: (data) => axiosClient.post('/auth/register', data),
    login: (data) => axiosClient.post('/auth/login', data),
    forgotPassword: (data) => axiosClient.post('/auth/forgot-password', data),
    verifyOtp: (data) => axiosClient.post('/auth/verify-otp', data),
    resendOtp: (data) => axiosClient.post('/auth/resend-otp', data), // BUG-02 fix: dedicated resend endpoint
    resetPassword: (data) => axiosClient.post('/auth/reset-password', data),
    
    changePassword: async (data) => {
        const response = await axiosClient.post('/auth/change-password', data); 
        return response.data;
    },

    getProfile: async () => {
        const response = await axiosClient.get('/users/profile'); 
        return response.data;
    },
    
    updateProfile: async (data) => {
        const response = await axiosClient.put('/users/profile', data);
        return response.data;
    },
    
    deleteAccount: async () => {
        const response = await axiosClient.delete('/users/profile');
        return response.data;
    },
};