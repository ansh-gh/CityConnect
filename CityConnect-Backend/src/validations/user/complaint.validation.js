const Joi = require("joi");

exports.createComplaintSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().valid(
        "road", "garbage", "street_light", "water_supply",
        "drainage", "public_property", "other"
    ).required(),
    latitude: Joi.number().empty("").optional(),
    longitude: Joi.number().empty("").optional(),
    address: Joi.string().allow("", null),
    image_url: Joi.string().allow("", null)
});

exports.updateComplaintSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().valid(
        "road", "garbage", "street_light", "water_supply",
        "drainage", "public_property", "other"
    ).required(),
    latitude: Joi.number().empty("").optional(),
    longitude: Joi.number().empty("").optional(),
    address: Joi.string().allow("", null),
    image_url: Joi.string().allow("", null)
});
