import { z } from 'zod'

export const masterProfileSchema = z.object({
  name: z.string(),
  photoUrl: z.string().nullable(),
  description: z.string(),
  telegramUsername: z.string(),
  phone: z.string(),
})
export type MasterProfile = z.infer<typeof masterProfileSchema>

export const bookingSettingsSchema = z.object({
  // If true, new bookings are created as CONFIRMED instead of PENDING.
  autoConfirm: z.boolean(),
  // "Напоминание за день до записи" — a flag for now; actually sending it is Telegram
  // notification wiring (see packages/shared/notifications.ts), not built yet.
  reminderDayBeforeEnabled: z.boolean(),
  // Clients can't book a slot starting sooner than this from "now" (see
  // computeAvailableDays' minLeadMinutes param).
  minLeadTimeHours: z.number().min(0),
})
export type BookingSettings = z.infer<typeof bookingSettingsSchema>

export const studioSettingsSchema = z.object({
  name: z.string(),
  photoUrl: z.string().nullable(),
  description: z.string(),
})
export type StudioSettings = z.infer<typeof studioSettingsSchema>

export const appSettingsSchema = z.object({
  masterProfile: masterProfileSchema,
  bookingSettings: bookingSettingsSchema,
  studioSettings: studioSettingsSchema,
})
export type AppSettings = z.infer<typeof appSettingsSchema>
