const Joi = require("joi");

exports.createBookingSchema = Joi.object({
    slot_id: Joi.number().integer().required(),
    booking_start: Joi.date().required(),
    booking_end: Joi.date().required()
});
