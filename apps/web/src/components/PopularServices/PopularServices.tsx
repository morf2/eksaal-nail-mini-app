import { motion } from 'framer-motion'
import ServiceCard from '../ServiceCard'
import { useServicesStore } from '../../shared/store/services'

export default function PopularServices() {
  const services = useServicesStore((state) => state.services.filter((service) => service.isActive))

  return (
    <section className="mt-12 px-6">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-5 font-heading text-xl text-heading"
      >
        Популярные услуги
      </motion.h2>

      <div className="flex flex-col gap-3">
        {services.map((service, index) => (
          <ServiceCard key={service.id} index={index} name={service.name} price={service.priceLabel} />
        ))}
      </div>
    </section>
  )
}
