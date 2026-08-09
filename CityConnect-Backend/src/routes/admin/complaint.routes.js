const router = require("express").Router();
const controller = require("../../controllers/admin/complaint.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorizeAdmin = require("../../middleware/admin.middleware");
const validate = require("../../middleware/validate.middleware");
const { updateComplaintStatusSchema } = require("../../validations/admin/complaint.validation");

router.use(authenticate);
router.use(authorizeAdmin);

router.get("/", controller.getAllComplaints);
router.get("/:id", controller.getComplaintById);
router.patch("/:id/status", validate(updateComplaintStatusSchema), controller.updateComplaintStatus);
router.get("/:id/history", controller.getComplaintHistory);

module.exports = router;
