import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { complaintApi } from '../api/complaintApi';

export const useGetMyComplaints = () => {
    return useQuery({
        queryKey: ['myComplaints'],
        queryFn: async () => {
            const response = await complaintApi.getMyComplaints();
            return response.data?.complaints || response.complaints || [];
        },
    });
};

export const useComplaintDetail = (id) => {
    return useQuery({
        queryKey: ['complaintDetail', id],
        queryFn: async () => {
            const response = await complaintApi.getComplaint(id);
            return response.data?.complaint || response.complaint || response.data;
        },
        enabled: !!id,
    });
};

export const useCreateComplaint = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => complaintApi.createComplaint(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myComplaints'] });
        },
        onError: (error) => {
            // BUG-09 fix: show user-facing error
            const message = error?.response?.data?.message || error.message || 'Failed to submit complaint. Please try again.';
            Alert.alert('Submission Failed', message);
        },
    });
};

export const useDeleteComplaint = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => complaintApi.deleteComplaint(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myComplaints'] });
        },
        onError: (error) => {
            const message = error?.response?.data?.message || error.message || 'Failed to delete complaint. Please try again.';
            Alert.alert('Delete Failed', message);
        },
    });
};

export const useTrackComplaint = (ticketNo) => {
    return useQuery({
        queryKey: ['trackComplaint', ticketNo],
        queryFn: async () => {
            const response = await complaintApi.trackComplaint(ticketNo);
            return response.data || response;
        },
        enabled: false,
    });
};

export const useComplaintHistory = (id) => {
    return useQuery({
        queryKey: ['complaintHistory', id],
        queryFn: async () => {
            const response = await complaintApi.getComplaintHistory(id);
            return response.data?.history || response.history || [];
        },
        enabled: !!id,
    });
};