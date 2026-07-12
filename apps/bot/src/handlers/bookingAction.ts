import type { Context } from 'telegraf'
import type { BookingAction } from '../api/bookingActions'
import { updateBookingStatusViaTelegram } from '../api/bookingActions'

const ACTION_LABEL: Record<BookingAction, string> = {
  CONFIRM: '✅ Подтверждено',
  CANCEL: '❌ Отменено',
}

// Shared by both confirm:* and cancel:* callback_data handlers registered in
// bot.ts. Removes the inline keyboard after the first successful tap (by
// rewriting the message without reply_markup) — without this a second tap (or a
// network race between two taps) would call updateBookingStatusViaTelegram again
// and duplicate the client's confirmation/cancellation message.
export async function handleBookingAction(
  ctx: Context,
  action: BookingAction,
  bookingId: string,
): Promise<void> {
  const chatId = ctx.from?.id
  if (!chatId) return

  const label = ACTION_LABEL[action]

  try {
    await updateBookingStatusViaTelegram(bookingId, action, String(chatId))
    await ctx.answerCbQuery(label)

    const message = ctx.callbackQuery && 'message' in ctx.callbackQuery ? ctx.callbackQuery.message : undefined
    const originalText = message && 'text' in message ? message.text : ''
    await ctx.editMessageText(originalText ? `${originalText}\n\n${label}` : label)
  } catch (error) {
    console.error('[bot] booking action failed:', error)
    await ctx.answerCbQuery('Не удалось выполнить действие', { show_alert: true }).catch(() => {})
  }
}
