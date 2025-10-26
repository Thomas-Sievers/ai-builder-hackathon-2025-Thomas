'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createPost } from '@/lib/database'
import { toast } from 'sonner'
import { Loader2, X, Plus, Video, FileText, Image } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface PostCreationFormProps {
  onPostCreated?: () => void
  onCancel?: () => void
}

type PostType = 'text' | 'video' | 'image'

export function PostCreationForm({ onPostCreated, onCancel }: PostCreationFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postType, setPostType] = useState<PostType>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('PostCreationForm: User state:', user)
    console.log('PostCreationForm: User ID:', user?.id)
    
    if (!user) {
      console.log('PostCreationForm: No user found')
      toast.error('You must be logged in to create a post')
      return
    }
    
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (postType === 'text' && !content.trim()) {
      console.log('Text post validation failed - no content')
      console.log('Content value:', content)
      console.log('Content trimmed:', content.trim())
      toast.error('Please enter some content')
      return
    }

    if (postType === 'video' && !videoUrl.trim()) {
      toast.error('Please enter a video URL')
      return
    }

    if (postType === 'image' && !imageUrl.trim()) {
      toast.error('Please enter an image URL')
      return
    }

    // Validate image URL format
    if (postType === 'image' && imageUrl.trim()) {
      const imageUrlPattern = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i
      if (!imageUrlPattern.test(imageUrl.trim())) {
        toast.error('Please enter a direct image URL (ending with .jpg, .png, .gif, etc.)')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const postData = {
        title: title.trim(),
        content: postType === 'text' ? content.trim() : null,
        type: postType,
        video_url: postType === 'video' ? videoUrl.trim() : null,
        image_url: postType === 'image' ? imageUrl.trim() : null,
        tags,
        is_public: isPublic,
      }

      console.log('PostCreationForm: Creating post with data:', postData)
      console.log('PostCreationForm: User ID for post creation:', user.id)
      
      const result = await createPost(postData, user.id)
      console.log('PostCreationForm: Post creation result:', result)
      
      toast.success('Post created successfully!')
      
      // Reset form
      setTitle('')
      setContent('')
      setVideoUrl('')
      setImageUrl('')
      setTags([])
      setNewTag('')
      setPostType('text')
      setIsPublic(true)
      
      onPostCreated?.()
      
      // Navigate to posts page if no callback provided
      if (!onPostCreated) {
        router.push('/posts')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          {postType === 'text' && <FileText className="w-5 h-5 text-blue-400" />}
          {postType === 'video' && <Video className="w-5 h-5 text-blue-400" />}
          {postType === 'image' && <Image className="w-5 h-5 text-blue-400" />}
        </div>
        <h2 className="text-xl font-semibold text-white">Create New Post</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="post-type" className="text-gray-300">Post Type</Label>
          <Select value={postType} onValueChange={(value: PostType) => setPostType(value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="text" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Text Post
                </div>
              </SelectItem>
              <SelectItem value="video" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video Post
                </div>
              </SelectItem>
              <SelectItem value="image" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Image Post
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-300">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            required
          />
        </div>

        {/* Content based on post type */}
        {postType === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-300">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, strategies, or updates..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
              required
            />
          </div>
        )}

        {postType === 'video' && (
          <div className="space-y-2">
            <Label htmlFor="video-url" className="text-gray-300">Video URL *</Label>
            <Input
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://twitch.tv/videos/..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              required
            />
            <p className="text-sm text-gray-400">
              Supports YouTube and Twitch video links
            </p>
          </div>
        )}

        {postType === 'image' && (
          <div className="space-y-2">
            <Label htmlFor="image-url" className="text-gray-300">Image URL *</Label>
            <Input
              id="image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>
        )}

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-gray-300">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
            <Button
              type="button"
              onClick={addTag}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-blue-600/20 text-blue-300 border-blue-500/30"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Settings */}
        <div className="space-y-2">
          <Label htmlFor="privacy" className="text-gray-300">Privacy</Label>
          <Select value={isPublic ? 'public' : 'private'} onValueChange={(value) => setIsPublic(value === 'public')}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="public" className="text-white hover:bg-gray-700">
                Public - Everyone can see this post
              </SelectItem>
              <SelectItem value="private" className="text-white hover:bg-gray-700">
                Private - Only you can see this post
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Post'
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
