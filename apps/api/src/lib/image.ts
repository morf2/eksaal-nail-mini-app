import sharp from 'sharp'

const SUPPORTED_INPUT_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function isSupportedImageContentType(contentType: string): boolean {
  return SUPPORTED_INPUT_CONTENT_TYPES.has(contentType)
}

export interface OptimizedImage {
  buffer: Buffer
  contentType: string
}

const MAX_WIDTH_PX = 1200
const WEBP_QUALITY = 80

// Portfolio photos are stored as bytes directly on PortfolioItem.imageData (no S3/R2 —
// see prisma/schema.prisma) — every upload is re-encoded here to keep rows small: resized
// to at most MAX_WIDTH_PX wide (never upscaled — a source image already narrower than this
// is left alone) and re-encoded as WebP, which beats JPEG at equivalent visual quality.
// Both matter directly against Render Postgres' 1GB storage cap.
export async function optimizeImage(buffer: Buffer): Promise<OptimizedImage> {
  const optimized = await sharp(buffer)
    .rotate() // bake in EXIF orientation before resizing — phone photos are often
    // stored "sideways" with an orientation tag; resizing before this would resize
    // against the wrong axis and the tag is dropped on re-encode either way.
    .resize({ width: MAX_WIDTH_PX, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  return { buffer: optimized, contentType: 'image/webp' }
}
