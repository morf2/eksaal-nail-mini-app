import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Phone, Send, X } from 'lucide-react'
import type { Booking } from '@eksaal/shared'
import { formatPrice } from '@eksaal/shared'
import { useAdminBookingsStore } from '../../shared/store/adminBookings'
import { useClientNotesStore } from '../../shared/store/clientNotes'
import { formatDateLabel } from '../../shared/dateLabels'
import { formatE164ForDisplay } from '../../shared/phone'

interface ClientProfileModalProps {
  telegramId: string | null
  onClose: () => void
}

const STATUS_LABEL: Record<Booking['status'], string> = {
  PENDING: 'Ожидает подтверждения',
  CONFIRMED: 'Подтверждена',
  CANCELLED: 'Отменена',
  COMPLETED: 'Завершена',
  NO_SHOW: 'Не пришёл(ла)',
}

function telegramLink(username: string): string {
  return `https://t.me/${username.replace(/^@/, '')}`
}

export default function ClientProfileModal({ telegramId, onClose }: ClientProfileModalProps) {
  const bookings = useAdminBookingsStore((state) => state.bookings)
  const notes = useClientNotesStore((state) => state.notes)
  const setNote = useClientNotesStore((state) => state.setNote)

  const clientBookings = useMemo(
    () =>
      telegramId
        ? bookings
            .filter((booking) => booking.telegramId === telegramId)
            .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))
        : [],
    [bookings, telegramId],
  )
  const latest = clientBookings[0] ?? null

  const totalVisits = clientBookings.filter((booking) => booking.status === 'COMPLETED').length
  const totalSpent = clientBookings
    .filter((booking) => booking.status === 'COMPLETED')
    .reduce((sum, booking) => sum + booking.totalPrice, 0)

  const [noteDraft, setNoteDraft] = useState('')
  useEffect(() => {
    if (telegramId) setNoteDraft(notes[telegramId] ?? '')
  }, [telegramId, notes])

  const contactHref = latest?.telegramUsername
    ? telegramLink(latest.telegramUsername)
    : latest?.phone
      ? `tel:${latest.phone.replace(/[^+\d]/g, '')}`
      : null

  return (
    <AnimatePresence>
      {telegramId && latest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/85 backdrop-blur-md sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-surface p-5 sm:rounded-3xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-lg text-heading">{latest.clientName ?? 'Клиент'}</p>
                {latest.telegramUsername && (
                  <p className="font-body text-sm text-text/60">{latest.telegramUsername}</p>
                )}
                {latest.phone && (
                  <p className="font-body text-sm text-text/60">
                    {formatE164ForDisplay(latest.phone)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-text/60"
                aria-label="Закрыть"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {contactHref && (
              <a
                href={contactHref}
                target={latest.telegramUsername ? '_blank' : undefined}
                rel="noreferrer"
                className="mb-5 flex w-fit items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 font-body text-xs text-accent"
              >
                {latest.telegramUsername ? <Send size={12} strokeWidth={2} /> : <Phone size={12} strokeWidth={2} />}
                Связаться
              </a>
            )}

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                <p className="mb-1 font-body text-xs text-text/50">Всего визитов</p>
                <p className="font-heading text-xl text-heading">{totalVisits}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                <p className="mb-1 font-body text-xs text-text/50">Общая сумма</p>
                <p className="font-heading text-xl text-accent">{totalSpent} ₽</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-2 font-body text-xs text-text/50">Заметки мастера</p>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                onBlur={() => setNote(telegramId, noteDraft)}
                placeholder="Например: любит нюдовые оттенки, чувствительная кутикула"
                rows={2}
                className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text placeholder:text-text/30 focus:border-accent focus:outline-none"
              />
            </div>

            <p className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
              История записей
            </p>
            <div className="flex flex-col gap-2">
              {clientBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-white/10 bg-background/40 p-4"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-body text-sm text-text">
                      {formatDateLabel(booking.date)}
                    </span>
                    <span className="shrink-0 font-body text-[11px] uppercase tracking-[0.08em] text-text/40">
                      {STATUS_LABEL[booking.status]}
                    </span>
                  </div>
                  <p className="font-body text-xs text-text/60">
                    {booking.services.map((service) => service.name).join(', ')}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-body text-xs text-text/40">{booking.startTime}</span>
                    <span className="font-heading text-sm text-accent">
                      {formatPrice(booking.totalPrice, false)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
