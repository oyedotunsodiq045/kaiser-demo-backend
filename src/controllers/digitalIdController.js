const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getDigitalId = asyncHandler(async (req, res) => {
  const member = await User.findById(req.memberId || req.user._id);

  if (!member) {
    return res.status(404).json({ message: "Member not found" });
  }

  return res.json({
    digitalId: {
      memberName: `${member.firstName} ${member.lastName}`,
      memberId: member.memberId || member._id.toString(),
      planName: member.insurancePlan?.planName || "Demo Health Plan",
      coverageTier: member.insurancePlan?.coverageTier || "Member",
      groupNumber: member.insurancePlan?.groupNumber || "DEMO-GROUP",
      effectiveDate: member.insurancePlan?.effectiveDate,
      barcodeValue: `DEMO:${member.memberId || member._id.toString()}`
    }
  });
});

module.exports = {
  getDigitalId
};
