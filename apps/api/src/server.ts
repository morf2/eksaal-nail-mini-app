import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { bookingsRouter } from './modules/bookings/bookings.router'
import { authRouter } from './modules/auth/auth.router'
import { telegramRouter } from './modules/telegram/telegram.router'
import { portfolioRouter } from './modules/portfolio/portfolio.router'
import { sendError } from './lib/responses'

dotenv.config()

const app = express()

// Render terminates TLS in front of the app and forwards over plain HTTP, setting
// X-Forwarded-Proto — without trust proxy, req.protocol always reads back 'http' even
// in production. portfolio.router.ts relies on req.protocol being correct to build
// the absolute image URL it returns (GET /portfolio/:id/image), so this isn't optional.
app.set('trust proxy', 1)

// Static whitelist for local dev ports + the deployed Netlify frontend, plus
// CORS_ORIGIN from env for any additional/staging domain without a redeploy.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://eksaal-nail.netlify.app',
  ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
]

app.use(cors({ origin: allowedOrigins, credentials: true }))
// Default express.json() limit (100kb) is too small for base64-encoded portfolio
// photos (see MAX_UPLOAD_SIZE_MB) — base64 itself adds ~33% overhead on top of the
// file size, and phone camera photos routinely land in the 5-10MB range before this
// API's own server-side optimization (see lib/image.ts) ever gets a chance to shrink
// them, so the ceiling here has to cover the raw upload, not the optimized result.
app.use(express.json({ limit: '15mb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/admin', authRouter)
app.use('/bookings', bookingsRouter)
app.use('/telegram', telegramRouter)
app.use('/portfolio', portfolioRouter)

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
