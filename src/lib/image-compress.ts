const MAX_DIMENSION = 2400
const JPEG_QUALITY = 0.82
const MAX_SOURCE_BYTES = 400 * 1024

export async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_SOURCE_BYTES) return file
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) return file

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    try {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
      const width = Math.max(1, Math.round(bitmap.width * scale))
      const height = Math.max(1, Math.round(bitmap.height * scale))
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) return file
      ctx.drawImage(bitmap, 0, 0, width, height)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY))
      if (!blob || blob.size >= file.size) return file
      const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
      return new File([blob], name, { type: "image/jpeg" })
    } finally {
      bitmap.close()
    }
  } catch {
    return file
  }
}
