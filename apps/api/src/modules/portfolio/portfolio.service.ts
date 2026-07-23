import type { PortfolioItem } from '@eksaal/shared'
import { prisma } from '../../lib/prisma'
import { optimizeImage } from '../../lib/image'
import { toPortfolioDto } from './portfolio.mapper'

export async function listPortfolioItems(imageBaseUrl: string): Promise<PortfolioItem[]> {
  const rows = await prisma.portfolioItem.findMany({ orderBy: { createdAt: 'desc' } })
  return rows.map((row) => toPortfolioDto(row, imageBaseUrl))
}

export interface CreatePortfolioItemInput {
  title: string
  category: PortfolioItem['category']
  description?: string
  imageBuffer: Buffer
}

export async function createPortfolioItem(
  input: CreatePortfolioItemInput,
  imageBaseUrl: string,
): Promise<PortfolioItem> {
  const optimized = await optimizeImage(input.imageBuffer)
  const row = await prisma.portfolioItem.create({
    data: {
      imageData: optimized.buffer,
      imageContentType: optimized.contentType,
      title: input.title,
      category: input.category,
      description: input.description,
      isHidden: false,
      createdAt: new Date().toISOString(),
    },
  })
  return toPortfolioDto(row, imageBaseUrl)
}

export interface UpdatePortfolioItemInput {
  title?: string
  category?: PortfolioItem['category']
  description?: string
  isHidden?: boolean
  imageBuffer?: Buffer
}

export async function updatePortfolioItem(
  id: string,
  input: UpdatePortfolioItemInput,
  imageBaseUrl: string,
): Promise<PortfolioItem | null> {
  const existing = await prisma.portfolioItem.findUnique({ where: { id } })
  if (!existing) return null

  let imageData = existing.imageData
  let imageContentType = existing.imageContentType
  if (input.imageBuffer) {
    const optimized = await optimizeImage(input.imageBuffer)
    imageData = optimized.buffer
    imageContentType = optimized.contentType
  }

  const row = await prisma.portfolioItem.update({
    where: { id },
    data: {
      title: input.title,
      category: input.category,
      description: input.description,
      isHidden: input.isHidden,
      imageData,
      imageContentType,
    },
  })
  return toPortfolioDto(row, imageBaseUrl)
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  const existing = await prisma.portfolioItem.findUnique({ where: { id } })
  if (!existing) return false

  await prisma.portfolioItem.delete({ where: { id } })
  return true
}

export interface PortfolioImage {
  data: Buffer
  contentType: string
}

// Backs GET /portfolio/:id/image — kept separate from the DTO path (toPortfolioDto never
// touches imageData) so listing/creating/updating items never pulls image bytes into
// memory unless something actually needs to serve them.
export async function getPortfolioItemImage(id: string): Promise<PortfolioImage | null> {
  const row = await prisma.portfolioItem.findUnique({
    where: { id },
    select: { imageData: true, imageContentType: true },
  })
  if (!row) return null
  return { data: row.imageData, contentType: row.imageContentType }
}
