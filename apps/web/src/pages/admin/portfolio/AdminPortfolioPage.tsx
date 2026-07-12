import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { usePortfolioStore } from '../../../shared/store/portfolio'
import PortfolioForm from '../../../components/PortfolioForm'
import AdminPortfolioCard from '../../../components/AdminPortfolioCard'
import { TEXT_COLORS } from '../../../shared/textColors'

export default function AdminPortfolioPage() {
  const items = usePortfolioStore((state) => state.items)
  const addItem = usePortfolioStore((state) => state.addItem)
  const toggleHidden = usePortfolioStore((state) => state.toggleHidden)
  const deleteItem = usePortfolioStore((state) => state.deleteItem)

  const [isFormOpen, setFormOpen] = useState(false)

  return (
    <div className="px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)] lg:px-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 font-heading text-2xl text-heading">Портфолио</h1>
          <p className="font-body text-sm" style={{ color: TEXT_COLORS.secondary }}>
            Работы, видимые клиентам в галерее
          </p>
        </div>
        {!isFormOpen && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setFormOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-body text-xs font-medium uppercase tracking-[0.1em] text-background"
          >
            <Plus size={14} strokeWidth={2} />
            Добавить
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <PortfolioForm
            onSubmit={(input) => {
              addItem(input)
              setFormOpen(false)
            }}
            onCancel={() => setFormOpen(false)}
          />
        )}
      </AnimatePresence>

      {items.length === 0 ? (
        <p className="mt-12 text-center font-body text-sm" style={{ color: TEXT_COLORS.secondary }}>
          Работ пока нет — добавьте первую.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <AdminPortfolioCard
                key={item.id}
                item={item}
                onToggleHidden={toggleHidden}
                onDelete={deleteItem}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
