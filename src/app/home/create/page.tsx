'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy load the PostCreationForm component
const PostCreationForm = lazy(() => 
  import('@/components/posts/PostCreationForm').then(module => ({ 
    default: module.PostCreationForm 
  }))
)

export default function CreatePostPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading])

  const handlePostCreated = () => {
    // Navigate back to posts page after successful creation
    router.push('/posts')
  }

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

  if (!user) {
    return null // Will redirect to sign in
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create New Post</h1>
            <p className="text-gray-400">
              Share your gameplay highlights, strategies, and connect with the esports community
            </p>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading form...</span>
              </div>
            </div>
          }>
            <PostCreationForm onPostCreated={handlePostCreated} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
