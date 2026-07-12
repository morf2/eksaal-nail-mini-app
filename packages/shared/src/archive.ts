import type { Booking } from './booking'

// A booking is "archived" — hidden from the main admin list — once it's a finished
// story (completed/cancelled) or its slot is in the past. Pure function so frontend
// and the future backend (e.g. GET /admin/bookings?archived=false) agree on the rule.
export function isBookingArchived(booking: Booking, now: Date = new Date()): boolean {
  if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') return true
  const bookingEnd = new Date(`${booking.date}T${booking.endTime}`)
  return bookingEnd.getTime() < now.getTime()
}
