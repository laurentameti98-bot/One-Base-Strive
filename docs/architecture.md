# Architecture

This document describes the layered architecture of One Base / Strive, explaining how code is organized and how data flows through the system.

## Backend Architecture

The backend follows a **layered architecture** pattern:

```
HTTP Request
    ↓
Routes (apps/api/src/routes/*)
    ↓
Services (apps/api/src/services/*) [optional]
    ↓
Repositories (apps/api/src/repos/*)
    ↓
Database (SQLite)
```

### Routes Layer

**Location**: `apps/api/src/routes/*`

Routes handle HTTP concerns:
- Request/response serialization
- Input validation (using Zod schemas from `@one-base/shared`)
- Authentication middleware (`requireUser`)
- Error handling and status codes
- Response formatting (`{ data: ... }` or `{ error: ... }`)

**Example**: `apps/api/src/routes/accounts.ts`
- `GET /api/v1/accounts` → list accounts
- `GET /api/v1/accounts/:id` → get account by ID
- `POST /api/v1/accounts` → create account
- `PATCH /api/v1/accounts/:id` → update account
- `DELETE /api/v1/accounts/:id` → delete account (returns 204)

**Key Responsibilities**:
- Extract query params, body, path params
- Validate input with Zod schemas
- Call service/repo methods
- Format responses consistently
- Handle errors and return appropriate status codes

### Services Layer

**Location**: `apps/api/src/services/*`

Services contain **business logic** that doesn't belong in routes or repos:

- **Authentication Service** (`authService.ts`):
  - Password hashing/verification (bcrypt)
  - Session token generation
  - Login/logout logic

- **Invoice Service** (`invoiceService.ts`):
  - Invoice number generation
  - Totals calculation (subtotal, tax, total)
  - Invoice + items creation/update (transactional)

**When to Use Services**:
- Complex business logic (not just CRUD)
- Multi-step operations (e.g., create invoice + items)
- Calculations or transformations
- Cross-cutting concerns (e.g., notifications, audit logs)

**When NOT to Use Services**:
- Simple CRUD operations → go directly from route to repo
- Examples: `accounts`, `contacts`, `deals` (simple CRUD, no services)

### Repositories Layer

**Location**: `apps/api/src/repos/*`

Repositories handle **database access**:

- SQL queries (using `better-sqlite3`)
- Data transformation (snake_case DB → camelCase API)
- Organization scoping (every query filters by `org_id`)
- Foreign key validation

**Example**: `apps/api/src/repos/accountsRepo.ts`
```typescript
export function listAccounts(orgId: string, filters?: {...}): AccountRow[] {
  // Query with org_id filter
  // Transform rows to camelCase
  // Return array
}

export function accountRowToAccount(row: AccountRow): Account {
  // Transform snake_case DB row → camelCase API type
}
```

**Key Responsibilities**:
- All queries enforce `org_id` scoping
- Transform database rows (snake_case) to API types (camelCase)
- Handle foreign key relationships
- Return typed data (using types from `@one-base/shared`)

**Naming Convention**:
- Functions: `list*`, `get*ById`, `create*`, `update*`, `delete*`
- Transformers: `*RowTo*` (e.g., `accountRowToAccount`)

### Database Layer

**Location**: `apps/api/src/db/*`

- **Connection** (`connection.ts`): SQLite connection, migration runner
- **Migrations** (`migrations/*.sql`): SQL migration files
- **Types** (`types/database.ts`): TypeScript types for database rows

## Frontend Architecture

The frontend follows a **feature-based** structure with shared components:

```
User Interaction
    ↓
Pages (apps/web/src/pages/*)
    ↓
Hooks (apps/web/src/hooks/*) [TanStack Query]
    ↓
API Modules (apps/web/src/lib/api/*)
    ↓
API Client (apps/web/src/lib/apiClient.ts)
    ↓
HTTP Request → Backend API
```

### Pages Layer

**Location**: `apps/web/src/pages/*`

Pages are route-level components:
- `crm/`: CRM pages (AccountsListPage, AccountDetailPage, etc.)
- `erp/`: ERP pages (InvoicesListPage, InvoiceDetailPage, etc.)
- `auth/`: Auth pages (LoginPage)

**Responsibilities**:
- Render UI (using shadcn/ui components)
- Handle user interactions (clicks, form submissions)
- Call hooks for data fetching/mutations
- Navigate between pages (React Router)

### Hooks Layer

**Location**: `apps/web/src/hooks/*`

Hooks use **TanStack Query** for data fetching and caching:

- **Data Fetching**: `useAccounts()`, `useInvoice(id)`, etc.
- **Mutations**: `useCreateAccount()`, `useUpdateInvoice()`, etc.
- **Query Invalidation**: Automatically refetch after mutations

**Example**: `apps/web/src/hooks/useAccounts.ts`
```typescript
export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
```

**Benefits**:
- Automatic caching and refetching
- Loading/error states handled
- Optimistic updates possible
- Request deduplication

### API Modules Layer

**Location**: `apps/web/src/lib/api/*`

API modules wrap the API client with typed functions:

