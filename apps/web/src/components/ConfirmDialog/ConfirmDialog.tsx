import { AnimatePresence, motion } from 'framer-motion'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-6 backdrop-blur-md"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xs rounded-2xl border border-white/10 bg-surface p-5 text-center"
          >
            <p className="mb-2 font-heading text-lg text-heading">{title}</p>
            {description && (
              <p className="mb-5 font-body text-sm text-text/60">{description}</p>
            )}

            <div className="flex flex-col gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={onConfirm}
                className="w-full rounded-full bg-accent px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-background"
              >
                {confirmLabel}
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={onCancel}
                className="w-full rounded-full border border-white/15 px-4 py-3 font-body text-xs text-text/60"
              >
                {cancelLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
