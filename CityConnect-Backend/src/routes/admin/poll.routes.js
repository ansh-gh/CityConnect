const router = require("express").Router();
const controller = require("../../controllers/admin/poll.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorizeAdmin = require("../../middleware/admin.middleware");
const validate = require("../../middleware/validate.middleware");
const { pollSchema } = require("../../validations/admin/poll.validation");

router.use(authenticate);
router.use(authorizeAdmin);

router.post("/", validate(pollSchema), controller.createPoll);
router.get("/", controller.getAllPolls);
router.get("/:id", controller.getPollById);
router.put("/:id", validate(pollSchema), controller.updatePoll);
router.delete("/:id", controller.deletePoll);

module.exports = router;
