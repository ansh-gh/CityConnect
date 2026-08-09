const router = require("express").Router();
const { register, login, forgotPassword, verifyOtp, resendOtp, resetPassword, changePassword } = require("../../controllers/user/auth.controller");
const validate = require("../../middleware/validate.middleware");
const authenticate = require("../../middleware/auth.middleware");
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema,
    changePasswordSchema
} = require("../../validations/user/auth.validation");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/resend-otp", validate(forgotPasswordSchema), resendOtp);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);

module.exports = router;
