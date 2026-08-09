const router = require("express").Router();
const controller = require("../../controllers/user/parking.controller");
const authenticate = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const { createBookingSchema } = require("../../validations/user/parking.validation");

router.get("/zones", controller.getZones);
router.get("/zones/:zoneId/slots", controller.getAvailableSlots);

router.use(authenticate);

router.post("/bookings", validate(createBookingSchema), controller.createBooking);
router.get("/bookings", controller.getMyBookings);
router.get("/bookings/:id", controller.getBooking);
router.put("/bookings/:id/cancel", controller.cancelBooking);

module.exports = router;
