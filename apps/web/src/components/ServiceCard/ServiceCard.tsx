import { motion } from 'framer-motion'

interface ServiceCardProps {
  name: string
  price: string
  index: number
}

export default function ServiceCard({ name, price, index }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-surface px-5 py-4"
    >
      <span className="font-body text-sm text-text">{name}</span>
      <span className="font-heading text-base text-accent">{price}</span>
    </motion.div>
  )
}
