import crypto from 'crypto';
import { db } from './db';
import { cookies } from 'next/headers';

const SALT_LENGTH = 16;
const ITERATIONS = 10000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

import { promisify } from 'util';

const pbkdf2 = promisify(crypto.pbkdf2);

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = (await pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)).toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  const verifyHash = (await pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)).toString('hex');
  return hash === verifyHash;
}

export function createSession(userId: string): string {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
    sessionId,
    userId,
    expiresAt.toISOString()
  );

  return sessionId;
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set('agrobot_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('agrobot_session')?.value;

  if (!sessionId) return null;

  const session = db.prepare('SELECT user_id, expires_at FROM sessions WHERE id = ?').get(sessionId) as any;

  if (!session) return null;

  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    return null;
  }

  const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(session.user_id) as any;
  return user || null;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('agrobot_session')?.value;

  if (sessionId) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
  }

  cookieStore.delete('agrobot_session');
}
