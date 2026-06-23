# SupportFlow — SaaS Customer Support Dashboard

A full-stack, multi-role customer support / ticketing platform (think Zendesk or
Intercom), built with a decoupled **Next.js** frontend and an **Express** REST API.
It features JWT authentication with role-based access control, full ticket
management, server-side search/filter/sort/pagination, and an analytics dashboard.

> **Tech:** Next.js · React · TypeScript · Tailwind CSS · Node.js · Express ·
> Prisma · MySQL · JWT · Zod · React Hook Form

---

## ✨ Features

- 🔐 **Authentication & RBAC** — register/login/logout with JWTs in httpOnly cookies; three roles (Admin, Support Agent, Customer) enforced at the route **and** data layers.
- 🎫 **Ticket management** — full CRUD with priorities, categories, agent assignment, and threaded comments.
- 🔎 **Search, filter, sort & pagination** — all server-side (search by title/customer, filter by status/priority/agent, sort, paginate).
- 📊 **Analytics dashboard** — live KPIs, tickets-by-status & by-priority charts, and a recent-activity feed (all via SQL aggregation).
- 🧾 **Audit trail & timeline** — every status change is recorded and shown as a per-ticket activity timeline.
- 👥 **Customer profiles & agent workload** — drill into a customer's tickets; see each agent's active/total load.
- 🔔 **Notifications** — an activity bell with an unread indicator.
- 💅 **Polished UX** — responsive layout with a mobile drawer, toast notifications, form validation (React Hook Form + Zod), and consistent loading/error/empty states.

## 🖼️ Screenshots

> Replace these placeholders with real screenshots (see [docs below](#-adding-screenshots)).

| Dashboard | Tickets | Ticket detail |
|---|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Tickets](docs/screenshots/tickets.png) | ![Ticket detail](docs/screenshots/ticket-detail.png) |

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS, React Hook Form, Zod, lucide-react |
| **Backend** | Node.js, Express, TypeScript, REST API |
| **Database** | MySQL + Prisma ORM (driver adapter) |
| **Auth** | JWT (httpOnly cookies), bcrypt, role-based middleware |
| **Validation** | Zod (shared client + server rules) |

## 📂 Project Structure

```
SaaS Customer Support Dashboard/
├── backend/                 # Express + TypeScript REST API
│   ├── prisma/              # schema, migrations, seed
│   └── src/
│       ├── config/          # env, prisma client
│       ├── middleware/      # error handler, validation
│       ├── modules/         # auth, tickets, users, analytics
│       └── utils/           # jwt, cookies, errors, asyncHandler
├── frontend/                # Next.js dashboard
│   └── src/
│       ├── app/             # routes (login, dashboard, tickets, …)
│       ├── components/      # UI + dashboard components
│       ├── context/         # auth + toast providers
│       └── lib/             # API service layer, types, validation
└── docs/                    # API, database, deployment docs
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm
- MySQL 8 running locally

### 1. Database setup
Create a database and a dedicated user (you'll be prompted for your MySQL root password):

```bash
mysql -u root -p -e "
CREATE DATABASE IF NOT EXISTS supportflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'supportflow'@'localhost' IDENTIFIED BY 'supportflow_dev_pw';
GRANT ALL PRIVILEGES ON supportflow.* TO 'supportflow'@'localhost';
GRANT ALL PRIVILEGES ON \`prisma_%\`.* TO 'supportflow'@'localhost';
FLUSH PRIVILEGES;
"
```

### 2. Backend
```bash
cd backend
cp .env.example .env          # adjust DATABASE_URL / JWT_SECRET if needed
npm install
npm run db:migrate            # create tables
npm run db:seed               # load demo data
npm run dev                   # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

Open **http://localhost:3000** and sign in with a demo account below.

## 🔑 Demo Accounts

All demo accounts use the password **`password123`**.

| Role | Email |
|---|---|
| Admin | `admin@supportflow.test` |
| Support Agent | `agent@supportflow.test` |
| Customer | `customer@supportflow.test` |

## 📚 Documentation

- [API Reference](docs/API.md) — every endpoint, with request/response shapes
- [Database Schema](docs/DATABASE.md) — models, relations, and design decisions
- [Deployment Guide](docs/DEPLOYMENT.md) — how to ship it

## 📸 Adding Screenshots

1. Run the app and log in as Admin.
2. Capture the Dashboard, Tickets list, and a Ticket detail page.
3. Save them as `docs/screenshots/dashboard.png`, `tickets.png`, `ticket-detail.png`.

## 📄 License

MIT — see [LICENSE](LICENSE).
# -SaaS-Customer-Support-Dashboard
