'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Database } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Copy, Check, Repeat } from 'lucide-react'
import { likePost, unlikePost, isPostLiked, repostPost } from '@/lib/database'
import { Comments } from './Comments'
import { Textarea } from '@/components/ui/textarea'

type Post = Database['public']['Tables']['posts']['Row'] & {
  users: Database['public']['Tables']['users']['Row']
  original_post?: {
    users: Database['public']['Tables']['users']['Row']
  } & Database['public']['Tables']['posts']['Row']
}

interface PostCardProps {
  post: Post
  currentUserId?: string
  onEdit?: (post: Post) => void
  onDelete?: (postId: string) => void
  onShare?: (post: Post) => void
}

export function PostCard({ 
  post, 
  currentUserId, 
  onEdit, 
  onDelete, 
  onShare 
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [commentsCount, setCommentsCount] = useState(post.comments_count)
  const [showComments, setShowComments] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showRepostDialog, setShowRepostDialog] = useState(false)
  const [repostComment, setRepostComment] = useState('')
  const [isReposting, setIsReposting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const isOwner = !!currentUserId && currentUserId === post.user_id
  
  const contentPreview = post.content && post.content.length > 200
  const displayContent = contentPreview && !showFullContent 
    ? post.content!.substring(0, 200) + '...' 
    : post.content

  // Check if post is liked by current user
  useEffect(() => {
    if (currentUserId) {
      isPostLiked(post.id, currentUserId).then(setIsLiked).catch(console.error)
    }
  }, [post.id, currentUserId])

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to like posts')
      return
    }

    try {
      setLoading(true)
      if (isLiked) {
        await unlikePost(post.id, currentUserId)
        setIsLiked(false)
        setLikesCount(prev => Math.max(prev - 1, 0))
      } else {
        await likePost(post.id, currentUserId)
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like')
    } finally {
      setLoading(false)
    }
  }

  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/posts/${post.id}` : ''

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content || '',
        url: postUrl,
      }).catch(() => {
        // If share fails, open the dialog instead
        setShowShareDialog(true)
      })
    } else {
      setShowShareDialog(true)
    }
    onShare?.(post)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy link')
    }
  }

  const handleRepost = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to repost')
      return
    }

    try {
      setIsReposting(true)
      await repostPost(post.id, currentUserId, repostComment.trim() || undefined)
      setShowRepostDialog(false)
      setRepostComment('')
      toast.success('Post reposted successfully!')
    } catch (error) {
      console.error('Error reposting:', error)
      toast.error('Failed to repost')
    } finally {
      setIsReposting(false)
    }
  }

  const getVideoEmbedUrl = (url: string) => {
    try {
      // YouTube
      if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
        const videoId = url.includes('youtu.be/') 
          ? url.split('youtu.be/')[1].split('?')[0]
          : url.split('v=')[1].split('&')[0]
        return `https://www.youtube.com/embed/${videoId}`
      }
      
      // Twitch
      if (url.includes('twitch.tv/videos/')) {
        const videoId = url.split('twitch.tv/videos/')[1].split('?')[0]
        return `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}`
      }
      
      // For other video URLs, return as-is
      return url
    } catch (error) {
      console.error('Error parsing video URL:', error)
      return url
    }
  }

  const isRepost = post.is_repost && !!post.original_post
  const displayPost = isRepost ? post.original_post! : post

  return (
    <Card className="bg-gray-800 border-gray-700 p-4 hover:border-gray-600 transition-colors mb-4">
      {/* Repost indicator */}
      {isRepost && (
        <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm">
          <Repeat className="w-4 h-4" />
          <span>{post.users.display_name} reposted</span>
          {post.repost_comment && (
            <div className="mt-2 p-2 bg-gray-700 rounded text-gray-200">{post.repost_comment}</div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={(isRepost && post.original_post?.users ? post.original_post.users : post.users).avatar_url || ''} />
            <AvatarFallback className="bg-cyan-400 text-gray-900">
              {(isRepost && post.original_post?.users ? post.original_post.users : post.users).display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{(isRepost && post.original_post?.users ? post.original_post.users : post.users).display_name}</h3>
              {(isRepost && post.original_post?.users ? post.original_post.users : post.users).is_verified && (
                <Badge variant="secondary" className="bg-cyan-400/20 text-cyan-300 text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400">
              @{(isRepost && post.original_post?.users ? post.original_post.users : post.users).username} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-700 border-gray-600">
              <DropdownMenuItem 
                onClick={() => onEdit?.(post)}
                className="text-gray-300 hover:bg-gray-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(post.id)}
                className="text-red-400 hover:bg-gray-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <h2 className="text-base font-semibold text-white mb-2">{displayPost.title}</h2>
        
        {displayPost.type === 'text' && displayPost.content && (
          <div className="text-gray-300 whitespace-pre-wrap">
            {displayPost.content}
          </div>
        )}

        {displayPost.type === 'video' && displayPost.video_url && (
          <div className="mt-4">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={getVideoEmbedUrl(displayPost.video_url)}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={(e) => {
                  console.error('Video iframe failed to load:', e)
                  toast.error('Failed to load video. Please check the URL.')
                }}
                onLoad={() => {
                  console.log('Video loaded successfully')
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Video URL: {displayPost.video_url}
            </p>
          </div>
        )}

        {displayPost.type === 'image' && displayPost.image_url && (
          <div className="mt-4">
            <img
              src={displayPost.image_url}
              alt={displayPost.title}
              className="w-full max-w-md rounded-lg"
              onError={(e) => {
                console.error('Image failed to load:', e)
                toast.error('Failed to load image. Please check the URL.')
              }}
              onLoad={() => {
                console.log('Image loaded successfully')
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Image URL: {displayPost.image_url}
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-cyan-400/20 text-cyan-300 border-cyan-400/30"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Privacy Indicator */}
      {!post.is_public && (
        <div className="flex items-center gap-1 mb-4 text-sm text-gray-400">
          <EyeOff className="w-4 h-4" />
          Private post
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-700">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors ${
            isLiked ? 'text-red-400 hover:text-red-300' : ''
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-white">{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-white">{commentsCount}</span>
        </button>

        <button
          onClick={() => setShowRepostDialog(true)}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Repeat className="w-5 h-5" />
          <span className="text-white">Repost</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-white">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <Comments 
            postId={post.id} 
            currentUserId={currentUserId}
            onCommentCountChange={(count) => {
              setCommentsCount(count)
            }}
          />
        </div>
      )}

      {/* Repost Dialog */}
      <Dialog open={showRepostDialog} onOpenChange={setShowRepostDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Repost</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share this post with your followers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Post Preview */}
            <div className="bg-gray-700 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={post.users.avatar_url || ''} />
                  <AvatarFallback className="bg-cyan-400 text-gray-900 text-xs">
                    {post.users.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-white">{post.users.display_name}</span>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">{post.title}</p>
            </div>

            {/* Optional Comment */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Add a comment (optional)</label>
              <Textarea
                value={repostComment}
                onChange={(e) => setRepostComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[100px]"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRepostDialog(false)
                  setRepostComment('')
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRepost}
                disabled={isReposting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isReposting ? 'Reposting...' : 'Repost'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Share Post</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share this post with others
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Post Link</label>
              <div className="flex gap-2">
                <Input
                  value={postUrl}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button
                  onClick={handleCopyLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={post.users.avatar_url || ''} />
                  <AvatarFallback className="bg-cyan-400 text-gray-900 text-xs">
                    {post.users.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-white">{post.users.display_name}</span>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">{post.title}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}