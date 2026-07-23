import { isSupportedImageContentType } from './image'

const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/

export interface ParsedImage {
  buffer: Buffer
  contentType: string
}

// Frontend sends the picked file as a data URL (FileReader.readAsDataURL) rather than
// multipart/form-data — decoded here into bytes + contentType before handing off to
// lib/image.ts's optimizeImage(). Throws on anything that isn't a supported image or
// exceeds MAX_UPLOAD_SIZE_MB, so route handlers can just catch and 400.
export function parseImageDataUrl(dataUrl: string): ParsedImage {
  const match = DATA_URL_PATTERN.exec(dataUrl)
  if (!match) {
    throw new Error('imageBase64 must be a data:<mime>;base64,<data> URL')
  }

  const [, contentType, base64] = match
  if (!isSupportedImageContentType(contentType)) {
    throw new Error(`Unsupported image type: ${contentType}`)
  }

  const buffer = Buffer.from(base64, 'base64')
  // This bounds the *raw* upload before optimizeImage ever runs, not the stored size —
  // the actual DB footprint is whatever optimizeImage produces (capped at 1200px
  // wide/WebP q80, typically tens to a few hundred KB regardless of input size). 15MB
  // comfortably covers an unedited phone camera photo without rejecting it before it
  // gets a chance to be shrunk.
  const maxSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? '15')
  if (buffer.length > maxSizeMb * 1024 * 1024) {
    throw new Error(`Image exceeds ${maxSizeMb}MB limit`)
  }

  return { buffer, contentType }
}
