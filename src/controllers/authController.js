const { z } = require("zod");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/token");

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  accountType: z.enum(["member", "caregiver"]),
  memberId: z.string().optional(),
  relationshipToMember: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const register = asyncHandler(async (req, res) => {
  const payload = registerSchema.parse(req.body);

  const user = await User.create({
    ...payload,
    role: payload.accountType,
    caregiverProfile:
      payload.accountType === "caregiver"
        ? { relationshipToMember: payload.relationshipToMember }
        : undefined
  });

  const token = signToken(user);
  return res.status(201).json({ token, user });
});

const login = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const user = await User.findOne({ email: payload.email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(payload.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  return res.json({ token, user });
});

const me = asyncHandler(async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = {
  register,
  login,
  me
};
