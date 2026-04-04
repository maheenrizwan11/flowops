# FlowOps

A multi-organization workflow and request management system. Organizations can manage their own members, roles, and internal approval processes independently.

---

## Prerequisites

- Node.js >= 18
- PostgreSQL running locally

---

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Configure environment variables**
```bash
cp .env.example .env
```

Open `.env` and fill in the values:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/flowops"
JWT_SECRET="any-long-random-string"
PORT=3000
JWT_EXPIRES_IN="7d"
```

**3. Run database migrations**
```bash
npm run db:migrate
```

**4. Seed test data**
```bash
npm run db:seed
```

This creates one organization (`Acme Corp`) with three test users:

| Email | Password | Role |
|-------|----------|------|
| admin@flowops.dev | password123 | ADMIN |
| reviewer@flowops.dev | password123 | REVIEWER |
| requester@flowops.dev | password123 | REQUESTER |

**5. Start the server**
```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `PORT` | Port the server listens on (default: 3000) |
| `JWT_EXPIRES_IN` | JWT expiry duration (e.g. `7d`, `24h`) |

---

## API Reference

All protected routes require the following header:
```
Authorization: Bearer <token>
```

---

### Auth

#### Register
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "email": "jane@example.com", "name": "Jane Doe" }
}
```

#### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "email": "jane@example.com", "name": "Jane Doe" }
}
```

#### Get current user
```
GET /api/auth/me
```
Returns the logged-in user's profile and all organization memberships.

---

### Organizations

#### Create organization
```
POST /api/orgs
```
**Body:**
```json
{
  "name": "Acme Corp",
  "slug": "acme-corp"
}
```
The creator is automatically assigned the ADMIN role.

#### List my organizations
```
GET /api/orgs
```
Returns all organizations the logged-in user belongs to.

#### Get organization
```
GET /api/orgs/:orgId
```
Returns organization details and member list.

#### Update organization
```
PATCH /api/orgs/:orgId
```
Requires ADMIN role.
**Body:**
```json
{ "name": "New Name" }
```

#### Delete organization
```
DELETE /api/orgs/:orgId
```
Requires ADMIN role.

---

### Members

#### List members
```
GET /api/orgs/:orgId/members
```
Returns all members and their roles in the organization.

#### Add member
```
POST /api/orgs/:orgId/members
```
Requires ADMIN role. The user must already have a registered account.

**Body:**
```json
{
  "email": "jane@example.com",
  "role": "REVIEWER"
}
```
`role` must be `REVIEWER` or `REQUESTER`.

#### Change member role
```
PATCH /api/orgs/:orgId/members/:userId
```
Requires ADMIN role.

**Body:**
```json
{ "role": "REVIEWER" }
```

#### Remove member
```
DELETE /api/orgs/:orgId/members/:userId
```
Requires ADMIN role.

---

### Requests — Workflow 1

#### Create draft request
```
POST /api/orgs/:orgId/requests
```
Requires REQUESTER role.

**Body:**
```json
{
  "title": "New Laptop",
  "description": "Need a replacement laptop for development work.",
  "category": "Equipment"
}
```

#### List requests
```
GET /api/orgs/:orgId/requests?status=SUBMITTED
```
Results are filtered by role automatically:
- REQUESTER sees only their own requests
- REVIEWER sees all non-draft requests
- ADMIN sees everything

Optional `status` query param filters by: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `ESCALATED`, `APPROVED`, `REJECTED`, `CLOSED`

#### Get request
```
GET /api/orgs/:orgId/requests/:requestId
```
Returns the request with full status history (timeline).

#### Update draft
```
PATCH /api/orgs/:orgId/requests/:requestId
```
Requires REQUESTER role. Only works on DRAFT status requests you own.

**Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "Updated category"
}
```

#### Submit request
```
POST /api/orgs/:orgId/requests/:requestId/submit
```
Requires REQUESTER role. Moves status from DRAFT to SUBMITTED. All REVIEWERs in the organization are notified.

#### Delete draft
```
DELETE /api/orgs/:orgId/requests/:requestId
```
Requires REQUESTER role. Only works on DRAFT status requests you own.

---

### Review — Workflow 2

#### Start review
```
POST /api/orgs/:orgId/requests/:requestId/review/start
```
Requires REVIEWER or ADMIN role. Moves status to UNDER_REVIEW and assigns the request to the reviewer.

#### Approve request
```
POST /api/orgs/:orgId/requests/:requestId/review/approve
```
Requires REVIEWER or ADMIN role. Must be the assigned reviewer. Moves status to APPROVED and closes the request.

#### Reject request
```
POST /api/orgs/:orgId/requests/:requestId/review/reject
```
Requires REVIEWER or ADMIN role. Must be the assigned reviewer. Moves status to REJECTED and closes the request.

#### Get audit trail
```
GET /api/orgs/:orgId/requests/:requestId/audit
```
Requires REVIEWER or ADMIN role. Returns the full audit log and status history for a request.

**Response:**
```json
{
  "auditLogs": [...],
  "statusHistory": [...]
}
```

---

### Escalation — Workflow 3

#### Escalate request
```
POST /api/orgs/:orgId/requests/:requestId/escalate
```
Requires REVIEWER or ADMIN role. Reassigns the request to another reviewer and marks it as ESCALATED. The new assignee is notified.

**Body:**
```json
{
  "assigneeId": "<user-id>",
  "reason": "Requires senior review"
}
```
`reason` is optional. `assigneeId` must be a REVIEWER or ADMIN in the same organization.

---

### Notifications

#### Get notifications
```
GET /api/notifications
```
Returns all notifications for the logged-in user, newest first.

**Response:**
```json
[
  {
    "id": "...",
    "type": "REQUEST_SUBMITTED",
    "message": "New request submitted: \"New Laptop\"",
    "read": false,
    "createdAt": "2026-04-05T10:00:00.000Z",
    "request": { "id": "...", "title": "New Laptop" }
  }
]
```

#### Mark one as read
```
PATCH /api/notifications/:notificationId/read
```

#### Mark all as read
```
PATCH /api/notifications/read-all
```

---

### Dashboards

#### Requester dashboard
```
GET /api/orgs/:orgId/dashboard/requester
```
Requires REQUESTER role.

**Response:**
```json
{
  "draft": [...],
  "submitted": [...],
  "closed": [...]
}
```

#### Reviewer dashboard
```
GET /api/orgs/:orgId/dashboard/reviewer
```
Requires REVIEWER or ADMIN role.

**Response:**
```json
{
  "assignedToMe": [...],
  "pendingReview": [...]
}
```

#### Admin dashboard
```
GET /api/orgs/:orgId/dashboard/admin
```
Requires ADMIN role.

**Response:**
```json
{
  "memberCount": 3,
  "requestsByStatus": {
    "DRAFT": 1,
    "SUBMITTED": 2,
    "APPROVED": 5
  },
  "recentActivity": [...]
}
```
