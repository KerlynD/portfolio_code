import PostForm from '@/components/admin/PostForm'

export default function NewPostPage() {
  return (
    <>
      <h1 className="admin-h">
        <span className="slash">/</span> New post
      </h1>
      <p className="admin-sub">Write a post, review, or paper note.</p>
      <PostForm />
    </>
  )
}
