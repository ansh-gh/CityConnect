import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parkingApi } from '../api/parkingApi';

export const useParkingZones = () => {
    return useQuery({
        queryKey: ['parkingZones'],
        queryFn: async () => {
            const response = await parkingApi.getZones();
            const data = response?.data?.data || response?.data || response;
            return data;
        },
        staleTime: 1000 * 60 * 5
    });
};

// NEW: Fetch specific slots for a zone
export const useAvailableSlots = (zoneId) => {
    return useQuery({
        queryKey: ['availableSlots', zoneId],
        queryFn: async () => {
            const response = await parkingApi.getAvailableSlots(zoneId);
            const data = response?.data?.data || response?.data || response;
            return data;
        },
        enabled: !!zoneId,
        staleTime: 1000 * 60 * 5
    });
};

// NEW: Fetch the user's bookings
export const useMyBookings = () => {
    return useQuery({
        queryKey: ['myBookings'],
        queryFn: async () => {
            const response = await parkingApi.getMyBookings();
            const data = response?.data?.data || response?.data || response;
            return data;
        },
        staleTime: 1000 * 60 * 5
    });
};

export const useCreateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bookingData) => parkingApi.createBooking(bookingData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parkingZones'] });
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
        }
    });
};

export const useCancelBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bookingId) => parkingApi.cancelBooking(bookingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
            queryClient.invalidateQueries({ queryKey: ['parkingZones'] });
        }
    });
};


