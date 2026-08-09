const feedbackService = require("../../services/user/feedback.service");

exports.createFeedback = async (req, res, next) => {
    try {
        const result = await feedbackService.createFeedback(req.user.id, req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getMyFeedbacks = async (req, res, next) => {
    try {
        const result = await feedbackService.getMyFeedbacks(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.deleteFeedback = async (req, res, next) => {
    try {
        const result = await feedbackService.deleteFeedback(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
