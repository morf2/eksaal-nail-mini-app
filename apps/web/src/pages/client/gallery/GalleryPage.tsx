import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PortfolioItem } from '@eksaal/shared'
import WorkCard from '../../../components/WorkCard'
import Lightbox from '../../../components/Lightbox'
import { useBookingStore } from '../../../shared/store/booking'
import { usePortfolioStore } from '../../../shared/store/portfolio'
import { useServicesStore } from '../../../shared/store/services'
import { TEXT_COLORS } from '../../../shared/textColors'

export default function GalleryPage() {
  const [openId, setOpenId] = useState<string | null>(null)
  const navigate = useNavigate()
  const selectDesign = useBookingStore((state) => state.selectDesign)
  const toggleService = useBookingStore((state) => state.toggleService)
  const selectedServices = useBookingStore((state) => state.selectedServices)
  const items = usePortfolioStore((state) => state.items)
  const services = useServicesStore((state) => state.services)

  const visibleItems = items.filter((item) => !item.isHidden)
  const openItem = visibleItems.find((item) => item.id === openId) ?? null

  const handleSelectDesign = (item: PortfolioItem) => {
    const designPayload = {
      id: item.id,
      imageUrl: item.imageUrl,
      description: item.title,
      category: item.category,
    }
    selectDesign(designPayload)

    // Best-effort match: only auto-pick a service when the client hasn't chosen
    // one yet, so we never override an in-progress selection.
    if (selectedServices.length === 0) {
      const matchingService = services.find(
        (service) => service.isActive && service.category === item.category,
      )
      if (matchingService) toggleService(matchingService)
    }

    setOpenId(null)
    navigate('/booking')
  }

  return (
    <div className="px-4 pb-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] lg:px-6">
      <h1 className="mb-1 font-heading text-2xl" style={{ color: TEXT_COLORS.primary }}>
        Работы
      </h1>
      <p className="mb-6 font-body text-sm" style={{ color: TEXT_COLORS.secondary }}>
        Портфолио EKSAAL NAIL — выберите дизайн, который хотите повторить.
      </p>

      {visibleItems.length === 0 ? (
        <p className="mt-12 text-center font-body text-sm" style={{ color: TEXT_COLORS.secondary }}>
          Работы скоро появятся здесь.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
          {visibleItems.map((item, index) => (
            <WorkCard
              key={item.id}
              id={item.id}
              imageUrl={item.imageUrl}
              title={item.title}
              index={index}
              onOpen={setOpenId}
            />
          ))}
        </div>
      )}

      <Lightbox
        design={openItem}
        onClose={() => setOpenId(null)}
        onSelectDesign={handleSelectDesign}
      />
    </div>
  )
}
