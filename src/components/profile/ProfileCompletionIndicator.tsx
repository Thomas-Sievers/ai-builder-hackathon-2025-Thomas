'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface ProfileCompletionIndicatorProps {
  profile: User
  gameProfiles: UserProfile[]
}

export function ProfileCompletionIndicator({ profile, gameProfiles }: ProfileCompletionIndicatorProps) {
  const calculateCompletion = () => {
    let completedFields = 0
    let totalFields = 0

    // Basic profile fields
    const basicFields = ['username', 'display_name', 'bio', 'location', 'website']
    basicFields.forEach(field => {
      totalFields++
      if (profile[field as keyof User] && profile[field as keyof User] !== '') {
        completedFields++
      }
    })

    // Game profiles
    const games = ['cs2', 'lol', 'valorant', 'dota2']
    games.forEach(game => {
      const gameProfile = gameProfiles.find(gp => gp.game === game)
      if (gameProfile) {
        totalFields++
        completedFields++
      }
    })

    return {
      completed: completedFields,
      total: totalFields,
      percentage: totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
    }
  }

  const { completed, total, percentage } = calculateCompletion()

  const getCompletionMessage = () => {
    if (percentage >= 80) return "Excellent! Your profile is well-completed."
    if (percentage >= 60) return "Good progress! Add a few more details to make your profile stand out."
    if (percentage >= 40) return "Getting there! Complete more sections to showcase your skills."
    return "Just getting started! Complete your profile to attract teams and scouts."
  }

  const getCompletionColor = () => {
    if (percentage >= 80) return "text-green-400"
    if (percentage >= 60) return "text-yellow-400"
    if (percentage >= 40) return "text-orange-400"
    return "text-red-400"
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-blue-400">Profile Completion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Progress</span>
            <span className="text-white font-semibold">{completed}/{total} sections</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${getCompletionColor()}`}>
              {percentage}% Complete
            </span>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm">
          {getCompletionMessage()}
        </p>

        {percentage < 100 && (
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">Complete your profile:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              {!profile.bio && <li>• Add a bio to tell your story</li>}
              {!profile.location && <li>• Add your location</li>}
              {!profile.website && <li>• Add your website or social links</li>}
              {gameProfiles.length === 0 && <li>• Add at least one game profile</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
