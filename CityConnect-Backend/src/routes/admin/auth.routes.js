const router = require("express").Router();
const authController = require("../../controllers/admin/auth.controller");
const validate = require("../../middleware/validate.middleware");
const authenticate = require("../../middleware/auth.middleware");
const { loginSchema } = require("../../validations/admin/auth.validation");

router.post("/login", validate(loginSchema), authController.login);

router.get("/profile", authenticate, (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;
