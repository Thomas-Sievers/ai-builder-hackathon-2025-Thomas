'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { NavBar } from '@/components/NavBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { searchTeams, getTeams } from '@/lib/database'
import { Loader2, Plus, Users, Search, MapPin } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

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

const gameNames: Record<string, string> = {
  cs2: 'Counter-Strike 2',
  lol: 'League of Legends',
  valorant: 'Valorant',
  dota2: 'Dota 2'
}

export default function TeamsPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [gameFilter, setGameFilter] = useState<string>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')

  const gameOptions = ['cs2', 'lol', 'valorant', 'dota2']

  useEffect(() => {
    loadTeams()
  }, [gameFilter, regionFilter])

  const loadTeams = async () => {
    try {
      setLoading(true)
      const filters: any = {
        limit: 50
      }

      if (gameFilter !== 'all') {
        filters.game = gameFilter
      }

      if (regionFilter !== 'all') {
        filters.region = regionFilter
      }

      let data
      if (searchQuery.trim()) {
        data = await searchTeams(searchQuery, filters)
      } else {
        data = await getTeams(filters)
      }
      setTeams(data || [])
    } catch (error) {
      console.error('Error loading teams:', error)
      toast.error('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadTeams()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Teams</h1>
              <p className="text-gray-400 mt-1">Discover and join esports teams</p>
            </div>
            {user && (
              <Link href="/teams/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </Link>
            )}
          </div>

          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search teams by name, tag, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch()
                      }
                    }}
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Game Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Game</label>
                    <Select value={gameFilter} onValueChange={setGameFilter}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all" className="text-white hover:bg-gray-700">All Games</SelectItem>
                        {gameOptions.map((game) => (
                          <SelectItem key={game} value={game} className="text-white hover:bg-gray-700">
                            {gameNames[game]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Region Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Region</label>
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all" className="text-white hover:bg-gray-700">All Regions</SelectItem>
                        <SelectItem value="North America" className="text-white hover:bg-gray-700">North America</SelectItem>
                        <SelectItem value="Europe" className="text-white hover:bg-gray-700">Europe</SelectItem>
                        <SelectItem value="Asia" className="text-white hover:bg-gray-700">Asia</SelectItem>
                        <SelectItem value="South America" className="text-white hover:bg-gray-700">South America</SelectItem>
                        <SelectItem value="Oceania" className="text-white hover:bg-gray-700">Oceania</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Teams List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : teams.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Teams Found</h3>
                <p className="text-gray-500">Try adjusting your filters or create a new team.</p>
                {user ? (
                  <Link href="/teams/create">
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Team
                    </Button>
                  </Link>
                ) : (
                  <p className="text-sm text-gray-400 mt-4">
                    <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300">
                      Sign in
                    </Link> to create a team
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teams.map((team) => (
                <Link key={team.id} href={`/teams/${team.id}`}>
                  <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-4">
                        {team.logo_url ? (
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={team.logo_url} alt={team.name} />
                            <AvatarFallback className="bg-gray-700 text-white">
                              {team.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-white truncate">{team.name}</h3>
                          <p className="text-sm text-gray-400 truncate">[{team.tag}]</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {team.description && (
                        <p className="text-gray-300 mb-4 line-clamp-2">{team.description}</p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-600 text-white">
                            {gameNames[team.game]}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{team.region}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{team.team_members.length} member{team.team_members.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* Team Members Preview */}
                      {team.team_members.length > 0 && (
                        <div className="flex -space-x-2 mb-4">
                          {team.team_members.slice(0, 5).map((member) => (
                            <Avatar key={member.id} className="w-8 h-8 border-2 border-gray-800">
                              <AvatarImage src={member.users.avatar_url || undefined} alt={member.users.display_name} />
                              <AvatarFallback className="bg-gray-700 text-white text-xs">
                                {member.users.display_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {team.team_members.length > 5 && (
                            <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-gray-300">
                              +{team.team_members.length - 5}
                            </div>
                          )}
                        </div>
                      )}

                      {team.website && (
                        <Button 
                          variant="outline" 
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(team.website, '_blank', 'noopener,noreferrer')
                          }}
                        >
                          Visit Website
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
