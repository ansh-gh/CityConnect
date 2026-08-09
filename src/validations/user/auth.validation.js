const Joi = require("joi");

exports.registerSchema = Joi.object({
    full_name: Joi.string().min(3).max(150).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).allow("", null),
    password: Joi.string().min(6).required()
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

exports.forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

exports.verifyOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required()
});

exports.resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
    newPassword: Joi.string().min(6).required()
});

exports.changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});
