import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from './ImageUpload'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

interface ProfileFormProps {
  profile: User
  onUpdate: (updatedProfile: Partial<User>) => void
  onCancel: () => void
}

export function ProfileForm({ profile, onUpdate, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    username: profile.username || '',
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onUpdate(formData)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpdate = (imageUrl: string) => {
    onUpdate({ avatar_url: imageUrl })
  }

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <ImageUpload profile={profile} onImageUpdate={handleImageUpdate} />

      {/* Profile Form */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-400">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">
                  Username
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name" className="text-gray-300">
                  Display Name
                </Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleChange('display_name', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-300">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                rows={4}
                placeholder="Tell us about yourself, your gaming experience, and what you're looking for..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-300">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-gray-300">
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="https://your-website.com"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
