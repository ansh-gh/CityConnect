const complaintService = require("../../services/user/complaint.service");

exports.createComplaint = async (req, res, next) => {
    try {
        const result = await complaintService.createComplaint(req.user.id, req.body, req.files || []);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getMyComplaints = async (req, res, next) => {
    try {
        const result = await complaintService.getMyComplaints(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getComplaint = async (req, res, next) => {
    try {
        const result = await complaintService.getComplaint(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.updateComplaint = async (req, res, next) => {
    try {
        // BUG-06 fix: pass req.files so the service can re-upload new images
        const result = await complaintService.updateComplaint(req.params.id, req.user.id, req.body, req.files || []);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.deleteComplaint = async (req, res, next) => {
    try {
        const result = await complaintService.deleteComplaint(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.trackComplaint = async (req, res, next) => {
    try {
        const result = await complaintService.trackComplaint(req.params.ticketNo, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getComplaintHistory = async (req, res, next) => {
    try {
        const result = await complaintService.getComplaintHistory(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
