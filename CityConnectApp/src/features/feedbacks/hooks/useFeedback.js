import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackApi } from '../api/feedbackApi';

export const useUserFeedback = () => {
    return useQuery({
        queryKey: ['myFeedbacks'],
        queryFn: async () => {
            const res = await feedbackApi.getUserFeedback();
            
            // Safely extract the array regardless of how deep the backend nests it
            if (Array.isArray(res)) return res;
            if (Array.isArray(res?.feedbacks?.feedbacks)) return res.feedbacks.feedbacks;
            if (Array.isArray(res?.feedbacks)) return res.feedbacks;
            if (Array.isArray(res?.feedback)) return res.feedback;
            if (Array.isArray(res?.rows)) return res.rows;
            return [];
        }
    });
};

export const useSubmitFeedback = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => feedbackApi.submitFeedback(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myFeedbacks'] });
        }
    });
};

export const useDeleteFeedback = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (feedbackId) => feedbackApi.deleteFeedback(feedbackId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myFeedbacks'] });
        }
    });
};