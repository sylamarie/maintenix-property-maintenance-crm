# Maintenix Portfolio Description

## Short Version

Maintenix is a full-stack property maintenance CRM and field service platform for managing clients, properties, work orders, field operatives, client approvals, variation requests, photo evidence, and print-ready job reports.

## Longer Version

Maintenix is a portfolio-ready full-stack application inspired by the operational needs of a UK property maintenance company. The system supports three user roles: admins, field operatives, and clients. Admins manage the CRM, properties, jobs, scheduling, operative assignment, and variation pricing. Operatives view assigned jobs, update job statuses, add notes, upload before/after photos, and raise variation requests. Clients access a read-only portal where they can track jobs, review photos and reports, and approve or reject priced variations.

The project focuses on real business workflows rather than a simple marketing site. It demonstrates relational database design, REST API structure, JWT authentication, role-based authorization, protected frontend routes, file uploads, search and filtering, reusable UI components, and print-friendly reporting.

## Feature Highlights

- Admin dashboard with live metrics from PostgreSQL
- CRM for clients and properties
- Work order CRUD with priority, status, scheduling, and assignment
- Operative dashboard and assigned job workflow
- Job notes and before/after/general photo uploads
- Variation workflow: raise, price, approve, or reject
- Client portal with linked properties, jobs, photos, variations, and reports
- Shared job report page with browser Print / Save as PDF support
- Role-based access control across backend APIs and frontend routes

## Tech Stack

- React
- Vite
- Tailwind CSS
- Node.js
- Express
- PostgreSQL
- JWT
- bcrypt
- REST APIs
- Local file uploads for MVP photo storage

## My Role

I built Maintenix as the full-stack developer, covering database schema design, Express API architecture, JWT authentication, role-based authorization, React routing, UI components, admin CRM workflows, operative workflows, client portal screens, variation approval logic, reporting, seed data, and documentation.

## What This Project Demonstrates

- Ability to model a complex real-world business domain
- Secure role-based application architecture
- Practical PostgreSQL schema design and relational queries
- Full-stack CRUD and workflow implementation
- Clean REST API organization using controllers, routes, models, middleware, and services
- Frontend state handling for loading, empty, error, and success states
- Portfolio-level UI polish for dashboards, tables, forms, cards, and reports
- Awareness of deployment concerns such as CORS, environment variables, database hosting, and persistent upload storage
