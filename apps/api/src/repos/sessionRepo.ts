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
  const session = db
    .prepare('SELECT * FROM sessions WHERE token = ?')
    .get(token) as SessionRow | undefined;

  // Check expiration in TypeScript instead of SQL
  if (session && session.expires_at) {
    const expiresAt = new Date(session.expires_at).getTime();
    const now = new Date().getTime();
    
    if (expiresAt <= now) {
      // Session expired, delete it and return null
      deleteSession(token);
      return undefined;
    }
  }

  return session;
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function deleteExpiredSessions(): void {
  const db = getDb();
  // Get all sessions and check expiration in TypeScript
  const sessions = db.prepare('SELECT token, expires_at FROM sessions').all() as Array<{
    token: string;
    expires_at: string;
  }>;

  const now = new Date().getTime();
  const expiredTokens = sessions.filter((session) => {
    if (!session.expires_at) return false;
    const expiresAt = new Date(session.expires_at).getTime();
    return expiresAt <= now;
  });

  // Delete expired sessions
  const deleteStmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  for (const session of expiredTokens) {
    deleteStmt.run(session.token);
  }
}
