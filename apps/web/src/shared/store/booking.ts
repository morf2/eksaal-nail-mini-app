import { create } from 'zustand'
import { addMinutesToTime, computeAvailableDays } from '@eksaal/shared'
import type {
  Booking,
  BookingServiceSnapshot,
  BookingStatus,
  CoatingStatus,
  DesignReference,
  DesiredLength,
  OccupiedRange,
  Service,
} from '@eksaal/shared'
import { useAdminBookingsStore } from './adminBookings'
import { useScheduleStore } from './schedule'
import { useServicesStore } from './services'
import { useAppSettingsStore } from './appSettings'
import { getTelegramUser } from '../telegram'
import { isValidRussianPhone, toE164 } from '../phone'
import { emitNotificationEvent } from '../notifications'

interface BookingDraftState {
  design: DesignReference | null
  selectedServices: Service[]
  date: string | null
  startTime: string | null
  coatingStatus: CoatingStatus | null
  desiredLength: DesiredLength | null
  phone: string
  clientComment: string
  confirmedBooking: Booking | null

  selectDesign: (design: DesignReference) => void
  clearDesign: () => void
  toggleService: (service: Service) => void
  selectDateTime: (date: string, startTime: string) => void
  clearDateTime: () => void
  setCoatingStatus: (value: CoatingStatus) => void
  setDesiredLength: (value: DesiredLength) => void
  setPhone: (phone: string) => void
  setClientComment: (comment: string) => void
  confirmBooking: () => Booking | null
  resetDraft: () => void
}

function createMockBookingId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useBookingStore = create<BookingDraftState>((set, get) => ({
  design: null,
  selectedServices: [],
  date: null,
  startTime: null,
  coatingStatus: null,
  desiredLength: null,
  phone: '',
  clientComment: '',
  confirmedBooking: null,

  selectDesign: (design) => set({ design }),
  clearDesign: () => set({ design: null }),

  toggleService: (service) =>
    set((state) => {
      const isSelected = state.selectedServices.some((item) => item.id === service.id)
      return {
        selectedServices: isSelected
          ? state.selectedServices.filter((item) => item.id !== service.id)
          : [...state.selectedServices, service],
      }
    }),

  selectDateTime: (date, startTime) => set({ date, startTime }),
  clearDateTime: () => set({ date: null, startTime: null }),
  setCoatingStatus: (coatingStatus) => set({ coatingStatus }),
  setDesiredLength: (desiredLength) => set({ desiredLength }),
  setPhone: (phone) => set({ phone }),
  setClientComment: (clientComment) => set({ clientComment }),

  // Simulates the future POST /bookings call — the returned object already matches the
  // planned Booking DB shape (service snapshots, computed endTime/duration/totalPrice,
  // Telegram contact info, status history), so swapping this for a real request later
  // is a one-line change, not a data remodel.
  confirmBooking: () => {
    const {
      selectedServices,
      date,
      startTime,
      design,
      coatingStatus,
      desiredLength,
      phone,
      clientComment,
    } = get()
    // Re-resolve against the live services store — prices/names/duration may have
    // changed (or the service been hidden/deleted) since the client added it here.
    const liveServices = useServicesStore.getState().services
    const resolvedServices = selectedServices
      .map((service) => liveServices.find((live) => live.id === service.id))
      .filter((service): service is NonNullable<typeof service> => Boolean(service?.isActive))

    // A booking cannot be created without a valid, complete Russian phone number.
    if (resolvedServices.length === 0 || !date || !startTime || !isValidRussianPhone(phone)) {
      return null
    }

    const services: BookingServiceSnapshot[] = resolvedServices.map((service) => ({
      serviceId: service.id,
      name: service.name,
      price: service.price,
      isPriceFrom: service.isPriceFrom,
      durationMinutes: service.durationMinutes,
    }))

    const durationMinutes = services.reduce((sum, item) => sum + item.durationMinutes, 0)
    const totalPrice = services.reduce((sum, item) => sum + item.price, 0)
    const endTime = addMinutesToTime(startTime, durationMinutes)

    const { bookingSettings } = useAppSettingsStore.getState().settings

    // Re-validate against the schedule right before creating the booking — the client
    // may have changed services (and therefore duration) after picking a slot, or
    // someone else may have taken it in the meantime. Prevents stale/double bookings.
    const schedule = useScheduleStore.getState().schedule
    const occupiedRanges: OccupiedRange[] = useAdminBookingsStore
      .getState()
      .bookings.filter((item) => item.status === 'PENDING' || item.status === 'CONFIRMED')
      .map((item) => ({ date: item.date, startTime: item.startTime, endTime: item.endTime }))
    const stillAvailable = computeAvailableDays(
      schedule,
      durationMinutes,
      occupiedRanges,
      14,
      new Date(),
      bookingSettings.minLeadTimeHours * 60,
    )
      .find((day) => day.date === date)
      ?.times.includes(startTime)
    if (!stillAvailable) return null
    const telegramUser = getTelegramUser()
    const createdAt = new Date().toISOString()

    // "Настройки записи → Автоматическое подтверждение": skip PENDING entirely when on.
    const initialStatus: BookingStatus = bookingSettings.autoConfirm ? 'CONFIRMED' : 'PENDING'

    const booking: Booking = {
      id: createMockBookingId(),
      clientId: null, // populated from verified Telegram initData once auth exists
      clientName: telegramUser.clientName,
      telegramUsername: telegramUser.telegramUsername,
      telegramId: telegramUser.telegramId,
      phone: toE164(phone),
      services,
      date,
      startTime,
      endTime,
      durationMinutes,
      totalPrice,
      design: design ?? undefined,
      coatingStatus: coatingStatus ?? undefined,
      desiredLength: desiredLength ?? undefined,
      clientComment: clientComment || undefined,
      status: initialStatus,
      statusHistory: [{ status: initialStatus, changedAt: createdAt }],
      createdAt,
    }

    set({ confirmedBooking: booking })
    // Mirrors the future POST /bookings write landing in the shared DB — pushes the
    // new request into the admin "Заявки" list so master sees it without a backend.
    useAdminBookingsStore.getState().addBooking(booking)
    emitNotificationEvent({
      type: 'NEW_BOOKING',
      bookingId: booking.id,
      telegramId: booking.telegramId,
      occurredAt: createdAt,
    })
    return booking
  },

  resetDraft: () =>
    set({
      design: null,
      selectedServices: [],
      date: null,
      startTime: null,
      coatingStatus: null,
      desiredLength: null,
      phone: '',
      clientComment: '',
      confirmedBooking: null,
    }),
}))
