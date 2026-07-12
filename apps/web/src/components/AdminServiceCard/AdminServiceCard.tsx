import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import type { Service } from '@eksaal/shared'
import { formatPrice } from '@eksaal/shared'
import ConfirmDialog from '../ConfirmDialog'

interface AdminServiceCardProps {
  service: Service
  onEdit: (service: Service) => void
  onToggleHidden: (id: string) => void
  onDelete: (id: string) => void
}

const CATEGORY_LABEL: Record<Service['category'], string> = {
  MANICURE: 'Маникюр',
  PEDICURE: 'Педикюр',
  EXTENSION: 'Наращивание',
  NAIL_ART: 'Дизайн ногтей',
}

export default function AdminServiceCard({
  service,
  onEdit,
  onToggleHidden,
  onDelete,
}: AdminServiceCardProps) {
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border border-white/10 bg-surface p-4 ${
        service.isActive ? '' : 'opacity-50'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 font-body text-xs text-accent">{CATEGORY_LABEL[service.category]}</p>
          <p className="font-heading text-base text-heading">{service.name}</p>
        </div>
        <div className="text-right">
          <p className="font-heading text-base text-accent">
            {formatPrice(service.price, service.isPriceFrom)}
          </p>
          <p className="font-body text-xs text-text/50">{service.durationMinutes} мин</p>
        </div>
      </div>

      {service.description && (
        <p className="mb-3 font-body text-xs text-text/50">{service.description}</p>
      )}

      {!service.isActive && (
        <p className="mb-3 font-body text-[11px] uppercase tracking-[0.1em] text-text/40">
          Скрыто от клиентов
        </p>
      )}

      <div className="flex gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => onEdit(service)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 py-2 font-body text-[11px] text-text/60"
        >
          <Pencil size={13} strokeWidth={1.5} />
          Изменить
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => onToggleHidden(service.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 py-2 font-body text-[11px] text-text/60"
        >
          {service.isActive ? <EyeOff size={13} strokeWidth={1.5} /> : <Eye size={13} strokeWidth={1.5} />}
          {service.isActive ? 'Скрыть' : 'Показать'}
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setDeleteConfirmOpen(true)}
          className="flex items-center justify-center rounded-full border border-white/15 px-3 py-2 text-text/60"
          aria-label="Удалить"
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </motion.button>
      </div>

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        title="Удалить услугу?"
        description="Услуга исчезнет из записи для клиентов. Уже созданные заявки не изменятся — там сохранён снимок услуги на момент записи."
        confirmLabel="Да, удалить"
        cancelLabel="Отмена"
        onConfirm={() => {
          onDelete(service.id)
          setDeleteConfirmOpen(false)
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </motion.div>
  )
}
