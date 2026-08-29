const { z } = require("zod");
const Prescription = require("../models/Prescription");
const AutomationTask = require("../models/AutomationTask");
const asyncHandler = require("../utils/asyncHandler");

const prescriptionSchema = z.object({
  member: z.string().optional(),
  medicationName: z.string().min(1),
  dosage: z.string().optional(),
  prescribingProvider: z.string().optional(),
  instructions: z.string().optional(),
  refillsRemaining: z.number().int().min(0).optional(),
  pharmacy: z
    .object({
      name: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional()
    })
    .optional(),
  nextEligibleRefillAt: z.coerce.date().optional()
});

const listPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ member: req.memberId }).sort({ medicationName: 1 });
  return res.json({ prescriptions });
});

const createPrescription = asyncHandler(async (req, res) => {
  const payload = prescriptionSchema.parse(req.body);
  const member = payload.member || req.user._id;
  const prescription = await Prescription.create({ ...payload, member });

  if (prescription.nextEligibleRefillAt) {
    await AutomationTask.create({
      member,
      type: "prescription_refill_reminder",
      title: `Refill reminder: ${prescription.medicationName}`,
      scheduledFor: prescription.nextEligibleRefillAt,
      payload: { prescription: prescription._id }
    });
  }

  return res.status(201).json({ prescription });
});

const requestRefill = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findOne({ _id: req.params.id, member: req.memberId });
  if (!prescription) return res.status(404).json({ message: "Prescription not found" });

  if (prescription.refillsRemaining <= 0) {
    return res.status(400).json({ message: "No refills remaining" });
  }

  prescription.refillsRemaining -= 1;
  prescription.pickupDetails.status = "processing";
  prescription.lastFilledAt = new Date();
  await prescription.save();

  return res.json({ prescription });
});

module.exports = {
  listPrescriptions,
  createPrescription,
  requestRefill
};
