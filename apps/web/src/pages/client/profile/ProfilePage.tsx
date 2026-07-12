import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil } from 'lucide-react'
import { useAdminBookingsStore } from '../../../shared/store/adminBookings'
import { useClientProfileStore } from '../../../shared/store/clientProfile'
import { getTelegramUser } from '../../../shared/telegram'
import { extractSubscriberDigits, formatRussianPhone } from '../../../shared/phone'
import PhoneInput from '../../../components/PhoneInput'
import ClientBookingCard from '../../../components/ClientBookingCard'

export default function ProfilePage() {
  const telegramUser = useMemo(() => getTelegramUser(), [])

  const bookings = useAdminBookingsStore((state) => state.bookings)
  const updateStatus = useAdminBookingsStore((state) => state.updateStatus)

  const displayNameOverride = useClientProfileStore((state) => state.displayName)
  const phoneOverride = useClientProfileStore((state) => state.phone)
  const setDisplayName = useClientProfileStore((state) => state.setDisplayName)
  const setPhone = useClientProfileStore((state) => state.setPhone)

  const myBookings = useMemo(
    () => bookings.filter((booking) => booking.telegramId === telegramUser.telegramId),
    [bookings, telegramUser.telegramId],
  )
  // Active vs history is purely status-based here (unlike the admin archive, which also
  // hides past-dated bookings) — "Мои записи" should always show a still-open request
  // even if its date has technically passed, until the master resolves it.
  const activeBookings = useMemo(
    () =>
      myBookings
        .filter((booking) => booking.status === 'PENDING' || booking.status === 'CONFIRMED')
        .sort((a, b) => (a.date === b.date ? (a.startTime < b.startTime ? -1 : 1) : a.date < b.date ? -1 : 1)),
    [myBookings],
  )
  const historyBookings = useMemo(
    () =>
      myBookings
        .filter((booking) => booking.status === 'COMPLETED' || booking.status === 'CANCELLED' || booking.status === 'NO_SHOW')
        .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1)),
    [myBookings],
  )

  const mostRecentPhone = myBookings[0]?.phone ?? null
  const name = displayNameOverride ?? telegramUser.clientName ?? 'Клиент'
  const phoneDigits = phoneOverride ?? extractSubscriberDigits(mostRecentPhone ?? '')

  const [isEditing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState(name)
  const [phoneDraft, setPhoneDraft] = useState(phoneDigits)

  const startEditing = () => {
    setNameDraft(name)
    setPhoneDraft(phoneDigits)
    setEditing(true)
  }

  const saveEditing = () => {
    if (nameDraft.trim()) setDisplayName(nameDraft.trim())
    setPhone(phoneDraft)
    setEditing(false)
  }

  return (
    <div className="px-4 pb-28 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <h1 className="mb-6 font-heading text-2xl text-heading">Профиль</h1>

      <section className="mb-8 rounded-2xl border border-white/10 bg-surface p-5">
        <div className="mb-4 flex items-center gap-4">
          {telegramUser.photoUrl ? (
            <img src={telegramUser.photoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-accent/40 font-heading text-xl text-heading">
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          {!isEditing ? (
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-lg text-heading">{name}</p>
              {telegramUser.telegramUsername && (
                <p className="font-body text-sm text-text/60">{telegramUser.telegramUsername}</p>
              )}
              <p className="font-body text-sm text-text/60">
                {phoneDigits ? formatRussianPhone(phoneDigits) : 'Телефон не указан'}
              </p>
            </div>
          ) : (
            <p className="flex-1 font-body text-sm text-text/50">Редактирование контактов</p>
          )}

          {!isEditing && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={startEditing}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-text/60"
              aria-label="Редактировать"
            >
              <Pencil size={14} strokeWidth={1.5} />
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              <div>
                <p className="mb-2 font-body text-xs text-text/50">Имя</p>
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-body text-sm text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <p className="mb-2 font-body text-xs text-text/50">Телефон</p>
                <PhoneInput value={phoneDraft} onChange={setPhoneDraft} />
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={saveEditing}
                  className="flex-1 rounded-full bg-accent px-4 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-background"
                >
                  Сохранить
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditing(false)}
                  className="flex-1 rounded-full border border-white/15 px-4 py-3 font-body text-xs text-text/60"
                >
                  Отмена
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
          Мои записи
        </h2>
        {activeBookings.length === 0 ? (
          <p className="font-body text-sm text-text/40">Активных записей нет.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {activeBookings.map((booking) => (
                <ClientBookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={(id) => updateStatus(id, 'CANCELLED')}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
          История
        </h2>
        {historyBookings.length === 0 ? (
          <p className="font-body text-sm text-text/40">Пока пусто.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {historyBookings.map((booking) => (
              <ClientBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
