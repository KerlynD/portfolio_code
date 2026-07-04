import { notFound } from 'next/navigation'
import PostForm from '@/components/admin/PostForm'
import { getPostById } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPostById(Number(id))
  if (!post) notFound()

  return (
    <>
      <h1 className="admin-h">
        <span className="slash">/</span> Edit post
      </h1>
      <p className="admin-sub">{post.title}</p>
      <PostForm post={post} />
    </>
  )
}
