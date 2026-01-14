---
name: one-base-strive
description: This is a new rule
---

# Overview

=== NON-NEGOTIABLE RULES ===
1) Keep the repo always runnable. After each major change ensure it still starts.
2) NO “quick hacks”. Use clean structure, types, and validation.
3) Frontend NEVER imports DB code. Frontend ONLY talks to backend API.
4) Use UUID primary keys in DB and data models.
5) Use Zod validation at API boundaries, and share schemas/types via packages/shared.
6) Implement consistent API response format:
   - Success: { data: ... }
   - Error:   { error: { code, message, details? } }
7) Add ESLint + Prettier and apply consistently.
8) Provide clear README instructions and .env.example.
9) Provide a seed script that creates demo org, admin user, deal stages.
10) Authentication must exist locally now, but be designed so it can be swapped later:
    - Local tables: users, sessions
    - Endpoints: POST /api/v1/auth/login, POST /api/v1/auth/logout, GET /api/v1/auth/me
    - Role primitive: "admin" | "member"
11) If you need to make a decision that could impact architecture, STOP and ask questions instead of guessing.
