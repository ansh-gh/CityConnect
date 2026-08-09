const router = require("express").Router();
const controller = require("../../controllers/admin/notification.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorizeAdmin = require("../../middleware/admin.middleware");
const validate = require("../../middleware/validate.middleware");
const { notificationSchema } = require("../../validations/admin/notification.validation");

router.use(authenticate);
router.use(authorizeAdmin);

router.post("/", validate(notificationSchema), controller.createNotification);
router.get("/", controller.getAllNotifications);
router.get("/:id", controller.getNotificationById);
router.put("/:id", validate(notificationSchema), controller.updateNotification);
router.delete("/:id", controller.deleteNotification);

module.exports = router;
