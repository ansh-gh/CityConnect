const feedbackService = require("../../services/admin/feedback.service");

// BUG-05 fix: all handlers now use next(error) to route through the global error handler

const getAllFeedbacks = async (req, res, next) => {
    try {
        const feedbacks = await feedbackService.getAllFeedbacks();
        res.json({ success: true, data: feedbacks });
    } catch (error) {
        next(error);
    }
};

const getFeedbackById = async (req, res, next) => {
    try {
        const feedback = await feedbackService.getFeedbackById(req.params.id);
        res.json({ success: true, data: feedback });
    } catch (error) {
        next(error);
    }
};

const deleteFeedback = async (req, res, next) => {
    try {
        await feedbackService.deleteFeedback(req.params.id);
        res.json({ success: true, message: "Feedback deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllFeedbacks, getFeedbackById, deleteFeedback };
