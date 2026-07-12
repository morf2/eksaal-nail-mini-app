import type { Booking } from '@eksaal/shared'
import { prisma } from '../../lib/prisma'
import { sendTelegramMessage } from '../telegram/telegram.service'
import type { InlineKeyboardButton } from '../telegram/telegram.service'

function formatNewBookingMessage(booking: Booking): string {
  const servicesList = booking.services.map((service) => service.name).join(', ')
  const comment =
    booking.clientComment && booking.clientComment.trim().length > 0
      ? booking.clientComment
      : 'Без комментария'

  const lines = [
    '💅 EKSAAL NAIL — новая запись',
    '',
    '👤 Клиент:',
    booking.clientName ?? 'Не указано',
    '',
    '📱 Телефон:',
    booking.phone,
  ]

  if (booking.telegramUsername) {
    lines.push('', 'Telegram:', booking.telegramUsername)
  }

  lines.push(
    '',
    '💎 Услуги:',
    servicesList,
    '',
    '📅 Дата:',
    booking.date,
    '',
    '⏰ Время:',
    booking.startTime,
    '',
    '💬 Комментарий:',
    comment,
  )

  return lines.join('\n')
}

// Callback data is just "confirm:<bookingId>" / "cancel:<bookingId>" — a cuid
// (~25 chars) plus the prefix comfortably fits Telegram's 64-byte callback_data
// limit. Parsed back out in apps/bot/src/handlers/bookingAction.ts.
function buildBookingActionKeyboard(bookingId: string): InlineKeyboardButton[][] {
  return [
    [
      { text: '✅ Подтвердить', callback_data: `confirm:${bookingId}` },
      { text: '❌ Отменить', callback_data: `cancel:${bookingId}` },
    ],
  ]
}

// Fire-and-forget by design — see call site in bookings.service.ts. Every failure
// mode here (no MASTER registered, Telegram API error for one/all of them) is
// caught internally so this can never affect booking creation itself.
export async function notifyNewBooking(booking: Booking): Promise<void> {
  const masters = await prisma.botSubscriber.findMany({ where: { role: 'MASTER' } })

  if (masters.length === 0) {
    console.warn('[notifications] NEW_BOOKING: no MASTER subscribers registered, skipping')
    return
  }

  const text = formatNewBookingMessage(booking)
  const keyboard = buildBookingActionKeyboard(booking.id)

  await Promise.all(
    masters.map((master) =>
      sendTelegramMessage(master.chatId, text, keyboard).catch((error) => {
        console.error(`[notifications] failed to notify master chatId=${master.chatId}:`, error)
      }),
    ),
  )
}

// Both called from the single place status actually changes — updateBookingStatus()
// in bookings.service.ts — so it doesn't matter whether the change came from the
// admin panel (PATCH /bookings/:id/status) or a Telegram button: the client is
// notified exactly the same way either time, no duplicated logic.
export async function notifyBookingConfirmed(booking: Booking): Promise<void> {
  if (!booking.telegramId) {
    console.warn(`[notifications] booking ${booking.id} has no telegramId, skipping client notify`)
    return
  }
  await sendTelegramMessage(booking.telegramId, 'Ваша запись подтверждена').catch((error) => {
    console.error(`[notifications] failed to notify client chatId=${booking.telegramId}:`, error)
  })
}

export async function notifyBookingCancelled(booking: Booking): Promise<void> {
  if (!booking.telegramId) {
    console.warn(`[notifications] booking ${booking.id} has no telegramId, skipping client notify`)
    return
  }
  await sendTelegramMessage(booking.telegramId, 'К сожалению, запись отменена').catch((error) => {
    console.error(`[notifications] failed to notify client chatId=${booking.telegramId}:`, error)
  })
}
