import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { addMinutesToTime, formatPrice } from '@eksaal/shared'
import { useBookingStore } from '../../../shared/store/booking'
import { useServicesStore } from '../../../shared/store/services'
import { formatDateLabel } from '../../../shared/dateLabels'
import { isValidRussianPhone } from '../../../shared/phone'
import DesignPreviewCard from '../../../components/DesignPreviewCard'
import ServiceSelector from '../../../components/ServiceSelector'
import DateTimeSelector from '../../../components/DateTimeSelector'
import AdditionalInfoForm from '../../../components/AdditionalInfoForm'
import BookingSummary from '../../../components/BookingSummary'

export default function BookingPage() {
  const navigate = useNavigate()
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [slotUnavailable, setSlotUnavailable] = useState(false)

  const design = useBookingStore((state) => state.design)
  const draftSelectedServices = useBookingStore((state) => state.selectedServices)
  const liveServices = useServicesStore((state) => state.services)
  // Re-resolve against the live services store so an admin edit (price/name/duration)
  // or hide/delete is reflected immediately, even for services already added here.
  const selectedServices = useMemo(
    () =>
      draftSelectedServices
        .map((service) => liveServices.find((live) => live.id === service.id))
        .filter((service): service is NonNullable<typeof service> => Boolean(service?.isActive)),
    [draftSelectedServices, liveServices],
  )
  const date = useBookingStore((state) => state.date)
  const startTime = useBookingStore((state) => state.startTime)
  const coatingStatus = useBookingStore((state) => state.coatingStatus)
  const desiredLength = useBookingStore((state) => state.desiredLength)
  const phone = useBookingStore((state) => state.phone)
  const clientComment = useBookingStore((state) => state.clientComment)
  const confirmedBooking = useBookingStore((state) => state.confirmedBooking)

  const toggleService = useBookingStore((state) => state.toggleService)
  const selectDateTime = useBookingStore((state) => state.selectDateTime)
  const clearDateTime = useBookingStore((state) => state.clearDateTime)
  const setCoatingStatus = useBookingStore((state) => state.setCoatingStatus)
  const setDesiredLength = useBookingStore((state) => state.setDesiredLength)
  const setPhone = useBookingStore((state) => state.setPhone)
  const setClientComment = useBookingStore((state) => state.setClientComment)
  const clearDesign = useBookingStore((state) => state.clearDesign)
  const confirmBooking = useBookingStore((state) => state.confirmBooking)
  const resetDraft = useBookingStore((state) => state.resetDraft)

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0)
  const isTotalApproximate = selectedServices.some((service) => service.isPriceFrom)
  const durationMinutes = selectedServices.reduce((sum, service) => sum + service.durationMinutes, 0)
  const previewEndTime = startTime && durationMinutes > 0 ? addMinutesToTime(startTime, durationMinutes) : null
  const timeLabel = startTime ? (previewEndTime ? `${startTime}–${previewEndTime}` : startTime) : null

  const canConfirm =
    selectedServices.length > 0 && Boolean(date) && Boolean(startTime) && isValidRussianPhone(phone)

  if (confirmedBooking) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <h2 className="font-heading text-2xl text-heading">Заявка отправлена</h2>
          <p className="max-w-xs font-body text-sm text-text/60">
            Мастер подтвердит запись в ближайшее время. Мы пришлём уведомление в Telegram.
          </p>
        </motion.div>

        <div className="w-full max-w-sm">
          <BookingSummary
            services={confirmedBooking.services.map((service) => ({
              id: service.serviceId,
              name: service.name,
              priceLabel: formatPrice(service.price, service.isPriceFrom),
            }))}
            totalPrice={confirmedBooking.totalPrice}
            isTotalApproximate={confirmedBooking.services.some((service) => service.isPriceFrom)}
            dateLabel={formatDateLabel(confirmedBooking.date)}
            timeLabel={`${confirmedBooking.startTime}–${confirmedBooking.endTime}`}
            design={confirmedBooking.design ?? null}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            resetDraft()
            navigate('/')
          }}
          className="font-body text-xs text-accent underline underline-offset-4"
        >
          Новая запись
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pb-32 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <h1 className="mb-6 font-heading text-2xl text-heading">Запись</h1>

      <AnimatePresence>
        {design && (
          <div className="mb-6">
            <DesignPreviewCard design={design} onClear={clearDesign} />
          </div>
        )}
      </AnimatePresence>

      <section className="mb-8">
        <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
          Услуги
        </h2>
        <ServiceSelector
          selectedIds={selectedServices.map((service) => service.id)}
          onToggle={toggleService}
        />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
          Дата и время
        </h2>
        <DateTimeSelector
          selectedDate={date ?? undefined}
          selectedTime={startTime ?? undefined}
          durationMinutes={durationMinutes}
          onSelect={(nextDate, nextTime) => {
            setSlotUnavailable(false)
            selectDateTime(nextDate, nextTime)
          }}
        />
        {slotUnavailable && (
          <p className="mt-2 font-body text-xs text-red-400/80">
            Это время уже заняли — выберите другое.
          </p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
          Дополнительная информация
        </h2>
        <AdditionalInfoForm
          phone={phone}
          showPhoneError={submitAttempted}
          coatingStatus={coatingStatus}
          desiredLength={desiredLength}
          comment={clientComment}
          onPhoneChange={setPhone}
          onCoatingStatusChange={setCoatingStatus}
          onDesiredLengthChange={setDesiredLength}
          onCommentChange={setClientComment}
        />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-body text-xs uppercase tracking-[0.15em] text-text/40">
          Перед подтверждением
        </h2>
        <BookingSummary
          services={selectedServices.map((service) => ({
            id: service.id,
            name: service.name,
            priceLabel: service.priceLabel,
          }))}
          totalPrice={totalPrice}
          isTotalApproximate={isTotalApproximate}
          dateLabel={date ? formatDateLabel(date) : null}
          timeLabel={timeLabel}
          design={design}
        />
      </section>

      <motion.button
        type="button"
        whileTap={canConfirm ? { scale: 0.97 } : undefined}
        onClick={() => {
          if (!canConfirm) {
            setSubmitAttempted(true)
            return
          }
          const result = confirmBooking()
          if (!result) {
            setSlotUnavailable(true)
            clearDateTime()
          }
        }}
        className={`w-full rounded-full px-8 py-4 font-body text-sm font-medium uppercase tracking-[0.15em] transition-colors ${
          canConfirm
            ? 'bg-accent text-background shadow-[0_8px_24px_-8px_rgba(217,143,167,0.45)]'
            : 'bg-surface text-text/30'
        }`}
      >
        Подтвердить запись
      </motion.button>
    </div>
  )
}
