const { z } = require("zod");
const Message = require("../models/Message");
const AutomationTask = require("../models/AutomationTask");
const { canAccessMember } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const messageSchema = z.object({
  member: z.string().optional(),
  recipientType: z.enum(["care_team", "member_services", "staff_user"]),
  assignedStaff: z.string().optional(),
  subject: z.string().min(1),
  body: z.string().min(1),
  category: z.enum(["medical_question", "billing", "coverage", "appointment", "pharmacy", "other"]).optional(),
  priority: z.enum(["low", "normal", "high"]).optional()
});

const replySchema = z.object({
  body: z.string().min(1),
  status: z.enum(["open", "in_review", "closed"]).optional()
});

const listMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ member: req.memberId })
    .populate("assignedStaff", "firstName lastName role")
    .sort({ updatedAt: -1 });

  return res.json({ messages });
});

const createMessage = asyncHandler(async (req, res) => {
  const payload = messageSchema.parse(req.body);
  const member = payload.member || req.user._id;

  const message = await Message.create({
    ...payload,
    member,
    sender: req.user._id,
    thread: [{ author: req.user._id, body: payload.body }]
  });

  await AutomationTask.create({
    member,
    ownerStaff: payload.assignedStaff,
    type: "staff_work_queue",
    title: `Respond to message: ${message.subject}`,
    scheduledFor: new Date(),
    payload: { message: message._id, category: message.category, priority: message.priority }
  });

  return res.status(201).json({ message });
});

const replyToMessage = asyncHandler(async (req, res) => {
  const payload = replySchema.parse(req.body);
  const message = await Message.findById(req.params.id);

  if (!message) return res.status(404).json({ message: "Message not found" });
  if (!(await canAccessMember(req, message.member))) {
    return res.status(403).json({ message: "Message access is not authorized" });
  }

  message.thread.push({ author: req.user._id, body: payload.body });
  if (payload.status) message.status = payload.status;
  await message.save();

  return res.json({ message });
});

module.exports = {
  listMessages,
  createMessage,
  replyToMessage
};
