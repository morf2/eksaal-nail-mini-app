import type { Booking as PrismaBooking } from '@prisma/client'
import type { Booking } from '@eksaal/shared'

// Converts a Prisma row (JSON columns typed as unknown) into the exact Booking
// shape the frontend already works with (packages/shared/src/booking.ts) —
// this is what keeps the phase-2 store swap a no-op for components.
export function toBookingDto(row: PrismaBooking): Booking {
  return {
    id: row.id,
    clientId: row.clientId,
    clientName: row.clientName,
    telegramUsername: row.telegramUsername,
    telegramId: row.telegramId,
    phone: row.phone,
    services: JSON.parse(row.services) as Booking['services'],
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    durationMinutes: row.durationMinutes,
    totalPrice: row.totalPrice,
    design: row.design ? (JSON.parse(row.design) as Booking['design']) : undefined,
    coatingStatus: (row.coatingStatus as Booking['coatingStatus']) ?? undefined,
    desiredLength: (row.desiredLength as Booking['desiredLength']) ?? undefined,
    clientComment: row.clientComment ?? undefined,
    status: row.status as Booking['status'],
    statusHistory: JSON.parse(row.statusHistory) as Booking['statusHistory'],
    createdAt: row.createdAt,
  }
}
