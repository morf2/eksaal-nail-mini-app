import { addMinutesToTime, toLocalISODate } from '@eksaal/shared'
import type { Booking, BookingServiceSnapshot, StatusHistoryEntry } from '@eksaal/shared'
import { mockServices } from './services'

function isoDateInDays(daysAhead: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysAhead)
  return toLocalISODate(date)
}

function hoursAgoIso(hours: number): string {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date.toISOString()
}

function serviceSnapshot(serviceId: string): BookingServiceSnapshot {
  const service = mockServices.find((item) => item.id === serviceId)
  if (!service) throw new Error(`Unknown mock service: ${serviceId}`)
  return {
    serviceId: service.id,
    name: service.name,
    price: service.price,
    isPriceFrom: service.isPriceFrom,
    durationMinutes: service.durationMinutes,
  }
}

function buildBooking(input: {
  id: string
  clientName: string
  telegramUsername: string
  phone: string
  services: string[]
  date: string
  startTime: string
  status: Booking['status']
  statusHistory: StatusHistoryEntry[]
  design?: Booking['design']
  coatingStatus?: Booking['coatingStatus']
  desiredLength?: Booking['desiredLength']
  clientComment?: string
}): Booking {
  const services = input.services.map(serviceSnapshot)
  const durationMinutes = services.reduce((sum, item) => sum + item.durationMinutes, 0)
  const totalPrice = services.reduce((sum, item) => sum + item.price, 0)

  return {
    id: input.id,
    clientId: `mock-${input.id}`,
    clientName: input.clientName,
    telegramUsername: input.telegramUsername,
    telegramId: `mock-tg-${input.id}`,
    phone: input.phone,
    services,
    date: input.date,
    startTime: input.startTime,
    endTime: addMinutesToTime(input.startTime, durationMinutes),
    durationMinutes,
    totalPrice,
    design: input.design,
    coatingStatus: input.coatingStatus,
    desiredLength: input.desiredLength,
    clientComment: input.clientComment,
    status: input.status,
    statusHistory: input.statusHistory,
    createdAt: input.statusHistory[0]?.changedAt ?? new Date().toISOString(),
  }
}

// Temporary seed data standing in for the future GET /admin/bookings response —
// replace with a real API call once the backend exists.
export const mockAdminBookings: Booking[] = [
  buildBooking({
    id: 'req-1',
    clientName: 'Анна Петрова',
    telegramUsername: '@anna.petrova',
    phone: '+79001234567',
    services: ['manicure-with-coating'],
    date: isoDateInDays(1),
    startTime: '14:00',
    status: 'PENDING',
    statusHistory: [{ status: 'PENDING', changedAt: hoursAgoIso(2) }],
    design: {
      id: 'nail-2',
      imageUrl: '/portfolio/nail-2.jpg',
      description: 'Работа EKSAAL NAIL №2',
      category: 'MANICURE',
    },
    desiredLength: 'MEDIUM',
    clientComment: 'Хочу форму как на фото, миндаль',
  }),
  buildBooking({
    id: 'req-2',
    clientName: 'Мария Соколова',
    telegramUsername: '@masha_s',
    phone: '+79015552211',
    services: ['manicure-no-coating', 'extension'],
    date: isoDateInDays(2),
    startTime: '11:00',
    status: 'PENDING',
    statusHistory: [{ status: 'PENDING', changedAt: hoursAgoIso(5) }],
    coatingStatus: 'HAS_OLD_COATING',
  }),
  buildBooking({
    id: 'req-3',
    clientName: 'Екатерина Волкова',
    telegramUsername: '@katya.volkova',
    phone: '+79027778899',
    services: ['extension'],
    date: isoDateInDays(3),
    startTime: '16:30',
    status: 'CONFIRMED',
    statusHistory: [
      { status: 'PENDING', changedAt: hoursAgoIso(30) },
      { status: 'CONFIRMED', changedAt: hoursAgoIso(28) },
    ],
    coatingStatus: 'HAS_OLD_COATING',
    desiredLength: 'LONG',
    clientComment: 'Аллергия на некоторые гели, уточню при встрече',
  }),
  buildBooking({
    id: 'req-4',
    clientName: 'Ольга Смирнова',
    telegramUsername: '@olga.smirnova',
    phone: '+79031112233',
    services: ['manicure-no-coating'],
    date: isoDateInDays(1),
    startTime: '10:00',
    status: 'CANCELLED',
    statusHistory: [
      { status: 'PENDING', changedAt: hoursAgoIso(50) },
      { status: 'CONFIRMED', changedAt: hoursAgoIso(48) },
      { status: 'CANCELLED', changedAt: hoursAgoIso(3) },
    ],
  }),
]
