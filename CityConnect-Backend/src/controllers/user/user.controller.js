const userService = require("../../services/user/user.service");

exports.getProfile = async (req, res, next) => {
    try {
        const result = await userService.getProfile(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const result = await userService.updateProfile(req.user.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const result = await userService.deleteUser(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
