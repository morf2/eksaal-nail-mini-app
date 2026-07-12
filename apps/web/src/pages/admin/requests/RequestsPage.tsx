import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Booking } from '@eksaal/shared'
import { isBookingArchived } from '@eksaal/shared'
import { useAdminBookingsStore } from '../../../shared/store/adminBookings'
import RequestCard from '../../../components/RequestCard'
import ClientProfileModal from '../../../components/ClientProfileModal'

const STATUS_PRIORITY: Record<Booking['status'], number> = {
  PENDING: 0,
  CONFIRMED: 1,
  COMPLETED: 2,
  NO_SHOW: 2,
  CANCELLED: 3,
}

export default function RequestsPage() {
  const bookings = useAdminBookingsStore((state) => state.bookings)
  const updateStatus = useAdminBookingsStore((state) => state.updateStatus)
  const deleteBooking = useAdminBookingsStore((state) => state.deleteBooking)

  const [openClientId, setOpenClientId] = useState<string | null>(null)

  const activeBookings = bookings.filter((booking) => !isBookingArchived(booking))
  const sortedBookings = [...activeBookings].sort(
    (a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status],
  )
  const pendingCount = activeBookings.filter((booking) => booking.status === 'PENDING').length
  const archivedCount = bookings.length - activeBookings.length

  return (
    <div className="px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)] lg:px-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 font-heading text-2xl text-heading">Заявки</h1>
          <p className="font-body text-sm text-text/60">
            {pendingCount > 0 ? `Новых заявок: ${pendingCount}` : 'Новых заявок нет'}
          </p>
        </div>
        <Link
          to="/admin/archive"
          className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 font-body text-xs text-text/50"
        >
          Архив{archivedCount > 0 ? ` · ${archivedCount}` : ''}
        </Link>
      </div>

      {sortedBookings.length === 0 ? (
        <p className="mt-12 text-center font-body text-sm text-text/40">
          Активных заявок нет.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {sortedBookings.map((booking) => (
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
