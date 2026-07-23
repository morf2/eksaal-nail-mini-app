import { Router } from 'express'
import type { Request } from 'express'
import { z } from 'zod'
import { portfolioCategorySchema } from '@eksaal/shared'
import { asyncHandler } from '../../lib/asyncHandler'
import { sendError, sendSuccess } from '../../lib/responses'
import { parseImageDataUrl } from '../../lib/parseImageDataUrl'
import { requireAdminSession } from '../auth/requireAdminSession'
import {
  createPortfolioItem,
  deletePortfolioItem,
  getPortfolioItemImage,
  listPortfolioItems,
  updatePortfolioItem,
} from './portfolio.service'

export const portfolioRouter = Router()

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ')
}

// Images are served from this same API (GET /portfolio/:id/image, see below), so the
// DTO's imageUrl needs this API's own public origin. Building it from the request
// itself (rather than a hardcoded/env-configured URL) means it's correct in both dev
// and prod automatically. req.protocol only reflects the real scheme (https on Render,
// which terminates TLS in front of the app) because server.ts sets `trust proxy`.
function getImageBaseUrl(req: Request): string {
  return `${req.protocol}://${req.get('host')}`
}

// Public, same as GET /bookings — the client gallery reads this unauthenticated.
portfolioRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await listPortfolioItems(getImageBaseUrl(req))
    sendSuccess(res, items)
  }),
)

// Public — referenced directly as <img src> from the admin panel, the site, and the
// Mini App, all of which load it as a plain cross-origin image request (not fetch/XHR),
// so it never goes through the credentialed-cookie / CORS path the JSON routes do.
portfolioRouter.get(
  '/:id/image',
  asyncHandler(async (req, res) => {
    const image = await getPortfolioItemImage(req.params.id)
    if (!image) {
      sendError(res, 'Portfolio item not found', 404)
      return
    }
    res.set('Content-Type', image.contentType)
    res.set('Cache-Control', 'public, max-age=300')
    res.send(image.data)
  }),
)

const createSchema = z.object({
  title: z.string().min(1),
  category: portfolioCategorySchema,
  description: z.string().optional(),
  // Data URL from the frontend's FileReader.readAsDataURL — see parseImageDataUrl.
  imageBase64: z.string().min(1),
})

portfolioRouter.post(
  '/',
  requireAdminSession,
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
      sendError(res, formatZodError(parsed.error))
      return
    }

    let image: ReturnType<typeof parseImageDataUrl>
    try {
      image = parseImageDataUrl(parsed.data.imageBase64)
    } catch (error) {
      sendError(res, error instanceof Error ? error.message : 'Invalid image')
      return
    }

    // Failures past this point are in image optimization (sharp) or the Prisma write
    // itself — surfacing the real message here (mirrors telegram.router.ts's
    // /send-test pattern) means a real failure shows up directly in the admin's
    // Network tab instead of only as a generic 500 with the cause visible solely in
    // Render's server logs.
    try {
      const item = await createPortfolioItem(
        {
          title: parsed.data.title,
          category: parsed.data.category,
          description: parsed.data.description,
          imageBuffer: image.buffer,
        },
        getImageBaseUrl(req),
      )
      sendSuccess(res, item, 201)
    } catch (error) {
      console.error('[portfolio] failed to create item:', error)
      sendError(res, error instanceof Error ? error.message : 'Failed to save portfolio item', 502)
    }
  }),
)

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  category: portfolioCategorySchema.optional(),
  description: z.string().optional(),
  isHidden: z.boolean().optional(),
  imageBase64: z.string().min(1).optional(),
})

portfolioRouter.patch(
  '/:id',
  requireAdminSession,
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) {
      sendError(res, formatZodError(parsed.error))
      return
    }

    let image: ReturnType<typeof parseImageDataUrl> | undefined
    if (parsed.data.imageBase64) {
      try {
        image = parseImageDataUrl(parsed.data.imageBase64)
      } catch (error) {
        sendError(res, error instanceof Error ? error.message : 'Invalid image')
        return
      }
    }

    try {
      const item = await updatePortfolioItem(
        req.params.id,
        {
          title: parsed.data.title,
          category: parsed.data.category,
          description: parsed.data.description,
          isHidden: parsed.data.isHidden,
          imageBuffer: image?.buffer,
        },
        getImageBaseUrl(req),
      )
      if (!item) {
        sendError(res, 'Portfolio item not found', 404)
        return
      }
      sendSuccess(res, item)
    } catch (error) {
      console.error('[portfolio] failed to update item:', error)
      sendError(res, error instanceof Error ? error.message : 'Failed to update portfolio item', 502)
    }
  }),
)

portfolioRouter.delete(
  '/:id',
  requireAdminSession,
  asyncHandler(async (req, res) => {
    const deleted = await deletePortfolioItem(req.params.id)
    if (!deleted) {
      sendError(res, 'Portfolio item not found', 404)
      return
    }
    sendSuccess(res, null)
  }),
)
