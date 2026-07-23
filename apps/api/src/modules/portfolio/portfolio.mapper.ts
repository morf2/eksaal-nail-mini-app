import type { PortfolioItem as PortfolioItemRow } from '@prisma/client'
import type { PortfolioItem } from '@eksaal/shared'

// Images are stored as bytes directly on the row (see prisma/schema.prisma) and served
// back through GET /portfolio/:id/image — imageUrl on the DTO is that route's absolute
// URL, built from the request's own origin (see portfolio.router.ts) so it resolves
// correctly in both dev and prod without a separate "public API URL" env var.
export function toPortfolioDto(row: PortfolioItemRow, imageBaseUrl: string): PortfolioItem {
  return {
    id: row.id,
    imageUrl: `${imageBaseUrl}/portfolio/${row.id}/image`,
    title: row.title,
    category: row.category as PortfolioItem['category'],
    description: row.description ?? undefined,
    isHidden: row.isHidden,
    createdAt: row.createdAt,
  }
}
