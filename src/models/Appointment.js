const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    providerName: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    location: String,
    visitType: {
      type: String,
      enum: ["in_person", "video", "phone"],
      default: "in_person"
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    startsAt: {
      type: Date,
      required: true
    },
    endsAt: Date,
    status: {
      type: String,
      enum: ["scheduled", "checked_in", "completed", "cancelled"],
      default: "scheduled"
    },
    preVisitCheckIn: {
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date,
      symptoms: String,
      medicationsChanged: Boolean,
      insuranceConfirmed: Boolean
    },
    cancelledAt: Date,
    cancellationReason: String
  },
  { timestamps: true }
);

appointmentSchema.index({ member: 1, startsAt: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
