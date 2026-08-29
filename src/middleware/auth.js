const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.sub);

  if (!user || user.status !== "active") {
    return res.status(401).json({ message: "Invalid or inactive account" });
  }

  req.user = user;
  return next();
});

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }

    return next();
  };
}

async function canAccessMember(req, memberId) {
  if (req.user.role === "staff" || req.user.role === "admin") return true;
  if (req.user._id.toString() === memberId.toString()) return true;

  const authorizedMembers = req.user.caregiverProfile?.authorizedMemberIds || [];
  return authorizedMembers.some((id) => id.toString() === memberId.toString());
}

const requireMemberAccess = asyncHandler(async (req, res, next) => {
  const memberId = req.params.memberId || req.body.member || req.query.memberId || req.user._id;

  if (!(await canAccessMember(req, memberId))) {
    return res.status(403).json({ message: "Member access is not authorized" });
  }

  req.memberId = memberId;
  return next();
});

module.exports = {
  requireAuth,
  requireRole,
  requireMemberAccess,
  canAccessMember
};
