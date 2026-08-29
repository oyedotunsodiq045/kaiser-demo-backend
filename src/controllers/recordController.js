const { z } = require("zod");
const MedicalRecord = require("../models/MedicalRecord");
const ExternalAccount = require("../models/ExternalAccount");
const AutomationTask = require("../models/AutomationTask");
const asyncHandler = require("../utils/asyncHandler");

const recordSchema = z.object({
  member: z.string(),
  recordType: z.enum(["test_result", "health_history", "immunization", "outside_record"]),
  title: z.string().min(1),
  source: z.string().optional(),
  observedAt: z.coerce.date().optional(),
  providerName: z.string().optional(),
  summary: z.string().optional(),
  values: z.array(z.object({
    name: z.string().optional(),
    value: z.string().optional(),
    unit: z.string().optional(),
    referenceRange: z.string().optional(),
    flag: z.enum(["low", "normal", "high", "critical", "unknown"]).optional()
  })).optional(),
  visibility: z.enum(["member", "care_team", "staff_only"]).optional()
});

const externalAccountSchema = z.object({
  member: z.string().optional(),
  organizationName: z.string().min(1),
  externalPatientId: z.string().min(1),
  provider: z.enum(["mychart", "other"]).optional()
});

const listRecords = asyncHandler(async (req, res) => {
  const records = await MedicalRecord.find({
    member: req.memberId,
    visibility: { $ne: "staff_only" }
  }).sort({ observedAt: -1, createdAt: -1 });

  return res.json({ records });
});

const createRecord = asyncHandler(async (req, res) => {
  const payload = recordSchema.parse(req.body);
  const record = await MedicalRecord.create(payload);

  if (record.recordType === "test_result") {
    await AutomationTask.create({
      member: record.member,
      type: "test_result_followup",
      title: `Review test result: ${record.title}`,
      scheduledFor: new Date(),
      payload: { record: record._id }
    });
  }

  return res.status(201).json({ record });
});

const connectExternalAccount = asyncHandler(async (req, res) => {
  const payload = externalAccountSchema.parse(req.body);
  const member = payload.member || req.user._id;

  const account = await ExternalAccount.create({
    ...payload,
    member,
    accessStatus: "connected",
    lastSyncedAt: new Date()
  });

  await MedicalRecord.create({
    member,
    recordType: "outside_record",
    title: `${account.organizationName} connected care summary`,
    source: account.organizationName,
    observedAt: new Date(),
    summary: "External account connected. This demo record represents imported outside records."
  });

  return res.status(201).json({ externalAccount: account });
});

const listExternalAccounts = asyncHandler(async (req, res) => {
  const externalAccounts = await ExternalAccount.find({ member: req.memberId }).sort({ createdAt: -1 });
  return res.json({ externalAccounts });
});

module.exports = {
  listRecords,
  createRecord,
  connectExternalAccount,
  listExternalAccounts
};
