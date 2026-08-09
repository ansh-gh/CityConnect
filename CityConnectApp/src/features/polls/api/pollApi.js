import axiosInstance from '../../../api/axiosClient';

export const pollApi = {
    getPolls: async () => {
        const response = await axiosInstance.get('/polls');
        return response.data;
    },
    getPollById: async (id) => {
        const response = await axiosInstance.get(`/polls/${id}`);
        return response.data;
    },
    getPollResults: async (id) => {
        const response = await axiosInstance.get(`/polls/${id}/results`);
        return response.data;
    },
    votePoll: async (pollId, optionId) => {
        const response = await axiosInstance.post(`/polls/${pollId}/vote`, { option_id: optionId });
        return response.data;
    }
};