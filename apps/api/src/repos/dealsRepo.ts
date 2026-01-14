import { getDb } from '../db/connection.js';
import { DealRow } from '../types/database.js';
import { Deal, CreateDealRequest, UpdateDealRequest } from '@one-base/shared';
import { randomUUID } from 'crypto';

export function createDeal(orgId: string, data: CreateDealRequest): DealRow {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  // Validate account_id belongs to org
  const account = db
    .prepare('SELECT id FROM accounts WHERE id = ? AND org_id = ?')
    .get(data.accountId, orgId);
  if (!account) {
    throw new Error('Account not found or does not belong to organization');
  }

  // Validate stage_id belongs to org
  const stage = db
    .prepare('SELECT id FROM deal_stages WHERE id = ? AND org_id = ?')
    .get(data.stageId, orgId);
  if (!stage) {
    throw new Error('Deal stage not found or does not belong to organization');
  }

  // Validate primary_contact_id if provided
  if (data.primaryContactId) {
    const contact = db
      .prepare('SELECT id FROM contacts WHERE id = ? AND org_id = ?')
      .get(data.primaryContactId, orgId);
    if (!contact) {
      throw new Error('Contact not found or does not belong to organization');
    }
  }

  db.prepare(
    `INSERT INTO deals (id, org_id, account_id, primary_contact_id, stage_id, name, amount_cents, currency, expected_close_date, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    orgId,
    data.accountId,
    data.primaryContactId || null,
    data.stageId,
    data.name,
    data.amountCents || 0,
    data.currency || 'EUR',
    data.expectedCloseDate || null,
    now,
    now
  );

  return db.prepare('SELECT * FROM deals WHERE id = ?').get(id) as DealRow;
}

export function getDealById(orgId: string, id: string): DealRow | undefined {
  const db = getDb();
  return db
    .prepare('SELECT * FROM deals WHERE id = ? AND org_id = ?')
    .get(id, orgId) as DealRow | undefined;
}

export function listDeals(
  orgId: string,
  options: { search?: string; stageId?: string; accountId?: string; limit?: number; offset?: number }
): DealRow[] {
  const db = getDb();
  const { search, stageId, accountId, limit = 50, offset = 0 } = options;

  let query = 'SELECT * FROM deals WHERE org_id = ?';
  const params: (string | number)[] = [orgId];

  if (stageId) {
    query += ' AND stage_id = ?';
    params.push(stageId);
  }

  if (accountId) {
    query += ' AND account_id = ?';
    params.push(accountId);
  }

  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(...params) as DealRow[];
}

export function updateDeal(
  orgId: string,
  id: string,
  data: UpdateDealRequest
): DealRow | undefined {
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

  if (data.stageId) {
    const stage = db
      .prepare('SELECT id FROM deal_stages WHERE id = ? AND org_id = ?')
      .get(data.stageId, orgId);
    if (!stage) {
      throw new Error('Deal stage not found or does not belong to organization');
    }
  }

  if (data.primaryContactId) {
    const contact = db
      .prepare('SELECT id FROM contacts WHERE id = ? AND org_id = ?')
      .get(data.primaryContactId, orgId);
    if (!contact) {
      throw new Error('Contact not found or does not belong to organization');
    }
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (data.accountId !== undefined) {
    updates.push('account_id = ?');
    params.push(data.accountId);
  }
  if (data.primaryContactId !== undefined) {
    updates.push('primary_contact_id = ?');
    params.push(data.primaryContactId || null);
  }
  if (data.stageId !== undefined) {
    updates.push('stage_id = ?');
    params.push(data.stageId);
  }
  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.amountCents !== undefined) {
    updates.push('amount_cents = ?');
    params.push(data.amountCents);
  }
  if (data.currency !== undefined) {
    updates.push('currency = ?');
    params.push(data.currency);
  }
  if (data.expectedCloseDate !== undefined) {
    updates.push('expected_close_date = ?');
    params.push(data.expectedCloseDate || null);
  }

  if (updates.length === 0) {
    return getDealById(orgId, id);
  }

  updates.push('updated_at = ?');
  params.push(now);
  params.push(id, orgId);

  db.prepare(
    `UPDATE deals SET ${updates.join(', ')} WHERE id = ? AND org_id = ?`
  ).run(...params);

  return getDealById(orgId, id);
}

export function deleteDeal(orgId: string, id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM deals WHERE id = ? AND org_id = ?').run(id, orgId);
  return result.changes > 0;
}

export function dealRowToDeal(row: DealRow): Deal {
  return {
    id: row.id,
    orgId: row.org_id,
    accountId: row.account_id,
    primaryContactId: row.primary_contact_id,
    stageId: row.stage_id,
    name: row.name,
    amountCents: row.amount_cents,
    currency: row.currency,
    expectedCloseDate: row.expected_close_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
