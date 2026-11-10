# Maintenix

Maintenix is a full-stack property maintenance CRM and field service platform built as a portfolio project. It models the internal system a UK property maintenance company would use to manage clients, properties, work orders, field operatives, client approvals, variations, photos, and job reports.

The goal of this project is to demonstrate production-style full-stack application work: role-based authentication, relational data modelling, REST APIs, admin CRUD workflows, operative field workflows, client portal access, local uploads, and print-ready reporting.

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
- Search, filtering, loading states, empty states, validation, errors, and confirmations
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

## Screenshots

Add screenshots to your portfolio or GitHub README after running the app:

- Login page
- Admin dashboard
- Clients CRM page
- Jobs management page
- Operative job detail with notes and uploaded photos
- Variation workflow screens
- Client portal dashboard
- Client job detail
- Job report page
- Print / Save as PDF preview

## Demo Accounts

These are the accounts created by `npm run db:seed` on a **local** database. The password below only works locally: seeding a hosted database requires you to choose your own password (see [docs/deployment.md](docs/deployment.md)).

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
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
```

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

## Build

```powershell
npm run build
```

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
      layouts/        app/auth layouts
      pages/          admin, operative, client, shared pages
      utils/          constants and formatters
  server/
    src/
      config/         env and PostgreSQL pool
      controllers/    request handlers
      db/             schema and seed scripts
      middleware/     auth, roles, errors, uploads
      models/         PostgreSQL query modules
      routes/         Express routers
      services/       auth service
      utils/          validation and error helpers
    uploads/          local uploaded files in development
  docs/
    portfolio-description.md
    final-qa-checklist.md
```

## API Overview

Authentication:

```txt
POST /api/auth/login
GET  /api/auth/me
```

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
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=Maintenix
```

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
- More automated backend and frontend tests
- Deployment CI/CD pipeline
