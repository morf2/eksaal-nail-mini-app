import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { bookingsRouter } from './modules/bookings/bookings.router'
import { authRouter } from './modules/auth/auth.router'
import { telegramRouter } from './modules/telegram/telegram.router'
import { sendError } from './lib/responses'

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/admin', authRouter)
app.use('/bookings', bookingsRouter)
app.use('/telegram', telegramRouter)

app.use((_req, res) => {
  sendError(res, 'Not found', 404)
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  sendError(res, 'Internal server error', 500)
})

const port = process.env.PORT ?? 4000

app.listen(port, () => {
  console.log(`API server listening on port ${port}`)
})
