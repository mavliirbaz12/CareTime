# CareVance HRMS Backend

This folder contains the Laravel 12 API for CareVance HRMS. It powers authentication, workspace onboarding, invitations, employee management, attendance, monitoring, reports, payroll, notifications, chat, invoices, billing, and desktop companion integrations.

## Runtime

- PHP 8.2+
- Laravel 12
- PostgreSQL-first configuration
- Custom bearer-token auth using `personal_access_tokens`
- Queue-ready mail and invitation flow
- Private storage for screenshots and chat attachments

## Setup

```bash
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

If you are not using `QUEUE_CONNECTION=sync`, run a worker:

```bash
php artisan queue:listen --tries=1 --timeout=0
```

## Main API Areas

- Auth and owner signup
- Workspace invitations and invite acceptance
- Users, organizations, report groups, and settings
- Attendance, leave requests, and time edit approvals
- Projects, tasks, and time entries
- Monitoring screenshots and secure file access
- Reports, dashboard summaries, and exports
- Payroll structures, payroll records, payouts, and payslips
- Chat conversations, groups, read state, typing state, and attachments
- Notifications, audit logs, billing, invoices, and company context

## Important Environment Variables

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
FILESYSTEM_DISK=local
API_TOKEN_TTL_MINUTES=10080

MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_FROM_ADDRESS=your_sender_email
MAIL_FROM_NAME="CareVance HRMS"
```

Also review:

- `CORS_ALLOWED_*`
- `RATE_LIMIT_*`
- `DESKTOP_WINDOWS_DOWNLOAD_URL`
- `ATTENDANCE_*`
- `PAYROLL_*`
- `STRIPE_*`

## Invitation Notes

- Workspace owner signup uses `POST /api/auth/signup-owner`
- Secure onboarding invites use `POST /api/invitations`
- Invite details are fetched through `GET /api/invitations/{token}`
- Invite acceptance happens through `POST /api/invitations/{token}/accept`
- Invite emails generate frontend links for `/accept-invite/:token`

## Mail / SMTP

Invitation emails use Laravel Mail. With `QUEUE_CONNECTION=sync`, the mail sends immediately in-process. With queue-backed drivers such as `database` or `redis`, keep a worker running.

### Brevo SMTP Example

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your_brevo_login
MAIL_PASSWORD=your_brevo_smtp_key
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=your_sender_email
MAIL_FROM_NAME="CareVance HRMS"
```

## Notes

- The API does not rely on Sanctum middleware wiring.
- Screenshot URLs use signed or authenticated access patterns.
- Chat attachments stream through protected endpoints.
- The app includes both the current invitation system and an older legacy invite flow.
