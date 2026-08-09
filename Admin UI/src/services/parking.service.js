import axios from "../api/axios";

export const parkingService = {
  // =========================
  // PARKING ZONES
  // =========================

  getZones: async () => {
    const res = await axios.get("/admin/parking/zones");
    return res.data;
  },

  getZoneById: async (id) => {
    const res = await axios.get(`/admin/parking/zones/${id}`);
    return res.data;
  },

  createZone: async (data) => {
    const res = await axios.post("/admin/parking/zones", data);
    return res.data;
  },

  updateZone: async (id, data) => {
    const res = await axios.put(`/admin/parking/zones/${id}`, data);
    return res.data;
  },

  deleteZone: async (id) => {
    const res = await axios.delete(`/admin/parking/zones/${id}`);
    return res.data;
  },

  // =========================
  // PARKING SLOTS
  // =========================

  getSlots: async () => {
    const res = await axios.get("/admin/parking/slots");
    return res.data;
  },

  getSlotById: async (id) => {
    const res = await axios.get(`/admin/parking/slots/${id}`);
    return res.data;
  },

  createSlot: async (data) => {
    const res = await axios.post("/admin/parking/slots", data);
    return res.data;
  },

  updateSlot: async (id, data) => {
    const res = await axios.put(`/admin/parking/slots/${id}`, data);
    return res.data;
  },

  deleteSlot: async (id) => {
    const res = await axios.delete(`/admin/parking/slots/${id}`);
    return res.data;
  },

  // =========================
  // BOOKINGS
  // =========================

  getBookings: async () => {
    const res = await axios.get("/admin/parking/bookings");
    return res.data;
  },

  getBookingById: async (id) => {
    const res = await axios.get(`/admin/parking/bookings/${id}`);
    return res.data;
  }
};