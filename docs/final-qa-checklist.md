# Maintenix Final QA Checklist

Use this checklist before taking screenshots, recording a demo, or sharing the GitHub repository.

## Setup

- [ ] PostgreSQL is running locally.
- [ ] `server/.env` has the correct `DATABASE_URL`.
- [ ] `client/.env` has `VITE_API_URL=http://localhost:5000/api`.
- [ ] `npm install` has been run from the project root.
- [ ] `npm run db:test` passes.
- [ ] `npm run db:schema` completes.
- [ ] `npm run db:seed` completes.
- [ ] `npm run build` passes.
- [ ] `npm run dev` starts backend and frontend.

## Authentication

- [ ] Admin can log in with `admin@maintenix.com / Password123`.
- [ ] Operative can log in with `operative@maintenix.com / Password123`.
- [ ] Client can log in with `client@maintenix.com / Password123`.
- [ ] Logged-out users are redirected to `/login`.
- [ ] Users cannot access another role's dashboard.
- [ ] Logout clears the session and redirects to login.

## Admin CRM

- [ ] Admin dashboard shows real database metrics.
- [ ] Clients list loads.
- [ ] Client search works.
- [ ] Client create/edit/delete works with confirmation on delete.
- [ ] Properties list loads.
- [ ] Property search/filter works.
- [ ] Property create/edit/delete works with confirmation on delete.
- [ ] Jobs list loads.
- [ ] Job search and filters work.
- [ ] Job create/edit/delete works with confirmation on delete.
- [ ] Operative assignment works.
- [ ] Job status update works.
- [ ] Schedule page filters by date, operative, and status.

## Operative Workflow

- [ ] Operative dashboard shows assigned job metrics.
- [ ] Operative sees only assigned jobs.
- [ ] Operative job detail opens.
- [ ] Status updates work for `in_progress`, `on_hold`, and `completed`.
- [ ] Completion date is set when a job is completed.
- [ ] Notes require text before submission.
- [ ] Notes display author, role, content, and date.
- [ ] Before photo upload works.
- [ ] After photo upload works.
- [ ] General photo upload works.
- [ ] Uploaded photos display after refresh.
- [ ] Open photo links work.

## Variation Workflow

- [ ] Operative can raise a variation from an assigned job.
- [ ] New variations start as `pending_admin_review`.
- [ ] Optional variation photo uploads and displays.
- [ ] Admin can view all variations.
- [ ] Admin search and status filters work.
- [ ] Admin can add a price and send to client approval.
- [ ] Admin can reject a variation.
- [ ] Client sees only their own variations.
- [ ] Client can approve pending client approval variations.
- [ ] Client can reject pending client approval variations.
- [ ] Client decision note saves.
- [ ] Status changes are reflected across operative, admin, and client views.

## Client Portal

- [ ] Client dashboard shows real metrics.
- [ ] Client properties page shows only linked properties.
- [ ] Client jobs page shows only linked jobs.
- [ ] Client job search works.
- [ ] Client job status filter works.
- [ ] Client job priority filter works.
- [ ] Client job detail opens.
- [ ] Client job detail is read-only.
- [ ] Client cannot update job status.
- [ ] Client cannot add notes.
- [ ] Client cannot upload photos.
- [ ] Client job photos display.
- [ ] Client job variations display.
- [ ] Client variation approval/rejection still works.

## Reports

- [ ] Admin can open reports for any job.
- [ ] Operative can open reports only for assigned jobs.
- [ ] Client can open reports only for linked client jobs.
- [ ] Report shows job details.
- [ ] Report shows client details.
- [ ] Report shows property details.
- [ ] Report shows operative details.
- [ ] Report shows status and priority badges.
- [ ] Report shows notes.
- [ ] Report shows before/after/general photos.
- [ ] Report shows variations, statuses, prices, and decision notes.
- [ ] Print / Save as PDF opens browser print.
- [ ] Print preview hides sidebar, topbar, and buttons.
- [ ] Photos appear in print preview.

## Responsive UI

- [ ] Login page works on mobile width.
- [ ] Sidebar opens and closes on mobile.
- [ ] Admin tables remain usable on smaller screens.
- [ ] Forms do not overflow containers.
- [ ] Cards and report sections stack cleanly.
- [ ] Status badges and buttons do not overlap.

## Screenshots To Capture

- [ ] Login page
- [ ] Admin dashboard
- [ ] Clients CRM page
- [ ] Jobs management page
- [ ] Operative job detail with photos
- [ ] Variation workflow in admin and client views
- [ ] Client portal dashboard
- [ ] Client job detail
- [ ] Job report page
- [ ] Print / Save as PDF preview
