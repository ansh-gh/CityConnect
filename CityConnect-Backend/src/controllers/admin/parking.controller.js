const parkingService = require("../../services/admin/parking.service");

// BUG-05 fix: all handlers now use next(error) to route through the global error handler

const createZone = async (req, res, next) => {
    try {
        const id = await parkingService.createZone(req.body);
        res.status(201).json({ success: true, message: "Parking zone created successfully", data: { zone_id: id } });
    } catch (error) {
        next(error);
    }
};

const getAllZones = async (req, res, next) => {
    try {
        const zones = await parkingService.getAllZones();
        res.json({ success: true, data: zones });
    } catch (error) {
        next(error);
    }
};

const getZoneById = async (req, res, next) => {
    try {
        const zone = await parkingService.getZoneById(req.params.id);
        res.json({ success: true, data: zone });
    } catch (error) {
        next(error);
    }
};

const updateZone = async (req, res, next) => {
    try {
        await parkingService.updateZone(req.params.id, req.body);
        res.json({ success: true, message: "Parking zone updated successfully" });
    } catch (error) {
        next(error);
    }
};

const deleteZone = async (req, res, next) => {
    try {
        await parkingService.deleteZone(req.params.id);
        res.json({ success: true, message: "Parking zone deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const createSlot = async (req, res, next) => {
    try {
        const id = await parkingService.createSlot(req.body);
        res.status(201).json({ success: true, message: "Parking slot created successfully", data: { slot_id: id } });
    } catch (error) {
        next(error);
    }
};

const getAllSlots = async (req, res, next) => {
    try {
        const slots = await parkingService.getAllSlots();
        res.json({ success: true, data: slots });
    } catch (error) {
        next(error);
    }
};

const getSlotById = async (req, res, next) => {
    try {
        const slot = await parkingService.getSlotById(req.params.id);
        res.json({ success: true, data: slot });
    } catch (error) {
        next(error);
    }
};

const updateSlot = async (req, res, next) => {
    try {
        await parkingService.updateSlot(req.params.id, req.body);
        res.json({ success: true, message: "Parking slot updated successfully" });
    } catch (error) {
        next(error);
    }
};

const deleteSlot = async (req, res, next) => {
    try {
        await parkingService.deleteSlot(req.params.id);
        res.json({ success: true, message: "Parking slot deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await parkingService.getAllBookings();
        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

const getBookingById = async (req, res, next) => {
    try {
        const booking = await parkingService.getBookingById(req.params.id);
        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createZone, getAllZones, getZoneById, updateZone, deleteZone,
    createSlot, getAllSlots, getSlotById, updateSlot, deleteSlot,
    getAllBookings, getBookingById
};
