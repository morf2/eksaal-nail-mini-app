import type { NotificationEvent } from '@eksaal/shared'

// Minimal pub/sub — the future Telegram bot integration point. When the bot exists,
// register a listener here that actually calls the Bot API; nothing about how events
// are emitted (see booking.ts confirmBooking / adminBookings.ts updateStatus) will
// need to change.
type NotificationListener = (event: NotificationEvent) => void

const listeners = new Set<NotificationListener>()

export function subscribeToNotificationEvents(listener: NotificationListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitNotificationEvent(event: NotificationEvent): void {
  listeners.forEach((listener) => listener(event))
}

// Default listener so events are visible during development without a real bot.
subscribeToNotificationEvents((event) => {
  console.info('[notification]', event.type, { bookingId: event.bookingId, telegramId: event.telegramId })
})
