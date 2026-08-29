const express = require("express");
const { getMember, linkCaregiver } = require("../controllers/userController");
const { requireAuth, requireMemberAccess, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/members/:memberId", requireAuth, requireMemberAccess, getMember);
router.post("/caregivers/link", requireAuth, requireRole("staff", "admin"), linkCaregiver);

module.exports = router;
