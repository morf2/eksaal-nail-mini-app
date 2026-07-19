import { isSupportedImageContentType } from './s3'

const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/

export interface ParsedImage {
  buffer: Buffer
  contentType: string
}

// Frontend sends the picked file as a data URL (FileReader.readAsDataURL) rather than
// multipart/form-data — decoded here into bytes + contentType before handing off to
// the S3 upload. Throws on anything that isn't a supported image or exceeds
// MAX_UPLOAD_SIZE_MB, so route handlers can just catch and 400.
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
  const maxSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? '5')
  if (buffer.length > maxSizeMb * 1024 * 1024) {
    throw new Error(`Image exceeds ${maxSizeMb}MB limit`)
  }

  return { buffer, contentType }
}
