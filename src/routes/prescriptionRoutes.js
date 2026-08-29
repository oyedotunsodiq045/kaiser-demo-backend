const express = require("express");
const {
  createPrescription,
  listPrescriptions,
  requestRefill
} = require("../controllers/prescriptionController");
const { requireAuth, requireMemberAccess, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, requireMemberAccess, listPrescriptions);
router.post("/", requireAuth, requireRole("staff", "admin"), createPrescription);
router.patch("/:id/refill", requireAuth, requireMemberAccess, requestRefill);

module.exports = router;
