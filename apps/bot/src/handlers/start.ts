import type { Context } from 'telegraf'
import { registerSubscriber } from '../api/registerSubscriber'

export async function handleStart(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id
  if (!chatId) return

  const username = ctx.from?.username ? `@${ctx.from.username}` : null

  try {
    await registerSubscriber({ chatId: String(chatId), username })
    await ctx.reply('Добро пожаловать в EKSAAL NAIL! Вы подписаны на уведомления о записи.')
  } catch (error) {
    console.error('[bot] failed to register subscriber:', error)
    await ctx.reply('Не удалось завершить регистрацию — попробуйте ещё раз чуть позже.')
  }
}
