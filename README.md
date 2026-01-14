# One Base - Strive (v0.5)

A clean, modern SaaS platform starter with CRM/ERP capabilities. Built as a monorepo with local-first architecture that's ready to migrate to cloud services.

## Stack

- **Frontend**: Vite + React + TypeScript + TanStack Query + Tailwind + shadcn/ui
- **Backend**: Node + TypeScript + Fastify + SQLite
- **Validation**: Zod schemas shared between frontend and backend
- **Package Manager**: pnpm

## Project Structure

```
one-base-strive/
├── apps/
│   ├── web/          # Frontend application
│   └── api/          # Backend API server
├── packages/
│   └── shared/       # Shared types, schemas, constants
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

## Prerequisites

- **Node.js**: 18.x or 20.x (LTS versions recommended)
  - Note: Node v24+ may have compatibility issues with native modules
- **pnpm**: >= 8.0.0 (recommended - via corepack)
  - Alternative: npm (comes with Node.js)

## Quick Start

1. **Enable corepack (for pnpm)**
   ```bash
   corepack enable
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```
   
   <details>
   <summary>Alternative: Using npm</summary>
   
   ```bash
   npm install
   ```
   </details>

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults work for local dev)
   # Optional: Set STRIVE_DB_PATH to customize database location
   ```

4. **Run migrations**
   ```bash
   pnpm migrate
   ```

5. **Seed database**
   ```bash
   pnpm seed
   ```

6. **Start development servers**
   ```bash
   pnpm dev
   ```
   
   **Or from Cursor** (auto-handles Node version):
   ```bash
   pnpm dev:cursor
   # or
   ./scripts/dev.sh
   ```

   This starts:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Default Login Credentials

After seeding:
- **Email**: admin@demo.com
- **Password**: admin123

## Available Scripts

- `pnpm dev` - Start both frontend and backend
- `pnpm dev:cursor` - **Recommended for Cursor**: Auto-setup Node 20 + pnpm, then start servers
- `./scripts/dev.sh` - Same as above, run directly
- `pnpm dev:web` - Start frontend only
- `pnpm dev:api` - Start backend only
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm migrate` - Run database migrations
- `pnpm seed` - Seed database with demo data

<details>
<summary>Using npm instead</summary>

Replace `pnpm` with `npm run` in all commands above. For example:
- `npm run dev`
- `npm run migrate`
- `npm run seed`
</details>

## Documentation

See the `docs/` directory for detailed documentation:
- [Development Setup](./docs/04-dev-setup.md)
- [Architecture Decisions](./docs/decisions.md)

## Features (Sprint 0.5)

- ✅ Local authentication (email/password)
- ✅ Session management (httpOnly cookies)
- ✅ UUID-based database design
- ✅ SQLite with migrations
- ✅ Type-safe API with Zod validation
- ✅ Consistent error handling
- ✅ Protected routes
- ✅ Professional UI with shadcn/ui

## Roadmap

- **Sprint 1**: CRM features (contacts, deals, pipeline)
- **Sprint 2**: ERP basics (inventory, invoicing)
- **Later**: Migration to Supabase/cloud services

## License

Private - All Rights Reserved
