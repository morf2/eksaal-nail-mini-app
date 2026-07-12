import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { ImageOff, X } from 'lucide-react'
import type { PortfolioItem } from '@eksaal/shared'
import { TEXT_COLORS } from '../../shared/textColors'

interface LightboxProps {
  design: PortfolioItem | null
  onClose: () => void
  onSelectDesign: (design: PortfolioItem) => void
}

export default function Lightbox({ design, onClose, onSelectDesign }: LightboxProps) {
  const [failed, setFailed] = useState(false)

  return (
    <AnimatePresence onExitComplete={() => setFailed(false)}>
      {design && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col bg-background/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={(event) => {
              event.stopPropagation()
              onClose()
            }}
            className="absolute right-5 top-[calc(env(safe-area-inset-top)+1rem)] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/60 backdrop-blur"
            style={{ color: TEXT_COLORS.primary }}
            aria-label="Закрыть"
          >
            <X size={20} strokeWidth={1.5} />
          </motion.button>

          <motion.div
            layoutId={`portfolio-${design.id}`}
            onClick={(event) => event.stopPropagation()}
            className="relative mx-auto mb-auto mt-auto w-full max-w-md px-4"
          >
            {!failed ? (
              <img
                src={design.imageUrl}
                alt={design.title}
                onError={() => setFailed(true)}
                className="max-h-[70vh] w-full rounded-3xl object-cover"
              />
            ) : (
              <div
                className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-3xl border border-white/10 bg-surface"
                style={{ color: TEXT_COLORS.secondary }}
              >
                <ImageOff size={28} strokeWidth={1.5} />
                <span className="font-body text-xs">Фото скоро появится</span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 px-6 text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="font-heading text-lg" style={{ color: TEXT_COLORS.primary }}>
              {design.title}
            </p>
            {design.description && (
              <p className="mt-1 font-body text-sm" style={{ color: TEXT_COLORS.secondary }}>
                {design.description}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-[calc(env(safe-area-inset-bottom)+1.5rem)] mt-6 flex justify-center px-6"
            onClick={(event) => event.stopPropagation()}
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectDesign(design)}
              className="w-full max-w-xs rounded-full bg-accent px-8 py-3.5 font-body text-sm font-medium uppercase tracking-[0.15em] text-background shadow-[0_8px_24px_-8px_rgba(217,143,167,0.45)]"
            >
              Хочу такой дизайн
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
