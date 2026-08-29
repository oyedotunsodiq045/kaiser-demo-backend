const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recipientType: {
      type: String,
      enum: ["care_team", "member_services", "staff_user"],
      required: true
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["medical_question", "billing", "coverage", "appointment", "pharmacy", "other"],
      default: "other"
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal"
    },
    status: {
      type: String,
      enum: ["open", "in_review", "closed"],
      default: "open"
    },
    thread: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        body: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

messageSchema.index({ member: 1, status: 1, updatedAt: -1 });
messageSchema.index({ assignedStaff: 1, status: 1 });

module.exports = mongoose.model("Message", messageSchema);
