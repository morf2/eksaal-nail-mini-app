// Mock "upload" — turns a picked file into a base64 data URL so it survives a page
// reload via localStorage without a backend. This is NOT how production should work:
// once the backend/S3 exist, this should become a real multipart upload returning a
// hosted URL (see project plan, admin portfolio section) — imageUrl stays a plain
// string either way, so swapping this out later doesn't touch the rest of the app.
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB — keeps localStorage usage sane

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
