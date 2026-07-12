import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { Service } from '@eksaal/shared'
import { useServicesStore } from '../../../shared/store/services'
import ServiceForm from '../../../components/ServiceForm'
import AdminServiceCard from '../../../components/AdminServiceCard'

export default function AdminServicesPage() {
  const services = useServicesStore((state) => state.services)
  const addService = useServicesStore((state) => state.addService)
  const updateService = useServicesStore((state) => state.updateService)
  const toggleHidden = useServicesStore((state) => state.toggleHidden)
  const deleteService = useServicesStore((state) => state.deleteService)

  const [isFormOpen, setFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const openAddForm = () => {
    setEditingService(null)
    setFormOpen(true)
  }

  const openEditForm = (service: Service) => {
    setEditingService(service)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingService(null)
  }

  return (
    <div className="px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)] lg:px-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 font-heading text-2xl text-heading">Услуги</h1>
          <p className="font-body text-sm text-text/60">
            Список, который видят клиенты при записи
          </p>
        </div>
        {!isFormOpen && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={openAddForm}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-body text-xs font-medium uppercase tracking-[0.1em] text-background"
          >
            <Plus size={14} strokeWidth={2} />
            Добавить
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <ServiceForm
            initialValues={editingService ?? undefined}
            onSubmit={(input) => {
              if (editingService) {
                updateService(editingService.id, input)
              } else {
                addService(input)
              }
              closeForm()
            }}
            onCancel={closeForm}
          />
        )}
      </AnimatePresence>

      {services.length === 0 ? (
        <p className="mt-12 text-center font-body text-sm text-text/40">
          Услуг пока нет — добавьте первую.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {services.map((service) => (
              <AdminServiceCard
                key={service.id}
                service={service}
                onEdit={openEditForm}
                onToggleHidden={toggleHidden}
                onDelete={deleteService}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
