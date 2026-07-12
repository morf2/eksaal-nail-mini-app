import { prisma } from '../../lib/prisma'

export interface BotSubscriberInput {
  chatId: string
  username?: string | null
  role?: string
}

// Upsert by chatId — a user hitting /start again (bot restarted, they blocked and
// unblocked, etc.) updates the existing row instead of creating duplicates.
export async function registerSubscriber(input: BotSubscriberInput) {
  const createdAt = new Date().toISOString()
  return prisma.botSubscriber.upsert({
    where: { chatId: input.chatId },
    update: {
      username: input.username ?? null,
      role: input.role ?? 'CLIENT',
    },
    create: {
      chatId: input.chatId,
      username: input.username ?? null,
      role: input.role ?? 'CLIENT',
      createdAt,
    },
  })
}

export interface InlineKeyboardButton {
  text: string
  callback_data: string
}

// Talks to the Telegram Bot API directly — no Telegraf dependency needed here for
// a single sendMessage call. Bots can only message chatIds that have already
// started a conversation with them (i.e. sent /start) — Telegram itself enforces
// this and returns an error otherwise.
export async function sendTelegramMessage(
  chatId: string,
  text: string,
  inlineKeyboard?: InlineKeyboardButton[][],
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured')
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(inlineKeyboard ? { reply_markup: { inline_keyboard: inlineKeyboard } } : {}),
    }),
  })

  const body = (await response.json()) as { ok: boolean; description?: string }
  if (!body.ok) {
    throw new Error(body.description ?? 'Telegram API request failed')
  }
}

// Guards POST /telegram/booking-action — only a chatId registered as MASTER may
// confirm/cancel a booking from Telegram. Without this, anyone who learns a
// bookingId (visible to the client themselves) could hit that endpoint directly.
export async function isMasterChatId(chatId: string): Promise<boolean> {
  const subscriber = await prisma.botSubscriber.findUnique({ where: { chatId } })
  return subscriber?.role === 'MASTER'
}
