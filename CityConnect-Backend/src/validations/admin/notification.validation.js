const Joi = require("joi");

const notificationSchema = Joi.object({
    title: Joi.string().required().messages({
        "string.empty": "Title is required",
        "any.required": "Title is required"
    }),
    message: Joi.string().required().messages({
        "string.empty": "Message is required",
        "any.required": "Message is required"
    }),
    user_id: Joi.number().integer().allow(null),
    type: Joi.string()
        .valid("general", "complaint", "parking")
        .default("general")
});

module.exports = { notificationSchema };
