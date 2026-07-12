import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Phone, Send } from 'lucide-react'
import type { Booking } from '@eksaal/shared'
import { formatPrice } from '@eksaal/shared'
import { formatDateLabel } from '../../shared/dateLabels'
import { formatE164ForDisplay } from '../../shared/phone'
import ConfirmDialog from '../ConfirmDialog'

interface RequestCardProps {
  booking: Booking
  onConfirm: (id: string) => void
  onReject: (id: string) => void
  onCancel: (id: string) => void
  onComplete: (id: string) => void
  onRestore: (id: string, status: 'PENDING' | 'CONFIRMED') => void
  onDelete: (id: string) => void
  onOpenClient?: (telegramId: string) => void
}

const STATUS_LABEL: Record<Booking['status'], string> = {
  PENDING: 'Ожидает подтверждения',
  CONFIRMED: 'Подтверждена',
  CANCELLED: 'Отменена',
  COMPLETED: 'Завершена',
  NO_SHOW: 'Не пришёл(ла)',
}

const COATING_LABEL: Record<string, string> = {
  NONE: 'Без старого покрытия',
  HAS_OLD_COATING: 'Есть старое покрытие',
}

const LENGTH_LABEL: Record<string, string> = {
  SHORT: 'Короткая длина',
  MEDIUM: 'Средняя длина',
  LONG: 'Длинная длина',
}

const DESIGN_CATEGORY_LABEL: Record<string, string> = {
  MANICURE: 'Маникюр',
  PEDICURE: 'Педикюр',
  EXTENSION: 'Наращивание',
  NAIL_ART: 'Дизайн ногтей',
}

type PendingAction = 'reject' | 'cancel' | 'delete'

const CONFIRM_DIALOG_COPY: Record<
  PendingAction,
  { title: string; description: string; confirmLabel: string }
> = {
  reject: {
    title: 'Отклонить заявку?',
    description: 'Заявка не удалится — она перейдёт в статус «Отменена», и её можно будет восстановить.',
    confirmLabel: 'Да, отклонить',
  },
  cancel: {
    title: 'Отменить запись?',
    description: 'Заявка не удалится — она перейдёт в статус «Отменена», и её можно будет восстановить.',
    confirmLabel: 'Да, отменить',
  },
  delete: {
    title: 'Удалить заявку навсегда?',
    description: 'Это действие необратимо — заявка и её история будут удалены без возможности восстановления.',
    confirmLabel: 'Да, удалить',
  },
}

function telegramLink(username: string): string {
  return `https://t.me/${username.replace(/^@/, '')}`
}

function formatHistoryTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RequestCard({
  booking,
  onConfirm,
  onReject,
  onCancel,
  onComplete,
  onRestore,
  onDelete,
  onOpenClient,
}: RequestCardProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [isHistoryOpen, setHistoryOpen] = useState(false)

  const isPending = booking.status === 'PENDING'
  const isConfirmed = booking.status === 'CONFIRMED'
  const isCancelled = booking.status === 'CANCELLED'
  const isCompleted = booking.status === 'COMPLETED'
  const isArchived = isCancelled || isCompleted

  const contactHref = booking.telegramUsername
    ? telegramLink(booking.telegramUsername)
    : booking.phone
      ? `tel:${booking.phone.replace(/[^+\d]/g, '')}`
      : null

  const dialogCopy = pendingAction ? CONFIRM_DIALOG_COPY[pendingAction] : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border p-5 lg:p-6 ${
        isArchived ? 'border-white/5 bg-surface/50 opacity-60' : 'border-white/10 bg-surface'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {booking.telegramId && onOpenClient ? (
            <button
              type="button"
              onClick={() => onOpenClient(booking.telegramId as string)}
              className="font-heading text-lg text-heading underline decoration-white/20 underline-offset-4 lg:text-xl"
            >
              {booking.clientName ?? 'Клиент'}
            </button>
          ) : (
            <p className="font-heading text-lg text-heading lg:text-xl">
              {booking.clientName ?? 'Клиент'}
            </p>
          )}
          <p className="font-body text-xs text-text/50 lg:text-sm">
            {formatDateLabel(booking.date)}, {booking.startTime}–{booking.endTime}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 font-body text-[11px] uppercase tracking-[0.1em] ${
            isConfirmed
              ? 'border-accent bg-accent text-background'
              : isPending
                ? 'border-accent/50 bg-accent/10 text-accent'
                : 'border-white/10 text-text/40'
          }`}
        >
          {STATUS_LABEL[booking.status]}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {booking.telegramUsername && (
          <span className="rounded-full border border-white/10 px-3 py-1 font-body text-[11px] text-text/60">
            {booking.telegramUsername}
          </span>
        )}
        {booking.phone && (
          <span className="rounded-full border border-white/10 px-3 py-1 font-body text-[11px] text-text/60">
            {formatE164ForDisplay(booking.phone)}
          </span>
        )}
        {contactHref && (
          <a
            href={contactHref}
            target={booking.telegramUsername ? '_blank' : undefined}
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 font-body text-[11px] text-accent"
          >
            {booking.telegramUsername ? <Send size={12} strokeWidth={2} /> : <Phone size={12} strokeWidth={2} />}
            Связаться
          </a>
        )}
      </div>

      <ul className="mb-4 flex flex-col gap-3">
        {booking.services.map((service) => (
          <li key={service.serviceId} className="flex flex-col gap-0.5">
            <span className="font-body text-sm text-text">{service.name}</span>
            <span className="font-body text-sm text-accent/80">
              {formatPrice(service.price, service.isPriceFrom)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mb-4 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="font-body text-sm text-text/60">Стоимость</span>
        <span className="font-heading text-xl text-accent">{booking.totalPrice} ₽</span>
      </div>

      {(booking.coatingStatus || booking.desiredLength) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {booking.coatingStatus && (
            <span className="rounded-full border border-white/10 px-3 py-1 font-body text-[11px] text-text/60">
              {COATING_LABEL[booking.coatingStatus]}
            </span>
          )}
          {booking.desiredLength && (
            <span className="rounded-full border border-white/10 px-3 py-1 font-body text-[11px] text-text/60">
              {LENGTH_LABEL[booking.desiredLength]}
            </span>
          )}
        </div>
      )}

      {booking.clientComment && (
        <p className="mb-4 rounded-xl bg-background/40 p-3 font-body text-sm text-text/70">
          {booking.clientComment}
        </p>
      )}

      {booking.design && (
        <div className="mb-4 flex items-center gap-3">
          <img
            src={booking.design.imageUrl}
            alt={booking.design.description}
            className="h-14 w-14 rounded-xl object-cover"
          />
          <div>
            <p className="font-body text-xs text-text/50">Дизайн из галереи</p>
            <p className="font-body text-sm text-text/70">{booking.design.description}</p>
            <p className="font-body text-xs text-accent/80">
              {DESIGN_CATEGORY_LABEL[booking.design.category] ?? booking.design.category}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setHistoryOpen((value) => !value)}
        className="mb-2 flex w-full items-center justify-between border-t border-white/10 pt-3 font-body text-xs text-text/40"
      >
        История статусов
        <motion.span animate={{ rotate: isHistoryOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} strokeWidth={1.5} />
        </motion.span>
      </button>

      {isHistoryOpen && (
        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 flex flex-col gap-1.5 overflow-hidden"
        >
          {booking.statusHistory.map((entry, index) => (
            <li key={index} className="flex items-center justify-between font-body text-[11px] text-text/50">
              <span>{STATUS_LABEL[entry.status]}</span>
              <span>{formatHistoryTimestamp(entry.changedAt)}</span>
            </li>
          ))}
        </motion.ul>
      )}

      {isPending && (
        <div className="flex gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => onConfirm(booking.id)}
            className="flex-1 rounded-full bg-accent px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-background"
          >
            Подтвердить
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setPendingAction('reject')}
            className="flex-1 rounded-full border border-white/15 px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-text/60"
          >
            Отклонить
          </motion.button>
        </div>
      )}

      {isConfirmed && (
        <div className="flex gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => onComplete(booking.id)}
            className="flex-1 rounded-full bg-accent px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-background"
          >
            Завершить
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setPendingAction('cancel')}
            className="flex-1 rounded-full border border-white/15 px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-text/60"
          >
            Отменить
          </motion.button>
        </div>
      )}

      {isCancelled && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onRestore(booking.id, 'PENDING')}
              className="flex-1 rounded-full border border-white/15 px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-text/60"
            >
              Восстановить в ожидание
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onRestore(booking.id, 'CONFIRMED')}
              className="flex-1 rounded-full border border-accent/50 px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-accent"
            >
              Восстановить подтверждённой
            </motion.button>
          </div>
          <button
            type="button"
            onClick={() => setPendingAction('delete')}
            className="font-body text-xs text-text/30 underline underline-offset-4"
          >
            Удалить навсегда
          </button>
        </div>
      )}

      {isCompleted && (
        <button
          type="button"
          onClick={() => setPendingAction('delete')}
          className="font-body text-xs text-text/30 underline underline-offset-4"
        >
          Удалить навсегда
        </button>
      )}

      <ConfirmDialog
        open={dialogCopy !== null}
        title={dialogCopy?.title ?? ''}
        description={dialogCopy?.description}
        confirmLabel={dialogCopy?.confirmLabel ?? ''}
        cancelLabel="Отмена"
        onConfirm={() => {
          if (pendingAction === 'reject') onReject(booking.id)
          if (pendingAction === 'cancel') onCancel(booking.id)
          if (pendingAction === 'delete') onDelete(booking.id)
          setPendingAction(null)
        }}
        onCancel={() => setPendingAction(null)}
      />
    </motion.div>
  )
}
