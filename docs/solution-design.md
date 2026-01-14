# Solution Design

## Product Context

**One Base / Strive** is a modern SaaS platform designed for small-to-medium businesses (SMBs) that need integrated CRM and ERP capabilities. The platform provides:

- **CRM (Customer Relationship Management)**: Manage accounts, contacts, deals, and sales activities
- **ERP (Enterprise Resource Planning)**: Basic invoicing and billing functionality
- **Multi-tenant Architecture**: Organization-level isolation for data security

The platform is built with a **local-first** approach, using SQLite for development, with a clear migration path to cloud services (e.g., Supabase, Postgres) for production deployments.

## Monorepo Layout

The project uses a **pnpm workspace** monorepo structure:

```
one-base-strive/
├── apps/
│   ├── api/          # Backend API server (Node + TypeScript + Fastify)
│   └── web/          # Frontend application (Vite + React + TypeScript)
├── packages/
│   └── shared/       # Shared types, schemas, and constants
├── docs/             # Documentation
└── scripts/          # Utility scripts (dev.sh, etc.)
```

### Apps

- **`apps/api`**: Backend REST API server
  - Fastify-based HTTP server
  - SQLite database with migrations
  - Session-based authentication
  - All routes under `/api/v1`

- **`apps/web`**: Frontend React application
  - Vite for build tooling
  - React Router for routing
  - TanStack Query for data fetching
  - Tailwind CSS + shadcn/ui for UI

### Packages

- **`packages/shared`**: Shared code between frontend and backend
  - Zod validation schemas
  - TypeScript types
  - Constants and enums
  - **Critical**: Must be environment-agnostic (no Node.js or browser-specific code)

## Key Principles

### 1. Frontend Never Imports Database Code

The frontend (`apps/web`) **never** directly accesses the database. All data access goes through the REST API (`apps/api`). This ensures:

- Clear API boundary
- Easy to swap backend implementations
- Frontend can be deployed separately (CDN, static hosting)
- Security: database credentials never exposed to frontend

### 2. API Boundary

All communication between frontend and backend happens via HTTP REST API:

- All endpoints prefixed with `/api/v1`
- Consistent response format: `{ data: ... }` for success, `{ error: { code, message, details? } }` for errors
- Authentication via httpOnly cookies (session tokens)

### 3. Organization Scoping

Every database record is **organization-scoped**. Every query enforces `org_id`:

- Users belong to an organization
- All CRM/ERP entities (accounts, contacts, deals, invoices) belong to an organization
- API routes automatically filter by the authenticated user's `org_id`
- Prevents data leakage between organizations

### 4. Authentication Cookies

Authentication uses **httpOnly cookies** for session management:

- Session tokens stored in `sessions` table
- Cookie set on login: `session_token=<random-uuid>`
- Cookie cleared on logout
- Middleware validates session token on protected routes
- 30-day expiration

## Data Model Overview

### Core Entities

#### Organizations (`orgs`)
- Root entity for multi-tenancy
- Each organization has its own users and data
- UUID primary key

#### Users (`users`)
- Belongs to an organization (`org_id`)
- Email/password authentication
- Roles: `admin`, `member`
- Password hashed with bcrypt

#### Sessions (`sessions`)
- Tracks active user sessions
- Token-based (random UUID, not JWT)
- Expires after 30 days
- Deleted on logout

### CRM Entities

#### Accounts (`accounts`)
- Companies/organizations in CRM
- Fields: `name`, `industry`, `website`, `phone`, `notes`
- Org-scoped

#### Contacts (`contacts`)
- People associated with accounts
- Fields: `first_name`, `last_name`, `email`, `phone`, `title`
- Optional link to `account_id`
- Org-scoped

#### Deals (`deals`)
- Sales opportunities/pipeline items
- Fields: `name`, `amount_cents`, `currency`, `expected_close_date`
- Links: `account_id`, `primary_contact_id`, `stage_id`
- Org-scoped

#### Deal Stages (`deal_stages`)
- Pipeline stages (e.g., "New", "Qualified", "Proposal", "Closed Won")
- Org-specific (each org can customize)
- Fields: `name`, `sort_order`, `is_closed`

