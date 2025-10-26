'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProfileDisplay } from '@/components/profile/ProfileDisplay'
import { GameProfilesSection } from '@/components/profile/GameProfilesSection'
import { HighlightReel } from '@/components/profile/HighlightReel'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<User | null>(null)
  const [gameProfiles, setGameProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch user profile by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (userError) {
        if (userError.code === 'PGRST116') {
          setError('Profile not found')
        } else {
          setError('Failed to load profile')
        }
        return
      }

      setProfile(userData)

      // Fetch game profiles
      const { data: gameData, error: gameError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userData.id)

      if (gameError) {
        console.error('Error fetching game profiles:', gameError)
        return
      }

      setGameProfiles(gameData || [])
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-400 text-xl">Loading profile...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl">{error || 'Profile not found'}</div>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-400">{profile.display_name}</h1>
            <div className="flex items-center space-x-2">
              {profile.is_verified && (
                <Badge className="bg-blue-600 text-white">Verified</Badge>
              )}
              {profile.is_premium && (
                <Badge className="bg-yellow-600 text-black">Premium</Badge>
              )}
            </div>
          </div>

          {/* Profile Display */}
          <ProfileDisplay profile={profile} />

          {/* Game Profiles Section */}
          <GameProfilesSection
            gameProfiles={gameProfiles}
            onUpdate={() => {}} // No updates allowed on public view
            isEditing={false}
          />

          {/* Highlight Reel */}
          <HighlightReel
            userId={profile.id}
            isEditing={false}
          />

          {/* Contact Information */}
          {(profile.location || profile.website) && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.location && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1">Location</h4>
                    <p className="text-gray-300">{profile.location}</p>
                  </div>
                )}
                {profile.website && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1">Website</h4>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
