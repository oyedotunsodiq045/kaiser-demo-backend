const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recordType: {
      type: String,
      enum: ["test_result", "health_history", "immunization", "outside_record"],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      default: "internal"
    },
    observedAt: Date,
    providerName: String,
    summary: String,
    values: [
      {
        name: String,
        value: String,
        unit: String,
        referenceRange: String,
        flag: {
          type: String,
          enum: ["low", "normal", "high", "critical", "unknown"],
          default: "unknown"
        }
      }
    ],
    attachments: [
      {
        label: String,
        url: String
      }
    ],
    visibility: {
      type: String,
      enum: ["member", "care_team", "staff_only"],
      default: "member"
    }
  },
  { timestamps: true }
);

medicalRecordSchema.index({ member: 1, recordType: 1, observedAt: -1 });

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
