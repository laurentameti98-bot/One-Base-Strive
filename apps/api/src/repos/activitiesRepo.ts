import { getDb } from '../db/connection.js';
import { ActivityRow } from '../types/database.js';
import { Activity, CreateActivityRequest, UpdateActivityRequest } from '@one-base/shared';
import { randomUUID } from 'crypto';

export function createActivity(
  orgId: string,
  userId: string,
  data: CreateActivityRequest
): ActivityRow {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  // Validate foreign keys if provided
  if (data.accountId) {
    const account = db
      .prepare('SELECT id FROM accounts WHERE id = ? AND org_id = ?')
      .get(data.accountId, orgId);
    if (!account) {
      throw new Error('Account not found or does not belong to organization');
    }
  }

  if (data.contactId) {
    const contact = db
      .prepare('SELECT id FROM contacts WHERE id = ? AND org_id = ?')
      .get(data.contactId, orgId);
    if (!contact) {
      throw new Error('Contact not found or does not belong to organization');
    }
  }

  if (data.dealId) {
    const deal = db
      .prepare('SELECT id FROM deals WHERE id = ? AND org_id = ?')
      .get(data.dealId, orgId);
    if (!deal) {
      throw new Error('Deal not found or does not belong to organization');
    }
  }

  db.prepare(
    `INSERT INTO activities (id, org_id, type, subject, body, occurred_at, account_id, contact_id, deal_id, created_by_user_id, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    orgId,
    data.type,
    data.subject || null,
    data.body || null,
    data.occurredAt || null,
    data.accountId || null,
    data.contactId || null,
    data.dealId || null,
    userId,
    now,
    now
  );

  return db.prepare('SELECT * FROM activities WHERE id = ?').get(id) as ActivityRow;
}

export function getActivityById(orgId: string, id: string): ActivityRow | undefined {
  const db = getDb();
  return db
    .prepare('SELECT * FROM activities WHERE id = ? AND org_id = ?')
    .get(id, orgId) as ActivityRow | undefined;
}

export function listActivities(
  orgId: string,
  options: {
    accountId?: string;
    contactId?: string;
    dealId?: string;
    limit?: number;
    offset?: number;
  }
): ActivityRow[] {
  const db = getDb();
  const { accountId, contactId, dealId, limit = 50, offset = 0 } = options;

  let query = 'SELECT * FROM activities WHERE org_id = ?';
  const params: (string | number)[] = [orgId];

  if (accountId) {
    query += ' AND account_id = ?';
    params.push(accountId);
  }

  if (contactId) {
    query += ' AND contact_id = ?';
    params.push(contactId);
  }

  if (dealId) {
    query += ' AND deal_id = ?';
    params.push(dealId);
  }

  query += ' ORDER BY occurred_at DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(...params) as ActivityRow[];
}

export function updateActivity(
  orgId: string,
  id: string,
  data: UpdateActivityRequest
): ActivityRow | undefined {
  const db = getDb();
  const now = new Date().toISOString();

  // Validate foreign keys if being updated
  if (data.accountId) {
    const account = db
      .prepare('SELECT id FROM accounts WHERE id = ? AND org_id = ?')
      .get(data.accountId, orgId);
    if (!account) {
      throw new Error('Account not found or does not belong to organization');
    }
  }

  if (data.contactId) {
    const contact = db
      .prepare('SELECT id FROM contacts WHERE id = ? AND org_id = ?')
      .get(data.contactId, orgId);
    if (!contact) {
      throw new Error('Contact not found or does not belong to organization');
    }
  }

  if (data.dealId) {
    const deal = db
      .prepare('SELECT id FROM deals WHERE id = ? AND org_id = ?')
      .get(data.dealId, orgId);
    if (!deal) {
      throw new Error('Deal not found or does not belong to organization');
    }
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (data.type !== undefined) {
    updates.push('type = ?');
    params.push(data.type);
  }
  if (data.subject !== undefined) {
    updates.push('subject = ?');
    params.push(data.subject || null);
  }
  if (data.body !== undefined) {
    updates.push('body = ?');
    params.push(data.body || null);
  }
  if (data.occurredAt !== undefined) {
    updates.push('occurred_at = ?');
    params.push(data.occurredAt || null);
  }
  if (data.accountId !== undefined) {
    updates.push('account_id = ?');
    params.push(data.accountId || null);
  }
  if (data.contactId !== undefined) {
    updates.push('contact_id = ?');
    params.push(data.contactId || null);
  }
  if (data.dealId !== undefined) {
    updates.push('deal_id = ?');
    params.push(data.dealId || null);
  }

  if (updates.length === 0) {
    return getActivityById(orgId, id);
  }

  updates.push('updated_at = ?');
  params.push(now);
  params.push(id, orgId);

  db.prepare(
    `UPDATE activities SET ${updates.join(', ')} WHERE id = ? AND org_id = ?`
  ).run(...params);

  return getActivityById(orgId, id);
}

export function deleteActivity(orgId: string, id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM activities WHERE id = ? AND org_id = ?').run(id, orgId);
  return result.changes > 0;
}

export function activityRowToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    orgId: row.org_id,
    type: row.type,
    subject: row.subject,
    body: row.body,
    occurredAt: row.occurred_at,
    accountId: row.account_id,
    contactId: row.contact_id,
    dealId: row.deal_id,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
