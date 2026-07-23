import { Router } from 'express'
import { z } from 'zod'
import { bookingSchema, bookingStatusSchema } from '@eksaal/shared'
import { asyncHandler } from '../../lib/asyncHandler'
import { sendError, sendSuccess } from '../../lib/responses'
import { requireAdminSession } from '../auth/requireAdminSession'
import { createBooking, deleteBooking, listBookings, updateBookingStatus } from './bookings.service'

export const bookingsRouter = Router()

// Same creation-time fields the frontend already computes in confirmBooking()
// (see apps/web/src/shared/store/booking.ts) — id/createdAt/statusHistory are
// server-assigned instead.
const createBookingSchema = bookingSchema.omit({
  id: true,
  createdAt: true,
  statusHistory: true,
})

const updateStatusSchema = z.object({ status: bookingStatusSchema })

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ')
}

bookingsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const bookings = await listBookings()
    sendSuccess(res, bookings)
  }),
)

bookingsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createBookingSchema.safeParse(req.body)
    if (!parsed.success) {
      sendError(res, formatZodError(parsed.error))
      return
    }
    const booking = await createBooking(parsed.data)
    sendSuccess(res, booking, 201)
  }),
)

bookingsRouter.patch(
  '/:id/status',
  requireAdminSession,
  asyncHandler(async (req, res) => {
    const parsed = updateStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      sendError(res, formatZodError(parsed.error))
      return
    }
    const booking = await updateBookingStatus(req.params.id, parsed.data.status)
    if (!booking) {
      sendError(res, 'Booking not found', 404)
      return
    }
    sendSuccess(res, booking)
  }),
)

bookingsRouter.delete(
  '/:id',
  requireAdminSession,
  asyncHandler(async (req, res) => {
    const deleted = await deleteBooking(req.params.id)
    if (!deleted) {
      sendError(res, 'Booking not found', 404)
      return
    }
    sendSuccess(res, null)
  }),
)
