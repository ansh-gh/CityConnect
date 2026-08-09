import axios from "../api/axios";

export const pollService = {
  getPolls: async () => {
    const res = await axios.get("/admin/polls");
    return res.data;
  },

  getPollById: async (id) => {
    const res = await axios.get(`/admin/polls/${id}`);
    return res.data;
  },

  createPoll: async (data) => {
    const res = await axios.post("/admin/polls", data);
    return res.data;
  },

  updatePoll: async (id, data) => {
    const res = await axios.put(`/admin/polls/${id}`, data);
    return res.data;
  },

  deletePoll: async (id) => {
    const res = await axios.delete(`/admin/polls/${id}`);
    return res.data;
  }
};
