import { getDb } from '../db/connection.js';
import { SessionRow } from '../types/database.js';
import { randomUUID } from 'crypto';
import { randomBytes } from 'crypto';

export function createSession(userId: string, expiresInDays = 30): SessionRow {
  const db = getDb();
  const id = randomUUID();
  const token = randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

  db.prepare(
    `INSERT INTO sessions (id, user_id, token, expires_at, created_at) 
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, userId, token, expiresAt.toISOString(), now.toISOString());

  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRow;
}

export function getSessionByToken(token: string): SessionRow | undefined {
  const db = getDb();
  return db
    .prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")')
    .get(token) as SessionRow | undefined;
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function deleteExpiredSessions(): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE expires_at <= datetime("now")').run();
}
