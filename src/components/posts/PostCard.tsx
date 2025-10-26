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
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { likePost, unlikePost, isPostLiked } from '@/lib/database'
import { Comments } from './Comments'

type Post = Database['public']['Tables']['posts']['Row'] & {
  users: Database['public']['Tables']['users']['Row']
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
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const isOwner = currentUserId === post.user_id
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

  return (
    <Card className="bg-gray-800 border-gray-700 p-4 hover:border-gray-600 transition-colors mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.users.avatar_url || ''} />
            <AvatarFallback className="bg-cyan-400 text-gray-900">
              {post.users.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{post.users.display_name}</h3>
              {post.users.is_verified && (
                <Badge variant="secondary" className="bg-cyan-400/20 text-cyan-300 text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400">
              @{post.users.username} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
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
        <h2 className="text-base font-semibold text-white mb-2">{post.title}</h2>
        
        {post.type === 'text' && post.content && (
          <div className="text-gray-300 whitespace-pre-wrap">
            {displayContent}
            {contentPreview && (
              <Button
                variant="link"
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-cyan-400 p-0 h-auto font-normal"
              >
                {showFullContent ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>
        )}

        {post.type === 'video' && post.video_url && (
          <div className="mt-4">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={getVideoEmbedUrl(post.video_url)}
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
              Video URL: {post.video_url}
            </p>
          </div>
        )}

        {post.type === 'image' && post.image_url && (
          <div className="mt-4">
            <img
              src={post.image_url}
              alt={post.title}
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
              Image URL: {post.image_url}
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