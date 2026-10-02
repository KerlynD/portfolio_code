'use client'

import type { Post } from '@/lib/db/schema'
import PostForm from '@/components/admin/PostForm'
import Modal from './Modal'
import { useEdit } from './EditProvider'

/** Centered modal wrapping the existing markdown PostForm. */
export default function PostEditorModal({ post }: { post?: Post }) {
  const { closeModal } = useEdit()
  return (
    <Modal title={post ? 'Edit post' : 'New post'} wide>
      <PostForm post={post} onDone={closeModal} />
    </Modal>
  )
}
