# API Conventions

This document describes the API design conventions used in One Base / Strive, ensuring consistency across all endpoints.

## Response Envelopes

### Success Responses

All successful responses wrap data in a `data` property:

```typescript
// Single resource
{ data: { id: "...", name: "..." } }

// List of resources
{ data: [{ id: "...", name: "..." }, ...] }

// Empty list
{ data: [] }
```

**Examples**:
- `GET /api/v1/accounts` → `{ data: Account[] }`
- `GET /api/v1/accounts/:id` → `{ data: Account }`
- `POST /api/v1/accounts` → `{ data: Account }` (201 Created)
- `PATCH /api/v1/accounts/:id` → `{ data: Account }` (200 OK)

### Error Responses

All errors follow this structure:

```typescript
{
  error: {
    code: string;        // Error code (see Error Codes)
    message: string;     // Human-readable message
    details?: unknown;   // Optional: validation errors, stack trace, etc.
  }
}
```

**HTTP Status Codes**:
- `400 Bad Request`: Validation errors, invalid input
- `401 Unauthorized`: Authentication required or invalid
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

**Example**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      { "path": ["name"], "message": "Required" }
    ]
  }
}
```

## Error Codes

Error codes are defined in `packages/shared/src/constants.ts`:

- **`AUTH_REQUIRED`**: User must be authenticated
- **`AUTH_INVALID`**: Invalid credentials or session
- **`VALIDATION_ERROR`**: Request validation failed (Zod errors)
- **`NOT_FOUND`**: Resource not found
- **`INTERNAL_ERROR`**: Server error (unexpected)

**Usage in Frontend**:
```typescript
try {
  await accountsApi.create(data);
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Show validation errors
  } else if (error.code === 'AUTH_REQUIRED') {
    // Redirect to login
  }
}
```

## DELETE Endpoints

**Convention**: DELETE endpoints return **204 No Content** (no body).

**Backend**:
```typescript
app.delete('/accounts/:id', async (request, reply) => {
  const deleted = accountsRepo.deleteAccount(orgId, id);
  if (!deleted) {
    return reply.code(404).send({ error: { ... } });
  }
  return reply.code(204).send(); // No body
});
```

**Frontend**:
```typescript
// apiClient handles 204 automatically
await apiClient.delete('/api/v1/accounts/:id'); // Returns void
```

**Rationale**:
- HTTP standard: 204 = success with no content
- Consistent across all DELETE endpoints
- Frontend doesn't need response data for delete operations

## PATCH Semantics

**Convention**: Use `PATCH` (not `PUT`) for updates.

**Why PATCH?**
- `PATCH` = partial update (only send changed fields)
- `PUT` = full replacement (must send all fields)
- Our updates are partial (only changed fields sent)

**Backend**:
```typescript
app.patch('/accounts/:id', async (request, reply) => {
  const data = UpdateAccountSchema.parse(request.body); // Partial schema
  const account = accountsRepo.updateAccount(orgId, id, data);
  return reply.send({ data: account });
});
```

**Frontend**:
```typescript
// Only send changed fields
await accountsApi.update(id, { name: "New Name" }); // PATCH request
```

**Update Schemas**:
- All `Update*Schema` in `packages/shared` use `.partial()` or optional fields
- Example: `UpdateAccountSchema` has all fields optional except those that can't change

## Authentication Endpoints

### POST /api/v1/auth/login

**Request**:
```json
{
  "email": "admin@demo.com",
  "password": "admin123"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "user": {
      "id": "...",
      "email": "admin@demo.com",
      "role": "admin",
      ...
    }
  }
}
```

**Cookie**: Sets `session_token` cookie (httpOnly, sameSite=lax, 30-day expiry)

### POST /api/v1/auth/logout

**Request**: Empty body (no `Content-Type` header)

**Response** (200 OK):
```json
{
  "data": {
    "ok": true
  }
}
```

**Cookie**: Clears `session_token` cookie

### GET /api/v1/auth/me

**Request**: No body, requires `session_token` cookie

**Response** (200 OK):
```json
{
  "data": {
    "user": {
      "id": "...",
      "email": "admin@demo.com",
      "role": "admin",
      ...
    }
  }
}
```

**Error** (401 Unauthorized):
```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Authentication required"
  }
}
```

## Cookie Rules

### Session Cookie Configuration

**Set on Login**:
```typescript
reply.setCookie('session_token', token, {
  httpOnly: true,        // Not accessible via JavaScript (XSS protection)
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'lax',      // CSRF protection
  path: '/',            // Available on all paths
  maxAge: 30 * 24 * 60 * 60,  // 30 days
});
```

**Cleared on Logout**:
```typescript
reply.clearCookie('session_token', {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
});
```

### Frontend Cookie Handling

**All API Requests**:
```typescript
// apiClient automatically includes cookies
fetch(url, {
  credentials: 'include',  // Always include cookies
  // ...
});
```

**No Manual Cookie Access**:
- Frontend never reads/writes cookies directly
- Cookies are httpOnly (not accessible via `document.cookie`)
- Session management is handled by browser automatically

## CORS & Credentials

### CORS Configuration

**Backend** (`apps/api/src/server.ts`):
```typescript
await fastify.register(fastifyCors, {
  origin: /^http:\/\/localhost:\d+$/,  // Any localhost port
  credentials: true,                    // Allow cookies
});
```

**Rationale**:
- Development: Allow any localhost port (Vite may use 5173, 5174, etc.)
- Production: Should restrict to specific origin
- `credentials: true` required for cookies to work

### Frontend Configuration

**All API Requests**:
```typescript
fetch(url, {
  credentials: 'include',  // Required for cookies
  // ...
});
```

**API Client** (`apps/web/src/lib/apiClient.ts`):
- All requests use `credentials: 'include'`
- Ensures cookies are sent with every request

## Content-Type Header

### Conditional Content-Type

**Rule**: Only set `Content-Type: application/json` when a request body exists.

**Frontend** (`apps/web/src/lib/apiClient.ts`):
```typescript
const headers: HeadersInit = {
  credentials: 'include',
};

