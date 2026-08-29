# Postman API Documentation

This guide documents the demo medical app API for Postman. It covers member signup/login, staff login, appointments, prescriptions, medical records, connected-care links, digital ID, messaging, caregiver access, and automation queues.

Base URL:

```text
https://kaiser-demo-backend.onrender.com/api
```

Local development URL:

```text
http://localhost:4000/api
```

Import these files into Postman:

- `postman/Kaiser-Demo-Backend.postman_collection.json`
- `postman/Kaiser-Demo-Backend.postman_environment.json`

This API is for demo data only. Do not use it with real patient data.

## Setup

Start the backend first:

```bash
npm install
copy .env.example .env
npm run seed
npm run dev
```

Environment values for the current Atlas/Render demo setup:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@starkmedia.0mv8b.mongodb.net/kaiser_demo
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=https://kaiser-demo-backend.onrender.com/api
```

Keep the real MongoDB username, password, and JWT secret in `.env` or Render environment variables only. Do not paste real secrets into documentation or commit them to Git.

The seeded staff login is:

```text
Email: staff.demo@example.com
Password: Password123!
```

## Import Into Postman

1. Open Postman.
2. Click `Import`.
3. Import `postman/Kaiser-Demo-Backend.postman_collection.json`.
4. Import `postman/Kaiser-Demo-Backend.postman_environment.json`.
5. Select the `Kaiser Demo Backend - Render` environment.
6. Run requests in the order shown in the collection.

## Environment Variables

The Postman environment includes:

| Variable | Purpose |
| --- | --- |
| `baseUrl` | API base URL |
| `memberToken` | JWT returned by member signup/login |
| `staffToken` | JWT returned by staff login |
| `caregiverToken` | JWT returned by caregiver signup/login |
| `memberId` | MongoDB `_id` for the member |
| `caregiverId` | MongoDB `_id` for the caregiver |
| `appointmentId` | MongoDB `_id` for a created appointment |
| `prescriptionId` | MongoDB `_id` for a created prescription |
| `messageId` | MongoDB `_id` for a created message |
| `automationTaskId` | MongoDB `_id` for an automation task |

Several requests include Postman test scripts that save these variables automatically after successful responses.

## Recommended Demo Flow

1. `Auth / Register Member`
2. `Auth / Login Member`
3. `Auth / Login Staff`
4. `Appointments / Schedule Appointment`
5. `Appointments / View Appointments`
6. `Appointments / Complete Pre-Visit Check-In`
7. `Appointments / Cancel Appointment`
8. `Prescriptions / Staff Add Prescription`
9. `Prescriptions / View Prescriptions and Pickup Details`
10. `Prescriptions / Request Refill`
11. `Medical Records / Staff Add Test Result`
12. `Medical Records / Staff Add Health History`
13. `Medical Records / Staff Add Immunization`
14. `Connected Care / Link External MyChart Account`
15. `Medical Records / View Unified Records Feed`
16. `Digital ID / Get Digital Membership Card`
17. `Messaging / Email Care Team`
18. `Messaging / Email Member Services`
19. `Messaging / View Message Threads`
20. `Messaging / Reply to Message`
21. `Automations / View Member Automation Tasks`
22. `Automations / View Staff Work Queue`

## Auth Setup in Postman

Member requests use:

```text
Authorization: Bearer {{memberToken}}
```

Staff requests use:

```text
Authorization: Bearer {{staffToken}}
```

You do not need to paste tokens manually if you run `Register Member`, `Login Member`, and `Login Staff` first.

## Core Requests

### Signup and Login

`POST {{baseUrl}}/auth/register`

Member body:

```json
{
  "firstName": "Ava",
  "lastName": "Member",
  "email": "ava.member@example.com",
  "password": "Password123!",
  "accountType": "member",
  "memberId": "KP-DEMO-1001",
  "phone": "555-0100"
}
```

Caregiver body:

```json
{
  "firstName": "Sam",
  "lastName": "Caregiver",
  "email": "sam.caregiver@example.com",
  "password": "Password123!",
  "accountType": "caregiver",
  "relationshipToMember": "Parent"
}
```

`POST {{baseUrl}}/auth/login`

Member login body:

```json
{
  "email": "ava.member@example.com",
  "password": "Password123!"
}
```

Staff login body:

```json
{
  "email": "staff.demo@example.com",
  "password": "Password123!"
}
```

### Appointments

Schedule appointment:

```text
POST {{baseUrl}}/appointments?memberId={{memberId}}
```

```json
{
  "providerName": "Dr. Jordan Lee",
  "department": "Primary Care",
  "location": "Oakland Medical Center",
  "visitType": "in_person",
  "reason": "Annual wellness visit",
  "startsAt": "2026-09-15T16:00:00.000Z",
  "endsAt": "2026-09-15T16:30:00.000Z"
}
```

View appointments:

```text
GET {{baseUrl}}/appointments?memberId={{memberId}}
```

Complete pre-visit check-in:

```text
PATCH {{baseUrl}}/appointments/{{appointmentId}}/check-in?memberId={{memberId}}
```

```json
{
  "symptoms": "No new symptoms",
  "medicationsChanged": false,
  "insuranceConfirmed": true
}
```

Cancel appointment:

```text
PATCH {{baseUrl}}/appointments/{{appointmentId}}/cancel?memberId={{memberId}}
```

```json
{
  "reason": "Need to reschedule"
}
```

### Prescriptions

Staff add/fill prescription:

```text
POST {{baseUrl}}/prescriptions
```

```json
{
  "member": "{{memberId}}",
  "medicationName": "Atorvastatin",
  "dosage": "10 mg",
  "prescribingProvider": "Dr. Jordan Lee",
  "instructions": "Take one tablet by mouth daily",
  "refillsRemaining": 3,
  "pharmacy": {
    "name": "Demo Medical Center Pharmacy",
    "address": "100 Health Way",
    "phone": "555-0199"
  },
  "nextEligibleRefillAt": "2026-10-01T14:00:00.000Z"
}
```

View prescriptions and pickup details:

```text
GET {{baseUrl}}/prescriptions?memberId={{memberId}}
```

Request refill:

```text
PATCH {{baseUrl}}/prescriptions/{{prescriptionId}}/refill?memberId={{memberId}}
```

After refill, `pickupDetails.status` becomes `processing`.

### Medical Records

Staff add test result:

```text
POST {{baseUrl}}/records
```

```json
{
  "member": "{{memberId}}",
  "recordType": "test_result",
  "title": "Lipid Panel",
  "providerName": "Dr. Jordan Lee",
  "observedAt": "2026-08-20T15:30:00.000Z",
  "summary": "Routine cholesterol screening.",
  "values": [
    {
      "name": "LDL",
      "value": "94",
      "unit": "mg/dL",
      "referenceRange": "0-99",
      "flag": "normal"
    }
  ]
}
```

Staff add health history:

```json
{
  "member": "{{memberId}}",
  "recordType": "health_history",
  "title": "Annual Wellness Summary",
  "observedAt": "2026-08-20T15:30:00.000Z",
  "summary": "Member completed annual wellness visit."
}
```

Staff add immunization:

```json
{
  "member": "{{memberId}}",
  "recordType": "immunization",
  "title": "Influenza Vaccine",
  "observedAt": "2026-08-20T15:30:00.000Z",
  "summary": "Seasonal influenza vaccine administered."
}
```

View unified medical records feed:

```text
GET {{baseUrl}}/records?memberId={{memberId}}
```

### Connected Care

Link external MyChart-style account:

```text
POST {{baseUrl}}/records/external-accounts?memberId={{memberId}}
```

```json
{
  "organizationName": "Outside Health System",
  "externalPatientId": "EXT-12345",
  "provider": "mychart"
}
```

View linked external accounts:

```text
GET {{baseUrl}}/records/external-accounts?memberId={{memberId}}
```

The demo link creates an `outside_record` in the unified records feed.

### Digital Membership Card

```text
GET {{baseUrl}}/digital-id?memberId={{memberId}}
```

The response includes member name, member ID, plan details, group number, and a demo barcode value for check-ins and pharmacy pickups.

### Messaging

Email care team:

```text
POST {{baseUrl}}/messages?memberId={{memberId}}
```

```json
{
  "recipientType": "care_team",
  "subject": "Question about recent test results",
  "body": "Can someone explain my lipid panel results?",
  "category": "medical_question",
  "priority": "normal"
}
```

Email member services:

```json
{
  "recipientType": "member_services",
  "subject": "Coverage question",
  "body": "Can you confirm whether video visits are covered by my plan?",
  "category": "coverage",
  "priority": "normal"
}
```

View messages:

```text
GET {{baseUrl}}/messages?memberId={{memberId}}
```

Reply to message:

```text
POST {{baseUrl}}/messages/{{messageId}}/replies
```

```json
{
  "body": "Adding one more detail to my question."
}
```

Staff reply:

```json
{
  "body": "Thanks for reaching out. Your care team will review this and follow up.",
  "status": "in_review"
}
```

### Automation Tasks

View member automation tasks:

```text
GET {{baseUrl}}/automations/member?memberId={{memberId}}
```

View staff work queue:

```text
GET {{baseUrl}}/automations/staff?status=pending
```

Update automation task:

```text
PATCH {{baseUrl}}/automations/{{automationTaskId}}
```

```json
{
  "status": "completed",
  "note": "Handled during demo workflow."
}
```

## Caregiver Access

After a caregiver registers, staff can link that caregiver to a member:

```text
POST {{baseUrl}}/users/caregivers/link
```

```json
{
  "caregiverId": "{{caregiverId}}",
  "memberId": "{{memberId}}"
}
```

After linking, the caregiver can use `Bearer {{caregiverToken}}` with `memberId={{memberId}}` on member endpoints.

## Common Status Codes

| Status | Meaning |
| --- | --- |
| `200` | Request succeeded |
| `201` | Record created |
| `400` | Request body failed validation |
| `401` | Missing, invalid, or expired JWT |
| `403` | User is not authorized for the member or staff-only resource |
| `404` | Record not found |
| `409` | Duplicate unique value, such as email or member ID |
