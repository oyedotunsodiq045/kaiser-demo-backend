const mongoose = require("mongoose");

const externalAccountSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    provider: {
      type: String,
      enum: ["mychart", "other"],
      default: "mychart"
    },
    organizationName: {
      type: String,
      required: true,
      trim: true
    },
    externalPatientId: {
      type: String,
      required: true,
      trim: true
    },
    accessStatus: {
      type: String,
      enum: ["pending", "connected", "expired", "revoked"],
      default: "pending"
    },
    lastSyncedAt: Date,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

externalAccountSchema.index({ member: 1, organizationName: 1 });

module.exports = mongoose.model("ExternalAccount", externalAccountSchema);
