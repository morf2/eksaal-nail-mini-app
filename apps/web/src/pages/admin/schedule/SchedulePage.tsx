import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Plus, X } from 'lucide-react'
import { SHIFT_HOUR_OPTIONS, generateTimeSlots } from '@eksaal/shared'
import type { WorkDaySchedule, WorkSchedule } from '@eksaal/shared'
import { useScheduleStore } from '../../../shared/store/schedule'
import { formatDateLabel } from '../../../shared/dateLabels'

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const WEEKDAY_LABEL: Record<number, string> = {
  0: 'Воскресенье',
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
}

const STEP_OPTIONS = [30, 60, 90, 120]
const BUFFER_OPTIONS = [0, 30, 60, 90, 120]

function sortByWeekdayOrder(days: WorkDaySchedule[]): WorkDaySchedule[] {
  return WEEKDAY_ORDER.map((weekday) => days.find((day) => day.weekday === weekday)).filter(
    (day): day is WorkDaySchedule => Boolean(day),
  )
}

export default function SchedulePage() {
  const schedule = useScheduleStore((state) => state.schedule)
  const setSchedule = useScheduleStore((state) => state.setSchedule)
  const addException = useScheduleStore((state) => state.addException)
  const removeException = useScheduleStore((state) => state.removeException)

  const [draft, setDraft] = useState<WorkSchedule>(schedule)
  const [exceptionDate, setExceptionDate] = useState('')

  const isDirty = JSON.stringify(draft) !== JSON.stringify(schedule)
  const hasInvalidDay = draft.weekDays.some(
    (day) => day.isWorking && day.startTime >= day.endTime,
  )

  const orderedDraftDays = useMemo(() => sortByWeekdayOrder(draft.weekDays), [draft.weekDays])

  const updateDay = (weekday: number, patch: Partial<WorkDaySchedule>) => {
    setDraft((current) => ({
      ...current,
      weekDays: current.weekDays.map((day) =>
        day.weekday === weekday ? { ...day, ...patch } : day,
      ),
    }))
  }

  const previewDay = orderedDraftDays.find((day) => day.isWorking)
  const previewSlots = previewDay
    ? generateTimeSlots(previewDay.startTime, previewDay.endTime, draft.slotStepMinutes)
    : []

  return (
    <div className="px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <h1 className="mb-1 font-heading text-2xl text-heading">Расписание</h1>
      <p className="mb-8 font-body text-sm text-text/60">
        Рабочие дни, часы и правила записи — клиенты видят только то, что здесь настроено.
      </p>

      <section className="mb-8">
        <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
          Рабочие дни
        </h2>
        <div className="flex flex-col gap-3">
          {orderedDraftDays.map((day) => (
            <div key={day.weekday} className="rounded-2xl border border-white/10 bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-heading text-base text-heading">
                  {WEEKDAY_LABEL[day.weekday]}
                </span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => updateDay(day.weekday, { isWorking: !day.isWorking })}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-xs transition-colors ${
                    day.isWorking
                      ? 'border-accent bg-accent text-background'
                      : 'border-white/10 text-text/50'
                  }`}
                >
                  {day.isWorking ? <Check size={13} strokeWidth={2} /> : <X size={13} strokeWidth={2} />}
                  {day.isWorking ? 'Работаю' : 'Выходной'}
                </motion.button>
              </div>

              {day.isWorking && (
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={day.startTime}
                    onChange={(event) => updateDay(day.weekday, { startTime: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-background px-3 py-2 font-body text-sm text-text focus:border-accent focus:outline-none"
                  >
                    {SHIFT_HOUR_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <span className="font-body text-text/40">—</span>
                  <select
                    value={day.endTime}
                    onChange={(event) => updateDay(day.weekday, { endTime: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-background px-3 py-2 font-body text-sm text-text focus:border-accent focus:outline-none"
                  >
                    {SHIFT_HOUR_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {day.isWorking && day.startTime >= day.endTime && (
                <p className="mt-2 font-body text-xs text-red-400/80">
                  Конец смены должен быть позже начала
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
          Шаг записи
        </h2>
        <p className="mb-3 font-body text-xs text-text/50">
          Через какой промежуток клиент может выбрать время начала — не влияет на
          длительность услуги.
        </p>
        <div className="flex flex-wrap gap-2">
          {STEP_OPTIONS.map((minutes) => (
            <motion.button
              key={minutes}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setDraft((current) => ({ ...current, slotStepMinutes: minutes }))}
              className={`rounded-full border px-4 py-2 font-body text-xs transition-colors ${
                draft.slotStepMinutes === minutes
                  ? 'border-accent bg-accent text-background'
                  : 'border-white/10 bg-surface text-text/70'
              }`}
            >
              {minutes} мин
            </motion.button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
          Минимальное время до конца смены
        </h2>
        <p className="mb-3 font-body text-xs text-text/50">
          Последняя запись не начнётся позже, чем за это время до конца смены — даже если
          услуга короче.
        </p>
        <div className="flex flex-wrap gap-2">
          {BUFFER_OPTIONS.map((minutes) => (
            <motion.button
              key={minutes}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                setDraft((current) => ({ ...current, minLeadBeforeEndMinutes: minutes }))
              }
              className={`rounded-full border px-4 py-2 font-body text-xs transition-colors ${
                draft.minLeadBeforeEndMinutes === minutes
                  ? 'border-accent bg-accent text-background'
                  : 'border-white/10 bg-surface text-text/70'
              }`}
            >
              {minutes === 0 ? 'Без буфера' : `${minutes} мин`}
            </motion.button>
          ))}
        </div>
      </section>

      <div className="mb-10">
        {hasInvalidDay && (
          <p className="mb-2 font-body text-xs text-red-400/80">
            Исправьте часы работы перед сохранением
          </p>
        )}
        <motion.button
          type="button"
          disabled={!isDirty || hasInvalidDay}
          whileTap={isDirty && !hasInvalidDay ? { scale: 0.97 } : undefined}
          onClick={() => setSchedule(draft)}
          className={`w-full rounded-full px-8 py-3.5 font-body text-sm font-medium uppercase tracking-[0.15em] transition-colors ${
            isDirty && !hasInvalidDay
              ? 'bg-accent text-background shadow-[0_8px_24px_-8px_rgba(217,143,167,0.45)]'
              : 'bg-surface text-text/30'
          }`}
        >
          {isDirty ? 'Сохранить изменения' : 'Изменений нет'}
        </motion.button>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
          Особые дни
        </h2>
        <p className="mb-3 font-body text-xs text-text/50">
          Сделать выходным конкретную дату — например, отпуск или праздник, даже если этот
          день недели обычно рабочий. Применяется сразу, без кнопки "Сохранить".
        </p>

        <div className="mb-3 flex gap-2">
          <input
            type="date"
            value={exceptionDate}
            onChange={(event) => setExceptionDate(event.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-surface px-3 py-2 font-body text-sm text-text focus:border-accent focus:outline-none"
          />
          <motion.button
            type="button"
            disabled={!exceptionDate}
            whileTap={exceptionDate ? { scale: 0.96 } : undefined}
            onClick={() => {
              if (!exceptionDate) return
              addException({ date: exceptionDate, isDayOff: true })
              setExceptionDate('')
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-body text-xs font-medium uppercase tracking-[0.1em] text-background disabled:opacity-40"
          >
            <Plus size={14} strokeWidth={2} />
            Выходной
          </motion.button>
        </div>

        {schedule.exceptions.length > 0 && (
          <div className="flex flex-col gap-2">
            {schedule.exceptions.map((exception) => (
              <div
                key={exception.date}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-surface px-4 py-2.5"
              >
                <span className="font-body text-sm text-text/80">
                  {formatDateLabel(exception.date)} — выходной
                </span>
                <button
                  type="button"
                  onClick={() => removeException(exception.date)}
                  className="font-body text-xs text-text/40 underline underline-offset-4"
                >
                  Убрать
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
          Клиенты увидят эти окна записи
        </h2>
        {previewDay ? (
          <div className="rounded-2xl border border-white/10 bg-surface p-4">
            <p className="mb-3 font-body text-xs text-text/50">
              Пример на {WEEKDAY_LABEL[previewDay.weekday]}, без учёта длительности
              выбранной услуги и уже занятых записей
            </p>
            <div className="flex flex-wrap gap-2">
              {previewSlots.map((slot) => (
                <span
                  key={slot}
                  className="rounded-full border border-white/10 bg-background px-3 py-1.5 font-body text-xs text-text/70"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="font-body text-sm text-text/40">
            Нет ни одного рабочего дня — клиенты не смогут записаться.
          </p>
        )}
      </section>
    </div>
  )
}
