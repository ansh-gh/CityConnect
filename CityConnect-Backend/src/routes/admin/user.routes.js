const router = require("express").Router();
const controller = require("../../controllers/admin/user.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorizeAdmin = require("../../middleware/admin.middleware");

router.use(authenticate);
router.use(authorizeAdmin);

router.get("/", controller.getAllUsers);
router.get("/:id", controller.getUserById);
router.put("/:id", controller.updateUser);
router.patch("/:id/status", controller.updateUserStatus);
router.delete("/:id", controller.deleteUser);

module.exports = router;
