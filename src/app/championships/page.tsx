'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { NavBar } from '@/components/NavBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { getChampionships } from '@/lib/database'
import { Loader2, Plus, Trophy, Calendar, MapPin, Users, DollarSign, Search } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

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

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-600',
  ongoing: 'bg-green-600',
  completed: 'bg-gray-600',
  cancelled: 'bg-red-600'
}

export default function ChampionshipsPage() {
  const { user, loading: authLoading } = useAuth()
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loading, setLoading] = useState(true)
  const [gameFilter, setGameFilter] = useState<string>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('upcoming')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    loadChampionships()
  }, [gameFilter, regionFilter, statusFilter, searchQuery])

  const loadChampionships = async () => {
    try {
      setLoading(true)
      const filters: any = {
        limit: 50,
        offset: 0
      }
      
      if (gameFilter !== 'all') {
        filters.game = gameFilter
      }
      
      if (regionFilter !== 'all') {
        filters.region = regionFilter
      }
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim()
      }
      
      const data = await getChampionships(filters)
      setChampionships(data || [])
    } catch (error) {
      console.error('Error loading championships:', error)
      toast.error('Failed to load championships')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      // Handle both date-only strings (YYYY-MM-DD) and datetime strings
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      
      // Use UTC methods to avoid timezone issues
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search championships by title, description, or organizer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Game</label>
                  <Select value={gameFilter} onValueChange={setGameFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all" className="text-white hover:bg-gray-700">All Games</SelectItem>
                      <SelectItem value="cs2" className="text-white hover:bg-gray-700">Counter-Strike 2</SelectItem>
                      <SelectItem value="lol" className="text-white hover:bg-gray-700">League of Legends</SelectItem>
                      <SelectItem value="valorant" className="text-white hover:bg-gray-700">Valorant</SelectItem>
                      <SelectItem value="dota2" className="text-white hover:bg-gray-700">Dota 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all" className="text-white hover:bg-gray-700">All Status</SelectItem>
                      <SelectItem value="upcoming" className="text-white hover:bg-gray-700">Upcoming</SelectItem>
                      <SelectItem value="ongoing" className="text-white hover:bg-gray-700">Ongoing</SelectItem>
                      <SelectItem value="completed" className="text-white hover:bg-gray-700">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Championships List */}
          {championships.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-12 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Championships Found</h3>
                <p className="text-gray-500">Try adjusting your filters or create a new championship.</p>
                {user && (
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/championships/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Championship
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {championships.map((champ) => (
                <Link key={champ.id} href={`/championships/${champ.id}`}>
                  <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-xl">{champ.title}</CardTitle>
                        <CardDescription className="text-gray-400">{champ.organizer}</CardDescription>
                      </div>
                      <Badge className={`${statusColors[champ.status]} text-white`}>
                        {champ.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4 line-clamp-3">{champ.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Trophy className="w-4 h-4" />
                        <span>{gameNames[champ.game]}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{champ.region}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(champ.start_date)} - {formatDate(champ.end_date)}</span>
                      </div>
                      
                      {champ.prize_pool && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span>Prize Pool: {formatCurrency(champ.prize_pool)}</span>
                        </div>
                      )}
                      
                      {champ.max_teams && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>Max Teams: {champ.max_teams}</span>
                        </div>
                      )}
                    </div>
                    
                    {champ.website && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-700"
                        asChild
                      >
                        <a href={champ.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
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
