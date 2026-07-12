import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Booking } from '@eksaal/shared'
import { formatDateLabel } from '../../shared/dateLabels'
import ConfirmDialog from '../ConfirmDialog'

interface ClientBookingCardProps {
  booking: Booking
  onCancel?: (id: string) => void
}

const STATUS_LABEL: Record<Booking['status'], string> = {
  PENDING: 'Ожидает подтверждения',
  CONFIRMED: 'Подтверждено',
  CANCELLED: 'Отменено',
  COMPLETED: 'Завершено',
  NO_SHOW: 'Не пришли',
}

export default function ClientBookingCard({ booking, onCancel }: ClientBookingCardProps) {
  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const isActive = booking.status === 'PENDING' || booking.status === 'CONFIRMED'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-white/10 bg-surface p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-base text-heading">
            {booking.services.map((service) => service.name).join(', ')}
          </p>
          <p className="mt-1 font-body text-xs text-text/50">
            {formatDateLabel(booking.date)}, {booking.startTime}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 font-body text-[11px] uppercase tracking-[0.1em] ${
            booking.status === 'CONFIRMED'
              ? 'border-accent bg-accent text-background'
              : booking.status === 'PENDING'
                ? 'border-accent/50 bg-accent/10 text-accent'
                : 'border-white/10 text-text/40'
          }`}
        >
          {STATUS_LABEL[booking.status]}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <span className="font-body text-sm text-text/60">Стоимость</span>
        <span className="font-heading text-lg text-accent">{booking.totalPrice} ₽</span>
      </div>

      {booking.clientComment && (
        <p className="mt-3 rounded-xl bg-background/40 p-3 font-body text-xs text-text/60">
          {booking.clientComment}
        </p>
      )}

      {isActive && onCancel && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setConfirmOpen(true)}
          className="mt-4 w-full rounded-full border border-white/15 px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-text/60"
        >
          Отменить запись
        </motion.button>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title="Отменить запись?"
        description="Запись перейдёт в статус «Отменено» и уйдёт в историю."
        confirmLabel="Да, отменить"
        cancelLabel="Не отменять"
        onConfirm={() => {
          onCancel?.(booking.id)
          setConfirmOpen(false)
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </motion.div>
  )
}
