'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GameProfileForm } from './GameProfileForm'
import { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface GameProfilesSectionProps {
  gameProfiles: UserProfile[]
  onUpdate: (gameProfile: UserProfile) => void
  isEditing: boolean
}

const GAME_INFO = {
  cs2: {
    name: 'Counter-Strike 2',
    shortName: 'CS2',
    color: 'bg-orange-600',
    ranks: ['Silver I', 'Silver II', 'Silver III', 'Silver IV', 'Silver Elite', 'Silver Elite Master', 'Gold Nova I', 'Gold Nova II', 'Gold Nova III', 'Gold Nova Master', 'Master Guardian I', 'Master Guardian II', 'Master Guardian Elite', 'Distinguished Master Guardian', 'Legendary Eagle', 'Legendary Eagle Master', 'Supreme Master First Class', 'Global Elite'],
    roles: ['Entry Fragger', 'Support', 'AWPer', 'IGL', 'Lurker', 'Rifler']
  },
  lol: {
    name: 'League of Legends',
    shortName: 'LoL',
    color: 'bg-blue-600',
    ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'],
    divisions: ['IV', 'III', 'II', 'I'],
    roles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support']
  },
  valorant: {
    name: 'Valorant',
    shortName: 'Valorant',
    color: 'bg-red-600',
    ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'],
    roles: ['Duelist', 'Initiator', 'Controller', 'Sentinel']
  },
  dota2: {
    name: 'Dota 2',
    shortName: 'Dota 2',
    color: 'bg-green-600',
    medals: ['Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal'],
    roles: ['Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support']
  }
}

export function GameProfilesSection({ gameProfiles, onUpdate, isEditing }: GameProfilesSectionProps) {
  const [editingGame, setEditingGame] = useState<string | null>(null)

  const handleGameProfileUpdate = (gameProfile: UserProfile) => {
    onUpdate(gameProfile)
    setEditingGame(null)
  }

  const getGameProfile = (game: string) => {
    return gameProfiles.find(profile => profile.game === game)
  }

  const renderGameProfile = (game: keyof typeof GAME_INFO) => {
    const profile = getGameProfile(game)
    const gameInfo = GAME_INFO[game]

    if (editingGame === game) {
      return (
        <GameProfileForm
          game={game}
          profile={profile}
          onUpdate={handleGameProfileUpdate}
          onCancel={() => setEditingGame(null)}
        />
      )
    }

    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded ${gameInfo.color} flex items-center justify-center`}>
                <span className="text-white text-sm font-bold">{gameInfo.shortName}</span>
              </div>
              <CardTitle className="text-white">{gameInfo.name}</CardTitle>
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingGame(game)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {profile ? 'Edit' : 'Add'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {profile ? (
            <div className="space-y-3">
              {profile.rank && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Rank</h4>
                  <Badge className="bg-blue-600 text-white">{profile.rank}</Badge>
                </div>
              )}
              {profile.division && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Division</h4>
                  <Badge className="bg-purple-600 text-white">{profile.division}</Badge>
                </div>
              )}
              {profile.lp && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">LP</h4>
                  <span className="text-gray-300">{profile.lp}</span>
                </div>
              )}
              {profile.mmr && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">MMR</h4>
                  <span className="text-gray-300">{profile.mmr}</span>
                </div>
              )}
              {profile.faceit_level && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Faceit Level</h4>
                  <span className="text-gray-300">{profile.faceit_level}</span>
                </div>
              )}
              {profile.esea_rank && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">ESEA Rank</h4>
                  <Badge className="bg-green-600 text-white">{profile.esea_rank}</Badge>
                </div>
              )}
              {profile.act_rank && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Act Rank</h4>
                  <Badge className="bg-red-600 text-white">{profile.act_rank}</Badge>
                </div>
              )}
              {profile.main_role && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Main Role</h4>
                  <Badge className="bg-yellow-600 text-black">{profile.main_role}</Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No profile for {gameInfo.name}</p>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setEditingGame(game)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Add Profile
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-400">Game Profiles</h2>
        <p className="text-gray-400 text-sm">
          Showcase your skills across different games
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(GAME_INFO).map(game => (
          <div key={game}>
            {renderGameProfile(game as keyof typeof GAME_INFO)}
          </div>
        ))}
      </div>
    </div>
  )
}
