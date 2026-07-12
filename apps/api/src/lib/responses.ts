import type { Response } from 'express'

// Single response envelope for every endpoint in this API — matches what the
// future frontend adapter (phase 2) will expect from every route, not just bookings.
export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data })
}

export function sendError(res: Response, error: string, status = 400): void {
  res.status(status).json({ success: false, error })
}
