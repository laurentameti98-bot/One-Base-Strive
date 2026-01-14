import { getDb } from '../db/connection.js';
import { UserRow } from '../types/database.js';
import { User, UserRole } from '@one-base/shared';
import { randomUUID } from 'crypto';

export function createUser(data: {
  orgId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}): UserRow {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO users (id, org_id, email, password_hash, role, is_active, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
  ).run(id, data.orgId, data.email, data.passwordHash, data.role, now, now);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
}

export function getUserByEmail(email: string): UserRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
}

export function getUserById(id: string): UserRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
}

// Convert UserRow to public User type
export function userRowToUser(row: UserRow): User {
  return {
    id: row.id,
    orgId: row.org_id,
    email: row.email,
    role: row.role,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
