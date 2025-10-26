'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { searchUsers, searchTeams, getTeams, getChampionships } from '@/lib/database'
import { Loader2, Search, Users, Trophy, UsersRound, MapPin, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type UserProfile = {
  id: string
  user_id: string
  game: 'cs2' | 'lol' | 'valorant' | 'dota2'
  rank: string | null
  division: string | null
  lp: number | null
  mmr: number | null
  faceit_level: number | null
  esea_rank: string | null
  act_rank: string | null
  main_role: string | null
  users: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
    location: string | null
    bio: string | null
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
  team_members: any[]
}

type Championship = {
  id: string
  title: string
  description: string
  game: 'cs2' | 'lol' | 'valorant' | 'dota2'
  region: string
  start_date: string
  end_date: string
  prize_pool: number | null
  max_teams: number | null
  registration_deadline: string | null
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  organizer: string
  website: string | null
  created_at: string
}

const gameNames: Record<string, string> = {
  cs2: 'Counter-Strike 2',
  lol: 'League of Legends',
  valorant: 'Valorant',
  dota2: 'Dota 2'
}

export default function SearchPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('players')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Player search state
  const [playerResults, setPlayerResults] = useState<UserProfile[]>([])
  const [playerLoading, setPlayerLoading] = useState(false)
  const [gameFilter, setGameFilter] = useState<string>('all')
  const [rankFilter, setRankFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')

  // Team search state
  const [teamResults, setTeamResults] = useState<Team[]>([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamGameFilter, setTeamGameFilter] = useState<string>('all')
  const [teamRegionFilter, setTeamRegionFilter] = useState<string>('all')

  // Championship search state
  const [championshipResults, setChampionshipResults] = useState<Championship[]>([])
  const [championshipLoading, setChampionshipLoading] = useState(false)
  const [championshipGameFilter, setChampionshipGameFilter] = useState<string>('all')
  const [championshipRegionFilter, setChampionshipRegionFilter] = useState<string>('all')
  const [championshipStatusFilter, setChampionshipStatusFilter] = useState<string>('upcoming')

  const gameOptions = ['cs2', 'lol', 'valorant', 'dota2']

  const getRankOptions = (game: string) => {
    switch (game) {
      case 'cs2':
        return ['Global Elite', 'Supreme Master First Class', 'Legendary Eagle Master', 'Legendary Eagle', 'Distinguished Master Guardian']
      case 'lol':
        return ['Challenger', 'Grandmaster', 'Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Iron']
      case 'valorant':
        return ['Radiant', 'Immortal', 'Ascendant', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Iron']
      case 'dota2':
        return ['Immortal', 'Divine', 'Ancient', 'Legend', 'Archon', 'Crusader', 'Herald']
      default:
        return []
    }
  }

  const getRoleOptions = (game: string) => {
    switch (game) {
      case 'cs2':
        return ['AWPer', 'Rifler', 'Lurker', 'IGL', 'Support']
      case 'lol':
        return ['Top', 'Jungle', 'Mid', 'ADC', 'Support']
      case 'valorant':
        return ['Duelist', 'Initiator', 'Controller', 'Sentinel']
      case 'dota2':
        return ['Carry', 'Mid', 'Offlane', 'Support', 'Hard Support']
      default:
        return []
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      const day = String(date.getUTCDate()).padStart(2, '0')
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const year = date.getUTCFullYear()
      return `${day}/${month}/${year}`
    } catch (error) {
      return ''
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'TBD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handlePlayerSearch = async () => {
    try {
      setPlayerLoading(true)
      const filters: any = { limit: 50 }
      if (gameFilter !== 'all') filters.game = gameFilter
      if (rankFilter !== 'all') filters.rank = rankFilter
      if (roleFilter !== 'all') filters.role = roleFilter
      if (regionFilter !== 'all') filters.region = regionFilter

      const data = await searchUsers(searchQuery, filters)
      setPlayerResults(data || [])
    } catch (error) {
      console.error('Error searching players:', error)
      toast.error('Failed to search players')
    } finally {
      setPlayerLoading(false)
    }
  }

  const handleTeamSearch = async () => {
    try {
      setTeamLoading(true)
      const filters: any = { limit: 50 }
      if (teamGameFilter !== 'all') filters.game = teamGameFilter
      if (teamRegionFilter !== 'all') filters.region = teamRegionFilter

      let data
      if (searchQuery.trim()) {
        data = await searchTeams(searchQuery, filters)
      } else {
        data = await getTeams(filters)
      }
      setTeamResults(data || [])
    } catch (error) {
      console.error('Error searching teams:', error)
      toast.error('Failed to search teams')
    } finally {
      setTeamLoading(false)
    }
  }

  const handleChampionshipSearch = async () => {
    try {
      setChampionshipLoading(true)
      const filters: any = { limit: 50 }
      if (championshipGameFilter !== 'all') filters.game = championshipGameFilter
      if (championshipRegionFilter !== 'all') filters.region = championshipRegionFilter
      if (championshipStatusFilter !== 'all') filters.status = championshipStatusFilter
      if (searchQuery.trim()) filters.search = searchQuery.trim()

      const data = await getChampionships(filters)
      setChampionshipResults(data || [])
    } catch (error) {
      console.error('Error searching championships:', error)
      toast.error('Failed to search championships')
    } finally {
      setChampionshipLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'players' && (gameFilter !== 'all' || searchQuery)) {
      handlePlayerSearch()
    }
  }, [gameFilter, rankFilter, roleFilter, regionFilter])

  useEffect(() => {
    if (activeTab === 'teams' && (teamGameFilter !== 'all' || teamRegionFilter !== 'all')) {
      handleTeamSearch()
    }
  }, [teamGameFilter, teamRegionFilter])

  useEffect(() => {
    if (activeTab === 'championships') {
      handleChampionshipSearch()
    }
  }, [championshipGameFilter, championshipRegionFilter, championshipStatusFilter])

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
            <p className="text-gray-400">
              Find players, teams, and championships all in one place
            </p>
          </div>

          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                  <TabsTrigger value="players" className="data-[state=active]:bg-blue-600">
                    <Users className="w-4 h-4 mr-2" />
                    Players
                  </TabsTrigger>
                  <TabsTrigger value="teams" className="data-[state=active]:bg-blue-600">
                    <UsersRound className="w-4 h-4 mr-2" />
                    Teams
                  </TabsTrigger>
                  <TabsTrigger value="championships" className="data-[state=active]:bg-blue-600">
                    <Trophy className="w-4 h-4 mr-2" />
                    Championships
                  </TabsTrigger>
                </TabsList>

                {/* Players Tab */}
                <TabsContent value="players" className="mt-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search players by username or display name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handlePlayerSearch()}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Game</label>
                        <Select value={gameFilter} onValueChange={setGameFilter}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="all">All Games</SelectItem>
                            {gameOptions.map((game) => (
                              <SelectItem key={game} value={game}>{gameNames[game]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {gameFilter !== 'all' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Rank</label>
                            <Select value={rankFilter} onValueChange={setRankFilter}>
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="all">All Ranks</SelectItem>
                                {getRankOptions(gameFilter).map((rank) => (
                                  <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Role</label>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="all">All Roles</SelectItem>
                                {getRoleOptions(gameFilter).map((role) => (
                                  <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Region</label>
                        <Select value={regionFilter} onValueChange={setRegionFilter}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="all">All Regions</SelectItem>
                            <SelectItem value="North America">North America</SelectItem>
                            <SelectItem value="Europe">Europe</SelectItem>
                            <SelectItem value="Asia">Asia</SelectItem>
                            <SelectItem value="South America">South America</SelectItem>
                            <SelectItem value="Oceania">Oceania</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={handlePlayerSearch} disabled={playerLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                      {playerLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                      Search Players
                    </Button>

                    {playerLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    ) : playerResults.length === 0 ? (
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="py-12 text-center">
                          <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                          <p className="text-gray-400">No players found</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {playerResults.map((profile) => (
                          <Link key={profile.id} href={`/profile/${profile.users.username}`}>
                            <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400 transition-colors cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <Avatar className="w-12 h-12">
                                    <AvatarImage src={profile.users.avatar_url || undefined} />
                                    <AvatarFallback className="bg-gray-700">{profile.users.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white truncate">{profile.users.display_name}</h3>
                                    <p className="text-sm text-gray-400 truncate">@{profile.users.username}</p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-blue-600 mb-2">{gameNames[profile.game]}</Badge>
                                {profile.rank && <p className="text-sm text-gray-400">Rank: {profile.rank}</p>}
                                {profile.main_role && <p className="text-sm text-gray-400">Role: {profile.main_role}</p>}
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Teams Tab */}
                <TabsContent value="teams" className="mt-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search teams by name, tag, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTeamSearch()}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Game</label>
                        <Select value={teamGameFilter} onValueChange={setTeamGameFilter}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="all">All Games</SelectItem>
                            {gameOptions.map((game) => (
                              <SelectItem key={game} value={game}>{gameNames[game]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Region</label>
                        <Select value={teamRegionFilter} onValueChange={setTeamRegionFilter}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="all">All Regions</SelectItem>
                            <SelectItem value="North America">North America</SelectItem>
                            <SelectItem value="Europe">Europe</SelectItem>
                            <SelectItem value="Asia">Asia</SelectItem>
                            <SelectItem value="South America">South America</SelectItem>
                            <SelectItem value="Oceania">Oceania</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={handleTeamSearch} disabled={teamLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                      {teamLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                      Search Teams
                    </Button>

                    {teamLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    ) : teamResults.length === 0 ? (
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="py-12 text-center">
                          <UsersRound className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                          <p className="text-gray-400">No teams found</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        {teamResults.map((team) => (
                          <Link key={team.id} href={`/teams/${team.id}`}>
                            <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400 transition-colors cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  {team.logo_url ? (
                                    <Avatar className="w-12 h-12">
                                      <AvatarImage src={team.logo_url} />
                                      <AvatarFallback className="bg-gray-700">{team.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold text-white">
                                      {team.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white truncate">{team.name}</h3>
                                    <p className="text-sm text-gray-400 truncate">[{team.tag}]</p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-blue-600 mb-2">{gameNames[team.game]}</Badge>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <MapPin className="w-4 h-4" />
                                  <span>{team.region}</span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Championships Tab */}
                <TabsContent value="championships" className="mt-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search championships by title, description, or organizer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleChampionshipSearch()}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Game</label>
                        <Select value={championshipGameFilter} onValueChange={setChampionshipGameFilter}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="all">All Games</SelectItem>
                            {gameOptions.map((game) => (
                              <SelectItem key={game} value={game}>{gameNames[game]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Region</label>
                        <Select value={championshipRegionFilter} onValueChange={setChampionshipRegionFilter}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="all">All Regions</SelectItem>
                            <SelectItem value="North America">North America</SelectItem>
                            <SelectItem value="Europe">Europe</SelectItem>
                            <SelectItem value="Asia">Asia</SelectItem>
                            <SelectItem value="South America">South America</SelectItem>
                            <SelectItem value="Oceania">Oceania</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Status</label>
                        <Select value={championshipStatusFilter} onValueChange={setChampionshipStatusFilter}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={handleChampionshipSearch} disabled={championshipLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                      {championshipLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                      Search Championships
                    </Button>

                    {championshipLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    ) : championshipResults.length === 0 ? (
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="py-12 text-center">
                          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                          <p className="text-gray-400">No championships found</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        {championshipResults.map((champ) => (
                          <Link key={champ.id} href={`/championships/${champ.id}`}>
                            <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400 transition-colors cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h3 className="font-semibold text-white mb-1">{champ.title}</h3>
                                    <p className="text-sm text-gray-400">{champ.organizer}</p>
                                  </div>
                                  <Badge className="bg-blue-600">{champ.status}</Badge>
                                </div>
                                <Badge variant="secondary" className="bg-blue-600 mb-2">{gameNames[champ.game]}</Badge>
                                <div className="space-y-1 text-sm text-gray-400">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{champ.region}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(champ.start_date)} - {formatDate(champ.end_date)}</span>
                                  </div>
                                  {champ.prize_pool && (
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="w-4 h-4" />
                                      <span>{formatCurrency(champ.prize_pool)}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
