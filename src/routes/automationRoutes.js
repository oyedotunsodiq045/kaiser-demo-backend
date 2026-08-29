const express = require("express");
const { listAutomationTasks, updateAutomationTask } = require("../controllers/automationController");
const { requireAuth, requireMemberAccess, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/member", requireAuth, requireMemberAccess, listAutomationTasks);
router.get("/staff", requireAuth, requireRole("staff", "admin"), listAutomationTasks);
router.patch("/:id", requireAuth, requireRole("staff", "admin"), updateAutomationTask);

module.exports = router;
