const router = require("express").Router();
const dashboardController = require("../../controllers/admin/dashboard.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorizeAdmin = require("../../middleware/admin.middleware");

router.get("/", authenticate, authorizeAdmin, dashboardController.getDashboardStats);

module.exports = router;
