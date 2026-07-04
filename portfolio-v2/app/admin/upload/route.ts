import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'

/** Protected by middleware (/admin/*). Uploads a file to Vercel Blob, returns its public URL. */
export async function POST(req: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not set on this deployment (add it, then redeploy).' },
      { status: 500 }
    )
  }

  let file: File
  try {
    const form = await req.formData()
    const f = form.get('file')
    if (!(f instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    file = f
  } catch (e) {
    return NextResponse.json(
      { error: `Could not read upload (Vercel limits server uploads to ~4.5MB). ${String(e)}` },
      { status: 400 }
    )
  }

  try {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9).toString(36)}.${ext}`
    const blob = await put(key, file, { access: 'public', token })
    return NextResponse.json({ url: blob.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[upload] blob put failed:', e)
    return NextResponse.json({ error: `Blob upload failed: ${message}` }, { status: 500 })
  }
}
