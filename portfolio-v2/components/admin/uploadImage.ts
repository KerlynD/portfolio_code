/** Uploads an image to Vercel Blob via the admin route. Returns its URL, or null after alerting. */
export async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await fetch('/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data.url as string
  } catch (e) {
    alert(String(e))
    return null
  }
}

/** First image file in a paste / drop, if any. */
export function imageFrom(list: DataTransfer | null): File | null {
  if (!list) return null
  return Array.from(list.files).find((f) => f.type.startsWith('image/')) ?? null
}
