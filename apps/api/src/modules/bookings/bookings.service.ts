import type { Booking, BookingStatus } from '@eksaal/shared'
import { prisma } from '../../lib/prisma'
import { toBookingDto } from './bookings.mapper'
import {
  notifyBookingCancelled,
  notifyBookingConfirmed,
  notifyNewBooking,
} from '../notifications/notificationService'

export type CreateBookingInput = Omit<Booking, 'id' | 'createdAt' | 'statusHistory'>

// createdAt is stored as an ISO-8601 string (not Prisma DateTime) to match the
// frontend exactly, so string ordering here is also chronological ordering.
export async function listBookings(): Promise<Booking[]> {
  const rows = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } })
  return rows.map(toBookingDto)
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const createdAt = new Date().toISOString()
  const row = await prisma.booking.create({
    data: {
      clientId: input.clientId,
      clientName: input.clientName,
      telegramUsername: input.telegramUsername,
      telegramId: input.telegramId,
      phone: input.phone,
      services: JSON.stringify(input.services),
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      durationMinutes: input.durationMinutes,
      totalPrice: input.totalPrice,
      design: input.design ? JSON.stringify(input.design) : undefined,
      coatingStatus: input.coatingStatus,
      desiredLength: input.desiredLength,
      clientComment: input.clientComment,
      status: input.status,
      statusHistory: JSON.stringify([{ status: input.status, changedAt: createdAt }]),
      createdAt,
    },
  })
  const booking = toBookingDto(row)

  // Fire-and-forget — notifyNewBooking() catches its own errors internally, and
  // this call isn't awaited, so a Telegram outage or missing MASTER subscriber
  // can never delay or fail booking creation itself.
  notifyNewBooking(booking).catch((error) => {
    console.error('[notifications] notifyNewBooking failed:', error)
  })

  return booking
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking | null> {
  const existing = await prisma.booking.findUnique({ where: { id } })
  if (!existing) return null

  // No-op guard: same status again (e.g. two near-simultaneous confirm taps —
  // one from a curl/API caller, one from the master's own double-tap in Telegram)
  // must not append a duplicate statusHistory entry or fire a second client
  // notification. Real transitions (PENDING -> CONFIRMED, PENDING -> CANCELLED,
  // etc.) are unaffected — this only short-circuits when nothing actually changes.
  if (existing.status === status) {
    return toBookingDto(existing)
  }

  const statusHistory = [
    ...(JSON.parse(existing.statusHistory) as Booking['statusHistory']),
    { status, changedAt: new Date().toISOString() },
  ]

  const row = await prisma.booking.update({
    where: { id },
    data: { status, statusHistory: JSON.stringify(statusHistory) },
  })
  const booking = toBookingDto(row)

  // Single unified point for client notifications — whether the status change
  // came from the admin panel (PATCH /bookings/:id/status) or a Telegram button
  // (POST /telegram/booking-action), both call this same function, so there's
  // exactly one place that decides "the client gets told." Fire-and-forget, same
  // reasoning as notifyNewBooking in createBooking() above.
  if (status === 'CONFIRMED') {
    notifyBookingConfirmed(booking).catch((error) => {
      console.error('[notifications] notifyBookingConfirmed failed:', error)
    })
  } else if (status === 'CANCELLED') {
    notifyBookingCancelled(booking).catch((error) => {
      console.error('[notifications] notifyBookingCancelled failed:', error)
    })
  }

  return booking
}

export async function deleteBooking(id: string): Promise<boolean> {
  const existing = await prisma.booking.findUnique({ where: { id } })
  if (!existing) return false

  await prisma.booking.delete({ where: { id } })
  return true
}
