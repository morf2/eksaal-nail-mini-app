import { motion } from 'framer-motion'
import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { TEXT_COLORS } from '../../shared/textColors'

interface WorkCardProps {
  id: string
  imageUrl: string
  title: string
  index: number
  onOpen: (id: string) => void
}

export default function WorkCard({ id, imageUrl, title, index, onOpen }: WorkCardProps) {
  const [failed, setFailed] = useState(false)

  return (
    <motion.button
      type="button"
      layoutId={`portfolio-${id}`}
      onClick={() => onOpen(id)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-surface"
    >
      {!failed ? (
        <>
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-active:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-3 pt-8">
            <p className="truncate text-left font-body text-xs" style={{ color: TEXT_COLORS.primary }}>
              {title}
            </p>
          </div>
        </>
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2"
          style={{ color: TEXT_COLORS.secondary }}
        >
          <ImageOff size={22} strokeWidth={1.5} />
          <span className="font-body text-[11px]">Скоро</span>
        </div>
      )}
    </motion.button>
  )
}
