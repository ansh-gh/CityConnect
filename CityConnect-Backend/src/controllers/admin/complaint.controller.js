const complaintService = require("../../services/admin/complaint.service");

// BUG-05 fix: all handlers now use next(error) to route through the global error handler

const getAllComplaints = async (req, res, next) => {
    try {
        const result = await complaintService.getAllComplaints();
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const getComplaintById = async (req, res, next) => {
    try {
        const complaint = await complaintService.getComplaintById(req.params.id);
        res.json({ success: true, data: complaint });
    } catch (error) {
        next(error);
    }
};

const updateComplaintStatus = async (req, res, next) => {
    try {
        await complaintService.updateComplaintStatus(
            req.params.id, req.body.status, req.body.remarks, req.user.id
        );
        res.json({ success: true, message: "Complaint updated successfully" });
    } catch (error) {
        next(error);
    }
};

const getComplaintHistory = async (req, res, next) => {
    try {
        const history = await complaintService.getComplaintHistory(req.params.id);
        res.json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllComplaints, getComplaintById, updateComplaintStatus, getComplaintHistory };
