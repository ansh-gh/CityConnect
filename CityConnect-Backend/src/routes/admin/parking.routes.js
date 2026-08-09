const router = require("express").Router();
const controller = require("../../controllers/admin/parking.controller");
const authenticate = require("../../middleware/auth.middleware");
const authorizeAdmin = require("../../middleware/admin.middleware");
const validate = require("../../middleware/validate.middleware");
const { zoneSchema, slotSchema } = require("../../validations/admin/parking.validation");

router.use(authenticate);
router.use(authorizeAdmin);

// Zones
router.post("/zones", validate(zoneSchema), controller.createZone);
router.get("/zones", controller.getAllZones);
router.get("/zones/:id", controller.getZoneById);
router.put("/zones/:id", validate(zoneSchema), controller.updateZone);
router.delete("/zones/:id", controller.deleteZone);

// Slots
router.post("/slots", validate(slotSchema), controller.createSlot);
router.get("/slots", controller.getAllSlots);
router.get("/slots/:id", controller.getSlotById);
router.put("/slots/:id", validate(slotSchema), controller.updateSlot);
router.delete("/slots/:id", controller.deleteSlot);

// Bookings (view only for admin)
router.get("/bookings", controller.getAllBookings);
router.get("/bookings/:id", controller.getBookingById);

module.exports = router;
