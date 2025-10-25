'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ProfileDisplay } from '@/components/profile/ProfileDisplay'
import { GameProfilesSection } from '@/components/profile/GameProfilesSection'
import { ProfileCompletionIndicator } from '@/components/profile/ProfileCompletionIndicator'
import { HighlightReel } from '@/components/profile/HighlightReel'
import { PrivacySettings } from '@/components/profile/PrivacySettings'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<User | null>(null)
  const [gameProfiles, setGameProfiles] = useState<UserProfile[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-400 text-xl">Loading profile...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-xl">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-400">My Profile</h1>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {/* Profile Completion Indicator */}
          <ProfileCompletionIndicator 
            profile={profile} 
            gameProfiles={gameProfiles} 
          />

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

          {/* Game Profiles Section */}
          <GameProfilesSection
            gameProfiles={gameProfiles}
            onUpdate={handleGameProfileUpdate}
            isEditing={isEditing}
          />

          {/* Highlight Reel */}
          <HighlightReel
            userId={user.id}
            isEditing={isEditing}
          />

          {/* Privacy Settings */}
          {isEditing && (
            <PrivacySettings
              profile={profile}
              onUpdate={handleProfileUpdate}
            />
          )}
        </div>
      </div>
    </div>
  )
}
