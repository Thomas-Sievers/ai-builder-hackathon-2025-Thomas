'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Database } from '@/types/database'
import { createComment, getPostComments, updateComment, deleteComment } from '@/lib/database'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Loader2, MoreHorizontal, Edit, Trash2, Send } from 'lucide-react'

type Comment = Database['public']['Tables']['post_comments']['Row'] & {
  users: Database['public']['Tables']['users']['Row']
}

interface CommentsProps {
  postId: string
  currentUserId?: string
  onCommentCountChange?: (count: number) => void
}

export function Comments({ postId, currentUserId, onCommentCountChange }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const loadComments = async () => {
    try {
      setLoading(true)
      console.log('Loading comments for post:', postId)
      const data = await getPostComments(postId)
      console.log('Comments loaded:', data)
      setComments(data || [])
      onCommentCountChange?.(data?.length || 0)
    } catch (error) {
      console.error('Error loading comments:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      // Don't show error toast for comments loading - just log it
      console.log('Comments loading failed, but continuing with empty array')
      setComments([])
      onCommentCountChange?.(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || !currentUserId) return

    try {
      setSubmitting(true)
      const comment = await createComment(postId, currentUserId, newComment.trim())
      setComments(prev => [comment, ...prev])
      setNewComment('')
      onCommentCountChange?.(comments.length + 1)
      toast.success('Comment added!')
    } catch (error) {
      console.error('Error creating comment:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      toast.error('Failed to add comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const updatedComment = await updateComment(commentId, editContent.trim())
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c))
      setEditingComment(null)
      setEditContent('')
      toast.success('Comment updated!')
    } catch (error) {
      console.error('Error updating comment:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      toast.error('Failed to update comment. Please try again.')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      onCommentCountChange?.(comments.length - 1)
      toast.success('Comment deleted!')
    } catch (error) {
      console.error('Error deleting comment:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      toast.error('Failed to delete comment. Please try again.')
    }
  }

  useEffect(() => {
    loadComments()
  }, [postId])

  return (
    <div className="space-y-4">
      {/* Add Comment Form */}
      {currentUserId && (
        <Card className="p-4 bg-gray-800 border-gray-700">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[80px]"
              disabled={submitting}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4 bg-gray-800 border-gray-700">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.users.avatar_url || ''} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {comment.users.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white text-sm">
                      {comment.users.display_name}
                    </h4>
                    {comment.users.is_verified && (
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 text-xs">
                        Verified
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(comment.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingComment(null)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>

                {/* Comment Actions */}
                {currentUserId === comment.user_id && editingComment !== comment.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-600">
                      <DropdownMenuItem 
                        onClick={() => handleEditComment(comment)}
                        className="text-gray-300 hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-400 hover:bg-gray-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
