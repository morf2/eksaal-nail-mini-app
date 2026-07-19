import { Router } from 'express'
import { z } from 'zod'
import { portfolioCategorySchema } from '@eksaal/shared'
import { asyncHandler } from '../../lib/asyncHandler'
import { sendError, sendSuccess } from '../../lib/responses'
import { parseImageDataUrl } from '../../lib/parseImageDataUrl'
import { requireAdminSession } from '../auth/requireAdminSession'
import {
  createPortfolioItem,
  deletePortfolioItem,
  listPortfolioItems,
  updatePortfolioItem,
} from './portfolio.service'

export const portfolioRouter = Router()

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ')
}

// Public, same as GET /bookings — the client gallery reads this unauthenticated.
portfolioRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await listPortfolioItems()
    sendSuccess(res, items)
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

    const item = await createPortfolioItem({
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
      imageBuffer: image.buffer,
      imageContentType: image.contentType,
    })
    sendSuccess(res, item, 201)
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

    const item = await updatePortfolioItem(req.params.id, {
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
      isHidden: parsed.data.isHidden,
      imageBuffer: image?.buffer,
      imageContentType: image?.contentType,
    })
    if (!item) {
      sendError(res, 'Portfolio item not found', 404)
      return
    }
    sendSuccess(res, item)
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
