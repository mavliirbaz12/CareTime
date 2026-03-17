# CareVance HRMS

CareVance HRMS is a full-stack workforce management platform built with a Laravel API, a React web app, and an optional Electron desktop tracker. It combines HR, attendance, time tracking, productivity monitoring, payroll, reporting, communication, and onboarding flows in one workspace-oriented product.

## Core Modules

- Workspace owner signup, trial onboarding, and invitation-based employee onboarding
- Employee management, roles, teams, report groups, and organization settings
- Attendance tracking with check-in/check-out, late tracking, leave requests, and time edit approvals
- Time tracking with projects, tasks, active timers, and today/active time entry APIs
- Productivity monitoring with screenshots, activity context, and desktop companion support
- Reports workspace for attendance, productivity, timelines, exports, hours tracked, and employee insights
- Payroll with structures, payroll records, payouts, payslips, and PDF generation
- Team chat with direct conversations, group chat, typing status, read state, and attachments
- Notifications, audit logs, billing views, invoices, and company/workspace APIs

## Tech Stack

### Backend

- Laravel 12
- PHP 8.2+
- PostgreSQL-first configuration
- Custom bearer-token authentication using `personal_access_tokens`
- Laravel Mail for invite delivery
- Queue-ready invitation and mail flow
- Dompdf for payslip PDF generation
- Stripe-ready payroll payment integration hooks

### Frontend

- React 18
- TypeScript
- Vite 5
- Tailwind CSS 3
- TanStack React Query 5
- React Router 6
- Axios
- Framer Motion
- Lucide React

### Desktop

- Electron 33
- `active-win` for active window tracking
- Electron Builder for Windows packaging

### Deployment

- Dockerfiles for frontend and backend
- Nginx-based frontend container setup
- Render Blueprint via `render.yaml`

## Repository Structure

```text
CareVance/
  backend/     Laravel 12 API
  frontend/    React + TypeScript web app
  desktop/     Electron desktop tracker
  README.md
  SPEC.md
  TODO.md
  render.yaml
```

## Quick Start

### 1. Backend

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

Optional queue worker when you are not using `QUEUE_CONNECTION=sync`:

```bash
php artisan queue:listen --tries=1 --timeout=0
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

In local development, the frontend now defaults to `/api` and can use Vite's dev proxy. For deployed environments, set `VITE_API_URL` explicitly.

### 3. Desktop Tracker

```bash
cd desktop
npm install
npm start
```

If `APP_URL` is not set, the desktop shell opens the local frontend by default.

## Important Environment Variables

### Backend

```env
APP_NAME="CareVance"
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=timetrackpro
DB_USERNAME=postgres
DB_PASSWORD=your_password

QUEUE_CONNECTION=sync
SESSION_DRIVER=database
CACHE_STORE=database
FILESYSTEM_DISK=local

MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_FROM_ADDRESS=your_sender_email
MAIL_FROM_NAME="CareVance HRMS"
```

Other important groups:

- `CORS_ALLOWED_*`
- `API_TOKEN_TTL_MINUTES`
- `RATE_LIMIT_*`
- `DESKTOP_WINDOWS_DOWNLOAD_URL`
- `ATTENDANCE_*`
- `PAYROLL_*`
- `STRIPE_*`

### Frontend

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_WEB_APP_URL=https://your-frontend-domain.com
VITE_DESKTOP_DOWNLOAD_URL=https://your-backend-domain.com/api/downloads/desktop/windows
VITE_DESKTOP_DOWNLOAD_LABEL=Download for Windows
```

### Desktop

```env
APP_URL=https://your-frontend-domain.com
```

## Authentication And Invitation Flow

CareVance supports two main onboarding paths:

- Workspace owner signup via `POST /api/auth/signup-owner`
- Invitation acceptance via `POST /api/invitations`, `GET /api/invitations/{token}`, and `POST /api/invitations/{token}/accept`

Current invite emails point users to:

- `/accept-invite/:token`

That flow locks the invited email and assigned role on the backend and creates the user account only when the invited user completes the accept form.

## Main Product Areas

### Admin / HR

- Workspace signup and subscription state
- Employee directory and profile 360 views
- Roles, groups, and invitations
- Audit logs
- Notifications publishing
- Billing summary

### Workforce Operations

- Attendance dashboard
- Leave management
- Time edit approval flows
- Time tracking and task/project assignment
- Productivity and screenshot monitoring
- Reports and exports

### Finance

- Payroll structures
- Payroll record generation
- Mock and Stripe-ready payout flow
- Payslips and PDF downloads
- Invoices and payment state changes

### Collaboration

- Direct chat
- Group chat
- Typing indicators
- Attachment delivery
- Notification center

## Deployment Notes

- `frontend/Dockerfile` builds and serves the SPA with Nginx
- `frontend/public/env-config.js` supports runtime frontend config injection
- `render.yaml` provisions both `carevance-frontend` and `carevance-backend`
- Backend health check is `/`
- Frontend health check is `/health`

## Useful Commands

### Backend

```bash
cd backend
php artisan test
```

### Frontend

```bash
cd frontend
npm run build
```

### Desktop

```bash
cd desktop
npm run dist:win
```

## Notes

- The API uses custom bearer-token middleware instead of Sanctum middleware wiring.
- Screenshots and chat attachments are served through authenticated or signed access paths.
- Invitation mail supports direct send or queued delivery depending on `QUEUE_CONNECTION`.
- The repo contains both current invitation flow (`/accept-invite/:token`) and a legacy invite flow used by older endpoints.
