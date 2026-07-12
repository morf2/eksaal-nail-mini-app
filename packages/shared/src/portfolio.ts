import { z } from 'zod'
import { serviceCategorySchema } from './category'

// Mirrors the planned PortfolioItem DB model, extended with title/category (the
// original plan only had image_url/description/is_active/sort_order/created_at).
export const portfolioCategorySchema = serviceCategorySchema
export type PortfolioCategory = z.infer<typeof portfolioCategorySchema>

export const portfolioItemSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  title: z.string().min(1),
  category: portfolioCategorySchema,
  description: z.string().optional(),
  // "Скрытие" — soft-hidden from the client gallery without deleting (renamed from the
  // original plan's is_active for clarity: true here means hidden, not active).
  isHidden: z.boolean(),
  createdAt: z.string(),
})
export type PortfolioItem = z.infer<typeof portfolioItemSchema>
