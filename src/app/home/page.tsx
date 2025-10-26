'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { NavBar } from '@/components/NavBar'
import { PostFeed } from '@/components/posts/PostFeed'
import { PostCreationForm } from '@/components/posts/PostCreationForm'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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
          {/* Create Post Card */}
          {user && (
            <>
              {!showCreateForm ? (
                <Card className="bg-gray-800 border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="w-full text-left text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        What's on your mind?
                      </button>
                    </div>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Post
                    </Button>
                  </div>
                </Card>
              ) : (
                <PostCreationForm
                  onPostCreated={() => {
                    setShowCreateForm(false)
                    setRefreshKey(prev => prev + 1) // Trigger refresh of PostFeed
                  }}
                  onCancel={() => setShowCreateForm(false)}
                />
              )}
            </>
          )}

          {/* Posts Feed */}
          <PostFeed 
            key={refreshKey}
            currentUserId={user?.id}
            showCreateButton={false}
          />
        </div>
      </div>
    </div>
  )
}