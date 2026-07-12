import { z } from 'zod'
import { russianPhoneSchema } from './phone'
import { serviceCategorySchema } from './category'

// Mirrors the planned Booking.status enum on the backend (see project DB plan).
export const bookingStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
])
export type BookingStatus = z.infer<typeof bookingStatusSchema>

// Mirrors the future PortfolioItem reference attached to a booking.
export const designReferenceSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  description: z.string(),
  category: serviceCategorySchema,
})
export type DesignReference = z.infer<typeof designReferenceSchema>

// Mirrors the planned Service DB model.
// isPriceFrom marks variable-cost services (e.g. extensions priced by complexity) —
// kept as a real flag rather than parsed out of priceLabel so "от X ₽" formatting
// stays correct anywhere the price is displayed, including after booking confirmation.
export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: serviceCategorySchema,
  description: z.string().optional(),
  durationMinutes: z.number().int().positive(),
  price: z.number().nonnegative(),
  priceLabel: z.string(),
  isPriceFrom: z.boolean(),
  isActive: z.boolean(),
})
export type Service = z.infer<typeof serviceSchema>

// A booking can include several services (many-to-many) — mirrors a future
// BookingService join-table row. Name/price/duration are snapshotted at booking
// time so later Service price/duration changes never rewrite past bookings.
export const bookingServiceSchema = z.object({
  serviceId: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  isPriceFrom: z.boolean(),
  durationMinutes: z.number().int().positive(),
})
export type BookingServiceSnapshot = z.infer<typeof bookingServiceSchema>

// Structured "additional info" fields — kept as short enums/booleans (not free text)
// so the backend can filter/report on them later, not just display a comment string.
export const coatingStatusSchema = z.enum(['NONE', 'HAS_OLD_COATING'])
export type CoatingStatus = z.infer<typeof coatingStatusSchema>

export const desiredLengthSchema = z.enum(['SHORT', 'MEDIUM', 'LONG'])
export type DesiredLength = z.infer<typeof desiredLengthSchema>

// One entry per status transition — mirrors a future BookingStatusHistory table
// (booking_id, status, changed_at). Seeded with a PENDING entry at creation time.
export const statusHistoryEntrySchema = z.object({
  status: bookingStatusSchema,
  changedAt: z.string(),
})
export type StatusHistoryEntry = z.infer<typeof statusHistoryEntrySchema>

// What the client fills in before submitting — mirrors the future POST /bookings payload.
export const bookingDraftSchema = z.object({
  serviceIds: z.array(z.string()).min(1, 'Выберите хотя бы одну услугу'),
  date: z.string().min(1, 'Выберите дату'),
  startTime: z.string().min(1, 'Выберите время'),
  design: designReferenceSchema.optional(),
  coatingStatus: coatingStatusSchema.optional(),
  desiredLength: desiredLengthSchema.optional(),
  clientComment: z.string().max(500).optional(),
  // Required — a booking cannot be created without a valid Russian phone number.
  phone: russianPhoneSchema,
})
export type BookingDraft = z.infer<typeof bookingDraftSchema>

// Full booking record shape — mirrors the planned Booking DB model / future API response.
// This is the exact object the frontend hands to POST /bookings once the API exists;
// today it's persisted only in local React/zustand state (mirrored to localStorage)
// via a mock confirmBooking() call.
export const bookingSchema = z.object({
  id: z.string(),
  clientId: z.string().nullable(), // populated from verified Telegram initData once auth exists
  // Temporary denormalized contact fields — once auth exists these should come from a
  // User join on clientId instead of being stored on the booking itself. telegramUsername/
  // telegramId are read client-side from Telegram.WebApp.initDataUnsafe for display only;
  // the backend must independently verify initData before trusting any of this for auth.
  clientName: z.string().nullable(),
  telegramUsername: z.string().nullable(),
  telegramId: z.string().nullable(),
  // Required and validated — enforced before a booking is ever created (see confirmBooking()).
  phone: russianPhoneSchema,
  services: z.array(bookingServiceSchema).min(1),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(), // startTime + sum(durationMinutes), computed via addMinutesToTime
  durationMinutes: z.number().int().positive(),
  totalPrice: z.number().nonnegative(),
  design: designReferenceSchema.optional(),
  coatingStatus: coatingStatusSchema.optional(),
  desiredLength: desiredLengthSchema.optional(),
  clientComment: z.string().max(500).optional(),
  status: bookingStatusSchema,
  statusHistory: z.array(statusHistoryEntrySchema).min(1),
  createdAt: z.string(),
})
export type Booking = z.infer<typeof bookingSchema>
