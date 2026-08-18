# VMS - Vendor Management System

## Overview

This monorepo contains the initial Phase 1 foundation for a vendor-primary Vendor Management System (VMS) MVP. It includes the shared auth foundation, PostgreSQL + Prisma integration, role-based backend authorization, and a role-based frontend shell for vendor, contractor, and project manager users.

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS + React Router + TanStack Query
- Backend: Node.js + Express + TypeScript + Prisma + Zod + JWT + bcryptjs
- Database: PostgreSQL

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL database server
- Git

## Installation

1. Clone the repository.
2. Install backend dependencies:
   ```bash
   cd vms/backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

## Environment variables

Create a backend .env file based on .env.example:

```bash
cd backend
cp .env.example .env
```

Set values for:

- DATABASE_URL
- JWT_SECRET
- PORT
- FRONTEND_URL

Frontend .env example:

```bash
cd frontend
cp .env.example .env
```

Required variable:

- VITE_API_URL

Do not commit .env files.

## Database setup

Make sure PostgreSQL is running and the database exists.

Example local PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vms_dev?schema=public"
```

Then run:

```bash
cd backend
npm run prisma:migrate
```

## Prisma migration

```bash
cd backend
npm run prisma:migrate
```

## Seed command

```bash
cd backend
npm run prisma:seed
```

## Running frontend

```bash
cd frontend
npm run dev
```

The frontend runs on http://localhost:5173 by default.

## Running backend

```bash
cd backend
npm run dev
```

The backend runs on http://localhost:4000 by default.

## Test accounts

These are development-only credentials for local testing.

- Vendor: vendor@test.com / Password123!
- Contractor: contractor@test.com / Password123!
- Project Manager: pm@test.com / Password123!

## API endpoints

### Auth

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/auth/vendor-only (role protected example)

### Response format

Success:

```json
{
  "success": true,
  "data": { ... }
}
```

Error:

```json
{
  "success": false,
  "message": "Human readable error"
}
```

## Project structure

```text
vms/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── vendor/
│   │   │   ├── contractor/
│   │   │   └── project-manager/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── router/
│   │   └── App.tsx
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── types/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── ...
│
├── README.md
└── .gitignore
```

## How the three developers should work

This repository is intentionally organized as a modular monolith so separate developers can work in parallel in later phases:

- Vendor developer: vendor-specific modules and UI flows
- Contractor developer: contractor-specific modules and timesheet workflows
- Project manager developer: project oversight, milestones, and approvals

The Phase 1 auth foundation is kept isolated from future business modules so later feature work can be added without coupling the auth layer to project logic.

## Phase 1 scope

This version implements:

- Authentication
- Role-based authorization foundation
- PostgreSQL database via Prisma
- User model
- Basic role-based navigation
- Basic dashboard placeholders
- Clean project structure

This version does not implement project creation, contractor assignment, timesheets, milestones, billing, invoices, notifications, or AI functionality.
