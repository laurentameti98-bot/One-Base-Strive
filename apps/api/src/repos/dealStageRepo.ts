import { getDb } from '../db/connection.js';
import { DealStageRow } from '../types/database.js';
import { DealStage } from '@one-base/shared';
import { randomUUID } from 'crypto';

export function createDealStage(data: {
  orgId: string;
  name: string;
  sortOrder: number;
  isClosed?: boolean;
}): DealStageRow {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO deal_stages (id, org_id, name, sort_order, is_closed, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, data.orgId, data.name, data.sortOrder, data.isClosed ? 1 : 0, now, now);

  return db.prepare('SELECT * FROM deal_stages WHERE id = ?').get(id) as DealStageRow;
}

export function getDealStagesByOrgId(orgId: string): DealStageRow[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM deal_stages WHERE org_id = ? ORDER BY sort_order')
    .all(orgId) as DealStageRow[];
}

export function dealStageRowToDealStage(row: DealStageRow): DealStage {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    sortOrder: row.sort_order,
    isClosed: row.is_closed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
