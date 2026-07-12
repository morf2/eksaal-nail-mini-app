import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { DesignReference } from '@eksaal/shared'
import { TEXT_COLORS } from '../../shared/textColors'

interface DesignPreviewCardProps {
  design: DesignReference
  onClear: () => void
}

const CATEGORY_LABEL: Record<DesignReference['category'], string> = {
  MANICURE: 'Маникюр',
  PEDICURE: 'Педикюр',
  EXTENSION: 'Наращивание',
  NAIL_ART: 'Дизайн ногтей',
}

export default function DesignPreviewCard({ design, onClear }: DesignPreviewCardProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface p-3"
    >
      <img
        src={design.imageUrl}
        alt={design.description}
        className="h-16 w-16 rounded-xl object-cover"
      />
      <div className="flex-1 text-left">
        <p className="font-body text-xs" style={{ color: TEXT_COLORS.secondary }}>
          Выбранный дизайн
        </p>
        <p className="font-body text-sm" style={{ color: TEXT_COLORS.primary }}>
          {design.description}
        </p>
        <p className="mt-0.5 font-body text-xs" style={{ color: TEXT_COLORS.accent }}>
          {CATEGORY_LABEL[design.category]}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => navigate('/gallery')}
          className="font-body text-xs underline underline-offset-4"
          style={{ color: TEXT_COLORS.accent }}
        >
          Изменить
        </button>
        <button
          type="button"
          onClick={onClear}
          className="font-body text-xs underline underline-offset-4"
          style={{ color: TEXT_COLORS.secondary }}
        >
          Убрать
        </button>
      </div>
    </motion.div>
  )
}
