const mongoose = require("mongoose");

const automationTaskSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    ownerStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    type: {
      type: String,
      enum: [
        "appointment_reminder",
        "prescription_refill_reminder",
        "test_result_followup",
        "coverage_review",
        "staff_work_queue"
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    payload: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending"
    },
    scheduledFor: Date,
    completedAt: Date,
    auditTrail: [
      {
        action: String,
        actor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        note: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

automationTaskSchema.index({ status: 1, scheduledFor: 1 });
automationTaskSchema.index({ member: 1, type: 1 });

module.exports = mongoose.model("AutomationTask", automationTaskSchema);
