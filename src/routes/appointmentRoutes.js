const express = require("express");
const {
  cancelAppointment,
  completeCheckIn,
  createAppointment,
  listAppointments
} = require("../controllers/appointmentController");
const { requireAuth, requireMemberAccess } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, requireMemberAccess, listAppointments);
router.post("/", requireAuth, requireMemberAccess, createAppointment);
router.patch("/:id/check-in", requireAuth, requireMemberAccess, completeCheckIn);
router.patch("/:id/cancel", requireAuth, requireMemberAccess, cancelAppointment);

module.exports = router;
