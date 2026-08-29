# Kaiser Permanente-Style Medical App Demo Backend

This is a simple Express and Mongoose API for a medical member app demo. It is not affiliated with Kaiser Permanente and does not implement production health-care compliance controls. Treat all data as demo data.

## Features Included

- Member and caregiver registration
- Member sign-in with JWT authentication
- Staff-seeded internal account support
- Caregiver-to-member authorization
- Appointment scheduling, listing, cancellation, and pre-visit check-in
- Prescription listing, staff creation, and refill requests
- Medical records feed for test results, health history, immunizations, and outside records
- External MyChart-style connected-care account links
- Digital membership card payload
- Member and staff messaging
- Member-facing reminders and staff work queue automation tasks

## Setup

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

The API defaults to `http://localhost:4000/api`.

For Postman-based developer usage examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Environment

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/kaiser_demo
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
```

## Main Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Register a member:

```json
{
  "firstName": "Ava",
  "lastName": "Member",
  "email": "ava@example.com",
  "password": "Password123!",
  "accountType": "member",
  "memberId": "KP-DEMO-1001"
}
```

Register a caregiver:

```json
{
  "firstName": "Sam",
  "lastName": "Caregiver",
  "email": "sam@example.com",
  "password": "Password123!",
  "accountType": "caregiver",
  "relationshipToMember": "Parent"
}
```

### Users

- `GET /api/users/members/:memberId`
- `POST /api/users/caregivers/link` staff/admin only

### Appointments

- `GET /api/appointments?memberId=:memberId`
- `POST /api/appointments`
- `PATCH /api/appointments/:id/check-in`
- `PATCH /api/appointments/:id/cancel`

### Prescriptions

- `GET /api/prescriptions?memberId=:memberId`
- `POST /api/prescriptions` staff/admin only
- `PATCH /api/prescriptions/:id/refill`

### Medical Records and Connected Care

- `GET /api/records?memberId=:memberId`
- `POST /api/records` staff/admin only
- `GET /api/records/external-accounts?memberId=:memberId`
- `POST /api/records/external-accounts`

### Digital ID

- `GET /api/digital-id?memberId=:memberId`

### Messaging

- `GET /api/messages?memberId=:memberId`
- `POST /api/messages`
- `POST /api/messages/:id/replies`

### Automations

- `GET /api/automations/member?memberId=:memberId`
- `GET /api/automations/staff?status=pending` staff/admin only
- `PATCH /api/automations/:id` staff/admin only

## Demo Notes

- Members can register and sign in directly.
- Caregivers can register, but staff/admin must link them to a member before they can access that member's data.
- Internal staff registration is intentionally not exposed as a public endpoint. Run `npm run seed` to create `staff.demo@example.com` with password `Password123!`.
- Automation is represented as persisted work items. In a fuller product, a scheduler such as BullMQ, Agenda, or a managed job runner would process these tasks.
