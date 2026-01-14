import bcrypt from 'bcrypt';
import { User } from '@one-base/shared';
import * as userRepo from '../repos/userRepo.js';
import * as sessionRepo from '../repos/sessionRepo.js';
import { SessionRow } from '../types/database.js';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function login(email: string, password: string): Promise<{ user: User; session: SessionRow } | null> {
  const userRow = userRepo.getUserByEmail(email);
  if (!userRow || !userRow.is_active) {
    return null;
  }

  const isValid = await verifyPassword(password, userRow.password_hash);
  if (!isValid) {
    return null;
  }

  const session = sessionRepo.createSession(userRow.id);
  const user = userRepo.userRowToUser(userRow);

  return { user, session };
}

export function logout(token: string): void {
  sessionRepo.deleteSession(token);
}

export function getUserBySessionToken(token: string): User | null {
  const session = sessionRepo.getSessionByToken(token);
  if (!session) {
    return null;
  }

  const userRow = userRepo.getUserById(session.user_id);
  if (!userRow || !userRow.is_active) {
    return null;
  }

  return userRepo.userRowToUser(userRow);
}
