# API Reference

Base URL (development): `http://localhost:4000`

All responses are JSON. Authentication uses a **JWT stored in an httpOnly cookie**
(`sf_token`), set on login/register and sent automatically by the browser. Requests
must include credentials (the frontend uses `credentials: "include"`).

**Error shape** (all errors):
```json
{ "message": "Human-readable message" }
```
Validation errors additionally include a field map:
```json
{ "message": "Validation failed", "errors": { "email": "Enter a valid email address" } }
```

**Roles:** `ADMIN`, `SUPPORT_AGENT`, `CUSTOMER`. "Staff" = Admin or Support Agent.

---

## Auth

### `POST /api/auth/register`
Create a customer account and log in. **Public.**
```json
// Request
{ "name": "Jane Doe", "email": "jane@example.com", "password": "password123" }
// 201 Response
{ "user": { "id": "...", "name": "Jane Doe", "email": "...", "role": "CUSTOMER", "createdAt": "...", "updatedAt": "..." } }
```

### `POST /api/auth/login`
Verify credentials and set the auth cookie. **Public.**
```json
// Request
{ "email": "admin@supportflow.test", "password": "password123" }
// 200 Response
{ "user": { "id": "...", "role": "ADMIN", ... } }
```

### `POST /api/auth/logout`
Clear the auth cookie. → `{ "message": "Logged out" }`

### `GET /api/auth/me`
Return the current user. **Auth required.** → `{ "user": { ... } }` or `401`.

---

## Tickets

All ticket routes require authentication. Customers are scoped to **their own** tickets.

### `GET /api/tickets`
List tickets with search/filter/sort/pagination.

| Query param | Values | Default |
|---|---|---|
| `search` | text (title or customer name) | – |
| `status` | `OPEN` `IN_PROGRESS` `RESOLVED` `CLOSED` | – |
| `priority` | `LOW` `MEDIUM` `HIGH` `URGENT` | – |
| `assignedAgentId` | user id or `unassigned` | – |
| `sort` | `newest` `oldest` `priority` | `newest` |
| `page` | integer ≥ 1 | `1` |
| `pageSize` | 1–50 | `10` |

```json
// 200 Response
{
  "tickets": [ { "id": "...", "title": "...", "status": "OPEN", "priority": "HIGH",
    "createdBy": { "id": "...", "name": "..." }, "assignedAgent": null,
    "_count": { "comments": 2 } } ],
  "pagination": { "page": 1, "pageSize": 10, "total": 4, "totalPages": 1 }
}
```

### `POST /api/tickets`
Create a ticket (caller becomes the creator). **Auth required.**
```json
{ "title": "Printer broken", "description": "It won't print", "priority": "HIGH", "category": "Hardware" }
```
→ `201 { "ticket": { ... } }`

### `GET /api/tickets/:id`
Get one ticket with `comments` and `statusHistory`. Customers may only access their own. → `200 | 403 | 404`.

### `PATCH /api/tickets/:id`
Update status / priority / category / `assignedAgentId` (use `null` to unassign).
**Staff only.** A status change appends a `statusHistory` row. → `200 { "ticket": { ... } }`.

### `DELETE /api/tickets/:id`
Delete a ticket (cascades comments/history). **Admin only.** → `204`.

### `POST /api/tickets/:id/comments`
Add a comment. Same access rules as viewing the ticket.
```json
{ "body": "Any update?" }
```
→ `201 { "comment": { "id": "...", "body": "...", "author": { ... } } }`

---

## Users (staff only)

### `GET /api/users/agents`
List staff for the assign dropdown. → `{ "agents": [ ... ] }`

### `GET /api/users/agents/workload`
Agents with assigned counts. → `{ "agents": [ { ..., "assignedTotal": 2, "assignedActive": 1 } ] }`

### `GET /api/users/customers`
Customer directory with ticket counts. → `{ "customers": [ { ..., "ticketCount": 3 } ] }`

### `GET /api/users/:id`
A customer's profile + their tickets + stats. → `{ "user", "tickets", "stats" }` or `404`.

---

## Analytics

### `GET /api/analytics/overview`
KPIs, chart data, and recent activity — scoped to the caller's role. **Auth required.**
```json
{
  "stats": { "total": 4, "open": 1, "inProgress": 2, "resolved": 1, "closed": 0, "urgent": 1 },
  "byStatus": { "OPEN": 1, "IN_PROGRESS": 2, "RESOLVED": 1, "CLOSED": 0 },
  "byPriority": { "LOW": 1, "MEDIUM": 1, "HIGH": 1, "URGENT": 1 },
  "recentActivity": [ { "id": "...", "ticketId": "...", "ticketTitle": "...",
    "fromStatus": "OPEN", "toStatus": "IN_PROGRESS", "changedByName": "Sam Agent", "createdAt": "..." } ]
}
```

---

## Health

### `GET /api/health`
Liveness probe. → `{ "status": "ok", "service": "supportflow-backend", "timestamp": "..." }`
