'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadProfileImage, deleteProfileImage } from '@/lib/image-upload'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

interface ImageUploadProps {
  profile: User
  onImageUpdate: (imageUrl: string) => void
}

export function ImageUpload({ profile, onImageUpdate }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadProfileImage(file, profile.id)
      
      if (result.success && result.url) {
        onImageUpdate(result.url)
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!profile.avatar_url) return

    setIsUploading(true)
    setError(null)

    try {
      const success = await deleteProfileImage(profile.avatar_url)
      if (success) {
        onImageUpdate('')
      } else {
        setError('Failed to remove image')
      }
    } catch (error) {
      console.error('Remove error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-blue-400">Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="text-2xl font-bold text-blue-400">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Button
              onClick={handleButtonClick}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            {profile.avatar_url && (
              <Button
                variant="outline"
                onClick={handleRemoveImage}
                disabled={isUploading}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Remove
              </Button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && (
          <div className="text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>• Supported formats: JPEG, PNG, WebP</p>
          <p>• Maximum file size: 5MB</p>
          <p>• Recommended size: 400x400 pixels</p>
        </div>
      </CardContent>
    </Card>
  )
}
