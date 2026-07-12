import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { isBookingArchived } from '@eksaal/shared'
import { useAdminBookingsStore } from '../../../shared/store/adminBookings'
import RequestCard from '../../../components/RequestCard'
import ClientProfileModal from '../../../components/ClientProfileModal'

export default function ArchivePage() {
  const bookings = useAdminBookingsStore((state) => state.bookings)
  const updateStatus = useAdminBookingsStore((state) => state.updateStatus)
  const deleteBooking = useAdminBookingsStore((state) => state.deleteBooking)

  const [openClientId, setOpenClientId] = useState<string | null>(null)

  const archivedBookings = bookings
    .filter((booking) => isBookingArchived(booking))
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)] lg:px-6">
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1.5 font-body text-xs text-text/50"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Заявки
      </Link>

      <h1 className="mb-1 font-heading text-2xl text-heading">Архив</h1>
      <p className="mb-6 font-body text-sm text-text/60">
        Завершённые, отменённые и прошедшие заявки — скрыты из основного списка.
      </p>

      {archivedBookings.length === 0 ? (
        <p className="mt-12 text-center font-body text-sm text-text/40">Архив пуст.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {archivedBookings.map((booking) => (
              <RequestCard
                key={booking.id}
                booking={booking}
                onConfirm={(id) => updateStatus(id, 'CONFIRMED')}
                onReject={(id) => updateStatus(id, 'CANCELLED')}
                onCancel={(id) => updateStatus(id, 'CANCELLED')}
                onComplete={(id) => updateStatus(id, 'COMPLETED')}
                onRestore={(id, status) => updateStatus(id, status)}
                onDelete={(id) => deleteBooking(id)}
                onOpenClient={setOpenClientId}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <ClientProfileModal telegramId={openClientId} onClose={() => setOpenClientId(null)} />
    </div>
  )
}
