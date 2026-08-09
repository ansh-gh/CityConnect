const Joi = require("joi");

exports.voteSchema = Joi.object({
    option_id: Joi.number().integer().required()
});
