import axiosClient from '../../../api/axiosClient';

export const complaintApi = {
    createComplaint: (formData) => axiosClient.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getMyComplaints: () => axiosClient.get('/complaints'),
    getComplaint: (id) => axiosClient.get(`/complaints/${id}`),
    updateComplaint: (id, data) => axiosClient.put(`/complaints/${id}`, data),
    deleteComplaint: (id) => axiosClient.delete(`/complaints/${id}`),
    trackComplaint: (ticketNo) => axiosClient.get(`/complaints/track/${ticketNo}`),
    getComplaintHistory: (id) => axiosClient.get(`/complaints/${id}/history`),
};