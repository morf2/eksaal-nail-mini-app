import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ScheduleException, WorkDaySchedule, WorkSchedule } from '@eksaal/shared'

interface ScheduleState {
  schedule: WorkSchedule
  // Commits a full draft in one go — the admin page edits a local draft and calls this
  // only when "Сохранить изменения" is pressed (see project requirement: no live-apply).
  setSchedule: (schedule: WorkSchedule) => void
  addException: (exception: ScheduleException) => void
  removeException: (date: string) => void
}

const DEFAULT_WEEK_DAYS: WorkDaySchedule[] = [
  { weekday: 1, isWorking: true, startTime: '08:00', endTime: '18:00' },
  { weekday: 2, isWorking: true, startTime: '08:00', endTime: '18:00' },
  { weekday: 3, isWorking: true, startTime: '08:00', endTime: '18:00' },
  { weekday: 4, isWorking: true, startTime: '08:00', endTime: '18:00' },
  { weekday: 5, isWorking: true, startTime: '08:00', endTime: '18:00' },
  { weekday: 6, isWorking: false, startTime: '08:00', endTime: '18:00' },
  { weekday: 0, isWorking: false, startTime: '08:00', endTime: '18:00' },
]

const DEFAULT_SCHEDULE: WorkSchedule = {
  weekDays: DEFAULT_WEEK_DAYS,
  slotStepMinutes: 30,
  minLeadBeforeEndMinutes: 120,
  exceptions: [],
}

// Persisted to localStorage (key: eksaal-schedule-v2 — bumped from the old flat-shape
// store since the data model changed incompatibly). Mock stand-in for the future
// WorkSchedule/DayOverride DB tables until the backend exists.
export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      schedule: DEFAULT_SCHEDULE,

      setSchedule: (schedule) => set({ schedule }),

      addException: (exception) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            exceptions: [
              ...state.schedule.exceptions.filter((item) => item.date !== exception.date),
              exception,
            ].sort((a, b) => (a.date < b.date ? -1 : 1)),
          },
        })),

      removeException: (date) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            exceptions: state.schedule.exceptions.filter((item) => item.date !== date),
          },
        })),
    }),
    { name: 'eksaal-schedule-v2' },
  ),
)
