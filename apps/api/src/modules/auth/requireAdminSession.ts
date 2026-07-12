import type { NextFunction, Request, Response } from 'express'
import { isSessionValid } from './auth.service'
import { SESSION_COOKIE_NAME } from './cookie'
import { sendError } from '../../lib/responses'

// Protects admin-only routes (currently PATCH /bookings/:id/status). GET /bookings
// stays public for now — see auth.router.ts / project notes: it's also read by the
// client booking flow (occupied slots, "Мои записи"), splitting that out is tracked
// as follow-up work, not done here.
export function requireAdminSession(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined
  if (!isSessionValid(sessionId)) {
    sendError(res, 'Unauthorized', 401)
    return
  }
  next()
}
