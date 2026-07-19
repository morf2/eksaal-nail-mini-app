import type { Context } from 'telegraf'
import { registerSubscriber } from '../api/registerSubscriber'

export async function handleStart(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id
  if (!chatId) return

  const username = ctx.from?.username ? `@${ctx.from.username}` : null

  // MASTER_TELEGRAM_CHAT_ID is the one chat that should receive new-booking
  // notifications — nothing else ever assigns the MASTER role. Re-checked on every
  // /start (not just first registration) so setting the env var after the master
  // already ran /start once still promotes them on their next /start.
  const masterChatId = process.env.MASTER_TELEGRAM_CHAT_ID
  const role: 'CLIENT' | 'MASTER' = masterChatId && String(chatId) === masterChatId ? 'MASTER' : 'CLIENT'

  try {
    await registerSubscriber({ chatId: String(chatId), username, role })
    await ctx.reply('Добро пожаловать в EKSAAL NAIL! Вы подписаны на уведомления о записи.')
  } catch (error) {
    console.error('[bot] failed to register subscriber:', error)
    await ctx.reply('Не удалось завершить регистрацию — попробуйте ещё раз чуть позже.')
  }
}
