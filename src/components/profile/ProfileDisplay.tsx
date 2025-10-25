'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

interface ProfileDisplayProps {
  profile: User
  showPublicLink?: boolean
}

export function ProfileDisplay({ profile, showPublicLink = true }: ProfileDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
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
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-white">{profile.display_name}</h2>
                {profile.is_verified && (
                  <Badge className="bg-blue-600 text-white">Verified</Badge>
                )}
                {profile.is_premium && (
                  <Badge className="bg-yellow-600 text-black">Premium</Badge>
                )}
              </div>
              <p className="text-gray-400">@{profile.username}</p>
              <p className="text-sm text-gray-500">
                Member since {formatDate(profile.created_at)}
              </p>
            </div>
          </div>
          {showPublicLink && (
            <Button variant="outline" asChild className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Link href={`/profile/${profile.username}`}>
                View Public Profile
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.bio && (
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">About</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {profile.premium_expires_at && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-400 mb-1">Premium Status</h4>
            <p className="text-gray-300">
              Premium expires on {formatDate(profile.premium_expires_at)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
