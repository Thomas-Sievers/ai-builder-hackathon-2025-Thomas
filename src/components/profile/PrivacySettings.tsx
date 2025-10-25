'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

interface PrivacySettingsProps {
  profile: User
  onUpdate: (updatedProfile: Partial<User>) => void
}

export function PrivacySettings({ profile, onUpdate }: PrivacySettingsProps) {
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'public', // public, followers, private
    show_email: false,
    show_location: true,
    show_website: true,
    show_game_profiles: true,
    show_highlights: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // For now, we'll store privacy settings in the bio field as JSON
      // In a real app, you'd have a separate privacy_settings table
      const privacyData = {
        ...privacySettings,
        updated_at: new Date().toISOString()
      }
      
      await onUpdate({
        bio: profile.bio + `\n\n<!--PRIVACY:${JSON.stringify(privacyData)}-->`
      })
    } catch (error) {
      console.error('Error updating privacy settings:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-blue-400">Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Profile Visibility</Label>
              <Select
                value={privacySettings.profile_visibility}
                onValueChange={(value) => handleChange('profile_visibility', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="public" className="text-white">
                    Public - Anyone can view your profile
                  </SelectItem>
                  <SelectItem value="followers" className="text-white">
                    Followers Only - Only your followers can view your profile
                  </SelectItem>
                  <SelectItem value="private" className="text-white">
                    Private - Only you can view your profile
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-300">What to Show on Public Profile</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Show Location</Label>
                  <Select
                    value={privacySettings.show_location ? 'yes' : 'no'}
                    onValueChange={(value) => handleChange('show_location', value === 'yes')}
                  >
                    <SelectTrigger className="w-24 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="yes" className="text-white">Yes</SelectItem>
                      <SelectItem value="no" className="text-white">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Show Website</Label>
                  <Select
                    value={privacySettings.show_website ? 'yes' : 'no'}
                    onValueChange={(value) => handleChange('show_website', value === 'yes')}
                  >
                    <SelectTrigger className="w-24 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="yes" className="text-white">Yes</SelectItem>
                      <SelectItem value="no" className="text-white">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Show Game Profiles</Label>
                  <Select
                    value={privacySettings.show_game_profiles ? 'yes' : 'no'}
                    onValueChange={(value) => handleChange('show_game_profiles', value === 'yes')}
                  >
                    <SelectTrigger className="w-24 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="yes" className="text-white">Yes</SelectItem>
                      <SelectItem value="no" className="text-white">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Show Highlight Reel</Label>
                  <Select
                    value={privacySettings.show_highlights ? 'yes' : 'no'}
                    onValueChange={(value) => handleChange('show_highlights', value === 'yes')}
                  >
                    <SelectTrigger className="w-24 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="yes" className="text-white">Yes</SelectItem>
                      <SelectItem value="no" className="text-white">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : 'Save Privacy Settings'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
