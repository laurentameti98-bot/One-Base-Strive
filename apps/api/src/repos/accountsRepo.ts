import { getDb } from '../db/connection.js';
import { AccountRow } from '../types/database.js';
import { Account, CreateAccountRequest, UpdateAccountRequest } from '@one-base/shared';
import { randomUUID } from 'crypto';

export function createAccount(orgId: string, data: CreateAccountRequest): AccountRow {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO accounts (id, org_id, name, industry, website, phone, notes, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    orgId,
    data.name,
    data.industry || null,
    data.website || null,
    data.phone || null,
    data.notes || null,
    now,
    now
  );

  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as AccountRow;
}

export function getAccountById(orgId: string, id: string): AccountRow | undefined {
  const db = getDb();
  return db
    .prepare('SELECT * FROM accounts WHERE id = ? AND org_id = ?')
    .get(id, orgId) as AccountRow | undefined;
}

export function listAccounts(
  orgId: string,
  options: { search?: string; limit?: number; offset?: number }
): AccountRow[] {
  const db = getDb();
  const { search, limit = 50, offset = 0 } = options;

  let query = 'SELECT * FROM accounts WHERE org_id = ?';
  const params: (string | number)[] = [orgId];

  if (search) {
    query += ' AND (name LIKE ? OR industry LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }

  query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(...params) as AccountRow[];
}

export function updateAccount(
  orgId: string,
  id: string,
  data: UpdateAccountRequest
): AccountRow | undefined {
  const db = getDb();
  const now = new Date().toISOString();

  const updates: string[] = [];
  const params: unknown[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.industry !== undefined) {
    updates.push('industry = ?');
    params.push(data.industry || null);
  }
  if (data.website !== undefined) {
    updates.push('website = ?');
    params.push(data.website || null);
  }
  if (data.phone !== undefined) {
    updates.push('phone = ?');
    params.push(data.phone || null);
  }
  if (data.notes !== undefined) {
    updates.push('notes = ?');
    params.push(data.notes || null);
  }

  if (updates.length === 0) {
    return getAccountById(orgId, id);
  }

  updates.push('updated_at = ?');
  params.push(now);
  params.push(id, orgId);

  db.prepare(
    `UPDATE accounts SET ${updates.join(', ')} WHERE id = ? AND org_id = ?`
  ).run(...params);

  return getAccountById(orgId, id);
}

export function deleteAccount(orgId: string, id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM accounts WHERE id = ? AND org_id = ?').run(id, orgId);
  return result.changes > 0;
}

export function accountRowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    industry: row.industry,
    website: row.website,
    phone: row.phone,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
