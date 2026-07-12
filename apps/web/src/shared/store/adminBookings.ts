import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Booking, BookingStatus } from '@eksaal/shared'
import { mockAdminBookings } from '../mocks/bookings'
import { emitNotificationEvent } from '../notifications'
import { createBookingApi, fetchBookingsFromApi, updateBookingStatusApi } from '../api/bookingsApi'

interface AdminBookingsState {
  bookings: Booking[]
  // Writes to POST /bookings in the background (see comment on the implementation
  // below) — the client's confirmBooking() calls this exactly as before.
  addBooking: (booking: Booking) => void
  // Writes to PATCH /bookings/:id/status in the background.
  updateStatus: (id: string, status: BookingStatus) => void
  // Local-only for now — DELETE /bookings/:id doesn't exist on the API yet (out of
  // scope for this phase), only ever called from the archive view after ConfirmDialog.
  deleteBooking: (id: string) => void
  // Dev-only utility (Настройки → Разработка): wipes every booking in this local store —
  // does not call the API, so it only clears what's cached/optimistically held client-side.
  clearTestBookings: () => void
}

// Persisted to localStorage (key: eksaal-admin-bookings) as an offline cache / fallback.
// The source of truth is now apps/api's SQLite-backed /bookings API — on module load
// this store immediately tries to hydrate `bookings` from GET /bookings, overwriting
// the localStorage-restored value with the server's copy. If the API is unreachable
// (dev server not running, network down), that hydration silently fails and whatever
// persist() already restored from localStorage keeps serving the app — same for
// addBooking/updateStatus below, which apply locally first and sync to the API after.
export const useAdminBookingsStore = create<AdminBookingsState>()(
  persist(
    (set, get) => ({
      bookings: mockAdminBookings,

      // Optimistic local insert first (instant UI feedback, identical to the old
      // localStorage-only behavior), then persist to the API in the background and
      // reconcile the client-generated id with the server-assigned one once it
      // responds. If the API is unreachable, the local copy is simply left as-is —
      // that's the fallback: nothing here throws or blocks on the network call.
      addBooking: (booking) => {
        set((state) => ({ bookings: [booking, ...state.bookings] }))

        createBookingApi(booking)
          .then((serverBooking) => {
            set((state) => ({
              bookings: state.bookings.map((item) => (item.id === booking.id ? serverBooking : item)),
            }))
          })
          .catch((error) => {
            console.warn(
              '[adminBookings] API unavailable, keeping local-only booking (localStorage fallback):',
              error,
            )
          })
      },

      updateStatus: (id, status) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id
              ? {
                  ...booking,
                  status,
                  statusHistory: [
                    ...booking.statusHistory,
                    { status, changedAt: new Date().toISOString() },
                  ],
                }
              : booking,
          ),
        }))

        if (status === 'CONFIRMED' || status === 'CANCELLED') {
          const booking = get().bookings.find((item) => item.id === id)
          if (booking) {
            emitNotificationEvent({
              type: status === 'CONFIRMED' ? 'BOOKING_CONFIRMED' : 'BOOKING_CANCELLED',
              bookingId: booking.id,
              telegramId: booking.telegramId,
              occurredAt: new Date().toISOString(),
            })
          }
        }

        // Same optimistic-then-reconcile pattern as addBooking — local state above
        // is already updated, this just persists it and syncs back the server copy.
        updateBookingStatusApi(id, status)
          .then((serverBooking) => {
            set((state) => ({
              bookings: state.bookings.map((item) => (item.id === id ? serverBooking : item)),
            }))
          })
          .catch((error) => {
            console.warn(
              '[adminBookings] API unavailable, keeping local-only status update (localStorage fallback):',
              error,
            )
          })
      },

      deleteBooking: (id) =>
        set((state) => ({ bookings: state.bookings.filter((booking) => booking.id !== id) })),

      clearTestBookings: () => set({ bookings: [] }),
    }),
    { name: 'eksaal-admin-bookings' },
  ),
)

// Fire-and-forget hydration from the API as soon as this store is first imported —
// replaces the localStorage/mock seed with the server's list. No component needs to
// trigger this; if it fails, the catch below just leaves the localStorage-restored
// state in place (the fallback requirement).
fetchBookingsFromApi()
  .then((bookings) => useAdminBookingsStore.setState({ bookings }))
  .catch((error) => {
    console.warn(
      '[adminBookings] API unavailable at startup, using localStorage cache (fallback):',
      error,
    )
  })
