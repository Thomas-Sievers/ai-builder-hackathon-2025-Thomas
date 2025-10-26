'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ProfileDisplay } from '@/components/profile/ProfileDisplay'
import { GameProfilesSection } from '@/components/profile/GameProfilesSection'
import { ProfileCompletionIndicator } from '@/components/profile/ProfileCompletionIndicator'
import { PrivacySettings } from '@/components/profile/PrivacySettings'
import { PostCard } from '@/components/posts/PostCard'
import { supabase } from '@/lib/supabase'
import { getPostsByUser, deletePost } from '@/lib/database'
import { Database } from '@/types/database'
import { LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type User = Database['public']['Tables']['users']['Row']
type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type Post = Database['public']['Tables']['posts']['Row'] & {
  users: Database['public']['Tables']['users']['Row']
}

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<User | null>(null)
  const [gameProfiles, setGameProfiles] = useState<UserProfile[]>([])
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, loading, router])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoadingProfile(true)
      
      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user profile:', userError)
        return
      }

      setProfile(userData)

      // Fetch game profiles
      const { data: gameData, error: gameError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)

      if (gameError) {
        console.error('Error fetching game profiles:', gameError)
        return
      }

      setGameProfiles(gameData || [])
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const fetchUserPosts = async () => {
    if (!user) return

    try {
      setLoadingPosts(true)
      const posts = await getPostsByUser(user.id)
      setUserPosts(posts)
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setLoadingPosts(false)
    }
  }

  useEffect(() => {
    if (user && !isEditing) {
      fetchUserPosts()
    }
  }, [user, isEditing])

  const handleProfileUpdate = async (updatedProfile: Partial<User>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updatedProfile)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return
      }

      setProfile(data)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleGameProfileUpdate = async (gameProfile: UserProfile) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(gameProfile)
        .select()
        .single()

      if (error) {
        console.error('Error updating game profile:', error)
        return
      }

      setGameProfiles(prev => 
        prev.filter(p => p.game !== gameProfile.game).concat(data)
      )
    } catch (error) {
      console.error('Error updating game profile:', error)
    }
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-blue-400 text-xl">Loading profile...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-400">My Profile</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Profile Form or Display */}
          {isEditing ? (
            <ProfileForm
              profile={profile}
              onUpdate={handleProfileUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ProfileDisplay profile={profile} />
          )}

          {/* Profile Completion Indicator */}
          <ProfileCompletionIndicator 
            profile={profile} 
            gameProfiles={gameProfiles} 
          />

          {/* Game Profiles Section */}
          <GameProfilesSection
            gameProfiles={gameProfiles}
            onUpdate={handleGameProfileUpdate}
            isEditing={isEditing}
          />

          {/* Privacy Settings */}
          {isEditing && (
            <PrivacySettings
              profile={profile}
              onUpdate={handleProfileUpdate}
            />
          )}

          {/* User's Posts */}
          {!isEditing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-blue-400">My Posts</h2>
                <span className="text-gray-400 text-sm">
                  {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
                </span>
              </div>

              {loadingPosts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : userPosts.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                  <p className="text-gray-400">You haven't made any posts yet.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user.id}
                      onEdit={(updatedPost) => {
                        setUserPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))
                        fetchUserPosts()
                      }}
                      onDelete={async (postId) => {
                        try {
                          await deletePost(postId)
                          toast.success('Post deleted successfully!')
                          setUserPosts(prev => prev.filter(p => p.id !== postId))
                        } catch (error) {
                          console.error('Error deleting post:', error)
                          toast.error('Failed to delete post')
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
