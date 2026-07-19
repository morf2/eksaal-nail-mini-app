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
// file size, so this ceiling is intentionally higher than the actual upload cap
// enforced in parseImageDataUrl.ts.
app.use(express.json({ limit: '10mb' }))
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
