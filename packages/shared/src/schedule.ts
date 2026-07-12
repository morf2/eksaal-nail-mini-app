import { z } from 'zod'
import { addMinutesToTime, toLocalISODate } from './time'

// 0 = Sunday ... 6 = Saturday — matches JS Date#getDay().
export const weekdaySchema = z.number().int().min(0).max(6)
export type Weekday = z.infer<typeof weekdaySchema>

// One row per weekday — mirrors the planned WorkSchedule DB model
// (id, weekday, start_time, end_time, is_working), one record per day of the week.
export const workDayScheduleSchema = z.object({
  weekday: weekdaySchema,
  isWorking: z.boolean(),
  startTime: z.string(), // "08:00"
  endTime: z.string(), // "18:00"
})
export type WorkDaySchedule = z.infer<typeof workDayScheduleSchema>

// A specific calendar date overriding the weekly template — mirrors the planned
// DayOverride model. Only day-off toggling for now (hour overrides are a future step).
export const scheduleExceptionSchema = z.object({
  date: z.string(), // ISO date
  isDayOff: z.boolean(),
})
export type ScheduleException = z.infer<typeof scheduleExceptionSchema>

export const workScheduleSchema = z.object({
  weekDays: z.array(workDayScheduleSchema).length(7),
  // Granularity of selectable start times shown to the client (NOT service duration).
  slotStepMinutes: z.number().int().positive(),
  // Extra safety buffer before shift end, on top of whatever the service needs.
  minLeadBeforeEndMinutes: z.number().int().nonnegative(),
  exceptions: z.array(scheduleExceptionSchema),
})
export type WorkSchedule = z.infer<typeof workScheduleSchema>

// Generates ["10:00", "12:00", ...] between startTime and endTime (inclusive) every
// stepMinutes. Relies on zero-padded "HH:MM" strings sorting lexicographically.
export function generateTimeSlots(startTime: string, endTime: string, stepMinutes: number): string[] {
  const slots: string[] = []
  let current = startTime
  let guard = 0

  while (current <= endTime && guard < 200) {
    slots.push(current)
    current = addMinutesToTime(current, stepMinutes)
    guard += 1
  }

  return slots
}

// Fixed 08:00–18:00 range in 30-minute steps — the allowed choices for shift
// start/end pickers in the admin schedule UI (min start 08:00, max end 18:00).
export const SHIFT_HOUR_OPTIONS = generateTimeSlots('08:00', '18:00', 30)

export interface AvailableDay {
  date: string // ISO date, e.g. 2026-07-15
  times: string[]
}

// An existing booking's occupied window — kept minimal (not the full Booking shape) so
// this stays a small, reusable pure function. Callers extract this from whatever active
// (PENDING/CONFIRMED) bookings they have on hand.
export interface OccupiedRange {
  date: string
  startTime: string
  endTime: string
}

// Pure availability computation — mirrors the future GET /schedule/slots response.
// Frontend and backend should share this exact logic so availability never drifts
// between what the client sees and what the server actually allows.
//
// A candidate start time is valid only if:
//  1. the day is a working day (weekly template, unless a date exception says otherwise)
//  2. finishing the requested service (or the minimum end-of-shift buffer, whichever is
//     longer) does not run past the shift's end time
//  3. the resulting [start, start+duration) window doesn't overlap any occupied range
export function computeAvailableDays(
  schedule: WorkSchedule,
  serviceDurationMinutes: number,
  occupiedRanges: OccupiedRange[],
  daysAhead = 14,
  from: Date = new Date(),
  // "Настройки записи → минимальное время до записи" (e.g. 2h): today's slots starting
  // sooner than this from `from` are hidden. Additive/optional so existing callers that
  // don't pass it keep behaving the same (today is still filtered by "already passed").
  minLeadMinutes = 0,
): AvailableDay[] {
  const days: AvailableDay[] = []
  const requiredGap = Math.max(serviceDurationMinutes, schedule.minLeadBeforeEndMinutes)
  const earliestAllowed = new Date(from.getTime() + minLeadMinutes * 60000)

  // offset 0 = today. Today was previously never included at all, so clients could
  // never book same-day even with hours left in the shift — included now, gated by
  // "already passed" (always) and minLeadMinutes (when the caller sets one).
  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const date = new Date(from)
    date.setDate(date.getDate() + offset)
    const iso = toLocalISODate(date)

    const exception = schedule.exceptions.find((item) => item.date === iso)
    if (exception?.isDayOff) continue

    const daySchedule = schedule.weekDays.find((item) => item.weekday === date.getDay())
    if (!daySchedule || !daySchedule.isWorking) continue

    const candidates = generateTimeSlots(daySchedule.startTime, daySchedule.endTime, schedule.slotStepMinutes)
    const dayRanges = occupiedRanges.filter((range) => range.date === iso)

    const times = candidates.filter((slot) => {
      const requiredEnd = addMinutesToTime(slot, requiredGap)
      if (requiredEnd > daySchedule.endTime) return false

      if (offset === 0) {
        const [hours, minutes] = slot.split(':').map(Number)
        const slotDateTime = new Date(date)
        slotDateTime.setHours(hours, minutes, 0, 0)
        if (slotDateTime < earliestAllowed) return false
      }

      const serviceEnd = addMinutesToTime(slot, serviceDurationMinutes)
      const overlapsExisting = dayRanges.some(
        (range) => slot < range.endTime && serviceEnd > range.startTime,
      )
      return !overlapsExisting
    })

    if (times.length > 0) {
      days.push({ date: iso, times })
    }
  }

  return days
}
