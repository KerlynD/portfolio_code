import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'

/** Protected by middleware (/admin/*). Uploads a file to Vercel Blob, returns its public URL. */
export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9).toString(36)}.${ext}`
    const blob = await put(key, file, { access: 'public' })
    return NextResponse.json({ url: blob.url })
  } catch (e) {
    console.error('[upload] failed:', e)
    return NextResponse.json(
      { error: 'Upload failed — is BLOB_READ_WRITE_TOKEN set?' },
      { status: 500 }
    )
  }
}
