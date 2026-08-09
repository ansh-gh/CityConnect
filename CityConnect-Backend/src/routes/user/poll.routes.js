const router = require("express").Router();
const controller = require("../../controllers/user/poll.controller");
const authenticate = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const { voteSchema } = require("../../validations/user/poll.validation");

router.get("/", controller.getAllPolls);
router.get("/:id", controller.getPollById);
router.get("/:id/results", controller.getPollResults);

router.use(authenticate);
router.post("/:id/vote", validate(voteSchema), controller.votePoll);

module.exports = router;
