const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String
  },
  { _id: false }
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: String,
    relationship: String,
    phone: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    phone: {
      type: String,
      trim: true
    },
    dateOfBirth: Date,
    accountType: {
      type: String,
      enum: ["member", "caregiver", "staff"],
      required: true
    },
    role: {
      type: String,
      enum: ["member", "caregiver", "staff", "admin"],
      default: "member"
    },
    memberId: {
      type: String,
      sparse: true,
      unique: true,
      trim: true
    },
    insurancePlan: {
      planName: String,
      coverageTier: String,
      groupNumber: String,
      effectiveDate: Date
    },
    caregiverProfile: {
      relationshipToMember: String,
      authorizedMemberIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ]
    },
    address: addressSchema,
    emergencyContact: emergencyContactSchema,
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active"
    },
    lastLoginAt: Date
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ accountType: 1, role: 1 });

module.exports = mongoose.model("User", userSchema);
