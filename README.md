# Maintenix

[![CI](https://github.com/sylamarie/maintenix-property-maintenance-crm/actions/workflows/ci.yml/badge.svg)](https://github.com/sylamarie/maintenix-property-maintenance-crm/actions/workflows/ci.yml)

Maintenix is a full-stack property maintenance CRM and field service platform built as a portfolio project. It models the internal system a UK property maintenance company would use to manage clients, properties, work orders, field operatives, client approvals, variations, photos, and job reports.

**Live demo: [maintenix-xi.vercel.app](https://maintenix-xi.vercel.app/login)**

## Try It In 10 Seconds

1. Open the [live demo](https://maintenix-xi.vercel.app/login).
2. Click **Admin**, **Operative**, or **Client**. There is no password to type; you are signed in straight away.
3. Look around, then sign out and try another role. The three roles see very different things.

Good to know:

- The API runs on a free hosting plan that sleeps when nobody is using it. If the first sign-in takes up to a minute, that is the server waking up. After that it is fast.
- The demo data is shared and you can change it. If it looks odd, someone has been testing.
- Photo uploads work, but files on the free plan are cleared whenever the API redeploys.

## Screenshots

**Admin dashboard**: workload, overdue alerts, and recent jobs across every client.

![Admin dashboard showing job status breakdown, overdue alerts and recent jobs](docs/screenshots/admin-dashboard.png)

**Operative dashboard**: what a field worker sees on their phone or tablet: only their own assigned jobs.

![Operative dashboard listing assigned jobs with status, priority and due dates](docs/screenshots/operative-dashboard.png)

**Client portal**: read-only job tracking, plus approving or rejecting priced variations.

![Client portal showing properties, active jobs and variations awaiting approval](docs/screenshots/client-portal.png)

## What This Project Shows

The goal is to demonstrate production-style full-stack work, not just screens that look right:

- **Real business rules.** Three roles with different data ownership. An operative can only open jobs assigned to them, and a client can only see their own properties.
- **A workflow that crosses roles.** An operative raises a variation, an admin prices it, and the client approves or rejects it.
- **Security basics done properly.** Passwords are hashed with bcrypt, and the server refuses to start with a weak signing secret. Failed logins are rate limited, errors never leak stack traces, and uploads are checked by file signature rather than trusting the file name.
- **Built to stay correct.** 64 automated tests (Vitest, Supertest, Testing Library) run in GitHub Actions on every pull request, together with linting and a production build.
- **Scales past the demo data.** Paginated lists, debounced search, and database indexes for the search queries.
- **Accessible UI.** Dialogs trap keyboard focus and close with Escape, and routes load on demand.
- **Actually deployed.** The frontend, API, and database run on three separate free services (see below).

## How It Is Built

```mermaid
flowchart LR
  Browser["Browser"] --> Vercel["Frontend<br/>React + Vite<br/>(Vercel)"]
  Vercel -->|"REST API + JWT"| Render["API<br/>Node + Express<br/>(Render)"]
  Render --> Neon[("PostgreSQL<br/>(Neon)")]
```

The repository is an npm workspaces monorepo: `client/` is the React app and `server/` is the Express API. The API follows a routes, controllers, models, middleware layout. Step-by-step hosting instructions are in [docs/deployment.md](docs/deployment.md).

## Why I Built It

Simple portfolio websites do not show how a developer handles real business logic. Maintenix is designed around a realistic service business workflow with multiple user roles and data ownership rules:

- office staff need CRM, job management, scheduling, and variation review tools
- field operatives need assigned jobs, notes, status updates, and photo evidence
- clients need read-only job visibility, variation approvals, and completion reports

## Key Features

- JWT authentication with bcrypt password hashing
- Role-based access for admin, operative, and client users
- Admin dashboard with live PostgreSQL metrics
- Client and property CRM
- Job/work order CRUD with status, priority, due dates, and operative assignment
- Schedule/dispatch list with filters
- Operative dashboard and assigned job workflow
- Job status updates with automatic completion dates
- Job notes with author metadata
- Local before/after/general photo uploads
- Variation workflow: operative raises, admin prices, client approves or rejects
- Client portal for properties, jobs, variations, photos, and read-only job details
- Shared job report page for all roles with browser print / Save as PDF support
- Search, filtering, pagination, loading states, empty states, validation, errors, and confirmations
- One-click demo sign-in for the three demo accounts (switched on only for the live demo)
- Responsive React/Tailwind interface with reusable UI components

## User Roles

Admin:

- manage clients, properties, jobs, assignments, schedules, and variations
- view all job reports

Operative:

- view only assigned jobs
- update status, add notes, upload photos, and raise variations
- view reports only for assigned jobs

Client:

- view only linked properties, jobs, photos, variations, and reports
- approve or reject variations awaiting client approval

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Styling: Tailwind CSS, lucide-react icons
- Backend: Node.js, Express
- Database: PostgreSQL
- Auth: JWT, bcrypt
- Uploads: local Express static file storage for MVP photos
- API style: REST
- Reports: browser print / Save as PDF
- Testing: Vitest, Supertest, React Testing Library
- Quality checks: ESLint, Prettier, GitHub Actions CI
- Hosting: Vercel (frontend), Render (API), Neon (PostgreSQL)

## Demo Accounts

**On the live demo** you do not need a password: click a role on the login page. That works because the live API has `DEMO_LOGIN_ENABLED=true`, which turns on a sign-in route that accepts only these three demo emails. It is off by default, and it never works for any other account.

**On your own computer**, these accounts are created by `npm run db:seed`. The password below only works against a local database; seeding a hosted database requires you to choose your own password (see [docs/deployment.md](docs/deployment.md)).

```txt
Admin
Email:    admin@maintenix.com
Password: Password123

Operative
Email:    operative@maintenix.com
Password: Password123

Client
Email:    client@maintenix.com
Password: Password123
```

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL 14 or newer

## Installation

Install dependencies from the repository root:

```powershell
npm install
```

Create local environment files:

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

## Environment Variables

Backend `server/.env`:

```txt
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/maintenix
DATABASE_CONNECTION_TIMEOUT_MS=5000
JWT_SECRET=<a random value of at least 32 characters, see below>
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
DEMO_LOGIN_ENABLED=false
```

`JWT_SECRET` signs every login token, so the API refuses to start if it is missing or short. Generate one and paste it into `server/.env`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Never commit `server/.env`; it is already in `.gitignore`.

Frontend `client/.env`:

```txt
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Maintenix
```

## Database Setup

Create a PostgreSQL database named `maintenix`, then run:

```powershell
npm run db:test
npm run db:schema
npm run db:seed
```

The seed script is idempotent and updates the core demo accounts and portfolio demo records. It does not remove records you manually created while testing. For a pristine portfolio demo, create a fresh local database and rerun the schema and seed commands.

Seeded demo data includes:

- Northstar Housing Association
- Harbour Estates
- Greenfield Property Services
- Flat 12, Harbour View Block C
- 24 Maple Court
- 8 King Street
- Bathroom leak repair
- Communal hallway light replacement
- Kitchen cabinet door repair
- Boiler pressure check
- Damaged fence panel replacement
- variations in pending admin review, pending client approval, approved, and rejected states

## Run The App

Start backend and frontend together:

```powershell
npm run dev
```

Or run them separately:

```powershell
npm run dev:server
npm run dev:client
```

Local URLs:

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Health:   http://localhost:5000/api/health
```

## Test, Lint, And Build

```powershell
npm test        # server and client tests (64 in total)
npm run lint    # ESLint
npm run build   # production build of the frontend
```

The same three checks run automatically in GitHub Actions on every push to `main` and on every pull request. The server tests mock the database, so you do not need PostgreSQL running to run them.

## Main Workflow To Test

1. Log in as admin and review dashboard metrics.
2. Create or edit a client, property, and job.
3. Assign a job to the demo operative.
4. Log in as operative and open the assigned job.
5. Update the job status, add a note, and upload before/after/general photos.
6. Raise a variation from the operative job detail page.
7. Log in as admin and price or reject the variation.
8. Log in as client and approve or reject a pending variation.
9. Open a job report as each role and use Print / Save as PDF.

## Folder Structure

```txt
maintenix/
  client/
    src/
      api/            REST API clients
      auth/           auth context and route guards
      components/     shared UI, sidebar, topbar
      hooks/          reusable React hooks
      layouts/        app/auth layouts
      pages/          admin, operative, client, shared pages
      utils/          constants and formatters
    vercel.json       makes deep links such as /admin/jobs work on Vercel
  server/
    src/
      __tests__/      API tests (Vitest + Supertest, database mocked)
      config/         env and PostgreSQL pool
      controllers/    request handlers
      db/             schema, seed, and demo-password scripts
      middleware/     auth, roles, errors, uploads
      models/         PostgreSQL query modules
      routes/         Express routers
      services/       auth service
      utils/          validation, pagination, and error helpers
    uploads/          local uploaded files in development
  docs/
    screenshots/      images used in this README
    deployment.md     step-by-step hosting guide
    portfolio-description.md
    final-qa-checklist.md
  .github/workflows/  CI: lint, test, build
  render.yaml         Render blueprint for the API
```

## API Overview

Authentication:

```txt
POST /api/auth/login
POST /api/auth/demo-login     (only when DEMO_LOGIN_ENABLED=true, demo emails only)
GET  /api/auth/me
```

Pagination: list endpoints for jobs, clients, and properties accept `?page=1&limit=10` (limit is capped at 100) and `?search=`. When `page` or `limit` is sent, the response also includes `pagination: { page, limit, total, totalPages }`.

Admin:

```txt
GET    /api/admin/dashboard
GET    /api/clients
POST   /api/clients
PATCH  /api/clients/:id
DELETE /api/clients/:id
GET    /api/properties
POST   /api/properties
PATCH  /api/properties/:id
DELETE /api/properties/:id
GET    /api/jobs
POST   /api/jobs
PATCH  /api/jobs/:id
PATCH  /api/jobs/:id/status
PATCH  /api/jobs/:id/assign
DELETE /api/jobs/:id
GET    /api/users/operatives
```

Operative:

```txt
GET   /api/operative/dashboard
GET   /api/operative/jobs
GET   /api/operative/jobs/:id
PATCH /api/operative/jobs/:id/status
POST  /api/job-notes
POST  /api/uploads/jobs/:jobId/photos
POST  /api/variations
```

Client:

```txt
GET   /api/client/dashboard
GET   /api/client/properties
GET   /api/client/jobs
GET   /api/client/jobs/:id
GET   /api/client/variations
PATCH /api/variations/:id/client-decision
```

Reports:

```txt
GET /api/reports/jobs/:jobId
```

## Reports And PDF Export

Maintenix uses a print-friendly report page for the MVP. The `Print / Save as PDF` button opens the browser print dialog. Sidebar, topbar, buttons, and photo links are hidden in print styles while the report content, badges, notes, variations, and photos remain visible.

A future production version could add server-side PDF generation for archived reports and email attachments.

## Deployment Preparation

Step-by-step hosting guide (Render + Neon + Vercel): [docs/deployment.md](docs/deployment.md). The overview below is for reference.

Recommended deployment plan:

- Frontend: Vercel or Netlify
- Backend: Render, Railway, Fly.io, or a VPS
- Database: Supabase, Neon, Railway PostgreSQL, Render PostgreSQL, or managed cloud PostgreSQL
- Uploads: Cloudinary, S3, or another object storage service before production use

Production environment variables:

```txt
NODE_ENV=production
PORT=<provided-by-host>
CLIENT_URL=https://your-frontend-domain.com
DATABASE_URL=<managed-postgresql-url>
DATABASE_CONNECTION_TIMEOUT_MS=10000
JWT_SECRET=<long-random-production-secret>
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
DEMO_LOGIN_ENABLED=false
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=Maintenix
```

Keep `DEMO_LOGIN_ENABLED=false` on any deployment that holds real data. Set it to `true` only on a public portfolio demo, where anyone can sign in as the three demo accounts.

CORS note:

- Set `CLIENT_URL` to the exact deployed frontend URL.
- If using multiple frontend domains, separate them with commas.

Upload storage limitation:

- Local uploads are fine for this MVP and local portfolio demo.
- On most hosted backend platforms, local files are temporary and may be removed during redeploys or restarts.
- Use Cloudinary or S3 for production-ready persistent uploads.

## Portfolio Description

Maintenix is a role-based property maintenance CRM and field service platform. It demonstrates full-stack business application development with React, Express, PostgreSQL, JWT authentication, admin CRUD workflows, field operative job updates, photo uploads, client approvals, variation pricing, and print-ready job reports.

See [docs/portfolio-description.md](docs/portfolio-description.md) for copy-ready portfolio text.

## Final QA

See [docs/final-qa-checklist.md](docs/final-qa-checklist.md) for the final test checklist before recording a demo or taking screenshots.

## Future Improvements

- Cloudinary or S3 upload storage
- Server-side PDF generation for archived job reports
- Email notifications for variation approvals and completed reports
- Quotes and invoice module
- Schedule calendar drag-and-drop
- Audit log for status and variation changes
- Password reset and user invite flow
- Pagination on the clients and properties pages (the API already supports it)
- Stricter job status rules, so a job cannot jump between any two statuses
- Browser-level end-to-end tests (for example Playwright)
