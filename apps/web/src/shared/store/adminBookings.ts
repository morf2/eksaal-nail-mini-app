import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Booking, BookingStatus } from '@eksaal/shared'
import { mockAdminBookings } from '../mocks/bookings'
import { emitNotificationEvent } from '../notifications'
import {
  createBookingApi,
  deleteBookingApi,
  fetchBookingsFromApi,
  updateBookingStatusApi,
} from '../api/bookingsApi'

interface AdminBookingsState {
  bookings: Booking[]
  // Writes to POST /bookings in the background (see comment on the implementation
  // below) — the client's confirmBooking() calls this exactly as before.
  addBooking: (booking: Booking) => void
  // Writes to PATCH /bookings/:id/status in the background.
  updateStatus: (id: string, status: BookingStatus) => void
  // Writes to DELETE /bookings/:id in the background — reverts the optimistic
  // removal if the API call fails, so a 401/network error never silently loses a
  // booking that's still in the DB (see onDelete in RequestsPage/ArchivePage).
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

      deleteBooking: (id) => {
        const removed = get().bookings.find((booking) => booking.id === id) ?? null
        set((state) => ({ bookings: state.bookings.filter((booking) => booking.id !== id) }))

        deleteBookingApi(id).catch((error) => {
          console.error(`[adminBookings] failed to delete booking id=${id}, restoring locally:`, error)
          if (!removed) return
          set((state) =>
            state.bookings.some((booking) => booking.id === id)
              ? state
              : { bookings: [...state.bookings, removed].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) },
          )
        })
      },

      clearTestBookings: () => set({ bookings: [] }),
    }),
    { name: 'eksaal-admin-bookings' },
  ),
)

// Fire-and-forget hydration from the API — replaces the localStorage/mock seed
// with the server's list. If it fails, the catch below just leaves whatever
// persist() already restored in place (the fallback requirement).
function refetchBookings(): void {
  fetchBookingsFromApi()
    .then((bookings) => useAdminBookingsStore.setState({ bookings }))
    .catch((error) => {
      console.warn('[adminBookings] API unavailable, keeping cached bookings (fallback):', error)
    })
}

refetchBookings()

// This store is shared as-is by the admin panel, the client Web app, and the
// Telegram Mini App, each running as its own separate browser/webview session
// with its own copy of this store — a status change made in one session (e.g. the
// master confirming a booking in the admin panel) has no way to reach another
// session's already-loaded state other than that session re-fetching. Polling is
// the simplest way to do that without introducing a new transport (WebSocket/SSE)
// or rearchitecting the store as a shared backend-pushed source.
const BOOKINGS_POLL_INTERVAL_MS = 5000
if (typeof window !== 'undefined') {
  setInterval(refetchBookings, BOOKINGS_POLL_INTERVAL_MS)
  window.addEventListener('focus', refetchBookings)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refetchBookings()
  })
}
