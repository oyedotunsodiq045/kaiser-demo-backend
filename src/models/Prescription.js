const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    medicationName: {
      type: String,
      required: true,
      trim: true
    },
    dosage: String,
    prescribingProvider: String,
    instructions: String,
    refillsRemaining: {
      type: Number,
      default: 0,
      min: 0
    },
    pharmacy: {
      name: String,
      address: String,
      phone: String
    },
    pickupDetails: {
      status: {
        type: String,
        enum: ["not_requested", "processing", "ready", "picked_up"],
        default: "not_requested"
      },
      readyAt: Date,
      pickupBy: Date
    },
    lastFilledAt: Date,
    nextEligibleRefillAt: Date
  },
  { timestamps: true }
);

prescriptionSchema.index({ member: 1, medicationName: 1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
