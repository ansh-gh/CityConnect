const Joi = require("joi");

exports.updateProfileSchema = Joi.object({
    full_name: Joi.string().min(3).max(100).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required()
});
