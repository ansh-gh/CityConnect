import axiosInstance from "../api/axios";

export const feedbackService = {
  getFeedbacks: async () => {
    const response = await axiosInstance.get("/admin/feedback");
    return response.data;
  },

  deleteFeedback: async (id) => {
    const response = await axiosInstance.delete(`/admin/feedback/${id}`);
    return response.data;
  }
};