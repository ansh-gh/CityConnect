const userService = require("../../services/admin/user.service");

// BUG-05 fix: all handlers now use next(error) to route through the global error handler

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json({ success: true, message: "Users fetched successfully", data: users });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        await userService.updateUser(req.params.id, req.body);
        res.json({ success: true, message: "User updated successfully" });
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        await userService.updateUserStatus(req.params.id, status);
        res.json({ success: true, message: `User status updated to ${status}` });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllUsers, getUserById, deleteUser, updateUser, updateUserStatus };
