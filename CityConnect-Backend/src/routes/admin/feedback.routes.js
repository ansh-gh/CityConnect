const router = require("express").Router();
const controller = require("../../controllers/admin/feedback.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorizeAdmin = require("../../middleware/admin.middleware");

router.use(authenticate);
router.use(authorizeAdmin);

router.get("/", controller.getAllFeedbacks);
router.get("/:id", controller.getFeedbackById);
router.delete("/:id", controller.deleteFeedback);

module.exports = router;
