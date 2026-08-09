const router = require("express").Router();
const controller = require("../../controllers/user/feedback.controller");
const authenticate = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const { createFeedbackSchema } = require("../../validations/user/feedback.validation");

router.use(authenticate);

router.post("/", validate(createFeedbackSchema), controller.createFeedback);
router.get("/", controller.getMyFeedbacks);
router.delete("/:id", controller.deleteFeedback);

module.exports = router;
