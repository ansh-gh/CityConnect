const Joi = require("joi");

exports.createFeedbackSchema = Joi.object({
    complaint_id: Joi.number().integer().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    feedback: Joi.string().trim().required()
});
