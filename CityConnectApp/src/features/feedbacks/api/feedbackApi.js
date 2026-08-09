import axiosInstance from '../../../api/axiosClient';

export const feedbackApi = {
    submitFeedback: async (payload) => {
        const response = await axiosInstance.post('/feedbacks', payload);
        return response.data;
    },
    getUserFeedback: async () => {
        const response = await axiosInstance.get('/feedbacks');
        return response.data;
    },
    deleteFeedback: async (feedbackId) => {
        const response = await axiosInstance.delete(`/feedbacks/${feedbackId}`);
        return response.data;
    }
};