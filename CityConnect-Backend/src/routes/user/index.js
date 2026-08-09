const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/complaints", require("./complaint.routes"));
router.use("/parking", require("./parking.routes"));
router.use("/polls", require("./poll.routes"));
router.use("/feedbacks", require("./feedback.routes"));

module.exports = router;
