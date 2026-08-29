const { z } = require("zod");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const caregiverLinkSchema = z.object({
  caregiverId: z.string(),
  memberId: z.string()
});

const getMember = asyncHandler(async (req, res) => {
  const member = await User.findById(req.memberId);
  if (!member) return res.status(404).json({ message: "Member not found" });
  return res.json({ member });
});

const linkCaregiver = asyncHandler(async (req, res) => {
  const { caregiverId, memberId } = caregiverLinkSchema.parse(req.body);

  const caregiver = await User.findById(caregiverId);
  const member = await User.findById(memberId);

  if (!caregiver || caregiver.accountType !== "caregiver") {
    return res.status(404).json({ message: "Caregiver account not found" });
  }

  if (!member || member.accountType !== "member") {
    return res.status(404).json({ message: "Member account not found" });
  }

  await User.updateOne(
    { _id: caregiver._id },
    { $addToSet: { "caregiverProfile.authorizedMemberIds": member._id } }
  );

  return res.json({ message: "Caregiver linked to member" });
});

module.exports = {
  getMember,
  linkCaregiver
};
