import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Service } from '@eksaal/shared'
import { useServicesStore } from '../../shared/store/services'

interface ServiceSelectorProps {
  selectedIds: string[]
  onToggle: (service: Service) => void
}

export default function ServiceSelector({ selectedIds, onToggle }: ServiceSelectorProps) {
  const services = useServicesStore((state) => state.services.filter((service) => service.isActive))

  return (
    <div className="flex flex-col gap-3">
      {services.map((service, index) => {
        const isSelected = selectedIds.includes(service.id)
        return (
          <motion.button
            key={service.id}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            onClick={() => onToggle(service)}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-colors ${
              isSelected ? 'border-accent bg-accent/10' : 'border-white/10 bg-surface'
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                isSelected ? 'border-accent bg-accent' : 'border-white/20'
              }`}
            >
              {isSelected && <Check size={13} strokeWidth={2.5} className="text-background" />}
            </span>

            <span className="flex-1 font-body text-sm text-text">{service.name}</span>

            <span className={`font-heading text-base ${isSelected ? 'text-accent' : 'text-heading'}`}>
              {service.priceLabel}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
