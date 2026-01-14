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
- **npm**: Comes with Node.js (or use pnpm >= 8.0.0)

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   # or if you have pnpm installed: pnpm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults work for local dev)
   ```

3. **Run migrations**
   ```bash
   pnpm migrate
   ```

4. **Seed database**
   ```bash
   npm run seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Default Login Credentials

After seeding:
- **Email**: admin@demo.com
- **Password**: admin123

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:web` - Start frontend only
- `npm run dev:api` - Start backend only
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with demo data

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
