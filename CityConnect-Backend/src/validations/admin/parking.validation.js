const Joi = require("joi");

const zoneSchema = Joi.object({
    zone_name: Joi.string().required().messages({
        "string.empty": "Zone name is required",
        "any.required": "Zone name is required"
    }),
    location: Joi.string().allow("", null).optional(),
    latitude: Joi.number().empty("").allow(null).optional(),
    longitude: Joi.number().empty("").allow(null).optional(),
    total_slots: Joi.number().integer().min(0).default(0).optional(),
    hourly_rate: Joi.number().min(0).default(0.00).optional(),
    is_active: Joi.number().valid(0, 1).default(1).optional()
});

const slotSchema = Joi.object({
    zone_id: Joi.number().integer().required(),
    slot_code: Joi.string().required().messages({
        "string.empty": "Slot code is required",
        "any.required": "Slot code is required"
    }),
    slot_type: Joi.string().valid("bike", "car", "ev").default("car").optional(),
    is_available: Joi.number().valid(0, 1).default(1).optional(),
    status: Joi.string().valid("available", "booked", "maintenance").default("available").optional(),
    price_per_hour: Joi.number().min(0).default(0.00).optional()
});

module.exports = { zoneSchema, slotSchema };
