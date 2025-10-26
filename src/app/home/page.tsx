'use client'

import { useAuth } from '@/contexts/AuthContext'
import { NavBar } from '@/components/NavBar'
import { PostFeed } from '@/components/posts/PostFeed'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Posts Feed */}
          <PostFeed 
            currentUserId={user?.id}
            showCreateButton={false}
          />
        </div>
      </div>
    </div>
  )
}