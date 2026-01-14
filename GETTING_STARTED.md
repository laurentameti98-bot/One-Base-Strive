# Getting Started with One Base / Strive

## 🎉 Sprint 0.5 Complete!

Your full-stack SaaS platform scaffold is ready. Everything is in place to start building CRM/ERP features in Sprint 1.

## ⚠️ Important: Node Version

**Use Node.js 18.x or 20.x (LTS)**

Your current Node version (24.12.0) is too new and has compatibility issues with native modules. Please switch to a LTS version:

### Using nvm (recommended)

```bash
# Install nvm if you don't have it
# Visit: https://github.com/nvm-sh/nvm

# Install and use Node 20 LTS
nvm install 20
nvm use 20

# Or use the .nvmrc file in the project
nvm use
```

### Manual Installation

Download Node.js 20.x LTS from: https://nodejs.org/

## 🚀 Quick Start

Once you have the correct Node version:

```bash
# Enable pnpm (one-time setup)
corepack enable

# Install dependencies
pnpm install

# Run migrations (creates database)
pnpm migrate

# Seed with demo data
pnpm seed

# Start development servers
pnpm dev
```

**Alternative with npm:**
```bash
npm install
npm run migrate
npm run seed
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 🔐 Login Credentials

After seeding, login with:
- **Email**: `admin@demo.com`
- **Password**: `admin123`

## 📦 What's Included

### Backend (apps/api)
✅ Fastify HTTP server with CORS  
✅ SQLite database with migrations  
✅ Local authentication (sessions + httpOnly cookies)  
✅ Zod request validation  
✅ Clean layered architecture (routes → services → repos)  
✅ UUID primary keys  
✅ Seed script with demo data  

**Endpoints:**
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/health` - Health check

### Frontend (apps/web)
✅ Vite + React + TypeScript  
✅ TanStack Query for data fetching  
✅ React Router with protected routes  
✅ Tailwind CSS + shadcn/ui components  
✅ react-hook-form + Zod validation  
✅ Professional, clean UI  

**Pages:**
- `/login` - Authentication page
- `/` - Protected dashboard (placeholder for Sprint 1)

### Shared (packages/shared)
✅ Zod schemas (shared FE/BE validation)  
✅ TypeScript types  
✅ Constants (roles, error codes)  

### Database Schema
✅ `orgs` - Organizations  
✅ `users` - Users (email/password auth)  
✅ `sessions` - Session tokens  
✅ `deal_stages` - CRM pipeline stages  

## 📁 Project Structure

```
one-base-strive/
├── apps/
│   ├── api/              # Backend (Node + Fastify + SQLite)
│   │   ├── src/
│   │   │   ├── db/       # Database & migrations
│   │   │   ├── middleware/
│   │   │   ├── repos/
│   │   │   ├── routes/
│   │   │   ├── scripts/  # migrate.ts, seed.ts
│   │   │   ├── services/
│   │   │   └── server.ts
│   │   └── package.json
│   └── web/              # Frontend (Vite + React)
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── pages/
│       │   └── main.tsx
│       └── package.json
├── packages/
│   └── shared/           # Shared types & schemas
├── docs/
│   ├── 04-dev-setup.md  # Detailed setup guide
│   └── decisions.md      # Architecture decisions
├── .nvmrc                # Node version spec
├── package.json          # Root workspace config
└── README.md
```

## 🛠️ Available Commands

**With pnpm (recommended):**
```bash
# Development
pnpm dev             # Start both FE + BE
pnpm dev:web         # Frontend only
pnpm dev:api         # Backend only

# Database
pnpm migrate         # Run migrations
pnpm seed            # Seed demo data

# Code Quality
pnpm lint            # Lint all packages
pnpm format          # Format with Prettier

# Build
pnpm build           # Build all packages
```

**With npm (alternative):**
```bash
# Replace 'pnpm' with 'npm run' in any command above
npm run dev
npm run migrate
npm run seed
# etc.
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Frontend loads at http://localhost:5173
- [ ] Backend health check works: http://localhost:3001/api/v1/health
- [ ] Login page displays correctly
- [ ] Can login with `admin@demo.com` / `admin123`
- [ ] Dashboard displays after login
- [ ] Logout button works

## 🔄 Reset Database

To start fresh:

```bash
rm -rf apps/api/data/
pnpm migrate
pnpm seed
```

Or with npm: `npm run migrate && npm run seed`

## 📚 Next Steps

You're ready for **Sprint 1 - CRM Features**!

Planned features:
- Contacts management
- Deals/opportunities
- Pipeline view (drag-drop stages)
- Activities/notes
- Basic reporting

## 🐛 Troubleshooting

### "better-sqlite3" compilation errors
→ Use Node 18.x or 20.x LTS (see above)

### Port already in use
→ Edit `.env` and change PORT or VITE_API_URL

### Database locked
→ Stop all processes, delete `apps/api/data/*.db-wal` files, restart

### CORS errors
→ Ensure both FE and BE are running

## 📖 Documentation

- **[Development Setup](./docs/04-dev-setup.md)** - Detailed setup guide
- **[Architecture Decisions](./docs/decisions.md)** - Design rationale
- **[README](./README.md)** - Project overview

## 🎯 Architecture Highlights

### Migration-Ready Design
- Local SQLite now → Postgres later (minimal changes)
- Local auth now → Supabase/Auth0 later (swap service layer)
- Frontend never imports DB code (clean separation)

### Clean Code Principles
- Consistent API response format
- Zod validation at boundaries
- Type-safe end-to-end
- UUID primary keys
- Layered architecture

### Security
- httpOnly cookies for sessions
- bcrypt password hashing
- CSRF protection (sameSite cookies)
- Session expiration (30 days)

---

**Questions?** Check the docs/ folder or the inline code comments.

**Ready to code?** Start with Sprint 1 features! 🚀
