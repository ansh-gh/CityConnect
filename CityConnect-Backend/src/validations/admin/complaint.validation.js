const Joi = require("joi");

const updateComplaintStatusSchema = Joi.object({
    status: Joi.string()
        .valid("submitted", "under_review", "in_progress", "resolved", "rejected")
        .required()
        .messages({
            "any.only": "Invalid complaint status",
            "any.required": "Status is required"
        }),
    remarks: Joi.string().allow("").max(500).messages({
        "string.max": "Remarks cannot exceed 500 characters"
    })
});

module.exports = { updateComplaintStatusSchema };
