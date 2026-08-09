const Joi = require("joi");

const pollSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "string.empty": "Title is required",
        "any.required": "Title is required"
    }),
    description: Joi.string().allow("", null).optional(),
    options: Joi.array().items(Joi.any()).optional(),
    option_1: Joi.string().trim().allow("", null).optional(),
    option_2: Joi.string().trim().allow("", null).optional(),
    option_3: Joi.string().trim().allow("", null).optional(),
    option_4: Joi.string().trim().allow("", null).optional(),
    start_date: Joi.date().empty("").allow(null).optional(),
    end_date: Joi.date().empty("").allow(null).optional(),
    status: Joi.string().valid("draft", "active", "closed").optional(),
    is_active: Joi.number().valid(0, 1).optional(),
    created_by: Joi.number().integer().empty("").allow(null).optional()
});

module.exports = { pollSchema };
