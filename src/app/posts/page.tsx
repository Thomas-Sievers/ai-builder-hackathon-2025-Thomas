'use client'

import { useAuth } from '@/contexts/AuthContext'
import { PostFeedWithFilters } from '@/components/posts/PostFeedWithFilters'
import { Loader2 } from 'lucide-react'

export default function PostsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Home</h1>
            <p className="text-gray-400">
              Share your gameplay highlights, strategies, and connect with the esports community
            </p>
          </div>

          <PostFeedWithFilters 
            currentUserId={user?.id}
            showCreateButton={!!user}
          />
        </div>
      </div>
    </div>
  )
}