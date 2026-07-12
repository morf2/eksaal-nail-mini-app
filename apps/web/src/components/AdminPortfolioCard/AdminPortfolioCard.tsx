import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import type { PortfolioItem } from '@eksaal/shared'
import ConfirmDialog from '../ConfirmDialog'
import { TEXT_COLORS } from '../../shared/textColors'

interface AdminPortfolioCardProps {
  item: PortfolioItem
  onToggleHidden: (id: string) => void
  onDelete: (id: string) => void
}

const CATEGORY_LABEL: Record<PortfolioItem['category'], string> = {
  MANICURE: 'Маникюр',
  PEDICURE: 'Педикюр',
  EXTENSION: 'Наращивание',
  NAIL_ART: 'Дизайн ногтей',
}

export default function AdminPortfolioCard({ item, onToggleHidden, onDelete }: AdminPortfolioCardProps) {
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`overflow-hidden rounded-2xl border border-white/10 bg-surface ${
        item.isHidden ? 'opacity-50' : ''
      }`}
    >
      <div className="relative aspect-[4/3]">
        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
        {item.isHidden && (
          <span
            className="absolute left-2 top-2 rounded-full bg-background/80 px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.1em]"
            style={{ color: TEXT_COLORS.secondary }}
          >
            Скрыто
          </span>
        )}
      </div>

      <div className="p-4 lg:p-5">
        <p className="mb-1 font-body text-xs" style={{ color: TEXT_COLORS.accent }}>
          {CATEGORY_LABEL[item.category]}
        </p>
        <p className="mb-1 font-heading text-base lg:text-lg" style={{ color: TEXT_COLORS.primary }}>
          {item.title}
        </p>
        {item.description && (
          <p className="mb-3 font-body text-xs" style={{ color: TEXT_COLORS.secondary }}>
            {item.description}
          </p>
        )}

        <div className="flex gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => onToggleHidden(item.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 py-2 font-body text-[11px]"
            style={{ color: TEXT_COLORS.secondary }}
          >
            {item.isHidden ? <Eye size={13} strokeWidth={1.5} /> : <EyeOff size={13} strokeWidth={1.5} />}
            {item.isHidden ? 'Показать' : 'Скрыть'}
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setDeleteConfirmOpen(true)}
            className="flex items-center justify-center rounded-full border border-white/15 px-3 py-2"
            style={{ color: TEXT_COLORS.secondary }}
            aria-label="Удалить"
          >
            <Trash2 size={13} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        title="Удалить работу?"
        description="Фото и описание удалятся без возможности восстановления."
        confirmLabel="Да, удалить"
        cancelLabel="Отмена"
        onConfirm={() => {
          onDelete(item.id)
          setDeleteConfirmOpen(false)
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </motion.div>
  )
}