#### Activities (`activities`)
- Notes, calls, meetings related to accounts/contacts/deals
- Types: `note`, `call`, `meeting`
- Fields: `subject`, `body`, `occurred_at`
- Links: `account_id`, `contact_id`, `deal_id`, `created_by_user_id`
- Org-scoped

### ERP Entities

#### Invoice Customers (`invoice_customers`)
- Billing customers (can link to CRM `accounts` via `account_id`)
- Fields: `name`, `email`, `phone`, `vat_id`, billing address fields
- Org-scoped

#### Invoices (`invoices`)
- Billing invoices
- Fields: `invoice_number`, `status` (draft/sent/paid/void), `issue_date`, `due_date`, `notes`
- Calculated fields: `subtotal_cents`, `tax_cents`, `total_cents`
- Links: `customer_id` → `invoice_customers`
- Org-scoped, unique `invoice_number` per org

#### Invoice Items (`invoice_items`)
- Line items on invoices
- Fields: `description`, `quantity`, `unit_price_cents`, `tax_rate_bps` (basis points, e.g., 1900 = 19%)
- Calculated: `line_total_cents`
- Links: `invoice_id` → `invoices`
- Org-scoped

### Relationships

```
orgs
  ├── users
  ├── accounts
  │   ├── contacts
  │   └── deals
  │       └── activities
  ├── deal_stages
  └── invoice_customers
      └── invoices
          └── invoice_items
```

**Key Relationships**:
- `contacts.account_id` → `accounts.id` (optional)
- `deals.account_id` → `accounts.id` (required)
- `deals.primary_contact_id` → `contacts.id` (optional)
- `deals.stage_id` → `deal_stages.id` (required)
- `activities.account_id` → `accounts.id` (optional)
- `activities.contact_id` → `contacts.id` (optional)
- `activities.deal_id` → `deals.id` (optional)
- `invoice_customers.account_id` → `accounts.id` (optional, links ERP to CRM)
- `invoices.customer_id` → `invoice_customers.id` (required)
- `invoice_items.invoice_id` → `invoices.id` (required)

## Migrations & Seed Approach

### Database Path

The database location is configurable via environment variable:

- **Default**: `apps/api/data/strive.db`
- **Override**: Set `STRIVE_DB_PATH` in `.env` or environment
- **Tests**: Use `apps/api/data/test.db` (isolated from dev database)

All scripts (migrate, seed, server) use the same database path via `apps/api/src/db/connection.ts`.

### Migrations

Migrations are SQL files in `apps/api/src/db/migrations/`:

- `001_initial_schema.sql`: Core tables (orgs, users, sessions, deal_stages)
- `002_crm_tables.sql`: CRM entities (accounts, contacts, deals, activities)
- `003_erp_invoicing.sql`: ERP entities (invoice_customers, invoices, invoice_items)

Migration runner (`apps/api/src/scripts/migrate.ts`):
- Tracks applied migrations in `migrations` table
- Idempotent: safe to run multiple times
- Applies migrations in order (by filename)

### Seed Script

Seed script (`apps/api/src/scripts/seed.ts`):
- **Idempotent**: Checks if data already exists before seeding
- Creates demo organization ("Demo Org")
- Creates admin user (`admin@demo.com` / `admin123`)
- Seeds deal stages (New, Qualified, Proposal, Closed Won, Closed Lost)
- Seeds demo CRM data (accounts, contacts, deals, activities)
- Seeds demo ERP data (invoice customers, invoices with items)

**To reset database**:
```bash
rm apps/api/data/strive.db
pnpm migrate
pnpm seed
```

## Future Migration Path

The system is designed for easy migration to cloud services:

1. **Database**: SQLite → Postgres (Supabase/RDS)
   - Change connection string in `apps/api/src/db/connection.ts`
   - SQL is mostly compatible (minor adjustments may be needed)
   - Repos layer shields the rest of the app

2. **Authentication**: Local → Supabase Auth / Auth0
   - Replace `apps/api/src/services/authService.ts` implementation
   - Keep same API interface (`/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/me`)
   - Frontend changes minimal (same hooks/API client)

3. **File Storage**: Local → S3 / Supabase Storage
   - Not implemented yet
   - Will use abstract storage interface
