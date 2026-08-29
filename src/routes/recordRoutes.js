const express = require("express");
const {
  connectExternalAccount,
  createRecord,
  listExternalAccounts,
  listRecords
} = require("../controllers/recordController");
const { requireAuth, requireMemberAccess, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, requireMemberAccess, listRecords);
router.post("/", requireAuth, requireRole("staff", "admin"), createRecord);
router.get("/external-accounts", requireAuth, requireMemberAccess, listExternalAccounts);
router.post("/external-accounts", requireAuth, requireMemberAccess, connectExternalAccount);

module.exports = router;
