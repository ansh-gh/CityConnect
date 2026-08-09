const notificationService = require("../../services/admin/notification.service");

// BUG-05 fix: all handlers now use next(error) to route through the global error handler

const createNotification = async (req, res, next) => {
    try {
        const id = await notificationService.createNotification(req.body);
        res.status(201).json({ success: true, message: "Notification created successfully", data: { notification_id: id } });
    } catch (error) {
        next(error);
    }
};

const getAllNotifications = async (req, res, next) => {
    try {
        const data = await notificationService.getAllNotifications();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getNotificationById = async (req, res, next) => {
    try {
        const data = await notificationService.getNotificationById(req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const updateNotification = async (req, res, next) => {
    try {
        await notificationService.updateNotification(req.params.id, req.body);
        res.json({ success: true, message: "Notification updated successfully" });
    } catch (error) {
        next(error);
    }
};

const deleteNotification = async (req, res, next) => {
    try {
        await notificationService.deleteNotification(req.params.id);
        res.json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createNotification, getAllNotifications, getNotificationById,
    updateNotification, deleteNotification
};
