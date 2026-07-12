import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../lib/asyncHandler'
import { sendError, sendSuccess } from '../../lib/responses'
import { createSession, destroySession, isSessionValid, verifyAdminCredentials } from './auth.service'
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from './cookie'

export const authRouter = Router()

const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
})

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      sendError(res, 'Введите логин и пароль', 400)
      return
    }

    const isValid = await verifyAdminCredentials(parsed.data.login, parsed.data.password)
    if (!isValid) {
      sendError(res, 'Неверный логин или пароль', 401)
      return
    }

    const sessionId = createSession()
    res.cookie(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS)
    sendSuccess(res, { authenticated: true })
  }),
)

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const sessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined
    destroySession(sessionId)
    res.clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS)
    sendSuccess(res, null)
  }),
)

authRouter.get(
  '/session',
  asyncHandler(async (req, res) => {
    const sessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined
    sendSuccess(res, { authenticated: isSessionValid(sessionId) })
  }),
)
