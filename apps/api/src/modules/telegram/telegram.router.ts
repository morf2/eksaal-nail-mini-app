import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../lib/asyncHandler'
import { sendError, sendSuccess } from '../../lib/responses'
import { isMasterChatId, registerSubscriber, sendTelegramMessage } from './telegram.service'
import { updateBookingStatus } from '../bookings/bookings.service'

export const telegramRouter = Router()

const registerSchema = z.object({
  chatId: z.string().min(1),
  username: z.string().nullable().optional(),
  role: z.string().optional(),
})

// Called by apps/bot's /start handler — must stay unauthenticated, there's no
// admin session in that context (it's a server-to-server call reacting to any
// Telegram user's /start, not a browser request).
telegramRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      sendError(res, 'chatId is required')
      return
    }
    const subscriber = await registerSubscriber(parsed.data)
    sendSuccess(res, subscriber, 201)
  }),
)

const sendTestSchema = z.object({
  chatId: z.string().min(1),
  message: z.string().min(1).optional(),
})

// No admin-session gate yet — flagged as the same kind of known gap as the public
// GET /bookings: there's no admin UI calling this in this phase (frontend is out
// of scope here), so there's nothing to gate against without inventing unrequested
// scope. Revisit once a real trigger point exists.
telegramRouter.post(
  '/send-test',
  asyncHandler(async (req, res) => {
    const parsed = sendTestSchema.safeParse(req.body)
    if (!parsed.success) {
      sendError(res, 'chatId is required')
      return
    }
    const text = parsed.data.message ?? 'Тестовое сообщение от EKSAAL NAIL 👋'
    try {
      await sendTelegramMessage(parsed.data.chatId, text)
    } catch (error) {
      // Surface Telegram's own error (e.g. "chat not found" for a chatId that
      // never sent /start) instead of a generic 500 — much more useful to debug.
      sendError(res, error instanceof Error ? error.message : 'Failed to send message', 502)
      return
    }
    sendSuccess(res, { sent: true })
  }),
)

const bookingActionSchema = z.object({
  bookingId: z.string().min(1),
  action: z.enum(['CONFIRM', 'CANCEL']),
  chatId: z.string().min(1),
})

const ACTION_TO_STATUS = { CONFIRM: 'CONFIRMED', CANCEL: 'CANCELLED' } as const

// Called by apps/bot when the master taps a button under the NEW_BOOKING message.
// Unauthenticated at the HTTP layer (same reasoning as /register — this is a
// server-to-server call from the bot, no admin session cookie exists there), but
// gated by isMasterChatId so only a chatId actually registered as MASTER can act —
// otherwise anyone who learned a bookingId could confirm/cancel it directly.
// Reuses the exact same updateBookingStatus() as the admin panel's PATCH route —
// see bookings.service.ts for the single place client notifications are sent from.
telegramRouter.post(
  '/booking-action',
  asyncHandler(async (req, res) => {
    const parsed = bookingActionSchema.safeParse(req.body)
    if (!parsed.success) {
      sendError(res, 'bookingId, action and chatId are required')
      return
    }

    const isMaster = await isMasterChatId(parsed.data.chatId)
    if (!isMaster) {
      sendError(res, 'Forbidden', 403)
      return
    }

    const status = ACTION_TO_STATUS[parsed.data.action]
    const booking = await updateBookingStatus(parsed.data.bookingId, status)
    if (!booking) {
      sendError(res, 'Booking not found', 404)
      return
    }

    sendSuccess(res, booking)
  }),
)
