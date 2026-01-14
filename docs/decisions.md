# Architecture Decisions

## Sprint 0.5 - Foundation

This document records key architectural decisions made during the initial scaffold of One Base / Strive.

## Tech Stack

### Monorepo Structure

**Decision**: Use pnpm workspaces with apps/ and packages/ structure.

**Rationale**:
- Clean separation of frontend, backend, and shared code
- Type sharing between FE/BE without duplication
- Single dependency installation
- Easy to add new apps/packages later (mobile, admin panel, etc.)

### Frontend: Vite + React

**Decision**: Vite as build tool, React 18 as framework.

**Rationale**:
- Vite: Fast HMR, modern ESM-based, excellent DX
- React: Mature ecosystem, team expertise
- TypeScript: Type safety end-to-end

### Backend: Fastify + SQLite

**Decision**: Fastify for HTTP server, SQLite for database.

**Rationale**:
- Fastify: Fast, schema-based validation support, good TS support
- SQLite: Perfect for local-first development, zero setup
- Migration path to Postgres is straightforward (SQL mostly compatible)

### Validation: Zod

**Decision**: Use Zod for all data validation, shared between FE/BE.

**Rationale**:
- TypeScript-first schema validation
- Runtime type safety
- Single source of truth for data shapes
- Can be used in both Node and browser
- Integrates well with react-hook-form

### UI: Tailwind + shadcn/ui

**Decision**: Tailwind for styling, shadcn/ui for components.

**Rationale**:
- Tailwind: Utility-first, fast iteration, consistent design
- shadcn/ui: Copy-paste components (not NPM dependency), Radix UI primitives
- Full control over component code, not locked into a library

## Authentication

### Local Auth with Migration Path

**Decision**: Implement local auth (email/password + sessions) with design that allows migration.

**Rationale**:
- Sprint 0.5 needs working auth immediately
- Local implementation gives full control
- Can be swapped for Supabase/Auth0/etc. later without frontend changes
- Session-based (httpOnly cookies) for security

**Future Migration Strategy**:
- Replace `authService.login()` with external provider
- Replace `requireUser()` middleware with provider's JWT validation
- Frontend keeps same hooks/API interface

## Database Design

### UUID Primary Keys

**Decision**: Use UUID strings for all primary keys.

**Rationale**:
- Prevents enumeration attacks
- Easier to merge data from multiple sources
- Compatible with distributed systems
- SQLite supports text primary keys efficiently
- Postgres migration will be seamless

### SQLite with Postgres Compatibility

**Decision**: Write SQL that works in both SQLite and Postgres.

**Rationale**:
- Local dev uses SQLite (zero setup)
- Production/cloud can use Postgres
- Avoid SQLite-specific features (e.g., INTEGER for booleans becomes 0/1, which we convert in code)
- Use TEXT for datetime (ISO 8601 strings)

## API Design

### Consistent Response Format

**Decision**: All successful responses return `{ data: ... }`, all errors return `{ error: { code, message, details? } }`.

**Rationale**:
- Makes frontend error handling consistent
- Error codes enable i18n and better UX
- Wrapping `data` allows future metadata (pagination, etc.)

### API Versioning

**Decision**: Prefix all routes with `/api/v1`.

**Rationale**:
- Allows breaking changes in future v2
- Clear separation from potential static file serving
- Industry standard practice

## Code Organization

### Backend Structure

**Decision**: Layered architecture (routes → services → repos).

**Rationale**:
- Routes: HTTP concerns (validation, serialization)
- Services: Business logic (password hashing, session management)
- Repos: Database access (CRUD operations)
- Clear separation of concerns
- Easy to test each layer
- Easy to swap database later (change repos only)

### Frontend Structure

**Decision**: Feature-based + shared components structure.

**Rationale**:
- `components/ui/`: Shared UI primitives (shadcn)
- `components/`: Shared business components
- `pages/`: Route-level components
- `hooks/`: Custom React hooks (useAuth, etc.)
- `lib/`: Utilities (API client, etc.)

### Shared Package

**Decision**: No environment-specific code in packages/shared.

**Rationale**:
- Must work in both Node and browser
- No `fs`, no `window`, only pure TS + Zod
- Prevents accidental bundling of server code in frontend

## Development Experience

### Migration Runner

**Decision**: Simple migration runner (SQL files + tracking table).

**Rationale**:
- No heavy ORM needed for SQLite
- Explicit SQL is easier to understand
- Migrations table tracks what's applied
- Can add more sophisticated tooling later if needed

### Seed Script

**Decision**: Idempotent seed script (checks if already seeded).

**Rationale**:
- Safe to run multiple times
- Creates demo org + admin user + deal stages
- Easy to reset for testing (delete DB, migrate, seed)

### Concurrent Dev Script

**Decision**: Single `pnpm dev` command runs both FE and BE.

**Rationale**:
- Better DX: one command to start everything
- Uses `concurrently` to run both processes
- Can still run individually when needed

## Security

### Session Management

**Decision**: httpOnly cookies for session tokens, 30-day expiry.

**Rationale**:
- httpOnly prevents XSS access to token
- sameSite=lax prevents CSRF
- 30-day expiry balances security and UX
- Tokens are random (not JWT) and stored in DB for revocation

### Password Hashing

**Decision**: bcrypt with 10 rounds.

**Rationale**:
- Industry standard
- Good balance of security and performance
- Argon2 is theoretically better but bcrypt is more widely supported

## Future Considerations

### Planned Migrations

1. **Database**: SQLite → Postgres (Supabase/RDS)
   - Change connection string
   - Minimal SQL changes needed
   - Repos layer shields the rest of the app

2. **Auth**: Local → Supabase Auth / Auth0
   - Replace authService implementation
   - Keep same API interface
   - Frontend changes minimal

3. **File Storage**: Local → S3 / Supabase Storage
   - Not implemented yet
   - Will use abstract storage interface

### Not Decided Yet

- Multi-tenancy model (org-level isolation in DB vs separate DBs)
- Caching strategy (Redis? In-memory?)
- Background jobs (when needed)
- Real-time features (WebSockets? SSE?)

These will be decided in Sprint 1+ when requirements are clearer.
