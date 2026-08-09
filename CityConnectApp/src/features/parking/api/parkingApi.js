import axiosClient from '../../../api/axiosClient';

export const parkingApi = {
    getZones: () => axiosClient.get('/parking/zones'),
    getAvailableSlots: (zoneId) => axiosClient.get(`/parking/zones/${zoneId}/slots`),
    createBooking: (data) => axiosClient.post('/parking/bookings', data),
    getMyBookings: () => axiosClient.get('/parking/bookings'),
    getBooking: (id) => axiosClient.get(`/parking/bookings/${id}`),
    cancelBooking: (id) => axiosClient.put(`/parking/bookings/${id}/cancel`),
};