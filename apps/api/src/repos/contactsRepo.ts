import { getDb } from '../db/connection.js';
import { ContactRow } from '../types/database.js';
import { Contact, CreateContactRequest, UpdateContactRequest } from '@one-base/shared';
import { randomUUID } from 'crypto';

export function createContact(orgId: string, data: CreateContactRequest): ContactRow {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  // Validate account_id belongs to org if provided
  if (data.accountId) {
    const account = db
      .prepare('SELECT id FROM accounts WHERE id = ? AND org_id = ?')
      .get(data.accountId, orgId);
    if (!account) {
      throw new Error('Account not found or does not belong to organization');
    }
  }

  db.prepare(
    `INSERT INTO contacts (id, org_id, account_id, first_name, last_name, email, phone, title, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    orgId,
    data.accountId || null,
    data.firstName,
    data.lastName,
    data.email || null,
    data.phone || null,
    data.title || null,
    now,
    now
  );

  return db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as ContactRow;
}

export function getContactById(orgId: string, id: string): ContactRow | undefined {
  const db = getDb();
  return db
    .prepare('SELECT * FROM contacts WHERE id = ? AND org_id = ?')
    .get(id, orgId) as ContactRow | undefined;
}

export function listContacts(
  orgId: string,
  options: { search?: string; accountId?: string; limit?: number; offset?: number }
): ContactRow[] {
  const db = getDb();
  const { search, accountId, limit = 50, offset = 0 } = options;

  let query = 'SELECT * FROM contacts WHERE org_id = ?';
  const params: (string | number)[] = [orgId];

  if (accountId) {
    query += ' AND account_id = ?';
    params.push(accountId);
  }

  if (search) {
    query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  query += ' ORDER BY last_name ASC, first_name ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(...params) as ContactRow[];
}

export function updateContact(
  orgId: string,
  id: string,
  data: UpdateContactRequest
): ContactRow | undefined {
  const db = getDb();
  const now = new Date().toISOString();

  // Validate account_id if being updated
  if (data.accountId) {
    const account = db
      .prepare('SELECT id FROM accounts WHERE id = ? AND org_id = ?')
      .get(data.accountId, orgId);
    if (!account) {
      throw new Error('Account not found or does not belong to organization');
    }
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (data.firstName !== undefined) {
    updates.push('first_name = ?');
    params.push(data.firstName);
  }
  if (data.lastName !== undefined) {
    updates.push('last_name = ?');
    params.push(data.lastName);
  }
  if (data.email !== undefined) {
    updates.push('email = ?');
    params.push(data.email || null);
  }
  if (data.phone !== undefined) {
    updates.push('phone = ?');
    params.push(data.phone || null);
  }
  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title || null);
  }
  if (data.accountId !== undefined) {
    updates.push('account_id = ?');
    params.push(data.accountId || null);
  }

  if (updates.length === 0) {
    return getContactById(orgId, id);
  }

  updates.push('updated_at = ?');
  params.push(now);
  params.push(id, orgId);

  db.prepare(
    `UPDATE contacts SET ${updates.join(', ')} WHERE id = ? AND org_id = ?`
  ).run(...params);

  return getContactById(orgId, id);
}

export function deleteContact(orgId: string, id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM contacts WHERE id = ? AND org_id = ?').run(id, orgId);
  return result.changes > 0;
}

export function contactRowToContact(row: ContactRow): Contact {
  return {
    id: row.id,
    orgId: row.org_id,
    accountId: row.account_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
