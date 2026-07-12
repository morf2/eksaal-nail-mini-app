import { motion } from 'framer-motion'
import type { DesignReference } from '@eksaal/shared'

interface SummaryServiceItem {
  id: string
  name: string
  priceLabel: string
}

interface BookingSummaryProps {
  services: SummaryServiceItem[]
  totalPrice: number
  isTotalApproximate?: boolean
  dateLabel?: string | null
  timeLabel?: string | null
  design?: DesignReference | null
}

export default function BookingSummary({
  services,
  totalPrice,
  isTotalApproximate = false,
  dateLabel,
  timeLabel,
  design,
}: BookingSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-white/10 bg-surface p-5"
    >
      <p className="mb-4 font-body text-xs uppercase tracking-[0.15em] text-text/40">Итого</p>

      {services.length > 0 ? (
        <ul className="mb-5 flex flex-col gap-5">
          {services.map((service) => (
            <li key={service.id} className="flex flex-col gap-1.5">
              <span className="font-body text-sm text-text">{service.name}</span>
              <span className="font-body text-sm text-accent/80">{service.priceLabel}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-5 font-body text-sm text-text/40">Услуги не выбраны</p>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <span className="font-body text-sm text-text/60">Стоимость</span>
        <span className="font-heading text-3xl text-accent">
          {isTotalApproximate ? 'от ' : ''}
          {totalPrice} ₽
        </span>
      </div>

      {dateLabel && (
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="font-body text-sm text-text/60">Дата</span>
          <span className="font-body text-sm text-text">{dateLabel}</span>
        </div>
      )}

      {timeLabel && (
        <div className="mt-2 flex items-center justify-between">
          <span className="font-body text-sm text-text/60">Время</span>
          <span className="font-body text-sm text-text">{timeLabel}</span>
        </div>
      )}

      {design && (
        <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
          <img
            src={design.imageUrl}
            alt={design.description}
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="font-body text-sm text-text/70">{design.description}</span>
        </div>
      )}
    </motion.div>
  )
}
