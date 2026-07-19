// Turns a picked file into a base64 data URL, which is what gets sent as
// `imageBase64` to POST/PATCH /portfolio — the API decodes it and uploads the bytes
// to the S3-compatible bucket (see apps/api/src/lib/parseImageDataUrl.ts), storing
// only the resulting bucket URL. Keep this ceiling comfortably under the API's
// MAX_UPLOAD_SIZE_MB so oversized files get a clear client-side error instead of a
// 400 from the server after the whole file has already been read.
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

export function fileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('Файл должен быть изображением'))
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return Promise.reject(new Error('Файл слишком большой (максимум 2MB)'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsDataURL(file)
  })
}
