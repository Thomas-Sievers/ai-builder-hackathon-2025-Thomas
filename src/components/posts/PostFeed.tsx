'use client'

import { useState, useEffect } from 'react'
import { PostCard } from './PostCard'
import { PostCreationForm } from './PostCreationForm'
import { PostEditForm } from './PostEditForm'
import { Button } from '@/components/ui/button'
import { Database } from '@/types/database'
import { getPosts, deletePost, getPostsWithFilters } from '@/lib/database'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Post = Database['public']['Tables']['posts']['Row'] & {
  users: Database['public']['Tables']['users']['Row']
}

interface PostFeedProps {
  currentUserId?: string
  showCreateButton?: boolean
  filters?: {
    type?: 'text' | 'video' | 'image'
    tags?: string[]
  }
  searchQuery?: string
}

export function PostFeed({ currentUserId, showCreateButton = true, filters, searchQuery }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [offset, setOffset] = useState(0)

  const POSTS_PER_PAGE = 10

  const loadPosts = async (reset = false) => {
    try {
      console.log('PostFeed: Loading posts, reset:', reset)
      if (reset) {
        setLoading(true)
        setOffset(0)
      } else {
        setLoadingMore(true)
      }

      const currentOffset = reset ? 0 : offset
      const filterOptions = {
        ...filters,
        search: searchQuery,
        limit: POSTS_PER_PAGE,
        offset: currentOffset,
      }
      
      const newPosts = await getPostsWithFilters(filterOptions)
      console.log('PostFeed: Loaded posts:', newPosts.length)
      console.log('PostFeed: Posts data:', newPosts)
      
      if (reset) {
        setPosts(newPosts)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }

      setHasMore(newPosts.length === POSTS_PER_PAGE)
      setOffset(currentOffset + POSTS_PER_PAGE)
    } catch (error) {
      console.error('Error loading posts:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(false)
    }
  }

  const handlePostCreated = () => {
    setShowCreateForm(false)
    loadPosts(true) // Reload posts from the beginning
  }

  const handlePostEdit = (post: Post) => {
    setEditingPost(post)
  }

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))
    setEditingPost(null)
  }

  const handlePostDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await deletePost(postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
      toast.success('Post deleted successfully!')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const handlePostShare = (post: Post) => {
    // Share functionality is handled in PostCard
    console.log('Share post:', post)
  }

  useEffect(() => {
    loadPosts(true)
  }, [filters, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      {showCreateButton && !showCreateForm && (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Post
          </Button>
        </div>
      )}

      {/* Create Post Form */}
      {showCreateForm && (
        <PostCreationForm
          onPostCreated={handlePostCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Post Form */}
      {editingPost && (
        <PostEditForm
          post={editingPost}
          onPostUpdated={handlePostUpdated}
          onCancel={() => setEditingPost(null)}
        />
      )}

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to share something with the community!</p>
          </div>
          {showCreateButton && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create First Post
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {posts
            .filter(post => !editingPost || post.id !== editingPost.id)
            .map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onEdit={handlePostEdit}
                onDelete={handlePostDelete}
                onShare={handlePostShare}
              />
            ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
