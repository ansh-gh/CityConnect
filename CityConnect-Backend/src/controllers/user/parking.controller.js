const parkingService = require("../../services/user/parking.service");

exports.getZones = async (req, res, next) => {
    try {
        const zones = await parkingService.getZones();
        res.status(200).json({ success: true, data: zones });
    } catch (error) {
        next(error);
    }
};

exports.getAvailableSlots = async (req, res, next) => {
    try {
        const slots = await parkingService.getAvailableSlots(req.params.zoneId);
        res.status(200).json({ success: true, data: slots });
    } catch (error) {
        next(error);
    }
};

exports.createBooking = async (req, res, next) => {
    try {
        const result = await parkingService.createBooking(req.user.id, req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = await parkingService.getMyBookings(req.user.id);
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

exports.getBooking = async (req, res, next) => {
    try {
        const booking = await parkingService.getBooking(req.params.id, req.user.id);
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

exports.cancelBooking = async (req, res, next) => {
    try {
        const result = await parkingService.cancelBooking(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
