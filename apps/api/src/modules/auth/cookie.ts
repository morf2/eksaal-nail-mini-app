import type { CookieOptions } from 'express'

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'eksaal_admin_session'

// sameSite: 'lax' works for localhost:5173 -> localhost:4000 (different port,
// same site) in dev; secure is only enabled in production since it requires HTTPS
// and would otherwise silently stop the browser from ever sending the cookie.
export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 12 * 60 * 60 * 1000, // 12h — matches auth.service.ts SESSION_DURATION_MS
  path: '/',
}
