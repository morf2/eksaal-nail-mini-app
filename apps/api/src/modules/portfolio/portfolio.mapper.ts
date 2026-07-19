import type { PortfolioItem as PortfolioItemRow } from '@prisma/client'
import type { PortfolioItem } from '@eksaal/shared'

export function toPortfolioDto(row: PortfolioItemRow): PortfolioItem {
  return {
    id: row.id,
    imageUrl: row.imageUrl,
    title: row.title,
    category: row.category as PortfolioItem['category'],
    description: row.description ?? undefined,
    isHidden: row.isHidden,
    createdAt: row.createdAt,
  }
}
