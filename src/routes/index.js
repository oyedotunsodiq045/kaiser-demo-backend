const express = require("express");
const appointmentRoutes = require("./appointmentRoutes");
const authRoutes = require("./authRoutes");
const automationRoutes = require("./automationRoutes");
const digitalIdRoutes = require("./digitalIdRoutes");
const messageRoutes = require("./messageRoutes");
const prescriptionRoutes = require("./prescriptionRoutes");
const recordRoutes = require("./recordRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "kaiser-demo-backend" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/records", recordRoutes);
router.use("/digital-id", digitalIdRoutes);
router.use("/messages", messageRoutes);
router.use("/automations", automationRoutes);

module.exports = router;
