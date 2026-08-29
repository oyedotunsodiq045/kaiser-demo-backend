const express = require("express");
const { createMessage, listMessages, replyToMessage } = require("../controllers/messageController");
const { requireAuth, requireMemberAccess } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, requireMemberAccess, listMessages);
router.post("/", requireAuth, requireMemberAccess, createMessage);
router.post("/:id/replies", requireAuth, replyToMessage);

module.exports = router;
