import { z } from 'zod'

// Structure only — no Telegram Bot API call happens anywhere yet. Once the bot exists,
// a backend worker subscribes to these same event types and sends the actual message;
// nothing about this shape should need to change when that happens.
export const notificationEventTypeSchema = z.enum([
  'NEW_BOOKING',
  'BOOKING_CONFIRMED',
  'BOOKING_CANCELLED',
])
export type NotificationEventType = z.infer<typeof notificationEventTypeSchema>

export const notificationEventSchema = z.object({
  type: notificationEventTypeSchema,
  bookingId: z.string(),
  telegramId: z.string().nullable(),
  occurredAt: z.string(),
})
export type NotificationEvent = z.infer<typeof notificationEventSchema>