if (data !== undefined) {
  headers['Content-Type'] = 'application/json';
}
```

**Why?**
- Empty POST requests (e.g., logout) shouldn't have `Content-Type`
- Some servers reject empty body with `Content-Type: application/json`
- Follows HTTP best practices

## Endpoint Patterns

### List Endpoints

**Pattern**: `GET /api/v1/{resource}?search=&limit=&offset=`

**Query Parameters**:
- `search`: Optional search term (searches name, email, etc.)
- `status`: Optional filter (for resources with status)
- `limit`: Optional pagination limit
- `offset`: Optional pagination offset

**Response**: `{ data: Resource[] }`

**Example**: `GET /api/v1/accounts?search=acme&limit=10`

### Detail Endpoints

**Pattern**: `GET /api/v1/{resource}/:id`

**Response**: `{ data: Resource }`

**Error**: 404 if not found

**Example**: `GET /api/v1/accounts/123e4567-e89b-12d3-a456-426614174000`

### Create Endpoints

**Pattern**: `POST /api/v1/{resource}`

**Request Body**: Validated with `Create*Schema` from `@one-base/shared`

**Response**: `{ data: Resource }` (201 Created)

**Example**: `POST /api/v1/accounts` with `{ name: "Acme Corp", ... }`

### Update Endpoints

**Pattern**: `PATCH /api/v1/{resource}/:id`

**Request Body**: Validated with `Update*Schema` (partial fields)

**Response**: `{ data: Resource }` (200 OK)

**Example**: `PATCH /api/v1/accounts/:id` with `{ name: "New Name" }`

### Delete Endpoints

**Pattern**: `DELETE /api/v1/{resource}/:id`

**Request Body**: None

**Response**: 204 No Content (no body)

**Error**: 404 if not found

**Example**: `DELETE /api/v1/accounts/:id`

## Validation

### Input Validation

All request bodies are validated with Zod schemas from `@one-base/shared`:

**Backend**:
```typescript
const data = CreateAccountSchema.parse(request.body);
// Throws ZodError if invalid
```

**Error Response**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "path": ["name"], "message": "Required" },
      { "path": ["email"], "message": "Invalid email" }
    ]
  }
}
```

### Foreign Key Validation

Repositories validate foreign keys belong to the same organization:

**Example**: Creating a contact with `account_id`
1. Check `account_id` exists
2. Check `account.org_id === current_user.org_id`
3. If either fails → 400 with `VALIDATION_ERROR`

## Organization Scoping

**Rule**: Every query automatically filters by `org_id` from the authenticated user.

**Implementation**:
- Middleware (`requireUser`) extracts `org_id` from session
- All repo methods take `orgId` as first parameter
- All SQL queries include `WHERE org_id = ?`

**Example**:
```typescript
// Route
app.get('/accounts', { preHandler: requireUser }, async (request, reply) => {
  const accounts = accountsRepo.listAccounts(request.user!.orgId);
  // ...
});

// Repo
export function listAccounts(orgId: string) {
  return db.prepare('SELECT * FROM accounts WHERE org_id = ?').all(orgId);
}
```

**Security**: Prevents data leakage between organizations.
