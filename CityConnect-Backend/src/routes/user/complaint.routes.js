const router = require("express").Router();
const controller = require("../../controllers/user/complaint.controller");
const authenticate = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload.middleware");
const validate = require("../../middleware/validate.middleware");
const { createComplaintSchema, updateComplaintSchema } = require("../../validations/user/complaint.validation");

router.use(authenticate);

router.post(
    "/",
    upload.array("images", 3), // Max 3 images
    validate(createComplaintSchema),
    controller.createComplaint
);

router.get("/", controller.getMyComplaints);
// BUG-02 fix: /track/:ticketNo MUST be above /:id – otherwise "track" is treated as a complaint ID
router.get("/track/:ticketNo", controller.trackComplaint);
router.get("/:id", controller.getComplaint);
router.get("/:id/history", controller.getComplaintHistory);
router.put(
    "/:id",
    upload.array("images", 3),
    validate(updateComplaintSchema),
    controller.updateComplaint
);
router.delete("/:id", controller.deleteComplaint);

module.exports = router;
