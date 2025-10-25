import { supabase } from './supabase'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadProfileImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File too large. Please upload an image smaller than 5MB.'
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: 'Failed to upload image. Please try again.'
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName)

    return {
      success: true,
      url: urlData.publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function deleteProfileImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]

    const { error } = await supabase.storage
      .from('profile-images')
      .remove([fileName])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}
