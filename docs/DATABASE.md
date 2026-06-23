# Database Schema

SupportFlow uses **MySQL** with **Prisma ORM**. The full schema lives in
[`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma).

## Entity-Relationship Overview

```
        ┌──────────────┐
        │     User     │  role: ADMIN | SUPPORT_AGENT | CUSTOMER
        └──────────────┘
          │   │      │
 createdBy │   │ assignedAgent
          ▼   ▼      
        ┌──────────────┐
        │    Ticket    │  status, priority, category
        └──────────────┘
          │      │      │
   comments│  history│  attachments
          ▼      ▼      ▼
 ┌───────────────┐ ┌────────────────────┐ ┌──────────────┐
 │ TicketComment │ │ TicketStatusHistory│ │  Attachment  │
 └───────────────┘ └────────────────────┘ └──────────────┘
```

## Models

### User
One table for everyone who can sign in. The `role` enum decides permissions —
customers, agents, and admins share the same identity structure (email, password,
name), so we **normalize** them into a single table rather than duplicating fields.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `email` | String | Unique |
| `passwordHash` | String | bcrypt hash; never returned to clients |
| `name` | String | |
| `role` | UserRole | `ADMIN` \| `SUPPORT_AGENT` \| `CUSTOMER` (default `CUSTOMER`) |
| `createdAt` / `updatedAt` | DateTime | |

**Relations:** `createdTickets` (as customer), `assignedTickets` (as agent),
`comments`, `statusChanges`.

### Ticket
The core support request.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `title` | String | |
| `description` | Text | |
| `status` | TicketStatus | `OPEN` \| `IN_PROGRESS` \| `RESOLVED` \| `CLOSED` |
| `priority` | TicketPriority | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` |
| `category` | String? | Optional |
| `createdById` | FK → User | The customer |
| `assignedAgentId` | FK → User? | The agent (nullable = unassigned) |
| `createdAt` / `updatedAt` | DateTime | |

Indexed on `status`, `priority`, `createdById`, `assignedAgentId` for fast filtering.

### TicketComment
A threaded reply. Cascade-deletes with its ticket. FK: `ticketId`, `authorId`.

### TicketStatusHistory
An **immutable audit row** written every time a ticket's status changes.
Powers the activity timeline and the dashboard activity feed.

| Field | Notes |
|---|---|
| `fromStatus` | Previous status (null when the ticket is opened) |
| `toStatus` | New status |
| `changedById` | Who made the change |
| `ticketId` | Cascade-deletes with the ticket |

### Attachment
File metadata (name, URL, size, MIME type) linked to a ticket. Schema is in place
for a future file-upload feature.

## Key Design Decisions

1. **Single `User` table + role enum** — avoids duplicating identity data across
   "customer" and "agent" tables. The Customers/Agents pages are filtered views.
2. **Enums over lookup tables** for status/priority/role — a fixed, small set, so
   enums give compile-time + database-level safety with no joins.
3. **Immutable status history** — instead of only storing the *current* status, we
   record every transition. This made the activity timeline and analytics feed
   essentially free to build later.
4. **`cuid` string IDs** — collision-resistant and safe to expose in URLs.
5. **Cascade deletes** — removing a ticket cleans up its comments, history, and
   attachments automatically (no orphaned rows).

## Migrations & Seed

- `npm run db:migrate` — apply schema changes (`prisma migrate dev`).
- `npm run db:seed` — load demo users + tickets (`prisma/seed.ts`).
- `npm run db:studio` — open Prisma Studio to browse data visually.
