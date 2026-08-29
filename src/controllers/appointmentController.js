const { z } = require("zod");
const Appointment = require("../models/Appointment");
const AutomationTask = require("../models/AutomationTask");
const asyncHandler = require("../utils/asyncHandler");

const appointmentSchema = z.object({
  member: z.string().optional(),
  providerName: z.string().min(1),
  department: z.string().min(1),
  location: z.string().optional(),
  visitType: z.enum(["in_person", "video", "phone"]).optional(),
  reason: z.string().min(1),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional()
});

const listAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ member: req.memberId }).sort({ startsAt: 1 });
  return res.json({ appointments });
});

const createAppointment = asyncHandler(async (req, res) => {
  const payload = appointmentSchema.parse(req.body);
  const member = req.memberId;

  const appointment = await Appointment.create({ ...payload, member });

  await AutomationTask.create({
    member,
    type: "appointment_reminder",
    title: `Appointment reminder: ${appointment.department}`,
    scheduledFor: new Date(appointment.startsAt.getTime() - 24 * 60 * 60 * 1000),
    payload: { appointment: appointment._id }
  });

  return res.status(201).json({ appointment });
});

const completeCheckIn = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, member: req.memberId },
    {
      status: "checked_in",
      preVisitCheckIn: {
        completed: true,
        completedAt: new Date(),
        symptoms: req.body.symptoms,
        medicationsChanged: req.body.medicationsChanged,
        insuranceConfirmed: req.body.insuranceConfirmed
      }
    },
    { new: true }
  );

  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  return res.json({ appointment });
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, member: req.memberId },
    {
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: req.body.reason
    },
    { new: true }
  );

  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  return res.json({ appointment });
});

module.exports = {
  listAppointments,
  createAppointment,
  completeCheckIn,
  cancelAppointment
};
