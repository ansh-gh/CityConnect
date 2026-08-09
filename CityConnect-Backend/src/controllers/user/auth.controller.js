const authService = require("../../services/user/auth.service");

exports.register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const result = await authService.forgotPassword(req.body.email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyOtp(email, otp);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const result = await authService.resetPassword(email, otp, newPassword);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.resendOtp(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
