const AutomationTask = require("../models/AutomationTask");
const asyncHandler = require("../utils/asyncHandler");

const listAutomationTasks = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "member" || req.user.role === "caregiver") {
    filter.member = req.memberId;
  } else if (req.query.status) {
    filter.status = req.query.status;
  }

  const tasks = await AutomationTask.find(filter)
    .populate("member", "firstName lastName memberId")
    .populate("ownerStaff", "firstName lastName role")
    .sort({ scheduledFor: 1, createdAt: -1 });

  return res.json({ tasks });
});

const updateAutomationTask = asyncHandler(async (req, res) => {
  const updates = {
    status: req.body.status,
    ownerStaff: req.body.ownerStaff,
    completedAt: req.body.status === "completed" ? new Date() : undefined
  };

  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  const task = await AutomationTask.findByIdAndUpdate(
    req.params.id,
    {
      $set: updates,
      $push: {
        auditTrail: {
          action: "updated",
          actor: req.user._id,
          note: req.body.note
        }
      }
    },
    { new: true }
  );

  if (!task) return res.status(404).json({ message: "Automation task not found" });
  return res.json({ task });
});

module.exports = {
  listAutomationTasks,
  updateAutomationTask
};
