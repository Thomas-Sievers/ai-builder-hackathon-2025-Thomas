'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getTeamById } from '@/lib/database'
import { Loader2, Edit, ArrowLeft, MapPin, Users, Globe, Trophy } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const gameNames: Record<string, string> = {
  cs2: 'Counter-Strike 2',
  lol: 'League of Legends',
  valorant: 'Valorant',
  dota2: 'Dota 2'
}

type TeamMember = {
  id: string
  user_id: string
  role: 'owner' | 'captain' | 'player' | 'coach' | 'manager'
  joined_at: string
  users: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
}

type Team = {
  id: string
  name: string
  tag: string
  description: string | null
  logo_url: string | null
  website: string | null
  region: string
  game: 'cs2' | 'lol' | 'valorant' | 'dota2'
  is_premium: boolean
  created_by: string
  created_at: string
  updated_at: string
  users: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
  team_members: TeamMember[]
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadTeam()
    }
  }, [params.id])

  const loadTeam = async () => {
    try {
      setLoading(true)
      const data = await getTeamById(params.id as string)
      setTeam(data)
    } catch (error) {
      console.error('Error loading team:', error)
      toast.error('Failed to load team')
      router.push('/teams')
    } finally {
      setLoading(false)
    }
  }

  const isOwner = user && team && (team.created_by === user.id || team.team_members.some(m => m.user_id === user.id && (m.role === 'owner' || m.role === 'captain')))

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!team) {
    return null
  }

  // Group members by role
  const membersByRole = {
    owner: team.team_members.filter(m => m.role === 'owner'),
    captain: team.team_members.filter(m => m.role === 'captain'),
    player: team.team_members.filter(m => m.role === 'player'),
    coach: team.team_members.filter(m => m.role === 'coach'),
    manager: team.team_members.filter(m => m.role === 'manager'),
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/teams">
            <Button variant="ghost" className="text-gray-400 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
          </Link>

          {/* Team Header */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                {team.logo_url ? (
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={team.logo_url} alt={team.name} />
                    <AvatarFallback className="bg-gray-700 text-white text-2xl">
                      {team.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{team.name}</h1>
                    <Badge variant="secondary" className="bg-blue-600 text-white">
                      [{team.tag}]
                    </Badge>
                    {isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        asChild
                      >
                        <Link href={`/teams/${team.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Team
                        </Link>
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      <span>{gameNames[team.game]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{team.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{team.team_members.length} member{team.team_members.length !== 1 ? 's' : ''}</span>
                    </div>
                    {team.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <a href={team.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          Website
                        </a>
                      </div>
                    )}
                  </div>

                  {team.description && (
                    <p className="text-gray-300">{team.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Owners */}
              {membersByRole.owner.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Owners</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {membersByRole.owner.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.users.avatar_url || undefined} alt={member.users.display_name} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {member.users.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/profile/${member.users.username}`} className="text-white hover:text-blue-400 font-medium">
                            {member.users.display_name}
                          </Link>
                          <p className="text-sm text-gray-400">@{member.users.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Captains */}
              {membersByRole.captain.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Captains</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {membersByRole.captain.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.users.avatar_url || undefined} alt={member.users.display_name} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {member.users.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/profile/${member.users.username}`} className="text-white hover:text-blue-400 font-medium">
                            {member.users.display_name}
                          </Link>
                          <p className="text-sm text-gray-400">@{member.users.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Players */}
              {membersByRole.player.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Players</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {membersByRole.player.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.users.avatar_url || undefined} alt={member.users.display_name} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {member.users.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/profile/${member.users.username}`} className="text-white hover:text-blue-400 font-medium">
                            {member.users.display_name}
                          </Link>
                          <p className="text-sm text-gray-400">@{member.users.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coaches */}
              {membersByRole.coach.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Coaches</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {membersByRole.coach.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.users.avatar_url || undefined} alt={member.users.display_name} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {member.users.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/profile/${member.users.username}`} className="text-white hover:text-blue-400 font-medium">
                            {member.users.display_name}
                          </Link>
                          <p className="text-sm text-gray-400">@{member.users.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Managers */}
              {membersByRole.manager.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Managers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {membersByRole.manager.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.users.avatar_url || undefined} alt={member.users.display_name} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {member.users.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/profile/${member.users.username}`} className="text-white hover:text-blue-400 font-medium">
                            {member.users.display_name}
                          </Link>
                          <p className="text-sm text-gray-400">@{member.users.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {team.team_members.length === 0 && (
                <p className="text-center text-gray-400 py-8">No team members yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
