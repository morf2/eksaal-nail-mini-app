import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { computeAvailableDays } from '@eksaal/shared'
import type { OccupiedRange } from '@eksaal/shared'
import { useScheduleStore } from '../../shared/store/schedule'
import { useAdminBookingsStore } from '../../shared/store/adminBookings'
import { useAppSettingsStore } from '../../shared/store/appSettings'
import { formatDateLabel } from '../../shared/dateLabels'

interface DateTimeSelectorProps {
  selectedDate?: string
  selectedTime?: string
  durationMinutes: number
  onSelect: (date: string, time: string) => void
}

export default function DateTimeSelector({
  selectedDate,
  selectedTime,
  durationMinutes,
  onSelect,
}: DateTimeSelectorProps) {
  const schedule = useScheduleStore((state) => state.schedule)
  const bookings = useAdminBookingsStore((state) => state.bookings)
  const minLeadTimeHours = useAppSettingsStore((state) => state.settings.bookingSettings.minLeadTimeHours)

  // A slot is occupied by any active (not yet resolved) booking — PENDING or CONFIRMED —
  // so two clients can never both see the same overlapping window as free.
  const occupiedRanges: OccupiedRange[] = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status === 'PENDING' || booking.status === 'CONFIRMED')
        .map((booking) => ({
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
        })),
    [bookings],
  )

  const days = useMemo(
    () =>
      durationMinutes > 0
        ? computeAvailableDays(
            schedule,
            durationMinutes,
            occupiedRanges,
            14,
            new Date(),
            minLeadTimeHours * 60,
          ).map((day) => ({
            ...day,
            label: formatDateLabel(day.date),
          }))
        : [],
    [schedule, occupiedRanges, durationMinutes, minLeadTimeHours],
  )

  const [viewedDate, setViewedDate] = useState(selectedDate ?? days[0]?.date)

  if (durationMinutes === 0) {
    return (
      <p className="font-body text-sm text-text/50">
        Сначала выберите услугу, чтобы увидеть доступное время.
      </p>
    )
  }

  const activeDay = days.find((day) => day.date === viewedDate) ?? days[0]

  if (!activeDay) {
    return <p className="font-body text-sm text-text/50">Нет свободных дат.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day.date}
            type="button"
            onClick={() => setViewedDate(day.date)}
            className={`shrink-0 rounded-full border px-4 py-2 font-body text-xs transition-colors ${
              day.date === activeDay.date
                ? 'border-accent bg-accent text-background'
                : 'border-white/10 bg-surface text-text/70'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {activeDay.times.map((time) => {
          const isSelected = selectedDate === activeDay.date && selectedTime === time
          return (
            <motion.button
              key={time}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onSelect(activeDay.date, time)}
              className={`rounded-full border px-4 py-2 font-body text-xs transition-colors ${
                isSelected
                  ? 'border-accent bg-accent text-background'
                  : 'border-white/10 bg-surface text-text/70'
              }`}
            >
              {time}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
