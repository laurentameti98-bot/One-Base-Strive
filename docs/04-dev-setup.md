# Development Setup

## Prerequisites

- **Node.js**: 18.x or 20.x (LTS versions recommended)
  - ⚠️ **Important**: Node v24+ may have compatibility issues with native modules like `better-sqlite3`
  - Use Node 18.x or 20.x for guaranteed compatibility
  - Check version: `node --version`
  - Download from: https://nodejs.org/
- **npm**: Comes with Node.js (or optionally use pnpm >= 8.0.0)

## Initial Setup

1. **Clone and install dependencies**

```bash
npm install
# or if you have pnpm: pnpm install
```

2. **Configure environment variables**

```bash
cp .env.example .env
```

Default values in `.env.example` work for local development. Customize if needed:

- `PORT=3001` - Backend API port
- `DATABASE_URL=./data/strive.db` - SQLite database path
- `SESSION_SECRET` - Session encryption key (change in production!)
- `SEED_ADMIN_EMAIL=admin@demo.com` - Default admin email
- `SEED_ADMIN_PASSWORD=admin123` - Default admin password
- `VITE_API_URL=http://localhost:3001` - API URL for frontend

3. **Run database migrations**

```bash
pnpm migrate
```

This creates the SQLite database and schema at `apps/api/data/strive.db`.

4. **Seed the database**

```bash
pnpm seed
```

This creates:
- Demo organization ("Demo Org")
- Admin user (default: admin@demo.com / admin123)
- Default deal stages (Lead, Qualified, Proposal, Negotiation, Won, Lost)

## Running the Application

### Development Mode (Recommended)

Start both frontend and backend concurrently:

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/v1/health

**Using npm:**
```bash
npm run dev
```

### Run Individually

**Backend only:**
```bash
pnpm dev:api
# or: npm run dev:api
```

**Frontend only:**
```bash
pnpm dev:web
# or: npm run dev:web
```

## Testing the Setup

1. Open http://localhost:5173
2. You should see the login page
3. Login with:
   - Email: `admin@demo.com`
   - Password: `admin123`
4. You should be redirected to the dashboard

## Code Quality

### Linting

```bash
pnpm lint
```

### Formatting

```bash
# Format all code
pnpm format

# Check formatting without changes
pnpm format:check
```

## Project Structure

```
one-base-strive/
├── apps/
│   ├── web/                 # Frontend (Vite + React)
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── hooks/       # React hooks (auth, etc.)
│   │   │   ├── lib/         # Utilities (API client, etc.)
│   │   │   ├── pages/       # Page components
│   │   │   └── main.tsx     # Entry point
│   │   └── package.json
│   └── api/                 # Backend (Node + Fastify)
│       ├── src/
│       │   ├── db/          # Database connection & migrations
│       │   ├── middleware/  # Auth middleware
│       │   ├── repos/       # Data repositories
│       │   ├── routes/      # API routes
│       │   ├── scripts/     # Migration & seed scripts
│       │   ├── services/    # Business logic (auth, etc.)
│       │   └── server.ts    # Server entry point
│       └── package.json
├── packages/
│   └── shared/              # Shared types & schemas
│       ├── src/
│       │   ├── constants.ts # Enums & constants
│       │   └── schemas/     # Zod validation schemas
│       └── package.json
└── package.json             # Root workspace config
```

## Database

### Location

SQLite database is stored at `apps/api/data/strive.db` (not committed to git).

### Migrations

Migration files are in `apps/api/src/db/schema.sql`.

To run migrations:
```bash
pnpm migrate
```

### Reset Database

To start fresh:

```bash
rm apps/api/data/strive.db
pnpm migrate
pnpm seed
```

## API Endpoints

All endpoints are prefixed with `/api/v1`:

### Authentication

- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/logout` - Logout (clear session)
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Health

- `GET /api/v1/health` - Health check

## Troubleshooting

### Port already in use

If port 3001 or 5173 is already in use, change it in `.env`:

```
PORT=3002
```

And update `VITE_API_URL` accordingly.

### Database locked

If you get "database is locked" errors:
1. Stop all running instances
2. Remove `apps/api/data/strive.db-wal` and `apps/api/data/strive.db-shm`
3. Restart

### Dependencies not found

Run `pnpm install` (or `npm install`) at the root level. Workspaces will install all dependencies.

### CORS errors

Make sure both frontend and backend are running, and that `VITE_API_URL` in `.env` matches the backend URL.
