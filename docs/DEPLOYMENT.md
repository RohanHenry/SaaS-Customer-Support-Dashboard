# Deployment Guide

SupportFlow is two deployable apps — a **Next.js frontend** and an **Express API**
backed by **MySQL**. A common, low-cost setup:

| Piece | Suggested host |
|---|---|
| Frontend (Next.js) | Vercel |
| Backend (Express) | Railway / Render / Fly.io |
| Database (MySQL) | Railway / PlanetScale / Aiven |

## 1. Provision MySQL
Create a managed MySQL database and copy its connection string. It will look like:
```
mysql://USER:PASSWORD@HOST:3306/DATABASE
```

## 2. Deploy the backend
Set these environment variables on your backend host:

| Variable | Example |
|---|---|
| `DATABASE_URL` | `mysql://user:pass@host:3306/supportflow` |
| `JWT_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |
| `CLIENT_URL` | your deployed frontend URL, e.g. `https://supportflow.vercel.app` |
| `NODE_ENV` | `production` |
| `PORT` | provided by the host |

Build & start commands:
```bash
npm install
npm run db:migrate     # or: npx prisma migrate deploy  (production)
npm run build          # tsc → dist/
npm start              # node dist/server.js
```
> Optionally run `npm run db:seed` once to load demo data.

**Production notes:**
- In production the auth cookie is sent with `Secure` (HTTPS only) — already handled via `NODE_ENV`.
- If frontend and backend are on **different domains**, the cookie is cross-site. Either host them on the same parent domain, or switch the cookie to `sameSite: "none"` + `secure: true` (see `backend/src/utils/cookies.ts`).
- Use `prisma migrate deploy` (not `migrate dev`) in production — it applies existing migrations without prompting.

## 3. Deploy the frontend (Vercel)
1. Import the repo; set the **root directory** to `frontend/`.
2. Add the environment variable:
   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | your deployed backend URL, e.g. `https://api.supportflow.app` |
3. Deploy. Vercel auto-detects Next.js (build: `next build`).

## 4. Connect the two
- Backend `CLIENT_URL` must equal the frontend's URL (for CORS + cookies).
- Frontend `NEXT_PUBLIC_API_URL` must equal the backend's URL.
- Redeploy both after setting these.

## 5. Verify
- Visit the frontend URL → log in with a demo account.
- Check `GET <backend-url>/api/health` returns `{ "status": "ok" }`.

## CORS & Cookies checklist
- [ ] Backend `CLIENT_URL` = exact frontend origin (no trailing slash)
- [ ] `cors({ credentials: true })` is enabled (it is)
- [ ] Frontend calls use `credentials: "include"` (they do, via `apiFetch`)
- [ ] HTTPS on both in production
