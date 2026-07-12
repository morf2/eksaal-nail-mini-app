import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'

// In-memory session store — sufficient for a single admin account and one API
// process. Restarting the API logs everyone out; move to a DB-backed Session
// table if that ever becomes a problem worth solving.
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000 // 12h
const sessions = new Map<string, { expiresAt: number }>()

export async function verifyAdminCredentials(login: string, password: string): Promise<boolean> {
  const expectedLogin = process.env.ADMIN_LOGIN
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!expectedLogin || !expectedPasswordHash) {
    console.error('ADMIN_LOGIN / ADMIN_PASSWORD_HASH is not configured')
    return false
  }

  if (login !== expectedLogin) return false
  return bcrypt.compare(password, expectedPasswordHash)
}

export function createSession(): string {
  const sessionId = crypto.randomBytes(32).toString('hex')
  sessions.set(sessionId, { expiresAt: Date.now() + SESSION_DURATION_MS })
  return sessionId
}

export function isSessionValid(sessionId: string | undefined): boolean {
  if (!sessionId) return false
  const session = sessions.get(sessionId)
  if (!session) return false
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId)
    return false
  }
  return true
}

export function destroySession(sessionId: string | undefined): void {
  if (sessionId) sessions.delete(sessionId)
}
