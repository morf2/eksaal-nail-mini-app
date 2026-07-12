import { motion } from 'framer-motion'
import { useEffect } from 'react'

interface SplashScreenProps {
  onFinished: () => void
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onFinished, 1800)
    return () => clearTimeout(timer)
  }, [onFinished])

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/40">
          <span className="font-heading text-2xl text-heading">E</span>
        </div>
        <span className="font-heading text-2xl tracking-[0.35em] text-heading">
          EKSAAL NAIL
        </span>
      </motion.div>
    </motion.div>
  )
}
