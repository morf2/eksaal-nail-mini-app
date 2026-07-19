import type { PortfolioItem } from '@eksaal/shared'
import { prisma } from '../../lib/prisma'
import { deletePortfolioImage, uploadPortfolioImage } from '../../lib/s3'
import { toPortfolioDto } from './portfolio.mapper'

export async function listPortfolioItems(): Promise<PortfolioItem[]> {
  const rows = await prisma.portfolioItem.findMany({ orderBy: { createdAt: 'desc' } })
  return rows.map(toPortfolioDto)
}

export interface CreatePortfolioItemInput {
  title: string
  category: PortfolioItem['category']
  description?: string
  imageBuffer: Buffer
  imageContentType: string
}

export async function createPortfolioItem(input: CreatePortfolioItemInput): Promise<PortfolioItem> {
  const { url, key } = await uploadPortfolioImage(input.imageBuffer, input.imageContentType)
  const row = await prisma.portfolioItem.create({
    data: {
      imageUrl: url,
      imageKey: key,
      title: input.title,
      category: input.category,
      description: input.description,
      isHidden: false,
      createdAt: new Date().toISOString(),
    },
  })
  return toPortfolioDto(row)
}

export interface UpdatePortfolioItemInput {
  title?: string
  category?: PortfolioItem['category']
  description?: string
  isHidden?: boolean
  imageBuffer?: Buffer
  imageContentType?: string
}

export async function updatePortfolioItem(
  id: string,
  input: UpdatePortfolioItemInput,
): Promise<PortfolioItem | null> {
  const existing = await prisma.portfolioItem.findUnique({ where: { id } })
  if (!existing) return null

  let imageUrl = existing.imageUrl
  let imageKey = existing.imageKey
  if (input.imageBuffer && input.imageContentType) {
    const uploaded = await uploadPortfolioImage(input.imageBuffer, input.imageContentType)
    imageUrl = uploaded.url
    imageKey = uploaded.key

    // Best-effort cleanup of the object being replaced — must not fail the update.
    deletePortfolioImage(existing.imageKey).catch((error) => {
      console.error('[portfolio] failed to delete replaced image:', error)
    })
  }

  const row = await prisma.portfolioItem.update({
    where: { id },
    data: {
      title: input.title,
      category: input.category,
      description: input.description,
      isHidden: input.isHidden,
      imageUrl,
      imageKey,
    },
  })
  return toPortfolioDto(row)
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  const existing = await prisma.portfolioItem.findUnique({ where: { id } })
  if (!existing) return false

  await prisma.portfolioItem.delete({ where: { id } })

  // Best-effort — the DB row is already gone either way, this just avoids leaking
  // orphaned objects in the bucket.
  deletePortfolioImage(existing.imageKey).catch((error) => {
    console.error('[portfolio] failed to delete image from bucket:', error)
  })
  return true
}
