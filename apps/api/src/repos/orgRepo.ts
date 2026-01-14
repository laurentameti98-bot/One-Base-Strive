import { getDb } from '../db/connection.js';
import { OrgRow } from '../types/database.js';
import { randomUUID } from 'crypto';

export function createOrg(name: string): OrgRow {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO orgs (id, name, created_at, updated_at) 
     VALUES (?, ?, ?, ?)`
  ).run(id, name, now, now);

  return db.prepare('SELECT * FROM orgs WHERE id = ?').get(id) as OrgRow;
}

export function getOrgById(id: string): OrgRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM orgs WHERE id = ?').get(id) as OrgRow | undefined;
}
