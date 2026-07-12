import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'
import { handleStart } from './handlers/start'
import { handleBookingAction } from './handlers/bookingAction'

dotenv.config()

const botToken = process.env.TELEGRAM_BOT_TOKEN

if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set')
}

export const bot = new Telegraf(botToken)

bot.start(handleStart)
bot.action(/^confirm:(.+)$/, (ctx) => handleBookingAction(ctx, 'CONFIRM', ctx.match[1]))
bot.action(/^cancel:(.+)$/, (ctx) => handleBookingAction(ctx, 'CANCEL', ctx.match[1]))

bot.launch(() => {
  console.log('Telegram bot is running (long polling)')
})

// Telegraf's documented shutdown pattern — without this, Ctrl+C / a process
// manager stop doesn't cleanly close the long-polling connection.
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
