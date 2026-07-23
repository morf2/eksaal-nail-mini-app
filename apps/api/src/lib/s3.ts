import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

// Talks to any S3-compatible bucket (Cloudflare R2, AWS S3, etc). No ACL is set on
// PutObject — R2 doesn't support per-object ACLs the way AWS S3 does; public read
// access is a bucket-level setting (public bucket URL or custom domain) configured
// outside this code, exposed to the rest of the app via S3_PUBLIC_URL_BASE.
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  },
})

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export function isSupportedImageContentType(contentType: string): boolean {
  return contentType in EXTENSION_BY_CONTENT_TYPE
}

export interface UploadedImage {
  url: string
  key: string
}

// key is stored alongside imageUrl on PortfolioItem so a later replace/delete can
// remove the old object from the bucket instead of leaking orphaned files.
export async function uploadPortfolioImage(buffer: Buffer, contentType: string): Promise<UploadedImage> {
  const bucket = process.env.S3_BUCKET
  const publicUrlBase = process.env.S3_PUBLIC_URL_BASE
  if (!bucket || !publicUrlBase) {
    throw new Error('S3_BUCKET / S3_PUBLIC_URL_BASE is not configured')
  }
  // S3_ENDPOINT/credentials aren't required to construct S3Client (it's built at
  // module load either way), but leaving them unset makes PutObjectCommand fail
  // with an opaque AWS SDK error (e.g. a DNS lookup failure) instead of a message
  // that actually names the missing env var.
  if (!process.env.S3_ENDPOINT || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
    throw new Error('S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY is not configured')
  }

  const extension = EXTENSION_BY_CONTENT_TYPE[contentType]
  if (!extension) {
    throw new Error(`Unsupported image type: ${contentType}`)
  }

  const key = `portfolio/${randomUUID()}.${extension}`

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  )

  return { url: `${publicUrlBase.replace(/\/$/, '')}/${key}`, key }
}

// Best-effort by design — callers (portfolio.service.ts) catch failures themselves so
// a bucket hiccup on delete never fails the DB operation it's cleaning up after.
export async function deletePortfolioImage(key: string): Promise<void> {
  const bucket = process.env.S3_BUCKET
  if (!bucket) return
  await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
