import type { CookieOptions } from 'express'

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'eksaal_admin_session'

// Frontend (Netlify) and API (Render) live on different registrable domains, so
// this cookie is cross-site from the browser's point of view on every fetch the
// frontend makes. SameSite=Lax blocks cross-site fetch/XHR entirely (it only
// allows top-level navigations) — the cookie would be *set* fine after login but
// never *sent* back on subsequent requests, making every requireAdminSession
// check silently fail with 401. SameSite=None is required for that, which in turn
// requires Secure (HTTPS) — true in production, not on http://localhost in dev,
// hence the split here rather than a single sameSite value.
const isProduction = process.env.NODE_ENV === 'production'

export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: 12 * 60 * 60 * 1000, // 12h — matches auth.service.ts SESSION_DURATION_MS
  path: '/',
}
