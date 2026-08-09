const router = require("express").Router();
const { getProfile, updateProfile, deleteUser } = require("../../controllers/user/user.controller");
const authenticate = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const { updateProfileSchema } = require("../../validations/user/user.validation");

router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);
router.delete("/profile", deleteUser);

module.exports = router;
