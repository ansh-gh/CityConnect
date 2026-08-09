import axiosInstance from "../api/axios";

export const complaintService = {
  // Get all complaints
  getComplaints: async () => {
    const response = await axiosInstance.get("/admin/complaints");
    return response.data;
  },

  // Get complaint by ID
  getComplaintById: async (id) => {
    const response = await axiosInstance.get(`/admin/complaints/${id}`);
    return response.data;
  },

  // Update complaint status
updateComplaintStatus: async (id, data) => {
  const response = await axiosInstance.patch(
    `/admin/complaints/${id}/status`,
    data
  );
  return response.data;
},

  // Assign complaint
  assignComplaint: async (id, data) => {
    const response = await axiosInstance.put(
      `/admin/complaints/${id}/assign`,
      data
    );
    return response.data;
  },

  // Delete complaint
  deleteComplaint: async (id) => {
    const response = await axiosInstance.delete(`/admin/complaints/${id}`);
    return response.data;
  }
};

export default complaintService;