- `accountsApi.ts`: `list()`, `getById()`, `create()`, `update()`, `delete()`
- `invoicesApi.ts`: `list()`, `get()`, `create()`, `update()`, `delete()`

**Responsibilities**:
- Type-safe API calls
- URL construction (query params, path params)
- Return typed responses (using types from `@one-base/shared`)

**Example**: `apps/web/src/lib/api/accountsApi.ts`
```typescript
export const accountsApi = {
  list: () => apiClient.get<AccountsResponse>('/api/v1/accounts'),
  getById: (id: string) => apiClient.get<AccountResponse>(`/api/v1/accounts/${id}`),
  create: (data: CreateAccountRequest) => 
    apiClient.post<AccountResponse>('/api/v1/accounts', data),
  // ...
};
```

### API Client

**Location**: `apps/web/src/lib/apiClient.ts`

The API client handles:
- Base URL configuration
- HTTP methods (`get`, `post`, `patch`, `delete`)
- Cookie handling (`credentials: "include"`)
- Conditional `Content-Type` header (only when body exists)
- Error handling (throws `ApiError` with code/message)
- 204 No Content handling (returns `undefined`)

**Key Features**:
- All requests include cookies (for authentication)
- Consistent error handling
- Type-safe responses

### UI Components

**Location**: `apps/web/src/components/*`

- **`ui/`**: shadcn/ui components (Button, Dialog, Table, etc.)
- **`Layout.tsx`**: Main layout with navigation
- **`ProtectedRoute.tsx`**: Route guard for authentication

## Shared Package

**Location**: `packages/shared/`

The shared package provides **type safety** and **validation** across frontend and backend:

### Structure

```
packages/shared/src/
├── constants.ts          # Enums (UserRole, ErrorCode, InvoiceStatus, etc.)
├── schemas/
│   ├── auth.ts          # Auth schemas (LoginRequest, User, etc.)
│   ├── accounts.ts      # Account schemas
│   ├── contacts.ts      # Contact schemas
│   ├── deals.ts         # Deal schemas
│   ├── activities.ts    # Activity schemas
│   ├── invoiceCustomers.ts
│   ├── invoices.ts
│   └── invoiceItems.ts
└── index.ts             # Exports all schemas/types
```

### Schemas

Zod schemas for validation:
- **Request Schemas**: `CreateAccountSchema`, `UpdateAccountSchema`, etc.
- **Response Schemas**: `AccountResponse`, `AccountsResponse`, etc.
- Used in:
  - Backend: Route validation (`CreateAccountSchema.parse(request.body)`)
  - Frontend: React Hook Form validation (`zodResolver(CreateAccountSchema)`)

### Types

TypeScript types derived from schemas:
- **Entity Types**: `Account`, `Contact`, `Invoice`, etc.
- **Response Types**: `AccountResponse`, `AccountsResponse`, etc.
- Used in:
  - Backend: Return types from repos
  - Frontend: API client return types, component props

### Constants

Enums and constants:
- `UserRole`: `ADMIN`, `MEMBER`
- `ErrorCode`: `AUTH_REQUIRED`, `VALIDATION_ERROR`, etc.
- `InvoiceStatus`: `DRAFT`, `SENT`, `PAID`, `VOID`
- `ActivityType`: `NOTE`, `CALL`, `MEETING`

### Critical Rules

1. **No Environment-Specific Code**: Must work in both Node.js and browser
   - ❌ No `fs`, `path`, `process.env` (Node-only)
   - ❌ No `window`, `document` (browser-only)
   - ✅ Only pure TypeScript + Zod

2. **Build Output**: Must be built before use
   - Run `pnpm --filter @one-base/shared build` (or use `preseed`/`premigrate` hooks)
   - Output: `packages/shared/dist/index.js` (and `.d.ts`)

## Data Flow Example

**Creating an Account**:

1. **User clicks "Create Account"** → `AccountsListPage.tsx`
2. **Form submission** → `AccountFormDialog.tsx` calls `handleSubmit(data)`
3. **Hook mutation** → `useCreateAccount().mutateAsync(data)`
4. **API call** → `accountsApi.create(data)` → `apiClient.post('/api/v1/accounts', data)`
5. **HTTP request** → `POST /api/v1/accounts` with cookie
6. **Route handler** → `apps/api/src/routes/accounts.ts` validates with `CreateAccountSchema`
7. **Repository** → `accountsRepo.createAccount(orgId, data)`
8. **Database** → `INSERT INTO accounts ...`
9. **Response** → `{ data: { id, name, ... } }`
10. **Frontend** → Query invalidation → refetch list → UI updates

## Testing Architecture

**Location**: `apps/api/src/tests/*`

- **Test Framework**: Vitest
- **Test Method**: Fastify `app.inject()` (no HTTP server needed)
- **Database**: Isolated `test.db` (separate from `strive.db`)
- **Setup**: `globalSetup.ts` runs migrations + seeds test data
- **Tests**: `auth.test.ts`, `crm.test.ts`, `erp.test.ts`

**Run Tests**:
```bash
pnpm --filter @one-base/api test
```
