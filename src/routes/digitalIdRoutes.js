const express = require("express");
const { getDigitalId } = require("../controllers/digitalIdController");
const { requireAuth, requireMemberAccess } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, requireMemberAccess, getDigitalId);

module.exports = router;
